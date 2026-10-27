import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '@/store/useAppStore'

function rawForecast() {
  return {
    latitude: 40.4168,
    longitude: -3.7038,
    timezone: 'Europe/Madrid',
    current: {
      time: 1_700_000_000,
      temperature_2m: 22,
      apparent_temperature: 21,
      wind_speed_10m: 2,
      wind_direction_10m: 180,
      precipitation: 0,
      weather_code: 1,
      relative_humidity_2m: 55,
      uv_index: 5,
      visibility: 20_000,
      snow_depth: 0,
      cloud_cover: 10,
    },
    hourly: {
      time: [1_700_003_600],
      temperature_2m: [21],
      apparent_temperature: [20],
      wind_speed_10m: [2],
      wind_direction_10m: [180],
      precipitation: [0],
      weather_code: [1],
      relative_humidity_2m: [56],
      uv_index: [4],
      snow_depth: [0],
      visibility: [20_000],
      cloud_cover: [12],
    },
    daily: {
      time: ['2026-01-15'],
      temperature_2m_max: [24],
      temperature_2m_min: [14],
      sunrise: [1_699_996_800],
      sunset: [1_700_050_000],
      precipitation_sum: [0],
      uv_index_max: [6],
      weather_code: [1],
    },
  }
}

/** URL-routed fetch: nominatim reverse -> forecast -> air quality. */
function stubWeatherFetch() {
  const fetchMock = vi.fn((url: string) => {
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
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function stubGeolocation(mode: 'success' | 'error') {
  const geo = {
    getCurrentPosition: vi.fn(
      (
        success: (pos: { coords: { latitude: number; longitude: number } }) => void,
        error: (err: { code: number }) => void,
      ) => {
        if (mode === 'success') {
          success({ coords: { latitude: 40.4168, longitude: -3.7038 } })
        } else {
          error({ code: 1 }) // permission denied
        }
      },
    ),
  }
  Object.defineProperty(navigator, 'geolocation', { value: geo, configurable: true })
  return geo
}

const resetStore = () =>
  useAppStore.setState({
    activity: 'general',
    person: 'adult',
    language: 'en',
    providerId: 'open-meteo',
    location: null,
    weather: null,
    weatherStatus: 'idle',
    weatherError: null,
  })

describe('app store', () => {
  beforeEach(() => {
    resetStore()
    localStorage.clear()
    sessionStorage.clear()
    vi.unstubAllGlobals()
  })

  it('persists user preferences to localStorage (D23)', async () => {
    useAppStore.getState().setActivity('school')
    useAppStore.getState().setPerson('child')
    useAppStore.getState().setLanguage('es')

    const stored = JSON.parse(localStorage.getItem('mom-recommends:prefs') ?? '{}')
    expect(stored.state.activity).toBe('school')
    expect(stored.state.person).toBe('child')
    expect(stored.state.language).toBe('es')
  })

  it('rehydrates preferences from localStorage on a fresh load (D23)', async () => {
    localStorage.setItem(
      'mom-recommends:prefs',
      JSON.stringify({
        state: {
          activity: 'school',
          person: 'child',
          language: 'es',
          providerId: 'open-meteo',
          location: null,
        },
        version: 0,
      }),
    )
    await useAppStore.persist.rehydrate()
    expect(useAppStore.getState().activity).toBe('school')
    expect(useAppStore.getState().person).toBe('child')
    expect(useAppStore.getState().language).toBe('es')
  })

  it('setLocation fetches weather, patches timezone and caches in sessionStorage (D23)', async () => {
    const fetchMock = stubWeatherFetch()

    await useAppStore.getState().setLocation({
      lat: 40.4168,
      lon: -3.7038,
      displayName: 'Madrid, España',
    })

    const state = useAppStore.getState()
    expect(state.weatherStatus).toBe('ready')
    expect(state.location?.timezone).toBe('Europe/Madrid')
    expect(state.weather?.location.name).toBe('Madrid, España')

    const cached = sessionStorage.getItem('mom-recommends:weather:40.4168,-3.7038')
    expect(cached).not.toBeNull()

    // A second setLocation for the same coords must use the cache, not the network.
    await useAppStore.getState().setLocation({
      lat: 40.4168,
      lon: -3.7038,
      displayName: 'Madrid, España',
    })
    expect(fetchMock).toHaveBeenCalledTimes(2) // forecast + AQI from the FIRST call only
  })

  it('loadLocation resolves from browser geolocation (D07)', async () => {
    stubGeolocation('success')
    stubWeatherFetch()
    await useAppStore.getState().loadLocation()
    expect(useAppStore.getState().weatherStatus).toBe('ready')
  })

  it('loadLocation reports failure when geolocation is denied (D07)', async () => {
    stubGeolocation('error')
    stubWeatherFetch()
    const result = await useAppStore.getState().loadLocation()
    expect(result.ok).toBe(false)
    expect(useAppStore.getState().weatherError).toBe('errors.location_unavailable')
  })

  it('refreshWeather surfaces fetch errors', async () => {
    useAppStore.setState({
      location: { lat: 1, lon: 2, displayName: 'Nowhere' },
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    await useAppStore.getState().refreshWeather()
    expect(useAppStore.getState().weatherStatus).toBe('error')
    expect(useAppStore.getState().weatherError).toBe('errors.weather_fetch')
  })
})