/**
 * Temperature bands (docs/data-models.md §4.2, decisions D05/D06).
 * Bands are half-open intervals [lower, upper): an exact boundary value belongs
 * to the warmer band. Below −30°C is still FROZEN (with an "extreme cold" warning).
 */

export type TempBand =
  | 'FROZEN'
  | 'COLD'
  | 'CHILLY'
  | 'COOL'
  | 'MILD'
  | 'WARM'
  | 'HOT'
  | 'VERY_HOT'

/** Condition words for the rationale (D06) — never temperatures (D04). */
export const CONDITION_WORDS: Record<TempBand, string> = {
  FROZEN: 'freezing',
  COLD: 'cold',
  CHILLY: 'cool',
  COOL: 'mildly cool',
  MILD: 'mild',
  WARM: 'warm',
  HOT: 'hot',
  VERY_HOT: 'very hot',
}

export function getTempBand(t: number): TempBand {
  if (t < -10) return 'FROZEN'
  if (t < 0) return 'COLD'
  if (t < 10) return 'CHILLY'
  if (t < 15) return 'COOL'
  if (t < 20) return 'MILD'
  if (t < 25) return 'WARM'
  if (t < 35) return 'HOT'
  return 'VERY_HOT'
}

/** Ordering used for item deduplication and layer conflict resolution (rules §13). */
export const TEMP_BAND_ORDER: TempBand[] = [
  'FROZEN',
  'COLD',
  'CHILLY',
  'COOL',
  'MILD',
  'WARM',
  'HOT',
  'VERY_HOT',
]