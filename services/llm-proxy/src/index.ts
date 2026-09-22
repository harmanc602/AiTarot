import dotenv from 'dotenv'

// Load environment variables FIRST before any other imports that need them
dotenv.config()

import express from 'express'
import cors from 'cors'
import { chatRouter } from './routes/chat.js'
import { healthRouter } from './routes/health.js'
import { rateLimitMiddleware } from './middleware/rate-limit.js'

const app = express()
const PORT = parseInt(process.env.PORT || '3000', 10)

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

// Body parsing
app.use(express.json())

// Rate limiting
app.use(rateLimitMiddleware)

// Routes
app.use('/v1', chatRouter)
app.use('/health', healthRouter)

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error]', err.message)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`[LLM Proxy] Listening on port ${PORT}`)
  console.log(`[LLM Proxy] Allowed origins:`, allowedOrigins)
})
