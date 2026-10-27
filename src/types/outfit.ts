/**
 * Outfit domain model (docs/data-models.md §1, §2).
 */

export type Activity = 'school' | 'playground' | 'walk' | 'sport' | 'commute' | 'general'
export type Person = 'adult' | 'child'
/** avatar styling only; the MVP always renders 'neutral' (D12) */
export type AvatarGender = 'neutral' | 'masculine' | 'feminine'

export type ItemCategory =
  | 'base' // underwear, thermal layer
  | 'mid' // sweater, long-sleeve shirt
  | 'outer' // jacket, coat, raincoat
  | 'feet' // shoes, boots, sneakers
  | 'head' // hat, hood, helmet
  | 'hands' // gloves, mittens
  | 'legs' // pants, leggings, tights
  | 'accessory' // scarf, umbrella, sunglasses (post-MVP)

export interface OutfitItem {
  category: ItemCategory
  /** "insulated winter boots" */
  name: string
  /** developer/QA-facing, e.g. "waterproof, rated to −20°C" — never shown as-is (D04) */
  description: string
  /** 1 = base, 2 = mid, 3 = outer */
  layer: number
  /** false = optional item (post-MVP accessories) */
  required: boolean
  /** path/ID of the SVG asset for the generated avatar */
  avatarAsset: string
}

export interface OutfitRequest {
  weather: import('@/types/weather').WeatherData
  activity: Activity
  person: Person
  gender?: AvatarGender
}

export interface Outfit {
  items: OutfitItem[]
  /** human-readable, localized, worded conditions only — no weather numbers (D04) */
  rationale: string
  /** 0–1 deterministic confidence (D21) */
  confidence: number
  /** e.g. "High UV — apply sunscreen" */
  warnings: string[]
}