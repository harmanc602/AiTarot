import { useTranslation } from 'react-i18next';
import { LANGUAGES, type Language } from '@aitarot/core';

/** Compact language switcher shown on the main screen (top-right). */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.language as Language;

  return (
    <div
      className="flex gap-1 rounded-full border border-gold/40 bg-black/40 p-1 backdrop-blur"
      role="group"
      aria-label={t('language.label')}
    >
      {LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => void i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          className={`rounded-full px-3 py-1 text-sm font-sans transition-colors ${
            current === lng
              ? 'bg-gold text-black'
              : 'text-white/80 hover:text-white'
          }`}
        >
          {t(`language.${lng}`)}
        </button>
      ))}
    </div>
  );
}
