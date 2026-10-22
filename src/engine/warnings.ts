/**
 * Warnings generation (recommendation-rules.md §11).
 * Numeric thresholds on uvIndex are used directly (never the uvMeaning label),
 * so the warning set is an exact match for the §6 table. Every string is an
 * i18next key (D17); English defaults live in src/i18n/locales.
 */
import i18n from '@/i18n'
import type { RuleContext } from '@/engine/context'

export function generateWarnings(ctx: RuleContext): string[] {
  const t = i18n.t.bind(i18n)
  const warnings: string[] = []

  if (ctx.uvIndex >= 11) {
    warnings.push(t('warnings.uv_extreme'))
  } else if (ctx.uvIndex >= 8) {
    warnings.push(t('warnings.uv_very_high'))
  } else if (ctx.uvIndex >= 6) {
    warnings.push(t('warnings.uv_high'))
  } else if (ctx.uvIndex >= 3) {
    warnings.push(t('warnings.uv_moderate'))
  }

  if (ctx.tempBand === 'FROZEN') {
    warnings.push(t('warnings.extreme_cold'))
  }
  if (ctx.tempBand === 'VERY_HOT') {
    warnings.push(t('warnings.heat'))
  }

  if (ctx.airQualityIndex !== null && ctx.airQualityIndex > 150) {
    warnings.push(t('warnings.poor_air'))
  }

  if (ctx.precipType === 'snow' && ctx.snowDepth > 10) {
    warnings.push(t('warnings.heavy_snow'))
  }

  return warnings
}