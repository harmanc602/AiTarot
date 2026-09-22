import express from 'express'
import { loadProviders } from '../config/providers.js'
import { callWithFallback, type ChatRequest } from '../lib/llm-client.js'

const router = express.Router()

// Lazy-load providers on first request to ensure dotenv has run
let providers: ReturnType<typeof loadProviders> | null = null
function getProviders() {
  if (!providers) {
    providers = loadProviders()
  }
  return providers
}

/**
 * POST /v1/chat/completions
 * OpenAI-compatible chat completions endpoint with automatic provider fallback.
 */
router.post('/chat/completions', async (req, res) => {
  try {
    const request: ChatRequest = {
      messages: req.body.messages,
      temperature: req.body.temperature,
      max_tokens: req.body.max_tokens,
      stream: req.body.stream ?? false
    }

    // Validate request
    if (!request.messages || !Array.isArray(request.messages) || request.messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request: messages array required' })
    }

    // Call providers with fallback
    const response = await callWithFallback(getProviders(), request)

    // Handle streaming response
    if (request.stream) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      // Pipe the response body
      if (response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          res.write(chunk)
        }
      }

      res.end()
    } else {
      // Non-streaming response
      const data = await response.json()
      res.json(data)
    }
  } catch (err) {
    const error = err as Error
    console.error('[Chat Route] Error:', error.message)
    res.status(503).json({ error: error.message || 'All providers failed' })
  }
})

export { router as chatRouter }
