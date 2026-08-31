# LLM Provider Configuration

## Supported Providers

The application uses LangChain for LLM abstraction, supporting multiple providers:

### 1. NVIDIA NIM (Default)

```env
VITE_LLM_PROVIDER=nvidia-nim
VITE_LLM_MODEL=meta/llama-3.1-70b-instruct
VITE_LLM_API_KEY=<your-nvidia-api-key>
VITE_LLM_BASE_URL=https://integrate.api.nvidia.com/v1
```

**Models available:**
- `meta/llama-3.1-8b-instruct` (free tier)
- `meta/llama-3.1-70b-instruct` (premium)
- `meta/llama-3.1-405b-instruct` (pro)

**Get API key:** https://build.nvidia.com/

### 2. OpenAI

```env
VITE_LLM_PROVIDER=openai
VITE_LLM_MODEL=gpt-4o
VITE_LLM_API_KEY=sk-xxx
VITE_LLM_BASE_URL=https://api.openai.com/v1
```

**Models available:**
- `gpt-4o-mini` (fast, cheap)
- `gpt-4o` (balanced)
- `o1-preview` (advanced reasoning)

**Get API key:** https://platform.openai.com/api-keys

### 3. Anthropic Claude

```env
VITE_LLM_PROVIDER=anthropic
VITE_LLM_MODEL=claude-3-5-sonnet-20241022
VITE_LLM_API_KEY=sk-ant-xxx
```

**Models available:**
- `claude-3-5-haiku-20241022` (fast)
- `claude-3-5-sonnet-20241022` (balanced)
- `claude-opus-4-20250514` (most capable)

**Get API key:** https://console.anthropic.com/

### 4. Local Models (Ollama)

```env
VITE_LLM_PROVIDER=ollama
VITE_LLM_MODEL=llama3.1:70b
VITE_LLM_BASE_URL=http://localhost:11434
```

**Prerequisites:** Install Ollama (https://ollama.ai) and pull a model:
```bash
ollama pull llama3.1:70b
```

## Switching Providers

1. Update `.env.local` with new provider credentials
2. Restart dev server: `npm run web`
3. Test chat functionality

**No code changes required** — LangChain handles provider differences automatically.

## User Tier System (Future)

When user authentication is added, the backend will:
1. Look up user's tier from `user_tiers` table
2. Enforce `llm_provider`, `llm_model`, and `max_messages_per_day`
3. Override frontend env vars with user-specific settings

Frontend preparation:
- Chat component accepts optional `userTier` prop
- Display tier badge in chat header
- Show upgrade prompt when hitting message limit
