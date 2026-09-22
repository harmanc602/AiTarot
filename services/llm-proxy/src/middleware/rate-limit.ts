import express from 'express'

interface RateLimitStore {
  [ip: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20', 10)
const WINDOW_HOURS = parseInt(process.env.RATE_LIMIT_WINDOW_HOURS || '1', 10)
const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000

export function rateLimitMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()

  // Initialize or reset if window expired
  if (!store[ip] || now > store[ip].resetTime) {
    store[ip] = {
      count: 0,
      resetTime: now + WINDOW_MS
    }
  }

  // Check limit
  if (store[ip].count >= MAX_REQUESTS) {
    const resetIn = Math.ceil((store[ip].resetTime - now) / 1000)
    return res.status(429).json({
      error: 'Rate limit exceeded',
      resetIn
    })
  }

  // Increment and continue
  store[ip].count++
  next()
}
