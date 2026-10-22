/**
 * Modifiers applied on top of the base layers (recommendation-rules.md §5–§8).
 * Rule order matters (rules §13.1): precipitation → wind → UV → activity → person.
 */
import type { Activity, OutfitItem, Person } from '@/types/outfit'
import type { TempBand } from '@/weather/bands'
import type { RuleContext } from '@/engine/context'
import { addIfMissing, item, replaceCategoryLayer } from '@/engine/items'

const raincoat = item('outer', 'raincoat', 3, true, 'waterproof, compact, packable')
const waterproofBoots = item('feet', 'waterproof_boots', 3, true, 'waterproof')
const snowPants = item('legs', 'snow_pants', 3, true, 'insulated, waterproof')
const longPants = item('legs', 'long_pants', 3, true, 'jeans or trousers')
const sneakers = item('feet', 'sneakers', 3, true, 'closed-toe')
const hood = item('head', 'hood', 2, true, 'jacket hood up')
const knitHat = item('head', 'knit_hat', 1, true, 'covers ears')
const lightGloves = item('hands', 'light_gloves', 2, true, 'lightweight')
const scarf = item('accessory', 'scarf', 1, true, 'neck protection')
const faceCovering = item('head', 'face_covering', 1, true, 'for strong wind below 10°C')
const sunHat = item('head', 'sun_hat', 1, true, 'wide-brim preferred')
const wideBrimHat = item('head', 'wide_brim_hat', 1, true, 'sun protection')
const uvSunglasses = item('hands', 'sunglasses', 2, true, 'UV protection')
const waterproofMittens = item('hands', 'waterproof_mittens', 2, true, 'insulated, waterproof')
const insulatedMittens = item('hands', 'insulated_mittens', 2, true, 'warmer than gloves')
const windbreaker = item('outer', 'windbreaker', 3, true, 'windproof shell')
const thermalBase = item('base', 'thermal_underwear', 1, true, 'moisture-wicking base layer')
const lightCardigan = item('outer', 'light_cardigan', 3, true, 'for air conditioning')

const COLD_BANDS: TempBand[] = ['FROZEN', 'COLD']
const WARM_BANDS: TempBand[] = ['WARM', 'HOT', 'VERY_HOT']
const HOT_BANDS: TempBand[] = ['HOT', 'VERY_HOT']

function replaceFeetWith(items: OutfitItem[], replacement: OutfitItem): OutfitItem[] {
  return replaceCategoryLayer(items, 'feet', 3, replacement)
}

/** §5 Precipitation modifiers. */
export function applyPrecipitationModifier(items: OutfitItem[], ctx: RuleContext): OutfitItem[] {
  switch (ctx.precipType) {
    case 'rain':
      items = replaceCategoryLayer(items, 'outer', 3, raincoat)
      items = replaceFeetWith(items, waterproofBoots)
      if (COLD_BANDS.includes(ctx.tempBand)) items = replaceCategoryLayer(items, 'legs', 3, snowPants)
      if (ctx.tempBand === 'COOL') items = addIfMissing(items, hood)
      break
    case 'snow':
      if (ctx.tempBand === 'FROZEN') {
        items = replaceCategoryLayer(items, 'hands', 2, waterproofMittens) // example A
      } else if (ctx.tempBand === 'COLD') {
        items = replaceCategoryLayer(items, 'legs', 3, snowPants)
        items = replaceFeetWith(items, waterproofBoots)
        items = replaceCategoryLayer(items, 'hands', 2, waterproofMittens)
      } else if (ctx.tempBand === 'CHILLY') {
        items = replaceFeetWith(items, waterproofBoots)
        items = addIfMissing(items, hood)
      }
      break
    case 'sleet':
    case 'hail':
      items = replaceCategoryLayer(items, 'outer', 3, raincoat)
      items = replaceFeetWith(items, waterproofBoots)
      if (COLD_BANDS.includes(ctx.tempBand)) {
        items = replaceCategoryLayer(items, 'hands', 2, insulatedMittens)
      }
      break
    case 'none':
      break
  }
  return items
}

