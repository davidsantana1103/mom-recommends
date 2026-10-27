/**
 * Browser Geolocation wrapper (architecture §3.1, D07).
 * No IP-based geolocation is ever attempted; a denial is surfaced to the UI,
 * which falls back to manual search.
 */
export interface GeolocationError extends Error {
  /** geolocation API error code (1 = permission denied, etc.) */
  code?: number
}

export function getBrowserCoords(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      const err = new Error('Geolocation not supported in this browser') as GeolocationError
      err.code = -1
      reject(err)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (geoErr) => {
        const err = new Error('Geolocation denied or unavailable') as GeolocationError
        err.code = geoErr.code
        reject(err)
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60 * 1000 },
    )
  })
}