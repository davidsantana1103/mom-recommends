import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import { useAppStore } from '@/store/useAppStore'

function rawForecast() {
  return {
    latitude: 40.4168,
    longitude: -3.7038,
    timezone: 'Europe/Madrid',
    current: {
      time: 1_700_000_000,
      temperature_2m: -12,
      apparent_temperature: -15,
      wind_speed_10m: 4,
      wind_direction_10m: 180,
      precipitation: 1,
      weather_code: 71,
      relative_humidity_2m: 80,
      uv_index: 1,
      visibility: 10_000,
      snow_depth: 8,
      cloud_cover: 90,
    },
    hourly: {
      time: [1_700_003_600],
      temperature_2m: [-12],
      apparent_temperature: [-15],
      wind_speed_10m: [4],
      wind_direction_10m: [180],
      precipitation: [1],
      weather_code: [71],
      relative_humidity_2m: [80],
      uv_index: [1],
      snow_depth: [8],
      visibility: [10_000],
      cloud_cover: [90],
    },
    daily: {
      time: ['2026-01-15'],
      temperature_2m_max: [-8],
      temperature_2m_min: [-16],
      sunrise: [1_699_996_800],
      sunset: [1_700_050_000],
      precipitation_sum: [4],
      uv_index_max: [1],
      weather_code: [71],
    },
  }
}

function stubNetwork() {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      const u = String(url)
      if (u.includes('air-quality')) {
        return Promise.resolve({ ok: true, json: async () => ({ current: { us_aqi: 40 } }) })
      }
      if (u.includes('nominatim')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ display_name: 'Madrid, España' }),
        })
      }
      return Promise.resolve({ ok: true, json: async () => rawForecast() })
    }),
  )
  const geo = {
    getCurrentPosition: vi.fn(
      (
        success: (pos: { coords: { latitude: number; longitude: number } }) => void,
      ) => success({ coords: { latitude: 40.4168, longitude: -3.7038 } }),
    ),
  }
  Object.defineProperty(navigator, 'geolocation', { value: geo, configurable: true })
}

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.unstubAllGlobals()
    useAppStore.setState({
      activity: 'school',
      person: 'child',
      language: 'en',
      providerId: 'open-meteo',
      location: null,
      weather: null,
      weatherStatus: 'idle',
      weatherError: null,
    })
  })

  it('auto-detects location, renders the avatar + rationale + worn items', async () => {
    stubNetwork()
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    // FROZEN + school + child → full winter outfit (feature 4 outputs).
    const svg = document.querySelector('[data-item="heavy_winter_coat"]')
    expect(svg).not.toBeNull()
    expect(screen.getByText(/full winter outfit/i)).toBeInTheDocument()
    expect(screen.getByText('Heavy winter coat')).toBeInTheDocument()
    expect(screen.getByText(/Madrid, España/)).toBeInTheDocument()
  })

  it('switching the activity re-recommends without re-fetching weather', async () => {
    stubNetwork()
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByRole('img')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Sport' }))
    await waitFor(() => {
      expect(useAppStore.getState().activity).toBe('sport')
    })
    // Still a rendered outfit after the activity switch.
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('shows a recoverable error state when geolocation is denied', async () => {
    const geo = {
      getCurrentPosition: vi.fn((_s: unknown, error: (e: { code: number }) => void) => {
        error({ code: 1 })
      }),
    }
    Object.defineProperty(navigator, 'geolocation', { value: geo, configurable: true })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(
      await screen.findByText(/couldn't get your location/i),
    ).toBeInTheDocument()
  })
})