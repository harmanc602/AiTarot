import type { Request, Response, NextFunction } from 'express'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10)
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20', 10)

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown'
  const now = Date.now()

  const entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return next()
  }

  if (entry.count >= MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((entry.resetAt - now) / 1000)
    })
  }

  entry.count++
  next()
}

// Cleanup expired entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(ip)
    }
  }
}, 3600000)
