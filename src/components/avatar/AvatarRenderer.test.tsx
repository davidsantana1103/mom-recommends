import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AvatarRenderer } from '@/components/avatar/AvatarRenderer'
import { recommendOutfit } from '@/engine'
import type { WeatherData, WeatherSnapshot } from '@/types/weather'

const snapshot: WeatherSnapshot = {
  time: 1_700_000_000_000,
  temperature: -12,
  apparentTemperature: -15,
  windSpeed: 4,
  windDirection: 180,
  precipitation: 1,
  precipitationType: 'snow',
  snowDepth: 8,
  humidity: 80,
  uvIndex: 1,
  airQualityIndex: null,
  cloudCover: 90,
  visibility: 10,
  weatherCode: 71,
}

const weather: WeatherData = {
  location: { lat: 0, lon: 0, name: 'Test', timezone: 'UTC' },
  current: snapshot,
  hourly: [],
  daily: [],
  fetchedAt: 0,
  provider: 'open-meteo',
}

describe('AvatarRenderer', () => {
  it('renders an accessible svg with the recommended clothes (D01/D15)', () => {
    const outfit = recommendOutfit({ weather, activity: 'school', person: 'child' })
    render(<AvatarRenderer items={outfit.items} person="child" label="Test outfit" />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('aria-label', 'Test outfit')

    // FROZEN + school + child → warm insulated pieces are present and rendered.
    expect(outfit.items.some((i) => i.name === 'heavy_winter_coat')).toBe(true)
    for (const name of ['heavy_winter_coat', 'snow_pants', 'knit_hat', 'waterproof_mittens']) {
      expect(svg.querySelector(`[data-item="${name}"]`)).not.toBeNull()
    }
    expect(outfit.items.length).toBeGreaterThan(4)
  })

  it('child avatars are scaled but still render all worn items', () => {
    const outfit = recommendOutfit({ weather, activity: 'general', person: 'adult' })
    const { container } = render(
      <AvatarRenderer items={outfit.items} person="child" label="Kid" />,
    )
    expect(container.querySelector('svg g[transform]')).not.toBeNull()
  })
})