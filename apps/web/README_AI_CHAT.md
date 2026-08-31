# AiTarot Web App - AI Chat Implementation

## Overview

This implementation adds a **RAG-powered AI chat interface** to the AiTarot web app. The chat provides ethical tarot guidance using:
- **Supabase** for vector storage (card meanings + methodology from PDFs)
- **LangChain** for multi-provider LLM support (NVIDIA NIM, OpenAI, Anthropic, Ollama)
- **Client-side embeddings** via @xenova/transformers (MiniLM-L6-v2, 384-dim)

## Architecture

### Split-Page Layout
- **Left/Top:** Card wheel OR reveal screen (toggles between states)
- **Right/Bottom:** AI chat (always visible, persists across state changes)
- **Responsive:** Horizontal split on portrait (tall viewports), vertical split on landscape

### RAG Pipeline
1. User sends query
2. Query is embedded (384-dim vector)
3. Vector search in Supabase retrieves:
   - Top 5 card meanings (from `card_meanings` table)
   - Top 3 methodology guidelines (from `reading_guidelines` table)
4. Context + current spread + ethical guidelines → LLM system prompt
5. LLM streams response back to chat

### Ethical Guidelines
Hard-coded in `apps/web/src/lib/rag.ts` as `TAROT_READER_SYSTEM_PROMPT`. Emphasizes:
- Free will and personal agency
- No medical/legal/financial advice
- Empowering tone
- Readings as possibilities, not fate

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Supabase Project
1. Go to https://supabase.com and create a new project
2. Copy your project URL and anon key
3. Run the schema setup:
   - Open Supabase SQL Editor
   - Copy contents of `apps/web/supabase-schema.sql`
   - Execute the SQL

### 3. Configure Environment
Copy `.env.local.example` to `.env.local`:
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `.env.local` with your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

VITE_LLM_PROVIDER=nvidia-nim
VITE_LLM_MODEL=meta/llama-3.1-70b-instruct
VITE_LLM_API_KEY=your-nvidia-api-key
VITE_LLM_BASE_URL=https://integrate.api.nvidia.com/v1

VITE_USER_TIER=free
```

### 4. Seed Database (Optional but Recommended)

**Note:** PDF processing and database seeding scripts are included but require:
- Environment variables: `SUPABASE_URL` and `SUPABASE_SECRET_KEY`
- PDF files in `assets/text/` (already present)
- Manual card meanings data (see `apps/web/scripts/seed-database.ts`)

To seed:
```bash
# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SECRET_KEY="your-secret-key"

# Process PDFs
npm run seed:pdfs --workspace apps/web

# Seed database (requires card meanings to be added to script first)
npm run seed:db --workspace apps/web
```

**Important:** The seeding script includes placeholder card meanings. You need to:
1. Edit `apps/web/scripts/seed-database.ts`
2. Add actual card meanings for all 78 cards (upright + reversed)
3. Then run the seed command

### 5. Run Development Server
```bash
npm run web
```

Open http://localhost:5173

## Usage

1. **Select cards** from the wheel (1-10 cards)
2. **Click "Enter"** to reveal your spread
3. **Ask questions** in the chat about your cards
4. **Hover over spread logs** in chat to view previous readings
5. **Click "Draw Again"** to return to wheel (chat persists with history)

## File Structure

```
apps/web/
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client + types
│   │   ├── embeddings.ts        # Client-side embedding generation
│   │   ├── llm.ts               # LangChain multi-provider LLM client
│   │   └── rag.ts               # RAG pipeline (retrieve + generate)
│   ├── components/
│   │   ├── SplitLayout.tsx      # Responsive split-page layout
│   │   ├── AIChatInterface.tsx  # Chat UI with spread logs
│   │   └── ...                  # Existing components
│   └── App.tsx                  # Updated with split layout
├── docs/
│   ├── LLM_PROVIDER_SETUP.md    # How to switch LLM providers
│   ├── PDF_INGESTION.md         # How to add new PDFs
│   ├── ETHICAL_GUIDELINES.md    # Tarot reading ethics
│   └── USER_TIERS.md            # Future user tier system
├── scripts/
│   ├── process-pdfs.ts          # PDF text extraction
│   └── seed-database.ts         # Database seeding
├── supabase-schema.sql          # Database schema + RPC functions
└── .env.local.example           # Environment template
```

## Switching LLM Providers

See `docs/LLM_PROVIDER_SETUP.md` for full details. Quick example:

### To OpenAI:
```env
VITE_LLM_PROVIDER=openai
VITE_LLM_MODEL=gpt-4o
VITE_LLM_API_KEY=sk-xxx
```

### To Anthropic:
```env
VITE_LLM_PROVIDER=anthropic
VITE_LLM_MODEL=claude-3-5-sonnet-20241022
VITE_LLM_API_KEY=sk-ant-xxx
```

No code changes needed — restart dev server and it works.

## User Tiers (MVP)

Currently frontend-only (no authentication). Tier is set via:
```env
VITE_USER_TIER=free  # or premium, pro
```

See `docs/USER_TIERS.md` for future backend integration plans.

## Known Limitations

1. **Seeding required:** Database starts empty. You must seed card meanings and PDFs.
2. **No authentication:** User tier is hardcoded in `.env.local`
3. **Client-side embeddings:** First query downloads ~80MB model (cached afterward)
4. **English chat only:** UI is multilingual (EN/ZH/JA), but LLM responses are English
5. **No message history persistence:** Chat clears on page reload
6. **Web only:** Mobile app does not have AI chat yet

## Next Steps

1. **Add card meanings:** Edit `seed-database.ts` with actual interpretations
2. **Run seeding:** Populate Supabase with card meanings + PDF content
3. **Test RAG:** Verify vector search returns relevant contexts
4. **Test providers:** Try switching between NVIDIA NIM, OpenAI, Anthropic
5. **Production deploy:** Set up environment variables in your hosting platform

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists and has correct values
- Restart dev server after changing `.env.local`

### "Vector search failed"
- Verify Supabase schema was created (run `supabase-schema.sql`)
- Check RPC functions exist: `match_card_meanings`, `match_reading_guidelines`

### "LLM API error"
- Verify API key is correct
- Check provider is supported (nvidia-nim, openai, anthropic, ollama)
- Ensure you have credits/quota remaining

### "Embedding model download slow"
- First run downloads ~80MB model from HuggingFace
- Cached in browser afterward
- Use good internet connection for first query

## Documentation

- [LLM Provider Setup](docs/LLM_PROVIDER_SETUP.md) — Switch providers
- [PDF Ingestion](docs/PDF_INGESTION.md) — Add new methodology sources
- [Ethical Guidelines](docs/ETHICAL_GUIDELINES.md) — Reading principles
- [User Tiers](docs/USER_TIERS.md) — Future paid features design
