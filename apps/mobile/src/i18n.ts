import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { resources, defaultLanguage, LANGUAGES, type Language } from '@aitarot/core';

/** Pick a supported language from the device locale, else the default. */
function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode ?? defaultLanguage;
  return (LANGUAGES as string[]).includes(code) ? (code as Language) : defaultLanguage;
}

void i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage(),
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v3',
});

export default i18n;
