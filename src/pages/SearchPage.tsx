import { useTranslation } from 'react-i18next'

export default function SearchPage() {
  const { t } = useTranslation()
  return <section>{t('nav.search')}</section>
}