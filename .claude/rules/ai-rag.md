---
globs: "apps/web/src/ai/**/*.ts,apps/web/src/rag/**/*.ts"
---
# AI/RAG Code Patterns

## Supabase Client

Always use the shared Supabase client instance (create once, reuse):

```tsx
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

## Vector Search Pattern

Use `supabase.rpc()` to call the `match_card_meanings` PostgreSQL function (must be created on Supabase side):

```tsx
const { data, error } = await supabase.rpc('match_card_meanings', {
  query_embedding: embeddingVector,  // float[] from embedding model
  match_threshold: 0.7,
  match_count: 5
})
```

## NVIDIA NIM Client

Use `fetch` or `axios` with proper error handling. Stream responses when possible:

```tsx
const response = await fetch(import.meta.env.VITE_NVIDIA_NIM_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_NVIDIA_NIM_API_KEY}`
  },
  body: JSON.stringify({
    model: 'meta/llama-3.1-70b-instruct',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery }
    ],
    temperature: 0.7,
    max_tokens: 512,
    stream: true  // for streaming responses
  })
})
```

## RAG Pipeline Checklist

1. **Embed the query** (client-side via transformers.js or server-side via Supabase edge function)
2. **Vector search** in `card_meanings` table
3. **Retrieve top-k contexts** (typically k=3–5)
4. **Inject contexts into prompt** as system or assistant messages
5. **Call NVIDIA NIM** with augmented prompt
6. **Stream or return completion** to chat UI

## Schema Expectations

`card_meanings` table must have:
- `embedding` column of type `vector(384)` (or match your embedding model dimension)
- Index: `CREATE INDEX ON card_meanings USING ivfflat (embedding vector_cosine_ops)`
- Columns: `id`, `card_id`, `orientation`, `context`, `embedding`, `language`

## Error Handling

- **Supabase errors:** Check `error` object returned from queries; log and show user-friendly message
- **NVIDIA NIM errors:** Handle 401 (auth), 429 (rate limit), 500 (server error) explicitly
- **Network errors:** Implement retry logic with exponential backoff (max 3 retries)

## Environment Variables

Required in `.env.local`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_NVIDIA_NIM_URL`
- `VITE_NVIDIA_NIM_API_KEY`

Never commit these to git. Add `.env.local` to `.gitignore`.
