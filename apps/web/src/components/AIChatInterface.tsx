import { useState, useRef, useEffect } from 'react'
import { retrieveCardContext, retrieveGuidelineContext, generateResponse } from '../lib/rag'
import type { RevealedCard } from '@aitarot/core'
import { cardImage } from '../cardImages'

interface Message {
  role: 'user' | 'assistant' | 'spread'
  content: string
  spread?: RevealedCard[]  // if role === 'spread', this contains the revealed cards
  timestamp: number
}

interface AIChatInterfaceProps {
  selectedCards: string[]  // currently selected card IDs on wheel
  currentReading: RevealedCard[] | null  // current revealed spread (null if not revealed yet)
  onSpreadLog: (spread: RevealedCard[]) => void  // callback when spread is revealed
  userTier?: string  // 'free', 'premium', 'pro' (defaults to 'free')
}

export default function AIChatInterface({
  selectedCards,
  currentReading,
  onSpreadLog,
  userTier = 'free'
}: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredSpread, setHoveredSpread] = useState<RevealedCard[] | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Log new spread when it's revealed
  useEffect(() => {
    if (!currentReading || currentReading.length === 0) return

    // Check if this spread is already logged
    const alreadyLogged = messages.some(
      m => m.role === 'spread' && JSON.stringify(m.spread) === JSON.stringify(currentReading)
    )

    if (!alreadyLogged) {
      const spreadMsg: Message = {
        role: 'spread',
        content: `Spread of ${currentReading.length} card${currentReading.length > 1 ? 's' : ''} revealed`,
        spread: currentReading,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, spreadMsg])
      onSpreadLog(currentReading)
    }
  }, [currentReading, messages, onSpreadLog])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    }])
    setIsLoading(true)

    try {
      // TEMPORARY: Skip RAG retrieval since database is empty
      // TODO: Re-enable when card meanings are seeded
      const cardContexts: any[] = []
      const guidelineContexts: any[] = []

      // // Include current reading context in RAG query if available
      // const queryContext = currentReading
      //   ? `Current spread: ${currentReading.map(r => `${r.card.id} (${r.orientation})`).join(', ')}. Question: ${userMessage}`
      //   : userMessage

      // // Retrieve both card meanings and methodology guidelines
      // const [cardContexts, guidelineContexts] = await Promise.all([
      //   retrieveCardContext(queryContext),
      //   retrieveGuidelineContext(userMessage)
      // ])

      let assistantContent = ''

      for await (const chunk of generateResponse(
        userMessage,
        cardContexts,
        guidelineContexts,
        currentReading,
        userTier
      )) {
        assistantContent += chunk
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1]
          if (lastMsg?.role === 'assistant') {
            return [...prev.slice(0, -1), {
              role: 'assistant',
              content: assistantContent,
              timestamp: lastMsg.timestamp
            }]
          }
          return [...prev, {
            role: 'assistant',
            content: assistantContent,
            timestamp: Date.now()
          }]
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = error instanceof Error
        ? `Error: ${error.message}`
        : 'Sorry, I encountered an error. Please try again.'
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex h-full flex-col bg-deep-purple/30 backdrop-blur-sm">
      {/* Header */}
      <div className="shrink-0 border-b border-lavender/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-gold">Card Guidance</h2>
          {userTier !== 'free' && (
            <span className="rounded-full bg-gold/20 px-2 py-0.5 font-sans text-xs text-gold">
              {userTier}
            </span>
          )}
        </div>
        {selectedCards.length > 0 && !currentReading && (
          <p className="mt-1 font-sans text-xs text-white/60">
            {selectedCards.length} card{selectedCards.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.map((msg, i) => {
          if (msg.role === 'spread') {
            return (
              <div
                key={i}
                className="flex justify-center"
                onMouseEnter={() => setHoveredSpread(msg.spread || null)}
                onMouseLeave={() => setHoveredSpread(null)}
              >
                <div className="cursor-pointer rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-center transition-colors hover:bg-gold/20">
                  <p className="font-serif text-xs text-gold">{msg.content}</p>
                  <p className="mt-1 font-sans text-[10px] text-white/40">
                    Hover to view
                  </p>
                </div>
              </div>
            )
          }

          return (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-lavender/20 text-white'
                    : 'bg-gold/10 text-white/90'
                }`}
              >
                <p className="whitespace-pre-wrap font-serif text-sm">{msg.content}</p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Hovered Spread Overlay */}
      {hoveredSpread && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="max-h-[80%] max-w-[90%] overflow-auto rounded-lg bg-deep-purple/90 p-4">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {hoveredSpread.map((revealed, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="w-20 overflow-hidden rounded border border-gold/40"
                    style={{ transform: revealed.orientation === 'reversed' ? 'rotate(180deg)' : undefined }}
                  >
                    <img
                      src={cardImage(revealed.card.imageKey)}
                      alt={revealed.card.id}
                      className="block h-auto w-full"
                    />
                  </div>
                  <p className="mt-1 text-center font-serif text-[10px] text-white/80">
                    {revealed.card.id}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-lavender/20 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your cards..."
            disabled={isLoading}
            className="flex-1 rounded-full border border-lavender/40 bg-deep-purple/50 px-4 py-2 text-white placeholder:text-white/40 focus:border-lavender focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-lavender/80 px-6 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-lavender disabled:opacity-50"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
