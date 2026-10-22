import { describe, expect, it } from 'vitest'
import { CONDITION_WORDS, getTempBand, TEMP_BAND_ORDER } from '@/weather/bands'

describe('getTempBand — half-open intervals [lower, upper) (D05)', () => {
  it('maps exact boundary values to the warmer band', () => {
    expect(getTempBand(-10)).toBe('COLD')
    expect(getTempBand(0)).toBe('CHILLY')
    expect(getTempBand(10)).toBe('COOL')
    expect(getTempBand(15)).toBe('MILD')
    expect(getTempBand(20)).toBe('WARM')
    expect(getTempBand(25)).toBe('HOT')
    expect(getTempBand(35)).toBe('VERY_HOT')
  })

  it('maps band interiors and below-−30 clamp correctly', () => {
    expect(getTempBand(-30)).toBe('FROZEN')
    expect(getTempBand(-40)).toBe('FROZEN') // lower clamp: still FROZEN
    expect(getTempBand(-5)).toBe('COLD')
    expect(getTempBand(5)).toBe('CHILLY')
    expect(getTempBand(12)).toBe('COOL')
    expect(getTempBand(18)).toBe('MILD')
    expect(getTempBand(22)).toBe('WARM')
    expect(getTempBand(30)).toBe('HOT')
    expect(getTempBand(40)).toBe('VERY_HOT')
  })

  it('covers the full ordering used for dedupe/conflict resolution', () => {
    expect(TEMP_BAND_ORDER).toHaveLength(8)
    expect(CONDITION_WORDS).toMatchObject({
      FROZEN: 'freezing',
      COLD: 'cold',
      CHILLY: 'cool',
      COOL: 'mildly cool',
      MILD: 'mild',
      WARM: 'warm',
      HOT: 'hot',
      VERY_HOT: 'very hot',
    })
  })
})