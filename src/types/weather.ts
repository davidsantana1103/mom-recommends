/**
 * Normalized weather data model (docs/data-models.md §1.5, §3).
 * All units are canonical (D19): °C, m/s, mm, km (visibility), cm (snow depth), %.
 * Providers convert, engine and UI never convert.
 */

export type PrecipType = 'none' | 'rain' | 'snow' | 'sleet' | 'hail'
export type DailyPrecipType = 'none' | 'rain' | 'snow' | 'mixed'

export interface WeatherSnapshot {
  /** epoch ms (UTC); render in the location timezone */
  time: number
  /** °C */
  temperature: number
  /** "feels like" °C */
  apparentTemperature: number
  /** m/s */
  windSpeed: number
  /** degrees, 0 = North */
  windDirection: number
  /** mm (rain + snow) */
  precipitation: number
  /** derived from WMO weather code, not from amounts */
  precipitationType: PrecipType
  /** cm on the ground (0 if none) */
  snowDepth: number
  /** 0–100 % */
  humidity: number
  /** 0–11+ */
  uvIndex: number
  /** US AQI 0–500; null when the provider has no air quality (D09) */
  airQualityIndex: number | null
  /** 0–100 % */
  cloudCover: number
  /** km */
  visibility: number
  /** WMO weather code (providers map to WMO) */
  weatherCode: number
}

export interface DailySummary {
  /** YYYY-MM-DD in the location timezone */
  date: string
  /** °C */
  tempMin: number
  /** °C */
  tempMax: number
  /** epoch ms (UTC) */
  sunrise: number
  /** epoch ms (UTC) */
  sunset: number
  /** mm total for the day */
  precipitationSum: number
  /** derived from the dominant daily WMO weather code */
  precipitationType: DailyPrecipType
  /** max UV during the day */
  uvIndexMax: number
}

export interface WeatherLocation {
  lat: number
  lon: number
  /** human-readable location name */
  name: string
  /** IANA timezone, e.g. "America/New_York" (filled by the provider, D19 §1.5) */
  timezone: string
}

export interface WeatherData {
  location: WeatherLocation
  current: WeatherSnapshot
  /** next 24–48 h */
  hourly: WeatherSnapshot[]
  /** index 0 = today; 1 = tomorrow (D13) */
  daily: DailySummary[]
  /** epoch ms when fetched */
  fetchedAt: number
  /** e.g. "open-meteo" */
  provider: string
}

export interface WeatherProvider {
  /** human-readable name for UI selection */
  readonly name: string
  /** optional attribution text for the UI footer */
  readonly attribution?: string
  /** fetch current + today's forecast for a coordinate */
  fetch(lat: number, lon: number): Promise<WeatherData>
}

/** A raw saved cache entry with a TTL timestamp (D23: sessionStorage, 5 min). */
export interface CachedWeather {
  savedAt: number
  data: WeatherData
}