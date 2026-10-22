import { describe, expect, it } from 'vitest'
import { deriveDailyPrecipitationType, derivePrecipitationType } from '@/weather/wmo'

describe('derivePrecipitationType (data-models §4.1)', () => {
  it('maps clear/cloudy/fog to none', () => {
    for (const code of [0, 1, 2, 3, 45, 48]) {
      expect(derivePrecipitationType(code)).toBe('none')
    }
  })

  it('maps drizzle/rain/showers/thunderstorm to rain', () => {
    for (const code of [51, 53, 55, 61, 63, 65, 80, 81, 82, 95]) {
      expect(derivePrecipitationType(code)).toBe('rain')
    }
  })

  it('maps freezing drizzle/rain and mixed showers to sleet', () => {
    for (const code of [56, 57, 66, 67, 83, 84]) {
      expect(derivePrecipitationType(code)).toBe('sleet')
    }
  })

  it('maps snow and snow grains/showers to snow', () => {
    for (const code of [71, 73, 75, 77, 85, 86]) {
      expect(derivePrecipitationType(code)).toBe('snow')
    }
  })

  it('maps thunderstorm with hail to hail', () => {
    for (const code of [96, 99]) {
      expect(derivePrecipitationType(code)).toBe('hail')
    }
  })

  it('treats unknown codes as dry', () => {
    expect(derivePrecipitationType(-1)).toBe('none')
    expect(derivePrecipitationType(999)).toBe('none')
  })

  it('derives daily type with sleet collapsing to mixed', () => {
    expect(deriveDailyPrecipitationType(0)).toBe('none')
    expect(deriveDailyPrecipitationType(61)).toBe('rain')
    expect(deriveDailyPrecipitationType(73)).toBe('snow')
    expect(deriveDailyPrecipitationType(66)).toBe('mixed')
    expect(deriveDailyPrecipitationType(99)).toBe('mixed')
  })
})