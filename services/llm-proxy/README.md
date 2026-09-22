# LLM Proxy Service

Node.js Express proxy for routing LLM requests through multiple providers with automatic fallback.

## Architecture

```
Frontend → Proxy → Provider Chain (Groq → NVIDIA NIM → Ollama)
```

The proxy tries providers in order until one succeeds. This keeps API keys server-side and provides automatic failover when free tier limits are hit.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and allowed origins
   ```

3. **Run locally:**
   ```bash
   npm run dev
   ```

4. **Test:**
   ```bash
   curl http://localhost:3000/health
   ```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard after deployment.

### Railway

```bash
railway login
railway init
railway up
```

Set environment variables in Railway dashboard.

## Environment Variables

See `.env.example` for the complete list. Key variables:

- `LLM_PROVIDER_N` — Provider name (groq, nvidia-nim, ollama)
- `LLM_MODEL_N` — Model identifier
- `LLM_API_KEY_N` — API key for provider N
- `LLM_BASE_URL_N` — Base URL for provider N
- `ALLOWED_ORIGINS` — Comma-separated CORS whitelist
- `RATE_LIMIT_MAX_REQUESTS` — Max requests per IP per hour (default: 20)

## API Endpoints

### POST /v1/chat/completions

OpenAI-compatible chat completions endpoint.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 512
}
```

**Response:** Server-sent events (SSE) stream or JSON object.

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-09-01T12:00:00.000Z"
}
```

## Provider Fallback Logic

1. Try provider 1 (e.g., Groq free tier)
2. If 429 (quota) or 5xx (server error) → try provider 2
3. If 401/403 (auth error) → try provider 2
4. If 4xx (client error, not quota) → return error immediately
5. Repeat for all providers
6. If all fail → return 503 Service Unavailable

## Rate Limiting

Simple in-memory rate limiting (20 requests/hour per IP by default). Resets on server restart.

For persistent rate limiting, use Redis or a cloud rate limiter service.

## Security

- API keys never exposed to frontend
- CORS whitelist enforces allowed origins
- Request validation prevents malformed payloads
- No credential logging

## Monitoring

Check logs for provider success/failure:
```
Trying provider: groq (llama-3.3-70b-versatile)
✓ Provider groq succeeded
```

Or:
```
✗ Provider groq failed: 429 Too Many Requests
Trying provider: nvidia-nim (meta/llama-3.1-70b-instruct)
✓ Provider nvidia-nim succeeded
```
