# PDF Ingestion for RAG

## Overview

The application uses 3 PDF source files for tarot reading methodology and ethical guidelines:

1. **The Ultimate Guide to Tarot - A Beginner.pdf** (17 MB) — methodology
2. **Universal-Rider-Waite-Booklet.pdf** (216 KB) — interpretation principles
3. **Waite_Pictorial_Key_to_the_Tarot.pdf** (2.2 MB) — interpretation principles

These are stored in `assets/text/` and processed during database seeding.

## Processing Pipeline

1. **Extract text** — `pdf-parse` library reads PDF content
2. **Chunk text** — Split into ~1000 character chunks on paragraph boundaries
3. **Generate embeddings** — MiniLM-L6-v2 (384-dim) via @xenova/transformers
4. **Store in Supabase** — `reading_guidelines` table with vector index

## Running the Pipeline

```bash
# From repo root
npm run seed:pdfs    # Extract and chunk PDFs → pdf-chunks.json
npm run seed:db      # Upload chunks to Supabase with embeddings
```

**Prerequisites:**
- `SUPABASE_URL` and `SUPABASE_SECRET_KEY` must be set in environment
- Supabase schema (tables + RPC functions) must be created first

## Adding New PDFs

1. Place PDF in `assets/text/`
2. Add entry to `PDF_FILES` array in `apps/web/scripts/process-pdfs.ts`:
   ```typescript
   {
     path: '../../assets/text/YourNewBook.pdf',
     category: 'methodology' // or 'ethics' or 'interpretation_principles'
   }
   ```
3. Run `npm run seed:pdfs && npm run seed:db`

## Troubleshooting

- **"pdf-parse error"** — Install Node.js dependencies: `npm install`
- **"Embedding model download slow"** — First run downloads ~80MB model from HuggingFace, cached afterward
- **"Supabase RPC not found"** — Run SQL schema setup first (see main plan)
- **"Out of memory"** — Large PDFs may need chunking adjustments; reduce `maxChunkSize` in `chunkText()`
