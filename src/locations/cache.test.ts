import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GEOCODE_TTL_MS, geocodeKey, readGeocodeCache, writeGeocodeCache } from '@/locations/cache'
import type { GeocodeResult } from '@/locations/types'

const results: GeocodeResult[] = [
  { lat: 40.4168, lon: -3.7038, displayName: 'Madrid, España', type: 'city' },
]

describe('geocode cache (D23: localStorage, 7 days)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  it('round-trips normalized queries', () => {
    writeGeocodeCache('New York', results)
    writeGeocodeCache('new york', results) // overwrites the same key
    const cached = readGeocodeCache('NEW  York ')
    expect(cached).toHaveLength(1)
    expect(geocodeKey('New   York')).toBe('new+york')
  })

  it('expires after the 7-day TTL', () => {
    vi.useFakeTimers()
    writeGeocodeCache('madrid', results)
    vi.advanceTimersByTime(GEOCODE_TTL_MS + 1)
    expect(readGeocodeCache('madrid')).toBeNull()
  })

  it('survives within the TTL window', () => {
    vi.useFakeTimers()
    writeGeocodeCache('madrid', results)
    vi.advanceTimersByTime(GEOCODE_TTL_MS - 1)
    expect(readGeocodeCache('madrid')).not.toBeNull()
  })

  it('returns null on miss and for corrupted entries', () => {
    expect(readGeocodeCache('nope')).toBeNull()
    localStorage.setItem('mom-recommends:geocode:x', '{bad')
    expect(readGeocodeCache('x')).toBeNull()
  })
})