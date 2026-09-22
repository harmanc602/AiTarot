import fetch from 'node-fetch'
import type { ChatCompletionRequest, ProviderConfig, ProxyError } from './types'

export function loadProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = []
  let i = 1

  while (process.env[`LLM_PROVIDER_${i}`]) {
    const name = process.env[`LLM_PROVIDER_${i}`]!
    const model = process.env[`LLM_MODEL_${i}`]
    const apiKey = process.env[`LLM_API_KEY_${i}`] || 'ollama'
    const baseURL = process.env[`LLM_BASE_URL_${i}`]

    if (!model || !baseURL) {
      console.warn(`Provider ${i} missing model or baseURL, skipping`)
      i++
      continue
    }

    providers.push({ name, model, apiKey, baseURL })
    i++
  }

  return providers
}

export async function tryProvider(
  config: ProviderConfig,
  request: ChatCompletionRequest
): Promise<Response> {
  const url = `${config.baseURL}/chat/completions`

  const body = {
    model: config.model,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.max_tokens ?? 512,
    stream: request.stream ?? true
  }

  console.log(`Trying provider: ${config.name} (${config.model})`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error: ProxyError = new Error(
      `Provider ${config.name} failed: ${response.status} ${response.statusText}`
    )
    error.status = response.status
    error.provider = config.name
    throw error
  }

  return response
}

export async function executeProviderChain(
  providers: ProviderConfig[],
  request: ChatCompletionRequest
): Promise<Response> {
  const errors: ProxyError[] = []

  for (const provider of providers) {
    try {
      const response = await tryProvider(provider, request)
      console.log(`✓ Provider ${provider.name} succeeded`)
      return response
    } catch (error) {
      console.warn(`✗ Provider ${provider.name} failed:`, error)
      errors.push(error as ProxyError)

      // If quota exceeded (429) or server error (5xx), try next provider
      const status = (error as ProxyError).status
      if (status === 429 || (status && status >= 500)) {
        continue
      }

      // For auth errors (401, 403), skip to next immediately
      if (status === 401 || status === 403) {
        continue
      }

      // For client errors (4xx except 429), don't retry
      if (status && status >= 400 && status < 500) {
        throw error
      }
    }
  }

  // All providers failed
  const lastError = errors[errors.length - 1]
  const combinedError: ProxyError = new Error(
    `All providers failed. Last error: ${lastError?.message || 'Unknown'}`
  )
  combinedError.status = 503
  throw combinedError
}
