# User Tier System Design

## Overview

The application is **prepared for** a 3-tier system but currently runs in **MVP mode** with hardcoded tier configuration.

## Tiers

| Tier | LLM Provider | Model | Max Messages/Day | Features |
|---|---|---|---|---|
| **Free** | NVIDIA NIM | llama-3.1-8b | 20 | Basic readings |
| **Premium** | NVIDIA NIM | llama-3.1-70b | 100 | + Spread history, advanced spreads |
| **Pro** | OpenAI | gpt-4o | Unlimited | + All premium, priority support |

## Current Implementation (MVP)

**Frontend-only:**
- Tier is read from `VITE_USER_TIER` env var (defaults to "free")
- `AIChatInterface` component accepts `userTier` prop
- Tier badge displayed in chat header
- LLM config selected via `getLLMConfigForTier()` in `apps/web/src/lib/llm.ts`

**No backend enforcement yet:**
- Message limits not enforced
- No authentication or user accounts
- Tier switching requires manual `.env.local` edit

## Future Implementation (Backend Required)

### Phase 1: Authentication
1. Add Supabase Auth (email/password or OAuth)
2. Create `users` table with foreign key to `user_tiers`
3. Store user's tier in database

### Phase 2: Backend API
1. Create API endpoint: `GET /api/user/tier`
2. Frontend fetches tier on app load
3. Override `VITE_USER_TIER` with backend value

### Phase 3: Enforcement
1. Rate limiting: track `messages_sent_today` in database
2. Block requests when limit reached
3. Show upgrade prompt in chat UI

### Phase 4: Payment Integration
1. Stripe or similar payment provider
2. Checkout flow for premium/pro upgrade
3. Webhook to update user tier in database

## Preparing Frontend for Backend Integration

**Already done:**
- `AIChatInterface` accepts `userTier` prop (dynamic)
- `getLLMConfigForTier()` maps tier to model config
- Tier badge UI in chat header

**Still needed:**
- API client for fetching user tier
- Loading state while tier is being fetched
- Error handling if tier fetch fails (fallback to free tier)
- Upgrade prompt component (trigger when message limit hit)
- Message count tracking (store in local state, sync with backend)
