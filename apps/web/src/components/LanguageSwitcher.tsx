import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, type Language } from '@aitarot/core';

/** Globe SVG icon. */
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z" />
    </svg>
  );
}

/**
 * Language switcher: a globe-icon button that toggles a dropdown list of the
 * available languages. The list closes when a language is picked or when the
 * user clicks anywhere outside the switcher (and on Escape).
 */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.language as Language;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const pick = (lng: Language) => {
    void i18n.changeLanguage(lng);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language.label')}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-black/40 text-gold backdrop-blur transition-colors hover:bg-white/10"
      >
        <GlobeIcon className="h-5 w-5" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('language.label')}
          className="absolute right-0 z-50 mt-2 min-w-[9rem] overflow-hidden rounded-xl border border-gold/40 bg-black/80 py-1 shadow-glow backdrop-blur"
        >
          {LANGUAGES.map((lng) => (
            <li key={lng} role="option" aria-selected={current === lng}>
              <button
                type="button"
                onClick={() => pick(lng)}
                className={`block w-full px-4 py-2 text-left text-sm font-sans transition-colors ${
                  current === lng
                    ? 'bg-gold/90 text-black'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t(`language.${lng}`)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
