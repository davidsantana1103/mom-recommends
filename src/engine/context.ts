/**
 * Rule context (recommendation-rules.md §3).
 */
import type { PrecipType, WeatherData } from '@/types/weather'
import type { TempBand } from '@/weather/bands'
import type { UVMeaning } from '@/weather/uv'
import { getTempBand } from '@/weather/bands'
import { getUVMeaning } from '@/weather/uv'

export interface RuleContext {
  tempBand: TempBand
  precipType: PrecipType
  uvMeaning: UVMeaning
  /** numeric — used directly by warnings (rules §11) */
  uvIndex: number
  /** m/s */
  windSpeed: number
  /** °C */
  temperature: number
  /** cm */
  snowDepth: number
  /** km */
  visibility: number
  /** US AQI or null (D09) */
  airQualityIndex: number | null
  /** WMO code (for fog/sun/cloud phrasing in the rationale) */
  weatherCode: number
  /** 0–100 % */
  cloudCover: number
}

export function buildRuleContext(weather: WeatherData): RuleContext {
  const c = weather.current
  return {
    tempBand: getTempBand(c.temperature),
    precipType: c.precipitationType,
    uvMeaning: getUVMeaning(c.uvIndex),
    uvIndex: c.uvIndex,
    windSpeed: c.windSpeed,
    temperature: c.temperature,
    snowDepth: c.snowDepth,
    visibility: c.visibility,
    airQualityIndex: c.airQualityIndex,
    weatherCode: c.weatherCode,
    cloudCover: c.cloudCover,
  }
}