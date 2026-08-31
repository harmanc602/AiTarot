import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

export interface LLMConfig {
  provider: string
  model: string
  apiKey: string
  baseURL?: string
  temperature?: number
  maxTokens?: number
}

/**
 * Create a LangChain LLM client based on provider configuration.
 * Supports NVIDIA NIM, OpenAI, Anthropic, and Ollama.
 */
export function createLLMClient(config?: Partial<LLMConfig>): BaseChatModel {
  const provider = config?.provider || import.meta.env.VITE_LLM_PROVIDER || 'nvidia-nim'
  const model = config?.model || import.meta.env.VITE_LLM_MODEL
  const apiKey = config?.apiKey || import.meta.env.VITE_LLM_API_KEY
  const baseURL = config?.baseURL || import.meta.env.VITE_LLM_BASE_URL
  const temperature = config?.temperature ?? 0.7
  const maxTokens = config?.maxTokens ?? 512

  console.log('[LLM Client] Creating with:', { provider, model, baseURL })

  switch (provider) {
    case 'nvidia-nim':
      // NVIDIA uses OpenAI-compatible API
      return new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: model,
        configuration: {
          baseURL: 'https://integrate.api.nvidia.com/v1',
        },
        temperature,
        maxTokens,
      })

    case 'openai':
      return new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: model,
        temperature,
        maxTokens,
        streaming: true,
      })

    case 'anthropic':
      return new ChatAnthropic({
        anthropicApiKey: apiKey,
        modelName: model,
        temperature,
        maxTokens,
        streaming: true,
      })

    case 'ollama':
      return new ChatOpenAI({
        openAIApiKey: 'not-needed', // Ollama doesn't validate API key
        modelName: model,
        configuration: {
          baseURL: baseURL || 'http://localhost:11434/v1',
          defaultHeaders: {},
        },
        temperature,
        maxTokens,
        streaming: true,
      })

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`)
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Stream completion from LLM using LangChain.
 * Yields text chunks as they arrive.
 */
export async function* streamCompletion(
  messages: ChatMessage[],
  llmConfig?: Partial<LLMConfig>
): AsyncGenerator<string> {
  const llm = createLLMClient(llmConfig)

  const langchainMessages = messages.map(msg => {
    if (msg.role === 'system') return new SystemMessage(msg.content)
    return new HumanMessage(msg.content)
  })

  const stream = await llm.stream(langchainMessages)

  for await (const chunk of stream) {
    const content = chunk.content
    if (typeof content === 'string' && content) {
      yield content
    }
  }
}

/**
 * Get LLM config for a specific user tier.
 * In MVP, this is frontend-only. Future: backend will override.
 *
 * NOTE: If .env.local has explicit LLM settings, those take precedence.
 */
export function getLLMConfigForTier(tier: string): Partial<LLMConfig> {
  // If env vars are explicitly set, use them (for development/testing)
  const envProvider = import.meta.env.VITE_LLM_PROVIDER
  const envModel = import.meta.env.VITE_LLM_MODEL

  if (envProvider && envModel) {
    return {
      provider: envProvider,
      model: envModel,
      maxTokens: 512,
    }
  }

  // Otherwise use tier-based defaults
  const tierMap: Record<string, Partial<LLMConfig>> = {
    free: {
      provider: 'nvidia-nim',
      model: 'meta/llama-3.1-8b-instruct',
      maxTokens: 256,
    },
    premium: {
      provider: 'nvidia-nim',
      model: 'meta/llama-3.1-70b-instruct',
      maxTokens: 512,
    },
    pro: {
      provider: 'openai',
      model: 'gpt-4o',
      maxTokens: 1024,
    },
  }

  return tierMap[tier] || tierMap.free
}
