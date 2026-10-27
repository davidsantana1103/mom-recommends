/**
 * OpenStreetMap Nominatim geocoding (architecture §3.1).
 * Free for light use; the browser's own navigator identity is sent (we cannot
 * set a custom User-Agent, and per Nominatim policy the UA we send is fine for
 * interactive client-side use). Results are locale-sensitive via accept-language.
 */
import type { GeoLocation, GeocodeResult } from '@/locations/types'

const SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse'

interface NominatimRow {
  lat: string
  lon: string
  display_name: string
  type: string
}

export async function searchPlaces(query: string, language: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return []
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'jsonv2',
    limit: '5',
    'accept-language': language,
  })
  const res = await fetch(`${SEARCH_URL}?${params}`)
  if (res.status === 400) return [] // bad query — nothing to search for
  if (!res.ok) {
    throw new Error(`Geocoding failed: HTTP ${res.status}`)
  }
  const rows = (await res.json()) as NominatimRow[]
  return rows
    .filter((r) => r.lat && r.lon)
    .map((r) => ({
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      displayName: r.display_name,
      type: r.type,
    }))
}

export async function reverseGeocode(lat: number, lon: number, language: string): Promise<GeoLocation> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'jsonv2',
    zoom: '10',
    'accept-language': language,
  })
  const res = await fetch(`${REVERSE_URL}?${params}`)
  if (!res.ok) {
    // Reverse geocoding is best-effort: fall back to plain coordinates.
    return { lat, lon, displayName: `${lat.toFixed(2)}, ${lon.toFixed(2)}` }
  }
  const row = (await res.json()) as NominatimRow
  return {
    lat,
    lon,
    displayName: row.display_name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
  }
}