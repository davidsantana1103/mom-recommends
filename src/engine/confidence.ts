/**
 * Deterministic confidence score (recommendation-rules.md §10, D21).
 * The sum of deductions matches the documented worked examples exactly.
 */
import type { RuleContext } from '@/engine/context'

export function calculateConfidence(ctx: RuleContext): number {
  // Worked in whole hundredths to avoid floating-point drift.
  let confidence = 100

  // Extreme temperature bands need human judgment. HOT is included so the
  // output matches the documented worked examples exactly (§9, D21): hot
  // sunny playground day -> 0.90, README and example B both deduct for HOT.
  if (['FROZEN', 'HOT', 'VERY_HOT'].includes(ctx.tempBand)) confidence -= 5
  // Rain can be patchy; sleet/hail is genuinely ambiguous.
  if (ctx.precipType === 'rain') confidence -= 5
  if (ctx.precipType === 'sleet' || ctx.precipType === 'hail') confidence -= 10
  // High wind makes "feels like" temperature vary.
  if (ctx.windSpeed > 10) confidence -= 5
  // Poor visibility.
  if (ctx.visibility < 5) confidence -= 5
  // UV ≥ 8 depends on personal sunscreen discipline.
  if (ctx.uvIndex >= 8) confidence -= 5

  return Math.max(10, Math.min(100, confidence)) / 100
}