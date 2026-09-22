import type { LLMProvider } from '../config/providers.js'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface LLMClientError extends Error {
  status?: number
  provider?: string
}

/**
 * Call a provider's chat completions endpoint (OpenAI-compatible).
 * Supports both streaming and non-streaming responses.
 */
export async function callProvider(
  provider: LLMProvider,
  request: ChatRequest
): Promise<Response> {
  const url = `${provider.baseURL}/chat/completions`

  console.log(`[LLM Client] Trying provider: ${provider.name} (${provider.model})`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: provider.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 512,
      stream: request.stream ?? false
    })
  })

  if (!response.ok) {
    const error: LLMClientError = new Error(`Provider ${provider.name} failed: ${response.status} ${response.statusText}`)
    error.status = response.status
    error.provider = provider.name

    // Log error details
    const body = await response.text().catch(() => 'Unable to read error body')
    console.error(`[LLM Client] ✗ Provider ${provider.name} failed:`, response.status, body)

    throw error
  }

  console.log(`[LLM Client] ✓ Provider ${provider.name} succeeded`)
  return response
}

/**
 * Try providers in order until one succeeds.
 * Automatic fallback on quota (429) or server errors (5xx).
 */
export async function callWithFallback(
  providers: LLMProvider[],
  request: ChatRequest
): Promise<Response> {
  let lastError: LLMClientError | null = null

  for (const provider of providers) {
    try {
      return await callProvider(provider, request)
    } catch (err) {
      const error = err as LLMClientError
      lastError = error

      // Retry on rate limit (429), server errors (5xx), or auth errors (401/403)
      const shouldRetry =
        error.status === 429 ||
        error.status === 401 ||
        error.status === 403 ||
        (error.status && error.status >= 500)

      if (!shouldRetry) {
        // Client error (4xx other than 429/401/403) — stop immediately
        throw error
      }

      // Continue to next provider
      console.log(`[LLM Client] Falling back to next provider...`)
    }
  }

  // All providers failed
  throw lastError || new Error('All providers failed')
}
