/**
 * Geocode cache (D23): localStorage, 7-day TTL.
 */
import type { GeocodeResult } from '@/locations/types'

const TTL_MS = 7 * 24 * 60 * 60 * 1000
const PREFIX = 'mom-recommends:geocode:'

export const GEOCODE_TTL_MS = TTL_MS

export function geocodeKey(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, '+')
}

export function readGeocodeCache(query: string): GeocodeResult[] | null {
  try {
    const raw = localStorage.getItem(PREFIX + geocodeKey(query))
    if (!raw) return null
    const entry = JSON.parse(raw) as { savedAt: number; results: GeocodeResult[] }
    if (Date.now() - entry.savedAt > TTL_MS) {
      localStorage.removeItem(PREFIX + geocodeKey(query))
      return null
    }
    return entry.results
  } catch {
    return null
  }
}

export function writeGeocodeCache(query: string, results: GeocodeResult[]): void {
  try {
    localStorage.setItem(
      PREFIX + geocodeKey(query),
      JSON.stringify({ savedAt: Date.now(), results }),
    )
  } catch {
    // storage full or unavailable — caching is best-effort
  }
}