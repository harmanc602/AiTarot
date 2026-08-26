# AiTarot — CLAUDE.md

Cross-cutting instructions for the entire monorepo. Subdirectory-specific guidance lives in `packages/core/CLAUDE.md`, `apps/web/CLAUDE.md`, `apps/mobile/CLAUDE.md`; path-scoped rules are in `.claude/rules/`; procedural workflows are in `.claude/skills/`.

---

## Golden Rules

1. **Node is not on PATH.** This repo was scaffolded on a machine without Node installed. Always use **`npm run <script>`** from the repo root (or `--workspace` flag) to run any command that invokes `node`, `tsc`, `vite`, or `expo`. Never call them directly from Bash — they will fail. See Environment Setup below for the full workaround.

2. **Core is the single source of truth for shared logic.** Card data, i18n resources, selection rules (1–10), reveal orientation (50/50), rotation math, and design tokens are all exported from `@aitarot/core` — see live export surface at @packages/core/src/index.ts. Never copy core logic into web or mobile; always import it. If you need a function that doesn't exist, add it to core first.

3. **AI chat & RAG architecture.** The web app home page is split into two halves: card wheel (first half) + AI chat (second half). Layout adapts: horizontal split if viewport is tall, vertical split if wide. AI chat uses RAG (Retrieval-Augmented Generation) backed by Supabase (database) and NVIDIA NIM (model provider). This architecture does not exist in mobile yet — mobile remains wheel-only.

---

## How instructions are organized

- **This file (root `CLAUDE.md`)** — cross-cutting: monorepo setup, Node-not-on-PATH workaround, architecture constraints, deployment pointers.
- **`packages/core/CLAUDE.md`** — pure-TS constraints, live export pointer, logic invariants.
- **`apps/web/CLAUDE.md`** — wheel rendering, i18n fonts, split-page layout (wheel + AI chat), AI/RAG/Supabase/NVIDIA NIM integration, known quirks.
- **`apps/mobile/CLAUDE.md`** — Reanimated, expo-localization, image map regeneration (mobile remains wheel-only, no AI chat yet).
- **`.claude/rules/`** — path-gated rules injected only when matching files are touched:
  - `testing.md` (`**/*.test.ts`) — never edit tests to pass
  - `i18n.md` (`**/i18n/locales/*.json`) — key parity across en/zh/ja
  - `core-logic.md` (`packages/core/src/logic/**/*.ts`) — selection/reveal/rotation invariants
  - `ai-rag.md` (`apps/web/src/ai/**/*.ts`, `apps/web/src/rag/**/*.ts`) — Supabase schema, NVIDIA NIM client patterns
- **`.claude/skills/`** — procedural workflows invoked explicitly (e.g., `/deploy`):
  - `deploy.md` — how to deploy web (Vercel/Netlify) and build mobile (EAS)

---

## Project Overview

**AiTarot** is a tarot card picker available as a responsive web app and a cross-platform mobile app (iOS / Android). Both are built from a shared TypeScript core so card data, translations, and game logic are written once.

**Web unique feature:** The home page is split into two halves — the interactive card wheel on one side, and an AI chat interface on the other. The AI chat provides card interpretations and guidance using RAG (retrieval-augmented generation) backed by Supabase for vector storage and NVIDIA NIM for the LLM.

**Common:** Spin an interactive wheel of 78 face-down cards, pick 1–10, and reveal your spread — each card upright or reversed, fully localized in English, Traditional Chinese, and Japanese.

| Layer | Tech |
|---|---|
| **Shared core** (`packages/core`) | TypeScript — card data, i18n resources, pure logic (deck, selection, reveal, rotation), design tokens |
| **Web** (`apps/web`) | React + Vite + TypeScript, Tailwind CSS, Framer Motion, `react-i18next`, **split-page layout (wheel + AI chat), Supabase client, NVIDIA NIM integration** |
| **Mobile** (`apps/mobile`) | Expo (SDK 51) + expo-router, React Native Reanimated + Gesture Handler, `react-native-svg`, `expo-localization` + `react-i18next` **(wheel-only, no AI chat yet)** |
| **Tooling** | npm workspaces, ESLint + Prettier (shared config), Python (asset prep + data generation) |

See `docs/` for detailed [architecture overview](docs/architecture.md), [i18n guide](docs/i18n-guide.md), and [design token reference](docs/design-tokens.md).

---

## Environment Setup

### Node-not-on-PATH workaround

This repo was scaffolded on a machine **without Node installed**. `node`, `npm`, `tsc`, `vite`, `expo`, and all Node-based CLIs are **not on PATH**.

**Never call them directly from Bash.** Use `npm run <script>` from the repo root (or with `--workspace` flag) to invoke any command that needs Node. npm itself is available because it was invoked via an indirect shim, but nothing Node installs into `node_modules/.bin/` is accessible directly.

If you need to run a command not already scripted in a `package.json`, add it there first, then call it via `npm run`.

### Prerequisites

