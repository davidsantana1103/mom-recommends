/**
 * Location layer facade (architecture §3.1).
 *   getCurrentLocation(): browser geolocation → reverse geocode for a name
 *   searchLocations():      manual search via Nominatim, cached 7 days (D23)
 */
import type { GeoLocation, GeocodeResult } from '@/locations/types'
import { getBrowserCoords } from '@/locations/geolocation'
import { reverseGeocode, searchPlaces } from '@/locations/nominatim'
import { readGeocodeCache, writeGeocodeCache } from '@/locations/cache'

export type { GeoLocation, GeocodeResult } from '@/locations/types'

export async function getCurrentLocation(language: string): Promise<GeoLocation> {
  const { lat, lon } = await getBrowserCoords()
  return reverseGeocode(lat, lon, language)
}

export async function searchLocations(query: string, language: string): Promise<GeocodeResult[]> {
  const cached = readGeocodeCache(query)
  if (cached) return cached
  const results = await searchPlaces(query, language)
  if (results.length > 0) writeGeocodeCache(query, results)
  return results
}