/**
 * Location layer types (docs/architecture.md §3.1).
 * `timezone` is filled in by the weather provider (Open-Meteo timezone=auto),
 * since neither the Geolocation API nor Nominatim reliably returns one.
 */
export interface GeoLocation {
  lat: number
  lon: number
  /** human-readable display name, e.g. "Madrid, Comunidad de Madrid, España" */
  displayName: string
  /** IANA timezone; empty until the weather provider fills it in */
  timezone?: string
}

/** Geocoder output row (Nominatim /search). */
export interface GeocodeResult {
  lat: number
  lon: number
  displayName: string
  /** Nominatim place type, e.g. "city", "town", "village" */
  type: string
}