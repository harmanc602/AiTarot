import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Don't throw error during initialization - allow app to load
// Runtime errors will occur when trying to use Supabase features
const hasValidConfig = supabaseUrl && supabaseKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseKey.includes('placeholder')

export const supabase = hasValidConfig
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

// Type definitions for database tables
export interface CardMeaning {
  id: string
  card_id: string
  orientation: 'upright' | 'reversed'
  context: string
  embedding: number[]
  language: string
  source?: string
}

export interface ReadingGuideline {
  id: string
  category: 'methodology' | 'ethics' | 'interpretation_principles'
  content: string
  embedding: number[]
  source: string
  page_number?: number
}

export interface UserTier {
  id: string
  tier_name: 'free' | 'premium' | 'pro'
  llm_provider: string
  llm_model: string
  max_messages_per_day: number
  features: Record<string, boolean>
}
