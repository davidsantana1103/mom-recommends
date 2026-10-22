/**
 * Visual outfit result (docs/architecture.md §3.6):
 * avatar + rationale + notes (warnings) + confidence + item names.
 * The avatar is the primary channel; item names support screen readers (D15).
 */
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Outfit, Person } from '@/types/outfit'
import { AvatarRenderer } from '@/components/avatar/AvatarRenderer'

export default function OutfitCard({
  outfit,
  person,
  locationName,
  label,
}: {
  outfit: Outfit
  person: Person
  locationName: string
  label: string
}) {
  const { t } = useTranslation()

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="flex flex-col gap-6 p-6 sm:flex-row">
        <div className="mx-auto flex h-64 w-48 shrink-0 items-end justify-center sm:mx-0">
          <AvatarRenderer items={outfit.items} person={person} label={label} />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <p className="text-sm font-medium text-ink-muted">{locationName}</p>
          <p className="text-pretty text-base leading-relaxed text-ink">{outfit.rationale}</p>

          {outfit.warnings.length > 0 && (
            <ul className="space-y-1.5">
              {outfit.warnings.map((warning) => (
                <li key={warning} className="flex items-start gap-2 text-sm text-amber-700">
                  <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <CheckCircle2 aria-hidden className="size-4 text-emerald-600" />
            <span>
              {t('home.confidence')}: {Math.round(outfit.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-surface-alt px-6 py-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
          {t('home.items')}
        </p>
        <ul className="flex flex-wrap gap-2">
          {outfit.items.map((item) => (
            <li
              key={item.name}
              className="rounded-full bg-surface px-3 py-1 text-sm text-ink shadow-sm ring-1 ring-line"
            >
              {t(`items.${item.name}`, item.name)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}