/**
 * Rationale generation (recommendation-rules.md §12, D04/D06).
 * Worded conditions only — never weather numbers. All text lives in the i18n
 * locale files (D17); this module only picks keys and fills in `activity`.
 */
import i18n from '@/i18n'
import type { Activity } from '@/types/outfit'
import type { RuleContext } from '@/engine/context'
import { CONDITION_WORDS } from '@/weather/bands'

function weatherPhrase(ctx: RuleContext): string {
  switch (ctx.precipType) {
    case 'snow':
      return 'snowing'
    case 'rain':
      return 'raining'
    case 'sleet':
      return 'sleeting'
    case 'hail':
      return 'hailing'
    default:
      break
  }
  if (ctx.weatherCode === 45 || ctx.weatherCode === 48) return 'foggy'
  if (ctx.windSpeed > 8) return 'windy'
  if (ctx.cloudCover < 25) return 'sunny'
  if (ctx.cloudCover < 75) return 'partly_cloudy'
  return 'cloudy'
}

function uvAdjective(ctx: RuleContext): string | null {
  if (ctx.uvIndex >= 11) return 'extreme'
  if (ctx.uvIndex >= 8) return 'very_high'
  if (ctx.uvIndex >= 6) return 'high'
  return null
}

function summaryKey(ctx: RuleContext): string {
  if (ctx.precipType === 'rain' && ['FROZEN', 'COLD', 'CHILLY', 'COOL'].includes(ctx.tempBand)) {
    return 'raincoat_layers'
  }
  if (ctx.precipType === 'snow' && (ctx.tempBand === 'CHILLY' || ctx.tempBand === 'COLD')) {
    return 'warm_waterproof'
  }
  switch (ctx.tempBand) {
    case 'FROZEN':
      return 'full_winter'
    case 'COLD':
      return 'warm_layers'
    case 'CHILLY':
      return 'layered'
    case 'COOL':
      return 'light_extra_layer'
    case 'MILD':
      return 'light_layers'
    case 'WARM':
      return 'summer_outfit'
    case 'HOT':
      return 'light_breathable'
    case 'VERY_HOT':
      return 'minimal'
  }
}

export function generateRationale(ctx: RuleContext, activity: Activity): string {
  const t = i18n.t.bind(i18n)
  const conditionKey = CONDITION_WORDS[ctx.tempBand].replace(/\s+/g, '_')
  const condition = t(`conditions.${conditionKey}`)
  const weather = t(`weather.${weatherPhrase(ctx)}`)
  const recommendation = t(`rationale.rec.${summaryKey(ctx)}`, {
    activity: t(`activity.${activity}`),
  })

  const uv = uvAdjective(ctx)
  const first = uv
    ? t('rationale.first_uv', { condition, weather, uv: t(`uv.${uv}`), recommendation })
    : t('rationale.first', { condition, weather, recommendation })

  const parts = [first]
  if (ctx.tempBand === 'FROZEN') parts.push(t('rationale.suffix.frozen'))
  if (ctx.tempBand === 'VERY_HOT') parts.push(t('rationale.suffix.very_hot'))
  if (uv) parts.push(t('rationale.suffix.sun'))
  return parts.join(' ')
}