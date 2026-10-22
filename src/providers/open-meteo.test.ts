import { beforeEach, describe, expect, it, vi } from 'vitest'
import { normalizeOpenMeteo, OpenMeteoProvider } from '@/providers/open-meteo'

const rawForecast = {
  latitude: 52.52,
  longitude: 13.41,
  timezone: 'Europe/Berlin',
  current: {
    time: 1_700_000_000,
    temperature_2m: 5.2,
    apparent_temperature: 3.1,
    wind_speed_10m: 4.5,
    wind_direction_10m: 210,
    precipitation: 0,
    weather_code: 3, // overcast
    relative_humidity_2m: 82,
    uv_index: 2.1,
    visibility: 19_400, // m
    snow_depth: 0.12, // m
    cloud_cover: 88,
  },
  hourly: {
    time: [1_700_009_000],
    temperature_2m: [5.0],
    apparent_temperature: [2.8],
    wind_speed_10m: [4.2],
    wind_direction_10m: [205],
    precipitation: [0.1],
    weather_code: [61], // rain
    relative_humidity_2m: [84],
    uv_index: [2.0],
    snow_depth: [0.11],
    visibility: [18_000],
    cloud_cover: [92],
  },
  daily: {
    time: ['2026-01-15', '2026-01-16'],
    temperature_2m_max: [7, 6],
    temperature_2m_min: [1, 0],
    sunrise: [1_699_996_000, 1_700_082_000],
    sunset: [1_700_050_000, 1_700_136_000],
    precipitation_sum: [2.4, 0],
    uv_index_max: [2, 2],
    weather_code: [61, 0],
  },
}

describe('normalizeOpenMeteo (D19 unit conversions)', () => {
  it('converts wind, visibility, snow depth and timestamps to canonical units', () => {
    const data = normalizeOpenMeteo(rawForecast, { current: { us_aqi: 42 } }, 'Berlin')

    expect(data.location).toEqual({ lat: 52.52, lon: 13.41, name: 'Berlin', timezone: 'Europe/Berlin' })
    expect(data.current.temperature).toBe(5.2) // °C passthrough
    expect(data.current.windSpeed).toBe(4.5) // m/s passthrough
    expect(data.current.visibility).toBe(19.4) // m -> km
    expect(data.current.snowDepth).toBe(12) // m -> cm
    expect(data.current.time).toBe(1_700_000_000 * 1000) // s -> ms
    expect(data.current.airQualityIndex).toBe(42)
    expect(data.current.cloudCover).toBe(88)
  })

  it('derives precipitation types from WMO codes', () => {
    const data = normalizeOpenMeteo(rawForecast, {}, 'Berlin')
    expect(data.current.precipitationType).toBe('none') // code 3 overcast
    expect(data.hourly[0].precipitationType).toBe('rain') // code 61
    expect(data.daily[0].precipitationType).toBe('rain')
  })

  it('keeps airQualityIndex null when air quality is missing (D09)', () => {
    const data = normalizeOpenMeteo(rawForecast, {}, 'Berlin')
    expect(data.current.airQualityIndex).toBeNull()
  })

  it('throws when required blocks are missing', () => {
    expect(() => normalizeOpenMeteo({} as never, {}, 'Berlin')).toThrow()
  })
})

describe('OpenMeteoProvider', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('fetches forecast and air quality, then normalizes', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => rawForecast })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ current: { us_aqi: 35 } }) })

    const provider = new OpenMeteoProvider()
    const data = await provider.fetch(52.52, 13.41, 'Berlin')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(data.provider).toBe('open-meteo')
    expect(data.fetchedAt).toBeGreaterThan(0)
    expect(data.location.name).toBe('Berlin')
    expect(data.current.airQualityIndex).toBe(35)

    const [forecastUrl] = fetchMock.mock.calls[0]
    expect(String(forecastUrl)).toContain('wind_speed_unit=ms')
    expect(String(forecastUrl)).toContain('temperature_unit=celsius')
    expect(String(forecastUrl)).toContain('timeformat=unixtime')
    expect(String(forecastUrl)).toContain('forecast_days=2')
  })

  it('never fails on air-quality request errors (D09)', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => rawForecast })
      .mockRejectedValueOnce(new Error('network down'))

    const provider = new OpenMeteoProvider()
    const data = await provider.fetch(52.52, 13.41, 'Berlin')

    expect(data.current.airQualityIndex).toBeNull()
  })

  it('throws on forecast HTTP errors', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 })

    await expect(new OpenMeteoProvider().fetch(1, 2)).rejects.toThrow('HTTP 500')
  })
})