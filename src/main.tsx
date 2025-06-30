import { HeroUIProvider } from '@heroui/react'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import App from './App'
import deLocales from '../locales/de.json'
import enLocales from '../locales/en.json'

function getBrowserLanguage(): string {
  // Get browser language (returns full code like 'en-US' or 'de-DE')
  const browserLang = navigator.language
  // Get the primary language part (en, de, etc)
  const primaryLang = browserLang.split('-')[0]

  // Only return if it's one of our supported languages
  const supportedLanguages = ['en', 'de']
  return supportedLanguages.includes(primaryLang) ? primaryLang : 'en'
}

const savedLang = localStorage.getItem('i18nextLng')
const defaultLang = savedLang || getBrowserLanguage()

const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement)

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: enLocales,
      de: deLocales,
    },
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  })

root.render(
  <StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </StrictMode>,
)
