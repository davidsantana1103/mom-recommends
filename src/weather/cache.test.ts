import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CACHE_TTL_MS, cacheKey, readWeatherCache, writeWeatherCache } from '@/weather/cache'
import type { WeatherData } from '@/types/weather'

const sampleWeather = {
  location: { lat: 1, lon: 2, name: 'Test', timezone: 'UTC' },
  current: {} as WeatherData['current'],
  hourly: [],
  daily: [],
  fetchedAt: 0,
  provider: 'open-meteo',
} satisfies WeatherData

describe('weather cache (D23)', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useRealTimers()
  })

  it('round-trips entries', () => {
    writeWeatherCache(cacheKey(1, 2), sampleWeather)
    const cached = readWeatherCache(cacheKey(1, 2))
    expect(cached?.location.name).toBe('Test')
  })

  it('returns null for a miss', () => {
    expect(readWeatherCache('missing')).toBeNull()
  })

  it('expires after the 5-minute TTL', () => {
    vi.useFakeTimers()
    writeWeatherCache(cacheKey(1, 2), sampleWeather)
    vi.advanceTimersByTime(CACHE_TTL_MS + 1)
    expect(readWeatherCache(cacheKey(1, 2))).toBeNull()
  })

  it('does not expire before the TTL', () => {
    vi.useFakeTimers()
    writeWeatherCache(cacheKey(1, 2), sampleWeather)
    vi.advanceTimersByTime(CACHE_TTL_MS - 1)
    expect(readWeatherCache(cacheKey(1, 2))).not.toBeNull()
  })

  it('treats corrupted entries as a miss', () => {
    sessionStorage.setItem('mom-recommends:weather:1.0000,2.0000', '{nope')
    expect(readWeatherCache(cacheKey(1, 2))).toBeNull()
  })

  it('keys by rounded coordinates', () => {
    expect(cacheKey(1.23456, 2.98764)).toBe('1.2346,2.9876')
    expect(cacheKey(1.23456, 2.98766)).toBe('1.2346,2.9877')
  })
})