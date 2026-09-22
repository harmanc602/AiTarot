import type { Request, Response, NextFunction } from 'express'

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',')

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  next()
}
