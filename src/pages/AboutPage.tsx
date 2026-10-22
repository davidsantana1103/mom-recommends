import { ExternalLink, MessageSquareText, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ISSUES_URL = 'https://github.com/davidsantana1103/mom-recommends/issues'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <section className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">{t('about.title')}</h1>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <ShieldCheck aria-hidden className="size-5 text-brand-600" />
          {t('about.privacyTitle')}
        </h2>
        <p className="text-ink-muted">{t('about.privacyText')}</p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-2 font-semibold">{t('about.dataTitle')}</h2>
        <p className="text-ink-muted">{t('about.dataText')}</p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-2 font-semibold">{t('about.contactTitle')}</h2>
        <p className="text-ink-muted">{t('about.contactText')}</p>
        <a
          href={ISSUES_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
        >
          <MessageSquareText aria-hidden className="size-4" />
          <span>GitHub Issues</span>
          <ExternalLink aria-hidden className="size-3" />
        </a>
      </div>

      <p className="text-sm italic text-ink-muted">{t('about.credits')}</p>
    </section>
  )
}