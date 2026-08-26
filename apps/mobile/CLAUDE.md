# apps/mobile — CLAUDE.md

Expo (SDK 51) + expo-router + React Native Reanimated + Gesture Handler. Mobile-specific rendering and navigation.

**Note:** The AI chat feature is **web-only** for now. Mobile remains wheel-only with the existing pick → reveal flow.

---

## Wheel Rendering

- **Reanimated `useSharedValue` + `useAnimatedStyle`** for the spin gesture (no Framer Motion in RN).
- **`react-native-gesture-handler` `<GestureDetector>`** with `Gesture.Pan()` for drag input.
- Geometry math imported from `@aitarot/core` (`cardAngle`, `dragToRotation`, `wrapRotation`) — never reimplement rotation logic locally.

---

## i18n

Uses `react-i18next` initialized with `@aitarot/core` resources.

Default language determined by device locale via `expo-localization`:

```tsx
import * as Localization from 'expo-localization'
const deviceLanguage = Localization.locale  // e.g., "en-US", "zh-TW", "ja-JP"
```

Map to `en`, `zh`, or `ja` and fall back to `en` if unsupported.

---

## Image Loading

React Native **cannot use dynamic `require()` paths**. Images must be mapped statically.

**Regenerate the image map** whenever you add/remove card images:

```bash
python apps/mobile/scripts/gen_image_map.py
```

This writes `src/cardImages.ts` with a static `require()` object like:

```tsx
export const cardImages: Record<string, any> = {
  'major-00': require('../../assets/img/clean/major-00-fool.webp'),
  'major-01': require('../../assets/img/clean/major-01-magician.webp'),
  // ... 78 entries
}
```

---

## Navigation

Uses `expo-router` (file-based routing):

- `app/index.tsx` — picker screen (wheel + selection)
- `app/reveal.tsx` — reveal screen (grid of revealed cards)
- `app/_layout.tsx` — root layout (gesture root, font loading, headerless stack)

Pass selected card IDs from picker → reveal via a tiny in-memory store (`src/revealStore.ts`) or route params.

---

## Before Committing

1. **Typecheck:** `npm run typecheck`
2. **Lint:** `npm run lint`
3. **Manual test:** `npm run mobile`, scan QR with Expo Go or press `a` (Android) / `i` (iOS simulator)
   - Test wheel drag gesture + momentum
   - Test card selection (1–10 enforcement)
   - Test reveal screen with upright/reversed cards
4. **Test all three languages:** EN, ZH, JA — verify device locale detection and font rendering.
