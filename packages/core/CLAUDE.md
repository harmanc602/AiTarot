# packages/core — CLAUDE.md

Pure TypeScript, zero framework dependencies. Everything here runs in both web and mobile without modification — **no DOM APIs, no React, no React Native imports.**

---

## Exports

See @packages/core/src/index.ts for the live export surface. Don't trust hand-copied lists — they drift. When adding a new export, add it to `index.ts` first, then import it in the consuming app.

---

## Logic Constraints

### Selection
- **1–10 cards.** `toggleSelection` enforces this — it rejects additions when `selected.length === MAX_SELECTION` (10).
- Never bypass `toggleSelection` to add items directly to the array.

### Reveal
- **Orientation is decided once** at confirm time via `revealCards(selectedIds)`.
- Each card gets `randomOrientation()` called exactly once — never re-randomize on re-render.
- `revealCards` returns `RevealedCard[]` with frozen orientation.

### Rotation (wheel geometry)
- **78 cards evenly spaced** around 360° (`360 / 78 ≈ 4.615°` per card).
- `rotation` state is the wheel's current spin angle (degrees).
- `cardAngle(index, rotation)` gives a card's current position.
- Shared math lives in `src/logic/rotation.ts` — **web and mobile must not reimplement it.** Import from core instead.

---

## Card Data

`data/tarot-cards.json` is **generated** by `scripts/gen_cards.py` — never hand-edit. Regenerate with:

```bash
npm run gen:cards
```

The JSON is imported directly by core logic (`src/logic/deck.ts`) and is the single source of truth for card identity, suits, and localized names.

---

## i18n Resources

`src/i18n/locales/{en,zh,ja}.json` — keep all three in strict key parity. Every key present in one locale must exist in all three.

Japanese uses `<wbr />` after `、` for manual line-break hints in long labels. Check `apps/web/CLAUDE.md` for rendering-side handling.

---

## Testing

`test/core.test.ts` — covers selection, reveal, rotation. Tests accept an injectable `rng` for determinism.

**Never edit an existing test to make it pass.** Tests are the spec. If a test fails, fix the code or explain why the test is wrong.

Run tests:

```bash
npm run test   # Node --test runner
```

---

## Design Tokens

`src/tokens.ts` — colors, fonts, `MAX_SELECTION`, `MIN_SELECTION`. Both apps import these for consistent theming.

Do not hard-code magic numbers (card limits, color hex codes) in app code — import from tokens instead.
