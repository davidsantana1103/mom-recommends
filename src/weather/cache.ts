/**
 * Weather response cache (D23): sessionStorage, 5-minute TTL.
 * Avoids re-fetching weather when the user changes activity or person.
 */
import type { CachedWeather, WeatherData } from '@/types/weather'

const TTL_MS = 5 * 60 * 1000
const KEY_PREFIX = 'mom-recommends:weather:'

export function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`
}

export function readWeatherCache(key: string): WeatherData | null {
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CachedWeather
    if (Date.now() - entry.savedAt > TTL_MS) {
      sessionStorage.removeItem(KEY_PREFIX + key)
      return null
    }
    return entry.data
  } catch {
    return null // corrupted entry or storage unavailable — treat as a miss
  }
}

export function writeWeatherCache(key: string, data: WeatherData): void {
  try {
    sessionStorage.setItem(KEY_PREFIX + key, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    // storage full or unavailable — caching is best-effort (privacy-first, D23)
  }
}

export const CACHE_TTL_MS = TTL_MS