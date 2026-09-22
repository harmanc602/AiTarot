export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  model?: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface ProviderConfig {
  name: string
  model: string
  apiKey: string
  baseURL: string
}

export interface ProxyError extends Error {
  status?: number
  provider?: string
}
