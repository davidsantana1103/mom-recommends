import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, LocateFixed, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { searchLocations } from '@/locations'
import type { GeocodeResult } from '@/locations'

export default function SearchPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const setLocation = useAppStore((s) => s.setLocation)
  const loadLocation = useAppStore((s) => s.loadLocation)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [status, setStatus] = useState<'idle' | 'searching' | 'done' | 'empty' | 'failed'>('idle')
  const [locating, setLocating] = useState(false)

  async function runSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setStatus('searching')
    try {
      const found = await searchLocations(query, i18n.language)
      setResults(found)
      setStatus(found.length > 0 ? 'done' : 'empty')
    } catch {
      setStatus('failed')
    }
  }

  async function pick(result: GeocodeResult) {
    await setLocation({ lat: result.lat, lon: result.lon, displayName: result.displayName })
    navigate('/')
  }

  async function handleUseCurrent() {
    setLocating(true)
    const { ok } = await loadLocation()
    setLocating(false)
    if (ok) navigate('/')
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('search.title')}</h1>
        <p className="mt-1 text-ink-muted">{t('search.privacyNote')}</p>
      </div>

      <form onSubmit={runSearch} className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          aria-label={t('search.placeholder')}
          className="min-w-0 flex-1 rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
        <button
          type="submit"
          disabled={status === 'searching' || !query.trim()}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {status === 'searching' ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <Search aria-hidden className="size-4" />
          )}
          {t('search.button')}
        </button>
      </form>

      <button
        type="button"
        onClick={() => void handleUseCurrent()}
        disabled={locating}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline disabled:opacity-50"
      >
        <LocateFixed aria-hidden className="size-4" />
        {locating ? t('home.loading') : t('search.useCurrentLocation')}
      </button>

      {status === 'empty' && <p className="text-ink-muted">{t('search.noResults')}</p>}
      {status === 'failed' && <p className="text-ink-muted">{t('search.failed')}</p>}

      {status === 'done' && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t('search.results')}
          </p>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {results.map((r) => (
              <li key={`${r.lat},${r.lon}`}>
                <button
                  type="button"
                  onClick={() => void pick(r)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-alt"
                >
                  <span className="min-w-0 flex-1 truncate text-ink">{r.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}