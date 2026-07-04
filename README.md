# AiTarot

A **tarot card picker** available as a **responsive web app** and a **cross-platform mobile app** (iOS / Android). Both are built from a shared TypeScript core so card data, translations, and game logic are written once.

Spin an interactive wheel of 78 face-down cards, pick 1–10, and reveal your spread — each card upright or reversed, fully localized in **English, Simplified Chinese, and Japanese**.

---

## Overview

| Layer | Tech |
|---|---|
| **Shared core** (`packages/core`) | TypeScript — card data, i18n resources, pure logic (deck, selection, reveal, rotation), design tokens |
| **Web** (`apps/web`) | React + Vite + TypeScript, Tailwind CSS, Framer Motion, `react-i18next` |
| **Mobile** (`apps/mobile`) | Expo (SDK 51) + expo-router, React Native Reanimated + Gesture Handler, `react-native-svg`, `expo-localization` + `react-i18next` |
| **Tooling** | npm workspaces, ESLint + Prettier (shared config), Python (asset prep + data generation) |

The wheel, card back (a code-drawn celestial SVG mandala), selection rules, reveal orientation, and translations are consistent across platforms because they draw from the same `@aitarot/core` package.

See [`docs/`](docs/) for the [architecture overview](docs/architecture.md), [i18n guide](docs/i18n-guide.md), and [design token reference](docs/design-tokens.md).

---

## Repository layout

```
AiTarot/
├─ packages/core/            # Shared, framework-agnostic TypeScript
│  ├─ data/tarot-cards.json  # The canonical 78-card dataset (en/zh/ja)
│  ├─ scripts/gen_cards.py   # Regenerates the dataset (source of truth)
│  ├─ src/logic/             # deck, selection, reveal, rotation (pure functions)
│  ├─ src/i18n/              # i18next resources + label formatters
│  └─ src/tokens.ts          # colors, fonts, limits
├─ apps/web/                 # Vite + React + Tailwind + Framer Motion
├─ apps/mobile/              # Expo + expo-router + Reanimated
├─ assets/img/               # 78 card images (big/ originals, clean/ cropped)
├─ scripts/crop_tarot_images.py
└─ docs/
```

---

## Prerequisites

- **Node.js ≥ 18** and **npm ≥ 9** (npm workspaces)
- **Python 3.9+** — only needed to regenerate card data / crop images
- **Mobile only:** the [Expo Go](https://expo.dev/go) app on a phone, or an Android/iOS emulator. iOS builds require macOS + Xcode.

> This repo was scaffolded on a machine without Node installed, so `npm install` has not been run here. Run it once after cloning (below).

---

## Installation

From the repo root:

```bash
npm install
```

This installs dependencies for every workspace (`packages/core`, `apps/web`, `apps/mobile`) and links the shared core.

---

## Running locally

### Web

```bash
npm run web          # starts Vite dev server (http://localhost:5173)
npm run web:build    # type-check + production build -> apps/web/dist
```

### Mobile

```bash
npm run mobile       # starts the Expo dev server
```

Then press `a` (Android emulator), `i` (iOS simulator, macOS only), or scan the QR code with **Expo Go**. You can also run `npm run mobile -- --web` to preview the RN app in a browser via react-native-web.

---

## Card data & assets

The 78-card dataset (`packages/core/data/tarot-cards.json`) is **generated**, not hand-edited — it is the single source of truth for card identity and localized names.

```bash
npm run gen:cards                          # regenerate the JSON dataset
python apps/mobile/scripts/gen_image_map.py # regenerate the mobile require() map
```

Card artwork lives in `assets/img/`:

- `big/` — original scans (white border + watermark)
- `clean/` — cropped artwork used by the apps

To (re)crop the clean images from the originals:

```bash
python -m pip install -r requirements.txt
python scripts/crop_tarot_images.py          # writes to assets/img/clean
python scripts/crop_tarot_images.py --in-place
```

Tune detection with `--background-threshold` and `--edge-trim` if a specific card needs a tighter or looser crop.

---

## Environment variables

None. The app has no backend, accounts, or secrets (see *Out of scope* below). No `.env` file is required.

---

## Quality

```bash
npm run typecheck    # tsc across all workspaces
npm run lint         # ESLint
npm run format       # Prettier --write
node --test packages/core/test    # run core logic unit tests (after npm install)
```

---

## Build & deployment

**Web** — a static site:

```bash
npm run web:build            # -> apps/web/dist
```

Deploy `apps/web/dist` to any static host (Netlify, Vercel, GitHub Pages, S3+CloudFront).

**Mobile** — via [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
cd apps/mobile
npx eas build --platform android   # or ios
```

---

## Version control / branching

- `main` — stable, releasable
- `develop` — integration branch
- `feature/*` — one branch per feature, merged into `develop` via PR

---

## Out of scope (v1)

User accounts, saved readings, card interpretations/meanings, any backend or database, and push notifications.
