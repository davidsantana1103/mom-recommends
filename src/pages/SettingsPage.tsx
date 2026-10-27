import { useTranslation } from 'react-i18next'
import ActivityPicker from '@/components/home/ActivityPicker'
import PersonPicker from '@/components/home/PersonPicker'
import { useAppStore } from '@/store/useAppStore'
import { providers } from '@/providers/registry'

const LANGUAGES = ['en', 'es'] as const

export default function SettingsPage() {
  const { t } = useTranslation()
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const providerId = useAppStore((s) => s.providerId)
  const setProviderId = useAppStore((s) => s.setProviderId)

  return (
    <section className="max-w-xl space-y-8">
      <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {t('settings.activity')}
        </p>
        <ActivityPicker />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {t('settings.person')}
        </p>
        <PersonPicker />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {t('settings.language')}
        </label>
        <div role="group" aria-label={t('settings.language')} className="flex flex-wrap gap-2">
          {LANGUAGES.map((lng) => {
            const selected = language === lng
            return (
              <button
                key={lng}
                type="button"
                onClick={() => setLanguage(lng)}
                aria-pressed={selected}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-line bg-surface text-ink-muted hover:border-brand-300 hover:text-ink'
                }`}
              >
                {t(`languages.${lng}`)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {t('settings.provider')}
        </label>
        <div role="group" aria-label={t('settings.provider')} className="flex flex-wrap gap-2">
          {providers.map((p) => {
            const selected = providerId === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setProviderId(p.id)}
                aria-pressed={selected}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-line bg-surface text-ink-muted hover:border-brand-300 hover:text-ink'
                }`}
              >
                {p.name}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-ink-muted">{t('settings.saved')}</p>
    </section>
  )
}