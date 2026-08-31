import { supabase } from './supabase'
import { getEmbedding } from './embeddings'
import { streamCompletion, getLLMConfigForTier, type ChatMessage } from './llm'
import type { RevealedCard } from '@aitarot/core'
import { cardName } from '@aitarot/core'

export interface RAGContext {
  card_id: string
  orientation: string
  context: string
  similarity: number
  source?: string
}

export interface GuidelineContext {
  category: string
  content: string
  source: string
  similarity: number
}

/**
 * Retrieve card meanings from vector database based on query.
 */
export async function retrieveCardContext(query: string): Promise<RAGContext[]> {
  const embedding = await getEmbedding(query)

  const { data, error } = await supabase.rpc('match_card_meanings', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5
  })

  if (error) throw new Error(`Vector search failed: ${error.message}`)
  return data || []
}

/**
 * Retrieve reading guidelines (methodology, ethics) from vector database.
 */
export async function retrieveGuidelineContext(query: string): Promise<GuidelineContext[]> {
  const embedding = await getEmbedding(query)

  const { data, error } = await supabase.rpc('match_reading_guidelines', {
    query_embedding: embedding,
    match_threshold: 0.75,
    match_count: 3
  })

  if (error) throw new Error(`Guideline search failed: ${error.message}`)
  return data || []
}

// System prompt defining ethical tarot reading principles
const TAROT_READER_SYSTEM_PROMPT = `You are a knowledgeable and ethical tarot reader. Follow these principles:

**Ethical Guidelines:**
1. Never make absolute predictions or claim to see the future with certainty
2. Emphasize free will and personal agency — readings are guidance, not fate
3. Avoid topics requiring professional expertise (medical, legal, financial advice)
4. Present interpretations as possibilities and reflections, not commands
5. Encourage self-reflection and personal growth
6. Respect the querent's autonomy and decision-making capacity

**Methodology:**
1. Consider card positions in the spread context
2. Look for patterns and relationships between cards
3. Balance traditional meanings with intuitive insights
4. Ground interpretations in the querent's specific question
5. Provide constructive and empowering guidance

**Tone:**
- Warm, supportive, and non-judgmental
- Clear and accessible (avoid overly esoteric language)
- Encouraging personal empowerment and growth`

/**
 * Generate tarot reading response with RAG context and ethical guidelines.
 * Streams LLM completion chunk by chunk.
 */
export async function* generateResponse(
  userQuery: string,
  cardContexts: RAGContext[],
  guidelineContexts: GuidelineContext[],
  currentReading: RevealedCard[] | null,
  userTier: string = 'free'
): AsyncGenerator<string> {
  // Build context from retrieved card meanings
  const cardContextStr = cardContexts
    .map(c => `[${c.card_id} ${c.orientation}${c.source ? ` from ${c.source}` : ''}]: ${c.context}`)
    .join('\n\n')

  // Build context from methodology guidelines
  const guidelineStr = guidelineContexts
    .map(g => `[${g.category} from ${g.source}]: ${g.content}`)
    .join('\n\n')

  let systemPrompt = TAROT_READER_SYSTEM_PROMPT

  // Add retrieved guidelines if available
  if (guidelineStr) {
    systemPrompt += `\n\n**Reference Materials:**\n${guidelineStr}`
  }

  // Add card meanings if available
  if (cardContextStr) {
    systemPrompt += `\n\n**Card Meanings:**\n${cardContextStr}`
  }

  // Add current reading context if available
  if (currentReading && currentReading.length > 0) {
    const readingStr = currentReading
      .map((r, idx) => `Position ${idx + 1}: ${cardName(r.card, 'en')} (${r.orientation})`)
      .join('\n')
    systemPrompt += `\n\n**Current Reading:**\n${readingStr}\n\nProvide guidance based on this specific spread. Consider the relationships between cards and their positions.`
  }

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: userQuery
    }
  ]

  // Get LLM config based on user tier
  const llmConfig = getLLMConfigForTier(userTier)

  yield* streamCompletion(messages, llmConfig)
}