- **Node.js ≥ 18** and **npm ≥ 9** (npm workspaces)
- **Python 3.9+** — only needed to regenerate card data / crop images
- **Mobile only:** [Expo Go](https://expo.dev/go) app on a phone, or an Android/iOS emulator. iOS builds require macOS + Xcode.

### Installation

From the repo root:

```bash
npm install
```

This installs dependencies for every workspace and links the shared core.

---

## Common Commands

```bash
# Development
npm run web             # Vite dev server (http://localhost:5173)
npm run mobile          # Expo dev server (scan QR with Expo Go)

# Build
npm run web:build       # typecheck + Vite build -> apps/web/dist

# Quality
npm run typecheck       # tsc across all workspaces
npm run lint            # ESLint
npm run format          # Prettier --write
npm run test            # Node --test runner on packages/core/test

# Data generation
npm run gen:cards       # regenerate packages/core/data/tarot-cards.json
python apps/mobile/scripts/gen_image_map.py  # regenerate mobile require() map
```

---

## Architecture

### Key constraints

1. **Pure core:** `packages/core` is framework-agnostic. No React, no DOM, no React Native imports. Everything here must run in both web and mobile without modification.

2. **Split-page web layout (wheel + AI chat):** The web app home page is divided into two halves:
   - **First half:** Interactive card wheel (existing feature)
   - **Second half:** AI chat interface with RAG-powered interpretations
   - **Layout logic:** Horizontal split (top/bottom) if viewport aspect ratio is tall (height > width). Vertical split (left/right) if viewport is wide (width ≥ height).
   - **Implementation:** CSS Grid or Flexbox with media queries / JS-driven layout based on `window.innerWidth` / `window.innerHeight`.

3. **AI/RAG stack (web only):**
   - **Database:** Supabase (PostgreSQL + pgvector for embeddings)
   - **Model provider:** NVIDIA NIM (LLM API)
   - **RAG pipeline:** User query → embed → vector search in Supabase → context retrieval → NVIDIA NIM completion with injected context
   - **Schema (planned):** `card_meanings` table with columns: `id`, `card_id`, `orientation`, `context`, `embedding` (vector), `language`
   - **Client pattern:** Supabase JS client for DB/vector queries, fetch/axios for NVIDIA NIM API calls

4. **Mobile remains wheel-only:** The AI chat feature and RAG architecture are **web-only** for now. Mobile apps continue with the existing wheel + reveal flow, no chat interface.

5. **Logic constraints:**
   - Selection: 1–10 cards enforced by `toggleSelection` (rejects additions at 10)
   - Reveal: orientation decided once, at confirm, via `revealCards()` — never re-randomized on re-render
   - Rotation math: shared in core, never reimplemented per platform

6. **Testing philosophy:** Write tests for new core logic. Existing tests are the spec — never edit a test to make it pass. If a test fails after your change, fix the implementation or explain why the test is obsolete.

---

## Card Data & Assets

The 78-card dataset (`packages/core/data/tarot-cards.json`) is **generated**, not hand-edited. Single source of truth.

Card artwork lives in `assets/img/`:
- `big/` — original scans
- `clean/` — cropped artwork used by apps

To regenerate:

```bash
npm run gen:cards   # regenerate JSON dataset
python scripts/crop_tarot_images.py  # re-crop clean/ from big/
python apps/mobile/scripts/gen_image_map.py  # regenerate mobile require() map
```

---

## Testing

```bash
npm run test        # Node --test runner on packages/core/test/*.test.ts
npm run typecheck   # tsc across all workspaces
```

Core logic has unit tests. Web and mobile are tested manually (no E2E suite yet).

**Never edit an existing test to make it pass.** Tests are the spec. If a test fails, fix the code or explain why the test is wrong — don't change the assertion to match new output.

---

## Before finishing any task

1. **Run typecheck:** `npm run typecheck` (from repo root).
2. **Run tests if you touched core logic:** `npm run test`.
3. **Verify the change manually** in the relevant app(s):
   - Web: `npm run web`, open http://localhost:5173
   - Mobile: `npm run mobile`, scan QR with Expo Go
4. **If you added/changed an export in core:** verify it appears in @packages/core/src/index.ts and is imported correctly in web/mobile.
5. **If you touched i18n:** verify key parity across `en.json`, `zh.json`, `ja.json`.
6. **If you touched AI/RAG code:** verify Supabase connection, vector search results, and NVIDIA NIM API responses in the web app chat interface.

---

## Deployment

See `.claude/skills/deploy.md` for full instructions. Quick summary:

- **Web (static site):** `npm run web:build` → deploy `apps/web/dist` to Vercel/Netlify/etc.
- **Mobile (EAS Build):** `cd apps/mobile && npx eas build --platform android` (or `ios` or `all`)

---

## Out of Scope

**Current scope (v1):**
- User accounts, saved readings, and push notifications remain out of scope.
- The AI chat feature is **web-only**; mobile does not have chat or RAG yet.
- Card interpretations in the AI chat are generated dynamically via RAG — no static meanings database is hand-curated for now (embeddings + NVIDIA NIM provide the interpretations).
