/**
 * UV index levels (docs/data-models.md §4.4).
 * These are labels for reasoning; warnings use the numeric thresholds directly.
 */
export type UVMeaning = 'low' | 'moderate' | 'high' | 'very_high' | 'extreme'

export function getUVMeaning(uv: number): UVMeaning {
  if (uv <= 2) return 'low'
  if (uv <= 5) return 'moderate'
  if (uv <= 7) return 'high'
  if (uv <= 10) return 'very_high'
  return 'extreme'
}