export interface LLMProvider {
  name: string
  model: string
  apiKey: string
  baseURL: string
}

export function loadProviders(): LLMProvider[] {
  const providers: LLMProvider[] = []

  for (let i = 1; i <= 10; i++) {
    const name = process.env[`LLM_PROVIDER_${i}`]
    const model = process.env[`LLM_MODEL_${i}`]
    const apiKey = process.env[`LLM_API_KEY_${i}`]
    const baseURL = process.env[`LLM_BASE_URL_${i}`]

    if (name && model && apiKey && baseURL) {
      providers.push({ name, model, apiKey, baseURL })
    }
  }

  if (providers.length === 0) {
    throw new Error('No LLM providers configured. Check your .env file.')
  }

  console.log(`[Config] Loaded ${providers.length} provider(s):`, providers.map(p => p.name))
  return providers
}
