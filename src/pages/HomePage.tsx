import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { t } = useTranslation()
  return (
    <section>
      <h1 className="text-2xl font-semibold">{t('app.name')}</h1>
      <p className="mt-2 text-ink-muted">{t('app.tagline')}</p>
    </section>
  )
}