import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, MapPin, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { recommendOutfit } from '@/engine'
import ActivityPicker from '@/components/home/ActivityPicker'
import PersonPicker from '@/components/home/PersonPicker'
import OutfitCard from '@/components/home/OutfitCard'

export default function HomePage() {
  const { t } = useTranslation()
  const location = useAppStore((s) => s.location)
  const weather = useAppStore((s) => s.weather)
  const weatherStatus = useAppStore((s) => s.weatherStatus)
  const weatherError = useAppStore((s) => s.weatherError)
  const activity = useAppStore((s) => s.activity)
  const person = useAppStore((s) => s.person)
  const loadLocation = useAppStore((s) => s.loadLocation)
  const refreshWeather = useAppStore((s) => s.refreshWeather)

  const isInitial = weatherStatus === 'idle'

  useEffect(() => {
    if (weatherStatus !== 'idle') return
    if (location) void refreshWeather()
    else void loadLocation()
  }, [weatherStatus, location, loadLocation, refreshWeather])

  const outfit = useMemo(
    () => (weather ? recommendOutfit({ weather, activity, person }) : null),
    [weather, activity, person],
  )

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('home.title')}</h1>
          <p className="mt-1 text-ink-muted">{t('app.tagline')}</p>
        </div>
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 rounded-md bg-surface-alt px-3 py-2 text-sm text-ink-muted ring-1 ring-line hover:text-ink"
        >
          <MapPin aria-hidden className="size-4" />
          <span className="hidden sm:inline">{t('search.title')}</span>
        </Link>
      </div>

      {isInitial || weatherStatus === 'loading' ? (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-16 text-ink-muted"
        >
          <Loader2 aria-hidden className="size-6 animate-spin motion-reduce:animate-none" />
          <p>{t('home.loading')}</p>
        </div>
      ) : weatherStatus === 'error' || !outfit ? (
        <div role="alert" className="rounded-2xl border border-dashed border-line p-8 text-center">
          <p className="text-ink">{weatherError ? t(weatherError) : t('errors.generic')}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => void refreshWeather()}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              <RefreshCw aria-hidden className="size-4" />
              {t('home.retry')}
            </button>
            <button
              type="button"
              onClick={() => void loadLocation()}
              className="inline-flex items-center gap-1.5 rounded-md bg-surface-alt px-3 py-2 text-sm text-ink-muted ring-1 ring-line hover:text-ink"
            >
              <MapPin aria-hidden className="size-4" />
              {t('home.useMyLocation')}
            </button>
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 rounded-md bg-surface-alt px-3 py-2 text-sm text-ink-muted ring-1 ring-line hover:text-ink"
            >
              {t('home.searchInstead')}
            </Link>
          </div>
        </div>
      ) : (
        <div role="region" aria-label={t('home.title')}>
          <OutfitCard
            outfit={outfit}
            person={person}
            locationName={location?.displayName ?? ''}
            label={t('home.for', { activity: t(`activities.${activity}`) })}
          />
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                {t('settings.activity')}
              </p>
              <ActivityPicker />
            </div>
            <div className="sm:w-40">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                {t('settings.person')}
              </p>
              <PersonPicker />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}