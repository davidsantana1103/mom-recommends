import { useTranslation } from 'react-i18next'

export default function AboutPage() {
  const { t } = useTranslation()
  return <section>{t('nav.about')}</section>
}