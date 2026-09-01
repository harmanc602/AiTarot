-- AiTarot Supabase Schema Setup
-- Run this SQL in your Supabase SQL Editor.
--
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / OR REPLACE /
-- DROP POLICY IF EXISTS), so an existing project can be brought up to date by
-- executing the whole file again.
--
-- SECURITY: tables created with plain CREATE TABLE have Row Level Security
-- OFF, and Supabase grants the `anon` role full DML on the public schema by
-- default. That means the publishable key -- which ships inside the client
-- bundle -- could INSERT/UPDATE/DELETE these rows. The RLS section at the
-- bottom of this file closes that; do not deploy publicly without it.

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Card meanings table
CREATE TABLE IF NOT EXISTS card_meanings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id TEXT NOT NULL,           -- e.g. "major-00", "cups-01"
  orientation TEXT NOT NULL,        -- "upright" or "reversed"
  context TEXT NOT NULL,            -- interpretation text (source for embeddings)
  embedding VECTOR(384) NOT NULL,   -- 384-dim for all-MiniLM-L6-v2
  language TEXT NOT NULL DEFAULT 'en',
  source TEXT,                      -- PDF filename or "curated"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_card_meanings_embedding
  ON card_meanings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_card_meanings_lookup
  ON card_meanings (card_id, orientation, language);
CREATE INDEX IF NOT EXISTS idx_card_meanings_source
  ON card_meanings (source);

-- Reading guidelines table (methodology, ethics from PDFs)
CREATE TABLE IF NOT EXISTS reading_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,           -- "methodology", "ethics", "interpretation_principles"
  content TEXT NOT NULL,            -- extracted text chunk from PDFs
  embedding VECTOR(384) NOT NULL,
  source TEXT NOT NULL,             -- PDF filename
  page_number INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reading_guidelines_embedding
  ON reading_guidelines USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_reading_guidelines_category
  ON reading_guidelines (category, source);

-- User tiers table (for future paid features)
CREATE TABLE IF NOT EXISTS user_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE,  -- "free", "premium", "pro"
  llm_provider TEXT NOT NULL,      -- "nvidia-nim", "openai", "anthropic"
  llm_model TEXT NOT NULL,         -- "llama-3.1-70b", "gpt-4o", "claude-3-5-sonnet"
  max_messages_per_day INT,
  features JSONB,                  -- feature flags
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed user tiers
INSERT INTO user_tiers (tier_name, llm_provider, llm_model, max_messages_per_day, features) VALUES
  ('free', 'nvidia-nim', 'meta/llama-3.1-8b-instruct', 20, '{"spread_history": false, "advanced_spreads": false}'),
  ('premium', 'nvidia-nim', 'meta/llama-3.1-70b-instruct', 100, '{"spread_history": true, "advanced_spreads": true}'),
  ('pro', 'openai', 'gpt-4o', -1, '{"spread_history": true, "advanced_spreads": true, "priority_support": true}')
ON CONFLICT (tier_name) DO NOTHING;

-- RPC function: Vector search for card meanings
CREATE OR REPLACE FUNCTION match_card_meanings(
  query_embedding VECTOR(384),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  card_id TEXT,
  orientation TEXT,
  context TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    card_meanings.id,
    card_meanings.card_id,
    card_meanings.orientation,
    card_meanings.context,
    1 - (card_meanings.embedding <=> query_embedding) AS similarity
  FROM card_meanings
  WHERE 1 - (card_meanings.embedding <=> query_embedding) > match_threshold
  ORDER BY card_meanings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- RPC function: Vector search for reading guidelines
CREATE OR REPLACE FUNCTION match_reading_guidelines(
  query_embedding VECTOR(384),
  match_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  content TEXT,
  source TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    reading_guidelines.id,
    reading_guidelines.category,
    reading_guidelines.content,
    reading_guidelines.source,
    1 - (reading_guidelines.embedding <=> query_embedding) AS similarity
  FROM reading_guidelines
  WHERE 1 - (reading_guidelines.embedding <=> query_embedding) > match_threshold
  ORDER BY reading_guidelines.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
-- All three tables hold shared *reference* data: the same rows for every
-- visitor, written only by the seeding scripts. So the policy is simply
-- "anyone may read, nobody may write" -- writes go through the service_role
-- key (used by scripts/seed-database.ts), which bypasses RLS entirely.
--
-- The RPC functions above are plain plpgsql (not SECURITY DEFINER), so they
-- execute as the caller and these SELECT policies govern them too -- vector
-- search keeps working for anon.
--
-- When user-specific tables arrive later (saved readings, profiles), give them
-- their own policies keyed on auth.uid(); these reference tables stay as-is.

ALTER TABLE card_meanings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "card_meanings_public_read" ON card_meanings;
CREATE POLICY "card_meanings_public_read"
  ON card_meanings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "reading_guidelines_public_read" ON reading_guidelines;
CREATE POLICY "reading_guidelines_public_read"
  ON reading_guidelines FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "user_tiers_public_read" ON user_tiers;
CREATE POLICY "user_tiers_public_read"
  ON user_tiers FOR SELECT TO anon, authenticated USING (true);

-- Defence in depth: with no INSERT/UPDATE/DELETE policy, RLS already denies
-- writes, but dropping the underlying grants means a future permissive policy
-- can't silently re-open them either.
REVOKE INSERT, UPDATE, DELETE ON card_meanings FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON reading_guidelines FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON user_tiers FROM anon, authenticated;
