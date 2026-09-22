export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Proxy URL from environment (GitHub Pages uses production proxy)
const PROXY_URL = import.meta.env.VITE_LLM_PROXY_URL || 'http://localhost:3000'

export async function* streamCompletion(
  systemPrompt: string,
  userMessage: string
): AsyncGenerator<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ]

  const response = await fetch(`${PROXY_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 512
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'LLM request failed' }))
    throw new Error(error.error || 'LLM request failed')
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) throw new Error('No response body')

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
}
