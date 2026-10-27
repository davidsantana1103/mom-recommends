import { describe, expect, it } from 'vitest'
import { getUVMeaning } from '@/weather/uv'

describe('getUVMeaning (data-models §4.4)', () => {
  it('maps thresholds exactly', () => {
    expect(getUVMeaning(0)).toBe('low')
    expect(getUVMeaning(2)).toBe('low')
    expect(getUVMeaning(3)).toBe('moderate')
    expect(getUVMeaning(5)).toBe('moderate')
    expect(getUVMeaning(6)).toBe('high')
    expect(getUVMeaning(7)).toBe('high')
    expect(getUVMeaning(8)).toBe('very_high')
    expect(getUVMeaning(10)).toBe('very_high')
    expect(getUVMeaning(11)).toBe('extreme')
    expect(getUVMeaning(14)).toBe('extreme')
  })
})