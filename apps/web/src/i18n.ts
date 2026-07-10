import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, defaultLanguage } from '@aitarot/core';

const STORAGE_KEY = 'aitarot.lang';

/** Restore a saved language, else fall back to the default. */
function initialLanguage(): string {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['en', 'zh', 'ja'].includes(saved)) return saved;
  }
  return defaultLanguage;
}

/** Reflect the active language on <html lang> so language-scoped CSS (e.g. the
 * Japanese font override in index.css) applies. */
function syncHtmlLang(lng: string) {
  if (typeof document !== 'undefined') document.documentElement.lang = lng;
}

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage(),
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
});

syncHtmlLang(i18n.language);

// Persist language changes so the choice survives reloads, and keep <html lang>
// in sync so the correct font stack is applied.
i18n.on('languageChanged', (lng) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, lng);
  syncHtmlLang(lng);
});

export default i18n;
