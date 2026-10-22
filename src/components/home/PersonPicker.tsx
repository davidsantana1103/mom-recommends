import { useTranslation } from 'react-i18next'
import type { Person } from '@/types/outfit'
import { useAppStore } from '@/store/useAppStore'

const PERSONS: Person[] = ['adult', 'child']

export default function PersonPicker() {
  const { t } = useTranslation()
  const person = useAppStore((s) => s.person)
  const setPerson = useAppStore((s) => s.setPerson)

  return (
    <div role="group" aria-label={t('settings.person')} className="flex gap-2">
      {PERSONS.map((p) => {
        const selected = person === p
        return (
          <button
            key={p}
            type="button"
            onClick={() => setPerson(p)}
            aria-pressed={selected}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              selected
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-line bg-surface text-ink-muted hover:border-brand-300 hover:text-ink'
            }`}
          >
            {t(`persons.${p}`)}
          </button>
        )
      })}
    </div>
  )
}