/**
 * Rule-based recommendation engine (docs/recommendation-rules.md).
 * Pure and deterministic: same weather + activity + person => same outfit.
 * Rule order (§13.1): base layers → precipitation → wind → UV → activity → person.
 */
import type { Outfit, OutfitItem, OutfitRequest } from '@/types/outfit'
import type { RuleContext } from '@/engine/context'
import { buildRuleContext } from '@/engine/context'
import { baseLayersForTempBand } from '@/engine/baseLayers'
import { calculateConfidence } from '@/engine/confidence'
import { compareItems } from '@/engine/items'
import {
  applyActivityModifier,
  applyPersonModifier,
  applyPrecipitationModifier,
  applyUVModifier,
  applyWindModifier,
} from '@/engine/modifiers'
import { generateRationale } from '@/engine/rationale'
import { generateWarnings } from '@/engine/warnings'

export type { RuleContext } from '@/engine/context'

/**
 * Dedupe + sort. Category/layer conflicts are already resolved by the
 * modifiers (they replace via `replaceCategoryLayer`), so here we only drop
 * exact-name duplicates (later-applied wins) and optional items — the worked
 * examples list only required items (D21 §14: optional items are post-MVP).
 */
export function dedupeAndSort(items: OutfitItem[]): OutfitItem[] {
  const byName = new Map<string, OutfitItem>()
  for (const i of items) {
    if (!i.required) continue
    byName.set(i.name, i) // later-applied item wins duplicates
  }
  return [...byName.values()].sort(compareItems)
}

export function recommendOutfit(request: OutfitRequest): Outfit {
  const { weather, activity, person } = request
  const ctx: RuleContext = buildRuleContext(weather)

  let items = baseLayersForTempBand(ctx.tempBand)
  items = applyPrecipitationModifier(items, ctx)
  items = applyWindModifier(items, ctx)
  items = applyUVModifier(items, ctx)
  items = applyActivityModifier(items, activity, ctx)
  items = applyPersonModifier(items, person)
  items = dedupeAndSort(items)

  return {
    items,
    rationale: generateRationale(ctx, activity),
    confidence: calculateConfidence(ctx),
    warnings: generateWarnings(ctx),
  }
}