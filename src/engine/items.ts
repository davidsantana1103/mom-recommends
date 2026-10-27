/**
 * Outfit item factory and ordering helpers (docs/data-models.md §2.3,
 * recommendation-rules.md §13).
 *
 * `name` is a stable slug that also serves as the i18n key (`items.<slug>`),
 * so the end-user UI (screen-reader descriptions) can localize it (D15/D17).
 * `description` is developer/QA-facing and never shown as-is (D04).
 *
 * Layer semantics (our consistent scheme; docs are loose here):
 *   1 = next to skin (base shirts, leggings, hat base, glove liners)
 *   2 = insulation   (mid shirts, sweaters, fleece, gloves, mittens, pants)
 *   3 = shell        (coats, jackets, raincoats, snow pants, boots, shoes)
 */
import type { ItemCategory, OutfitItem } from '@/types/outfit'

export const CATEGORY_ORDER: Record<ItemCategory, number> = {
  base: 0,
  legs: 1,
  mid: 2,
  outer: 3,
  feet: 4,
  head: 5,
  hands: 6,
  accessory: 7,
}

const ASSET_ROOT = '/assets/avatar/clothing'

export function item(
  category: ItemCategory,
  slug: string,
  layer: number,
  required: boolean,
  description: string,
): OutfitItem {
  return {
    category,
    name: slug,
    description,
    layer,
    required,
    avatarAsset: `${ASSET_ROOT}/${category}/${slug}.svg`,
  }
}

/** Stable sort: layer first (base under shell), then category order, then name. */
export function compareItems(a: OutfitItem, b: OutfitItem): number {
  if (a.layer !== b.layer) return a.layer - b.layer
  const cat = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category]
  if (cat !== 0) return cat
  return a.name.localeCompare(b.name)
}

/** Remove every item of a category whose layer is >= the given layer. */
export function replaceCategoryLayer(
  items: OutfitItem[],
  category: ItemCategory,
  layer: number,
  replacement: OutfitItem,
): OutfitItem[] {
  const rest = items.filter((i) => !(i.category === category && i.layer >= layer))
  return [...rest, replacement]
}

export function addIfMissing(items: OutfitItem[], candidate: OutfitItem): OutfitItem[] {
  if (items.some((i) => i.name === candidate.name)) return items
  return [...items, candidate]
}

export function findSlug(items: OutfitItem[], slug: string): OutfitItem | undefined {
  return items.find((i) => i.name === slug)
}