/**
 * Base layers per temperature band (recommendation-rules.md §4).
 */
import type { OutfitItem } from '@/types/outfit'
import type { TempBand } from '@/weather/bands'
import { item } from '@/engine/items'

export function baseLayersForTempBand(band: TempBand): OutfitItem[] {
  switch (band) {
    case 'FROZEN':
      return [
        item('base', 'thermal_underwear', 1, true, 'moisture-wicking base layer'),
        item('legs', 'thermal_leggings', 1, true, 'warm base layer under snow pants'),
        item('mid', 'thermal_shirt', 2, true, 'long-sleeve thermal top'),
        item('mid', 'fleece', 2, true, 'mid-weight fleece or wool layer'),
        item('outer', 'heavy_winter_coat', 3, true, 'insulated, windproof, water-resistant'),
        item('legs', 'snow_pants', 3, true, 'insulated, waterproof'),
        item('feet', 'insulated_winter_boots', 3, true, 'rated to −20°C, waterproof'),
        item('head', 'knit_hat', 1, true, 'covers ears'),
        item('hands', 'glove_liners', 1, true, 'thin liner under mittens'),
        item('hands', 'insulated_mittens', 2, true, 'warmer than gloves'),
        item('head', 'face_covering', 1, false, 'balaclava or neck gaiter'),
      ]
    case 'COLD':
      return [
        item('base', 'thermal_underwear', 1, true, 'wear below −5°C'),
        item('legs', 'thermal_leggings', 1, false, 'under pants when below −5°C'),
        item('mid', 'long_sleeve_shirt', 2, true, 'or thermal shirt'),
        item('mid', 'sweater', 2, true, 'mid-weight'),
        item('outer', 'insulated_jacket', 3, true, 'windproof'),
        item('legs', 'insulated_pants', 3, true, 'jeans with thermal liner or snow pants'),
        item('feet', 'insulated_boots', 3, true, 'waterproof'),
        item('head', 'knit_hat', 1, true, 'covers ears'),
        item('accessory', 'scarf', 1, false, 'neck protection'),
        item('hands', 'gloves', 2, true, 'insulated'),
      ]
    case 'CHILLY':
      return [
        item('mid', 'long_sleeve_shirt', 2, true, ''),
        item('outer', 'light_jacket', 3, true, 'windbreaker or denim jacket'),
        item('legs', 'long_pants', 3, true, 'jeans, trousers, leggings'),
        item('feet', 'closed_shoes', 3, true, 'sneakers or boots'),
        item('head', 'hat', 1, false, 'beanie or cap'),
        item('hands', 'light_gloves', 2, false, 'when windy or below 5°C'),
      ]
    case 'COOL':
      return [
        item('base', 'tshirt', 1, true, 'short-sleeve'),
        item('mid', 'sweater', 2, true, 'cardigan or light coat'),
        item('legs', 'long_pants', 3, true, 'jeans or trousers'),
        item('feet', 'closed_shoes', 3, true, 'sneakers or boots'),
        item('head', 'hat', 1, false, 'cap or light beanie'),
        item('head', 'hood', 2, false, 'jacket hood when needed'),
      ]
    case 'MILD':
      return [
        item('base', 'tshirt', 1, true, 'short-sleeve'),
        item('legs', 'long_pants', 3, true, 'jeans, chinos, leggings'),
        item('feet', 'closed_shoes', 3, true, 'sneakers'),
        item('outer', 'light_jacket', 3, false, 'cardigan or windbreaker'),
        item('head', 'hat', 1, false, 'cap'),
      ]
    case 'WARM':
      return [
        item('base', 'tshirt', 1, true, 'short-sleeve'),
        item('legs', 'shorts', 3, true, 'breathable fabric'),
        item('feet', 'sandals', 3, true, 'open-toed OK'),
        item('outer', 'light_cardigan', 3, false, 'for air conditioning'),
        item('head', 'hat', 1, false, 'sun hat or cap'),
      ]
    case 'HOT':
      return [
        item('base', 'tshirt', 1, true, 'short-sleeve, breathable'),
        item('legs', 'shorts', 3, true, 'light fabric'),
        item('feet', 'sandals', 3, true, 'open-toed'),
        item('head', 'sun_hat', 1, true, 'wide-brim preferred'),
      ]
    case 'VERY_HOT':
      return [
        item('base', 'tshirt', 1, true, 'ultra-light, moisture-wicking'),
        item('legs', 'shorts', 3, true, 'light fabric'),
        item('feet', 'sandals', 3, true, 'open-toed'),
        item('head', 'wide_brim_hat', 1, true, 'sun protection'),
      ]
  }
}