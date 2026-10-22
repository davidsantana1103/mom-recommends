/**
 * Provider registry (docs/architecture.md §5).
 * The MVP ships a single keyless provider (D08); keyed providers are post-MVP.
 */
import type { WeatherProvider } from '@/types/weather'
import { OpenMeteoProvider } from '@/providers/open-meteo'

export const providers: WeatherProvider[] = [new OpenMeteoProvider()]

export function getProvider(name: string): WeatherProvider {
  return providers.find((p) => p.id === name || p.name === name) ?? providers[0]
}