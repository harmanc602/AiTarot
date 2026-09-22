import type { Request, Response, NextFunction } from 'express'
import type { ChatCompletionRequest } from '../types'

export function validateRequest(req: Request, res: Response, next: NextFunction) {
  const body = req.body as Partial<ChatCompletionRequest>

  if (!body.messages || !Array.isArray(body.messages)) {
    return res.status(400).json({ error: 'Missing or invalid "messages" field' })
  }

  if (body.messages.length === 0) {
    return res.status(400).json({ error: 'Messages array cannot be empty' })
  }

  for (const msg of body.messages) {
    if (!msg.role || !msg.content) {
      return res.status(400).json({ error: 'Each message must have "role" and "content"' })
    }
    if (!['system', 'user', 'assistant'].includes(msg.role)) {
      return res.status(400).json({ error: 'Invalid message role' })
    }
  }

  next()
}
