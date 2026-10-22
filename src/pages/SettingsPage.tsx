import { useTranslation } from 'react-i18next'

export default function SettingsPage() {
  const { t } = useTranslation()
  return <section>{t('nav.settings')}</section>
}