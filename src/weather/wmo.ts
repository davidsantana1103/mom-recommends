/**
 * WMO weather code grouping (docs/data-models.md §4.1, appendix §10).
 * precipitationType is derived from the weather code, never from amounts.
 */
import type { PrecipType } from '@/types/weather'

const RAIN_CODES = new Set([51, 53, 55, 61, 63, 65, 80, 81, 82, 95])
const SLEET_CODES = new Set([56, 57, 66, 67, 83, 84])
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86])
const HAIL_CODES = new Set([96, 99])

export function derivePrecipitationType(code: number): PrecipType {
  if (RAIN_CODES.has(code)) return 'rain'
  if (SLEET_CODES.has(code)) return 'sleet'
  if (SNOW_CODES.has(code)) return 'snow'
  if (HAIL_CODES.has(code)) return 'hail'
  return 'none'
}

/** Same grouping for a whole day; sleet/hail collapse to 'mixed'. */
export function deriveDailyPrecipitationType(code: number): 'none' | 'rain' | 'snow' | 'mixed' {
  const type = derivePrecipitationType(code)
  if (type === 'sleet' || type === 'hail') return 'mixed'
  return type
}