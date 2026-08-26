---
globs: "packages/core/src/logic/**/*.ts"
---
Re-verify after any edit here:
- Selection stays 1–10 cards (`toggleSelection` rejects additions at 10)
- Reveal orientation is decided once, at confirm, via `revealCards()` — never re-randomized
- Rotation/geometry math is shared — web and mobile must not reimplement it

Run `npm run typecheck && npm run test` before touching any web/mobile code
that depends on what you just changed.
