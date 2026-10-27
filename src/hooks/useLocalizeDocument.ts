/**
 * Keeps <html lang>, <title> and the meta description in sync with the
 * active language (D17). Hooks into i18n events so a language switch from
 * Settings updates the document immediately.
 */
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function useLocalizeDocument() {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.language
    document.title = t('app.name')
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', t('meta.description'))
  }, [i18n.language, t])
}