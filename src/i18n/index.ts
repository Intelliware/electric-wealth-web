import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCA from './en-CA.json';
import frCA from './fr-CA.json';

// en-CA.json / fr-CA.json are ported from the mobile app (mobile/src/i18n), plus a "web" section.

export type AppLocale = 'en-CA' | 'fr-CA';

const LOCALE_KEY = 'ew_locale';

function initialLocale(): AppLocale {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === 'en-CA' || stored === 'fr-CA') return stored;
  } catch {
    // storage unavailable: fall through to the browser language
  }
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr-CA' : 'en-CA';
}

void i18n.use(initReactI18next).init({
  resources: {
    'en-CA': { translation: enCA },
    'fr-CA': { translation: frCA },
  },
  lng: initialLocale(),
  fallbackLng: 'en-CA',
  interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language;

export function getAppLocale(): AppLocale {
  return i18n.language === 'fr-CA' ? 'fr-CA' : 'en-CA';
}

export async function setAppLocale(locale: AppLocale): Promise<void> {
  await i18n.changeLanguage(locale);
  document.documentElement.lang = locale;
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // ignore
  }
}

export default i18n;
