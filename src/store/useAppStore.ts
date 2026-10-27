/**
 * App store (Zustand, D02/D23).
 * Persisted subset (user preferences): activity, person, language, provider,
 * last location — in localStorage. Weather is never persisted here; the
 * sessionStorage 5-min cache (src/weather/cache.ts) handles repeat visits
 * (D23). Orchestrates location -> weather -> (outfit computed by consumers).
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Activity, Person } from '@/types/outfit'
import type { GeoLocation } from '@/locations'
import type { WeatherData } from '@/types/weather'
import { getCurrentLocation } from '@/locations'
import { getProvider } from '@/providers/registry'
import { cacheKey, readWeatherCache, writeWeatherCache } from '@/weather/cache'
import i18n from '@/i18n'

export type WeatherStatus = 'idle' | 'loading' | 'ready' | 'error'

interface AppState {
  activity: Activity
  person: Person
  language: string
  providerId: string
  location: GeoLocation | null
  weather: WeatherData | null
  weatherStatus: WeatherStatus
  weatherError: string | null

  setActivity: (activity: Activity) => void
  setPerson: (person: Person) => void
  setLanguage: (language: string) => void
  setProviderId: (id: string) => void
  /** manual set from the Search page — immediately fetches weather */
  setLocation: (loc: GeoLocation) => Promise<void>
  /** auto-detect via browser geolocation (D07); returned for UI branching */
  loadLocation: () => Promise<{ ok: boolean }>
  /** re-fetch (or read cache) for the current location */
  refreshWeather: () => Promise<void>
  clearWeatherError: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activity: 'general',
      person: 'adult',
      language: 'en',
      providerId: 'open-meteo',
      location: null,
      weather: null,
      weatherStatus: 'idle',
      weatherError: null,

      setActivity: (activity) => set({ activity }),
      setPerson: (person) => set({ person }),
      setLanguage: (language) => {
        void i18n.changeLanguage(language)
        set({ language })
      },
      setProviderId: (providerId) => set({ providerId }),

      setLocation: async (loc) => {
        set({ location: loc, weatherError: null })
        try {
          const data = await refreshWeatherFor(get(), loc)
          set({
            weather: data,
            weatherStatus: 'ready',
            location: { ...loc, timezone: data.location.timezone },
          })
        } catch {
          set({ weatherStatus: 'error', weatherError: 'errors.weather_fetch' })
        }
      },

      loadLocation: async () => {
        if (get().location) return { ok: true } // already have a location
        try {
          const loc = await getCurrentLocation(get().language)
          await get().setLocation(loc)
          return { ok: true }
        } catch {
          set({ weatherStatus: 'error', weatherError: 'errors.location_unavailable' })
          return { ok: false }
        }
      },

      refreshWeather: async () => {
        const { location } = get()
        if (!location) return
        set({ weatherStatus: 'loading', weatherError: null })
        try {
          const data = await refreshWeatherFor(get(), location)
          set({ weather: data, weatherStatus: 'ready' })
        } catch {
          set({ weatherStatus: 'error', weatherError: 'errors.weather_fetch' })
        }
      },

      clearWeatherError: () => set({ weatherError: null }),
    }),
    {
      name: 'mom-recommends:prefs',
      partialize: (state) => ({
        activity: state.activity,
        person: state.person,
        language: state.language,
        providerId: state.providerId,
        location: state.location,
      }),
    },
  ),
)

async function refreshWeatherFor(state: AppState, loc: GeoLocation): Promise<WeatherData> {
  const key = cacheKey(loc.lat, loc.lon)
  const cached = readWeatherCache(key)
  if (cached) return cached // sessionStorage hit (5-min TTL, D23)

  const provider = getProvider(state.providerId)
  const data = await provider.fetch(loc.lat, loc.lon, loc.displayName)
  writeWeatherCache(key, data)
  return data
}