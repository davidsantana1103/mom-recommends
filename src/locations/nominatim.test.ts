import { afterEach, describe, expect, it, vi } from 'vitest'
import { reverseGeocode, searchPlaces } from '@/locations/nominatim'

const rows = [
  { lat: '40.4168', lon: '-3.7038', display_name: 'Madrid, España', type: 'city' },
  { lat: '0', lon: '0', display_name: 'Null Island', type: 'island' },
]

describe('searchPlaces', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('requests Nominatim with query, limit and language', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => rows })
    vi.stubGlobal('fetch', fetchMock)

    const results = await searchPlaces('madrid', 'es')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toContain('https://nominatim.openstreetmap.org/search')
    expect(url).toContain('q=madrid')
    expect(url).toContain('limit=5')
    expect(url).toContain('accept-language=es')
    expect(results).toEqual([
      { lat: 40.4168, lon: -3.7038, displayName: 'Madrid, España', type: 'city' },
      { lat: 0, lon: 0, displayName: 'Null Island', type: 'island' },
    ])
  })

  it('returns [] for an empty query and never fetches', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await searchPlaces('  ', 'en')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('treats a 400 as an empty result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400 }))
    expect(await searchPlaces('x', 'en')).toEqual([])
  })

  it('throws on server errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    await expect(searchPlaces('x', 'en')).rejects.toThrow('HTTP 500')
  })
})

describe('reverseGeocode', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('maps a reverse-geocode row to GeoLocation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ display_name: 'Madrid, España' }),
      }),
    )
    const loc = await reverseGeocode(40.4168, -3.7038, 'es')
    expect(loc).toEqual({ lat: 40.4168, lon: -3.7038, displayName: 'Madrid, España' })
  })

  it('falls back to coordinates when reverse geocoding fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))
    const loc = await reverseGeocode(40.4168, -3.7038, 'en')
    expect(loc.lat).toBe(40.4168)
    expect(loc.displayName).toContain('40.42')
  })
})