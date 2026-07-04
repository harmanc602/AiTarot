import en from './locales/en.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import type { Language, Orientation, RevealedCard, TarotCard } from '../types';

/**
 * i18next resource bundles, ready to pass to `i18n.init({ resources })` on
 * either platform. The `translation` namespace is used throughout the apps.
 */
export const resources = {
  en: { translation: en },
  zh: { translation: zh },
  ja: { translation: ja },
} as const;

export const defaultLanguage: Language = 'en';

/** The localized display name of a card in the given language. */
export function cardName(card: TarotCard, language: Language): string {
  return card.name[language];
}

/**
 * Build the label shown under a revealed card, e.g.
 *   en → "Ace of Cups (Upright)"
 *   zh → "杯一（正）"
 *   ja → "カップのエース（正位置）"
 *
 * `t` is the i18next translation function bound to the active language, so the
 * `cardLabel` template and `orientation.*` strings come from the locale files —
 * keeping punctuation (ASCII vs. full-width parens) correct per language.
 */
export function revealLabel(
  card: TarotCard,
  orientation: Orientation,
  language: Language,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  return t('cardLabel', {
    name: cardName(card, language),
    orientation: t(`orientation.${orientation}`),
  });
}

/** Convenience: label a {@link RevealedCard} in one call. */
export function revealedCardLabel(
  revealed: RevealedCard,
  language: Language,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  return revealLabel(revealed.card, revealed.orientation, language, t);
}

export { en, zh, ja };
