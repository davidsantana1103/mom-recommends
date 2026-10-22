/**
 * Open-Meteo weather provider (docs/architecture.md §5, data-models §3.1, D08/D09/D19).
 * Free for non-commercial use, no API key. Attribution (CC BY 4.0) must be shown.
 */
import type {
  DailyPrecipType,
  WeatherData,
  WeatherProvider,
  WeatherSnapshot,
} from '@/types/weather'
import { deriveDailyPrecipitationType, derivePrecipitationType } from '@/weather/wmo'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

const round1 = (n: number): number => Math.round(n * 10) / 10
const sToMs = (s: number): number => s * 1000

interface RawForecast {
  latitude: number
  longitude: number
  timezone: string
  current?: {
    time: number
    temperature_2m: number
    apparent_temperature: number
    wind_speed_10m: number
    wind_direction_10m: number
    precipitation: number
    weather_code: number
    relative_humidity_2m: number
    uv_index: number
    visibility: number
    snow_depth: number
    cloud_cover: number
  }
  hourly?: {
    time: number[]
    temperature_2m: number[]
    apparent_temperature: number[]
    wind_speed_10m: number[]
    wind_direction_10m: number[]
    precipitation: number[]
    weather_code: number[]
    relative_humidity_2m: number[]
    uv_index: number[]
    snow_depth: number[]
    visibility: number[]
    cloud_cover: number[]
  }
  daily?: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    sunrise: number[]
    sunset: number[]
    precipitation_sum: number[]
    uv_index_max: number[]
    weather_code: number[]
  }
}

interface RawAirQuality {
  current?: { us_aqi?: number | null }
}

/** Normalize a raw Open-Meteo payload into the canonical model (exported for tests). */
export function normalizeOpenMeteo(
  forecast: RawForecast,
  airQuality: RawAirQuality,
  name: string,
): Omit<WeatherData, 'fetchedAt' | 'provider'> {
  const aqi = airQuality.current?.us_aqi ?? null
  const currentRaw = forecast.current

  if (!currentRaw || !forecast.hourly || !forecast.daily) {
    throw new Error('Open-Meteo response missing required data blocks')
  }

  const current: WeatherSnapshot = {
    time: sToMs(currentRaw.time),
    temperature: currentRaw.temperature_2m,
    apparentTemperature: currentRaw.apparent_temperature,
    windSpeed: currentRaw.wind_speed_10m,
    windDirection: currentRaw.wind_direction_10m,
    precipitation: currentRaw.precipitation,
    precipitationType: derivePrecipitationType(currentRaw.weather_code),
    snowDepth: round1(currentRaw.snow_depth * 100), // m -> cm
    humidity: currentRaw.relative_humidity_2m,
    uvIndex: currentRaw.uv_index,
    airQualityIndex: aqi,
    cloudCover: currentRaw.cloud_cover,
    visibility: round1(currentRaw.visibility / 1000), // m -> km
    weatherCode: currentRaw.weather_code,
  }

  const h = forecast.hourly
  const hourly: WeatherSnapshot[] = h.time.map((time, i) => ({
    time: sToMs(time),
    temperature: h.temperature_2m[i],
    apparentTemperature: h.apparent_temperature[i],
    windSpeed: h.wind_speed_10m[i],
    windDirection: h.wind_direction_10m[i],
    precipitation: h.precipitation[i],
    precipitationType: derivePrecipitationType(h.weather_code[i]),
    snowDepth: round1(h.snow_depth[i] * 100),
    humidity: h.relative_humidity_2m[i],
    uvIndex: h.uv_index[i],
    airQualityIndex: aqi,
    cloudCover: h.cloud_cover[i],
    visibility: round1(h.visibility[i] / 1000),
    weatherCode: h.weather_code[i],
  }))

  const d = forecast.daily
  const daily = d.time.map((date, i) => ({
    date,
    tempMin: d.temperature_2m_min[i],
    tempMax: d.temperature_2m_max[i],
    sunrise: sToMs(d.sunrise[i]),
    sunset: sToMs(d.sunset[i]),
    precipitationSum: d.precipitation_sum[i],
    precipitationType: deriveDailyPrecipitationType(d.weather_code[i]) as DailyPrecipType,
    uvIndexMax: d.uv_index_max[i],
  }))

  return {
    location: {
      lat: forecast.latitude,
      lon: forecast.longitude,
      name,
      timezone: forecast.timezone,
    },
    current,
    hourly,
    daily,
  }
}

export class OpenMeteoProvider implements WeatherProvider {
  readonly id = 'open-meteo'
  readonly name = 'Open-Meteo'
  readonly attribution = 'Weather data by Open-Meteo.com' // required (CC BY 4.0, D08)

  async fetch(lat: number, lon: number, name?: string): Promise<WeatherData> {
    const forecastParams = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current:
        'temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,'
        + 'precipitation,weather_code,relative_humidity_2m,uv_index,visibility,snow_depth,cloud_cover',
      hourly:
        'temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,'
        + 'precipitation,weather_code,relative_humidity_2m,uv_index,snow_depth,visibility,cloud_cover',
      daily:
        'temperature_2m_max,temperature_2m_min,sunrise,sunset,'
        + 'precipitation_sum,uv_index_max,weather_code',
      timezone: 'auto',
      forecast_days: '2', // today + tomorrow (D13); UI shows today only
      temperature_unit: 'celsius',
      wind_speed_unit: 'ms', // default is km/h — must request m/s (D19)
      precipitation_unit: 'mm',
      timeformat: 'unixtime', // epoch seconds; normalized to ms
    })

    const forecastRes = await fetch(`${FORECAST_URL}?${forecastParams}`)
    if (!forecastRes.ok) {
      throw new Error(`Open-Meteo forecast failed: HTTP ${forecastRes.status}`)
    }
    const forecast = (await forecastRes.json()) as RawForecast

    // Air quality is optional (D09): a missing/failed AQI request must never
    // fail the whole weather fetch, so it only leaves airQualityIndex null.
    let airQuality: RawAirQuality = {}
    try {
      const aqParams = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        current: 'us_aqi',
        timeformat: 'unixtime',
      })
      const aqRes = await fetch(`${AIR_QUALITY_URL}?${aqParams}`)
      if (aqRes.ok) {
        airQuality = (await aqRes.json()) as RawAirQuality
      }
    } catch {
      // ignore — AQI stays null
    }

    const locationName = name ?? `${lat.toFixed(2)}, ${lon.toFixed(2)}`
    return {
      ...normalizeOpenMeteo(forecast, airQuality, locationName),
      fetchedAt: Date.now(),
      provider: this.id,
    }
  }
}