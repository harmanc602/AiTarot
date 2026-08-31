# apps/web — CLAUDE.md

React + Vite + TypeScript + Tailwind CSS + Framer Motion. Web-specific rendering, styles, and the **split-page layout (wheel + AI chat)**.

---

## Split-Page Layout (Wheel + AI Chat)

The home page is divided into **two halves**:

1. **First half:** Interactive card wheel (existing feature — CardWheel component)
2. **Second half:** AI chat interface with RAG-powered card interpretations

### Layout Logic

- **Horizontal split (top/bottom):** if viewport aspect ratio is **tall** (height > width)
- **Vertical split (left/right):** if viewport aspect ratio is **wide** (width ≥ height)

### Implementation Approach

Use CSS Grid or Flexbox with:
- Media queries: `@media (orientation: portrait)` vs `@media (orientation: landscape)`
- Or JS-driven layout: compare `window.innerWidth` / `window.innerHeight` in a `useEffect` + `ResizeObserver` or `matchMedia` listener

### Component Structure (planned)

```tsx
<SplitLayout orientation={isPortrait ? 'horizontal' : 'vertical'}>
  <WheelSection>
    <CardWheel {...wheelProps} />
  </WheelSection>
  <ChatSection>
    <AIChatInterface />
  </ChatSection>
</SplitLayout>
```

---

## AI Chat & RAG Integration

### Stack

- **Database:** Supabase (PostgreSQL + pgvector extension for vector embeddings)
- **Model Provider:** NVIDIA NIM (LLM API for completions)
- **RAG Pipeline:**
  1. User sends a query (e.g., "What does The Fool upright mean?")
  2. Embed the query using a sentence transformer (via Supabase edge function or client-side)
  3. Vector similarity search in Supabase `card_meanings` table
  4. Retrieve top-k relevant contexts
  5. Inject context into NVIDIA NIM prompt
  6. Stream completion back to chat UI

### Supabase Schema (planned)

Table: `card_meanings`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Unique meaning entry |
| `card_id` | `text` | Card identifier (e.g., `"major-00"`, `"cups-01"`) |
| `orientation` | `text` | `"upright"` or `"reversed"` |
| `context` | `text` | The interpretation text (source for embeddings) |
| `embedding` | `vector(384)` | pgvector embedding (384-dim for MiniLM, adjust as needed) |
| `language` | `text` | `"en"`, `"zh"`, or `"ja"` |

Indexes:
- `vector(embedding vector_cosine_ops)` for similarity search
- `(card_id, orientation, language)` composite for exact lookups

### Client Patterns

**Supabase Client:**

```tsx
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

// Vector search example
const { data, error } = await supabase.rpc('match_card_meanings', {
  query_embedding: embedding,  // float[] from embedding model
  match_threshold: 0.7,
  match_count: 5
})
```

**NVIDIA NIM API:**

```tsx
const response = await fetch(import.meta.env.VITE_NVIDIA_NIM_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_NVIDIA_NIM_API_KEY}`
  },
  body: JSON.stringify({
    model: 'meta/llama-3.1-70b-instruct',  // or chosen model
    messages: [
      { role: 'system', content: 'You are a tarot reader...' },
      { role: 'user', content: userQuery },
      { role: 'assistant', content: retrievedContext }  // injected RAG context
    ],
    temperature: 0.7,
    max_tokens: 512
  })
})
```

### Environment Variables

Add to `.env.local` (gitignored):

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=xxx
VITE_NVIDIA_NIM_URL=https://integrate.api.nvidia.com/v1/chat/completions
VITE_NVIDIA_NIM_API_KEY=xxx
```

---

## Wheel Rendering (existing feature)

- **360° ring layout:** 78 cards evenly spaced via `cardAngle(index, rotation)` from `@aitarot/core`.
- **CSS transforms** for positioning: `transform: translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`
- **Framer Motion** for spin animations (drag + momentum).
- Only render the **visible arc** of cards (e.g., bottom 180°) to avoid 78 DOM nodes — see `isCardVisible` from core.

---

## i18n & Fonts

Uses `react-i18next` initialized with `@aitarot/core` resources. Language choice persists to `localStorage`.

### Font Loading

Fonts loaded via `index.html` `<link>` tags (Google Fonts):

- **English:** Cinzel (serif, card names), Cormorant Garamond (body text)
- **Traditional Chinese:** Noto Serif TC
- **Japanese:** Noto Serif JP

### Language-Scoped Font CSS

Use attribute selectors to apply fonts only when `<html lang="...">` matches:

```css
/* Default (English) */
.card-name { font-family: 'Cinzel', serif; }

/* Chinese override */
[lang='zh'] .card-name { font-family: 'Noto Serif TC', serif; }

/* Japanese override */
[lang='ja'] .card-name { font-family: 'Noto Serif JP', serif; }
```

### Japanese Word Breaking

Japanese labels use `<wbr />` after `、` for manual line-break hints. Render with `dangerouslySetInnerHTML` or parse `<wbr />` manually if sanitizing.

---

## Known Quirks

### ResizeObserver + padding

`ResizeObserver` `contentRect` excludes padding — this is **load-bearing** in `RevealPage.tsx` where card grid sizing relies on the content box measurement. Do not replace `ResizeObserver` with `clientWidth`/`clientHeight` without accounting for padding.

### fitGrid label height

`fitGrid` layout logic assumes **2-line English labels, 1-line zh/ja labels** due to character density differences. If you change label rendering, re-verify grid spacing in all three languages.

---

## Styling

**Tailwind CSS only.** Do not introduce CSS modules, styled-components, or inline styles via `style={{...}}` — use Tailwind utility classes. For one-off values, add them to `tailwind.config.js` `theme.extend`.

---

## Image Loading

`src/cardImages.ts` uses `import.meta.glob` (Vite feature) to dynamically import all card images from `../../assets/img/clean/*.webp`.

Returns a function `getCardImage(imageKey: string): string` that resolves to the bundled URL.

---

## Before Committing

1. **Typecheck:** `npm run typecheck`
2. **Lint:** `npm run lint`
3. **Manual test:** `npm run web`, verify at http://localhost:5173
   - Test wheel interaction
   - Test AI chat (if implemented): send a query, verify RAG retrieval + NVIDIA NIM response
   - Test layout split: resize browser to portrait/landscape, confirm correct split direction
4. **Test all three languages:** EN, ZH, JA — verify fonts render correctly and labels fit grid cells.
