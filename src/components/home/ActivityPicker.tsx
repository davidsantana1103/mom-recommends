import { useTranslation } from 'react-i18next'
import type { Activity } from '@/types/outfit'
import { useAppStore } from '@/store/useAppStore'

const ACTIVITIES: Activity[] = ['school', 'playground', 'walk', 'sport', 'commute', 'general']

export default function ActivityPicker() {
  const { t } = useTranslation()
  const activity = useAppStore((s) => s.activity)
  const setActivity = useAppStore((s) => s.setActivity)

  return (
    <div role="group" aria-label={t('settings.activity')} className="flex flex-wrap gap-2">
      {ACTIVITIES.map((a) => {
        const selected = activity === a
        return (
          <button
            key={a}
            type="button"
            onClick={() => setActivity(a)}
            aria-pressed={selected}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              selected
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line bg-surface text-ink-muted hover:border-brand-300 hover:text-ink'
            }`}
          >
            {t(`activities.${a}`)}
          </button>
        )
      })}
    </div>
  )
}