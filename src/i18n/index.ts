import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes values (D02)
  },
})

export default i18n