/** §5.4 Wind modifier. */
export function applyWindModifier(items: OutfitItem[], ctx: RuleContext): OutfitItem[] {
  if (ctx.windSpeed > 8 && !items.some((i) => i.category === 'outer' && i.required)) {
    items = addIfMissing(items, windbreaker)
  }
  if (ctx.windSpeed > 12) {
    items = addIfMissing(items, knitHat)
    items = addIfMissing(items, scarf)
  }
  if (ctx.windSpeed > 15 && ctx.temperature < 10) {
    items = addIfMissing(items, faceCovering)
  }
  return items
}

/** §6 UV modifier — adds head/hands items only; warnings are generated separately. */
export function applyUVModifier(items: OutfitItem[], ctx: RuleContext): OutfitItem[] {
  if (ctx.uvIndex >= 11) {
    items = addIfMissing(items, wideBrimHat)
    items = addIfMissing(items, uvSunglasses)
  } else if (ctx.uvIndex >= 8) {
    items = addIfMissing(items, sunHat)
    items = addIfMissing(items, uvSunglasses)
  } else if (ctx.uvIndex >= 6) {
    items = addIfMissing(items, sunHat)
  }
  return items
}

/** §7 Activity modifiers. */
export function applyActivityModifier(
  items: OutfitItem[],
  activity: Activity,
  ctx: RuleContext,
): OutfitItem[] {
  switch (activity) {
    case 'school':
      // Conservative coverage: long pants (unless it's hot), closed-toe shoes.
      if (
        items.some((i) => i.category === 'legs' && i.name === 'shorts') &&
        !WARM_BANDS.includes(ctx.tempBand)
      ) {
        items = replaceCategoryLayer(items, 'legs', 3, longPants)
      }
      if (items.some((i) => i.category === 'feet' && i.name === 'sandals')) {
        items = replaceFeetWith(items, sneakers)
      }
      if (WARM_BANDS.includes(ctx.tempBand)) {
        items = addIfMissing(items, lightCardigan) // classroom AC
      }
      break
    case 'playground':
      if (
        items.some((i) => i.category === 'legs' && i.name === 'shorts') &&
        !HOT_BANDS.includes(ctx.tempBand)
      ) {
        items = replaceCategoryLayer(items, 'legs', 3, longPants)
      }
      items = replaceFeetWith(items, sneakers) // closed-toe for safety (example B)
      break
    case 'walk':
      if (['CHILLY', 'COLD', 'FROZEN'].includes(ctx.tempBand)) {
        items = addIfMissing(items, knitHat)
        items = addIfMissing(items, lightGloves)
      }
      items = replaceFeetWith(items, sneakers)
      break
    case 'sport':
      items = replaceFeetWith(items, sneakers) // sneakers only
      if (['COOL', 'CHILLY', 'COLD', 'FROZEN'].includes(ctx.tempBand)) {
        items = addIfMissing(items, thermalBase) // thermal base under athletic wear
      }
      break
    case 'commute':
      if (ctx.precipType !== 'none') {
        items = replaceCategoryLayer(items, 'outer', 3, raincoat)
      }
      if (items.some((i) => i.category === 'feet' && i.name === 'sandals')) {
        items = replaceFeetWith(items, sneakers)
      }
      break
    case 'general':
      break
  }
  return items
}

/**
 * §8 Person modifier — children prefer mittens (warmer) over gloves.
 * Only swaps plain gloves; waterproof/insulated mittens are kept as-is
 * (precipitation rules run before this one).
 */
export function applyPersonModifier(items: OutfitItem[], person: Person): OutfitItem[] {
  if (person === 'child') {
    const hands = items.find((i) => i.category === 'hands')
    if (hands && (hands.name === 'gloves' || hands.name === 'light_gloves')) {
      items = replaceCategoryLayer(items, 'hands', 2, insulatedMittens)
    }
  }
  return items
}