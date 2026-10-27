import { describe, expect, it } from 'vitest'
import type { Activity, Person } from '@/types/outfit'
import type { WeatherData, WeatherSnapshot } from '@/types/weather'
import { recommendOutfit } from '@/engine'

function snapshot(overrides: Partial<WeatherSnapshot> = {}): WeatherSnapshot {
  return {
    time: 1_700_000_000_000,
    temperature: 20,
    apparentTemperature: 19,
    windSpeed: 2,
    windDirection: 180,
    precipitation: 0,
    precipitationType: 'none',
    snowDepth: 0,
    humidity: 60,
    uvIndex: 3,
    airQualityIndex: null,
    cloudCover: 30,
    visibility: 20,
    weatherCode: 1,
    ...overrides,
  }
}

function weather(overrides: Partial<WeatherSnapshot> = {}): WeatherData {
  return {
    location: { lat: 0, lon: 0, name: 'Test', timezone: 'UTC' },
    current: snapshot(overrides),
    hourly: [],
    daily: [],
    fetchedAt: 0,
    provider: 'open-meteo',
  }
}

function recommend(
  w: WeatherData,
  activity: Activity = 'general',
  person: Person = 'adult',
) {
  return recommendOutfit({ weather: w, activity, person })
}

const itemNames = (o: ReturnType<typeof recommend>) => o.items.map((i) => i.name)
const sorted = (o: ReturnType<typeof recommend>) => itemNames(o).slice().sort()

describe('recommendOutfit — worked examples (recommendation-rules.md §9, D21)', () => {
  it('Example A: −12°C snowing FROZEN, child going to school', () => {
    const outfit = recommend(
      weather({
        temperature: -12,
        precipitationType: 'snow',
        weatherCode: 71, // snow fall
        windSpeed: 4.2, // 15 km/h
        uvIndex: 2,
      }),
      'school',
      'child',
    )

    expect(sorted(outfit)).toEqual([
      'fleece',
      'glove_liners',
      'heavy_winter_coat',
      'insulated_winter_boots',
      'knit_hat',
      'snow_pants',
      'thermal_leggings',
      'thermal_shirt',
      'thermal_underwear',
      'waterproof_mittens',
    ])
    expect(outfit.confidence).toBe(0.95)
    expect(outfit.warnings).toEqual(['Extreme cold — limit outdoor exposure'])
    expect(outfit.rationale).toBe(
      "It's freezing and snowing, so we recommend a full winter outfit for school. Warm layers to keep dry and protected.",
    )
  })

  it('Example B: 28°C sunny HOT with UV 8, adult at the playground', () => {
    const outfit = recommend(
      weather({
        temperature: 28,
        weatherCode: 0,
        uvIndex: 8,
        windSpeed: 1.4, // 5 km/h
        cloudCover: 0, // sunny
      }),
      'playground',
      'adult',
    )

    expect(sorted(outfit)).toEqual(['shorts', 'sneakers', 'sun_hat', 'sunglasses', 'tshirt'])
    expect(outfit.confidence).toBe(0.9)
    expect(outfit.warnings).toEqual([
      'Very high UV — apply sunscreen, wear a wide-brim hat and sunglasses',
    ])
    expect(outfit.rationale).toBe(
      "It's hot and sunny with very high UV, so wear light, breathable clothing for the playground. A hat and sunglasses will help with sun protection.",
    )
  })

  it('Example C: 8°C rainy CHILLY with UV 4, adult commuting', () => {
    const outfit = recommend(
      weather({
        temperature: 8,
        precipitationType: 'rain',
        weatherCode: 61,
        windSpeed: 2.8, // 10 km/h
        uvIndex: 4,
      }),
      'commute',
      'adult',
    )

    expect(sorted(outfit)).toEqual(['long_pants', 'long_sleeve_shirt', 'raincoat', 'waterproof_boots'])
    expect(outfit.confidence).toBe(0.95)
    expect(outfit.warnings).toEqual(['Moderate UV — sunscreen recommended'])
    expect(outfit.rationale).toContain("It's cool and raining, so wear a raincoat over your layers")
  })
})

describe('recommendOutfit — rule edges', () => {
  it('maps boundary temperature 0°C to CHILLY layers (D05)', () => {
    const outfit = recommend(weather({ temperature: 0 }))
    expect(sorted(outfit)).toEqual(['closed_shoes', 'light_jacket', 'long_pants', 'long_sleeve_shirt'])
  })

  it('child prefers mittens over gloves (D21 §8)', () => {
    const child = recommend(weather({ temperature: -5, precipitationType: 'snow', weatherCode: 71 }), 'general', 'child')
    const adult = recommend(weather({ temperature: -5, precipitationType: 'snow', weatherCode: 71 }), 'general', 'adult')
    expect(itemNames(child)).toContain('waterproof_mittens')
    expect(itemNames(adult)).toContain('waterproof_mittens')
  })

  it('wind > 8 m/s adds a windbreaker when no outer layer exists', () => {
    const outfit = recommend(weather({ temperature: 22, windSpeed: 9 }))
    expect(itemNames(outfit)).toContain('windbreaker')
  })

  it('wind > 15 m/s below 10°C adds a face covering', () => {
    const outfit = recommend(weather({ temperature: 8, windSpeed: 16 }))
    expect(itemNames(outfit)).toContain('face_covering')
  })

  it('UV 11+ adds wide-brim hat and sunglasses; UV 6 adds a sun hat', () => {
    const extreme = recommend(weather({ temperature: 30, uvIndex: 11 }))
    expect(itemNames(extreme)).toContain('wide_brim_hat')
    expect(itemNames(extreme)).toContain('sunglasses')

    const high = recommend(weather({ temperature: 30, uvIndex: 6 }))
    expect(itemNames(high)).toContain('sun_hat')
    expect(itemNames(high)).not.toContain('sunglasses')
  })

  it('sport forces sneakers and adds a thermal base below 15°C', () => {
    const outfit = recommend(weather({ temperature: 12 }), 'sport')
    expect(itemNames(outfit)).toContain('sneakers')
    expect(itemNames(outfit)).toContain('thermal_underwear')
  })

  it('school keeps long pants at COOL but allows shorts at HOT', () => {
    const cool = recommend(weather({ temperature: 12 }), 'school')
    expect(itemNames(cool)).toContain('long_pants')
    const hot = recommend(weather({ temperature: 28 }), 'school')
    expect(itemNames(hot)).toContain('shorts')
  })

  it('keeps every item unique by name and excludes optional items', () => {
    const outfit = recommend(weather({ temperature: -12, weatherCode: 71 }))
    const names = outfit.items.map((i) => i.name)
    expect(new Set(names).size).toBe(names.length)
    expect(outfit.items.every((i) => i.required)).toBe(true)
  })

  it('clamps confidence to [0.1, 1]', () => {
    const terrible = weather({
      temperature: 30,
      precipitationType: 'sleet',
      windSpeed: 20,
      uvIndex: 10,
      visibility: 2,
    })
    expect(recommend(terrible).confidence).toBe(0.7)
  })

  it('emits AQI warning above 150 and nothing when AQI is null (D09)', () => {
    const poor = recommend(weather({ airQualityIndex: 190 }))
    expect(poor.warnings).toContain('Poor air quality — consider indoor activities')
    const none = recommend(weather({ airQualityIndex: null }))
    expect(none.warnings).not.toContain('Poor air quality — consider indoor activities')
  })
})