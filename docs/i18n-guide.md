# Internationalization (i18n) Guide

AiTarot ships in **English (`en`)**, **Simplified Chinese (`zh`)**, and **Japanese (`ja`)**.
All UI strings, card names, and system messages are localized. Both apps use
[`i18next`](https://www.i18next.com/) + `react-i18next` and share their translation
resources from `@aitarot/core`, so there is exactly **one** place to edit each string.

## Where strings live

| Content | Location |
|---|---|
| UI strings & messages | `packages/core/src/i18n/locales/{en,zh,ja}.json` |
| Card names | `packages/core/data/tarot-cards.json` (`name.{en,zh,ja}` per card) |
| Resource bundling & label helpers | `packages/core/src/i18n/index.ts` |
| Web init (persists to `localStorage`) | `apps/web/src/i18n.ts` |
| Mobile init (defaults to device locale) | `apps/mobile/src/i18n.ts` |

### UI string keys

```jsonc
{
  "app":   { "title": "AiTarot" },
  "picker":{ "instruction": "…", "enter": "…" },
  "reveal":{ "title": "…", "back": "…" },
  "orientation": { "upright": "…", "reversed": "…" },
  "cardLabel": "{{name}} ({{orientation}})",   // punctuation differs per language
  "toast": { "maxCards": "…" },
  "language": { "label": "…", "en": "…", "zh": "…", "ja": "…" }
}
```

`cardLabel` is a template: English uses ASCII parentheses and a space
(`Ace of Cups (Upright)`), while Chinese and Japanese use full-width parentheses with no
space (`杯一（正）`, `カップのエース（正位置）`). This is why the label is built through the
locale file and not hard-coded — see `revealedCardLabel` in
`packages/core/src/i18n/index.ts`.

### Card names

Card names come from the generated dataset. **Do not edit `tarot-cards.json` by hand** —
edit the generator and re-run it:

```
packages/core/scripts/gen_cards.py   →   npm run gen:cards
```

The generator holds the Major Arcana names per language and composes Minor Arcana names
from suit + rank tables.

## Using translations in components

```tsx
import { useTranslation } from 'react-i18next';
import { revealedCardLabel, type Language } from '@aitarot/core';

const { t, i18n } = useTranslation();
t('picker.instruction');                         // a UI string
revealedCardLabel(revealed, i18n.language as Language, t); // a card label
```

Switch language with `i18n.changeLanguage('zh')` (the `LanguageSwitcher` component does
this). On web the choice is saved to `localStorage`; on mobile the initial language follows
the device locale.

---

## Adding a new language

Example: add **French (`fr`)**.

1. **Register the code** in `packages/core/src/types.ts`:

   ```ts
   export type Language = 'en' | 'zh' | 'ja' | 'fr';
   export const LANGUAGES: Language[] = ['en', 'zh', 'ja', 'fr'];
   ```

2. **Add UI strings** — create `packages/core/src/i18n/locales/fr.json` with the **same keys**
   as `en.json`. Choose the correct `cardLabel` punctuation for the language.

3. **Wire the resource** in `packages/core/src/i18n/index.ts`:

   ```ts
   import fr from './locales/fr.json';
   export const resources = {
     en: { translation: en },
     zh: { translation: zh },
     ja: { translation: ja },
     fr: { translation: fr },
   } as const;
   ```

4. **Add card names** — extend the tables in `packages/core/scripts/gen_cards.py`
   (add a `fr` entry to every Major Arcana tuple and to the suit/rank maps), then run
   `npm run gen:cards`. Because `Language` now includes `fr`, TypeScript will flag any card
   whose `name` is missing the `fr` key.

5. **Verify** — `npm run typecheck` (catches missing keys via the `Localized` type) and check
   that both `en.json` and `fr.json` have identical key sets.

That's it — the `LanguageSwitcher` renders one button per entry in `LANGUAGES`, so the new
language appears automatically on both platforms. No app code changes required.

## Checklist for translators

- [ ] Every key present in `en.json` exists in the new locale (no more, no less).
- [ ] `cardLabel` uses culturally correct parentheses/spacing.
- [ ] `orientation.upright` / `orientation.reversed` are short (they render in the label).
- [ ] Card names added to `gen_cards.py` and regenerated.
- [ ] `npm run typecheck` passes.
