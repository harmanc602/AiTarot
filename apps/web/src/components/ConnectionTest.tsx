import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getEmbedding } from '../lib/embeddings'
import { createLLMClient } from '../lib/llm'
import { HumanMessage } from '@langchain/core/messages'

export default function ConnectionTest() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [name]: true }))
    try {
      const result = await testFn()
      setResults(prev => ({ ...prev, [name]: { success: true, data: result } }))
    } catch (error: any) {
      setResults(prev => ({
        ...prev,
        [name]: { success: false, error: error.message || String(error) }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }))
    }
  }

  const testSupabaseConnection = async () => {
    const { data, error } = await supabase.from('user_tiers').select('tier_name').limit(1)
    if (error) throw error
    return `Connected! Found ${data?.length || 0} tier(s)`
  }

  const testSupabaseTables = async () => {
    const tables = ['card_meanings', 'reading_guidelines', 'user_tiers']
    const results = await Promise.all(
      tables.map(async (table) => {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        return { table, count: count || 0, error: error?.message }
      })
    )
    return results
  }

  const testEmbedding = async () => {
    const text = "Test embedding generation"
    const embedding = await getEmbedding(text)
    return `Generated ${embedding.length}-dimensional vector`
  }

  const testLLM = async () => {
    const llm = createLLMClient()
    const response = await llm.invoke([
      new HumanMessage("Say 'Connection successful' and nothing else.")
    ])
    return response.content
  }

  const testVectorSearch = async () => {
    // Test if RPC function exists
    const embedding = Array(384).fill(0).map(() => Math.random())
    const { data, error } = await supabase.rpc('match_card_meanings', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 1
    })
    if (error) throw error
    return `RPC function works! Found ${data?.length || 0} result(s)`
  }

  const renderResult = (name: string) => {
    const result = results[name]
    const isLoading = loading[name]

    if (isLoading) {
      return <span className="text-yellow-400">Testing...</span>
    }

    if (!result) {
      return <span className="text-gray-400">Not tested</span>
    }

    if (result.success) {
      return (
        <div className="text-green-400">
          <div>✓ Success</div>
          <pre className="mt-1 text-xs text-gray-300">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )
    }

    return (
      <div className="text-red-400">
        <div>✗ Failed</div>
        <pre className="mt-1 text-xs text-gray-300">{result.error}</pre>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">AiTarot Connection Tests</h1>

        <div className="space-y-6">
          {/* Environment Check */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Environment Variables</h2>
            <div className="space-y-2 font-mono text-sm">
              <div>
                <span className="text-gray-400">VITE_SUPABASE_URL:</span>{' '}
                <span className={import.meta.env.VITE_SUPABASE_URL?.includes('placeholder') ? 'text-red-400' : 'text-green-400'}>
                  {import.meta.env.VITE_SUPABASE_URL || '❌ Not set'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">VITE_SUPABASE_PUBLISHABLE_KEY:</span>{' '}
                <span className={import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.includes('placeholder') ? 'text-red-400' : 'text-green-400'}>
                  {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✓ Set' : '❌ Not set'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">VITE_LLM_PROVIDER:</span>{' '}
                <span className="text-blue-400">
                  {import.meta.env.VITE_LLM_PROVIDER || 'nvidia-nim (default)'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">VITE_LLM_MODEL:</span>{' '}
                <span className="text-blue-400">
                  {import.meta.env.VITE_LLM_MODEL || '❌ Not set'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">VITE_LLM_API_KEY:</span>{' '}
                <span className={import.meta.env.VITE_LLM_API_KEY?.includes('placeholder') ? 'text-red-400' : 'text-green-400'}>
                  {import.meta.env.VITE_LLM_API_KEY ? '✓ Set' : '❌ Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Supabase Tests */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Supabase Tests</h2>
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => runTest('supabase-connection', testSupabaseConnection)}
                  disabled={loading['supabase-connection']}
                  className="rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Test Connection
                </button>
                <div className="mt-2">{renderResult('supabase-connection')}</div>
              </div>

              <div>
                <button
                  onClick={() => runTest('supabase-tables', testSupabaseTables)}
                  disabled={loading['supabase-tables']}
                  className="rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Check Tables & Row Counts
                </button>
                <div className="mt-2">{renderResult('supabase-tables')}</div>
              </div>

              <div>
                <button
                  onClick={() => runTest('vector-search', testVectorSearch)}
                  disabled={loading['vector-search']}
                  className="rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Test Vector Search RPC
                </button>
                <div className="mt-2">{renderResult('vector-search')}</div>
              </div>
            </div>
          </div>

          {/* Embedding Test */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Embedding Generation</h2>
            <button
              onClick={() => runTest('embedding', testEmbedding)}
              disabled={loading['embedding']}
              className="rounded bg-purple-600 px-4 py-2 text-sm hover:bg-purple-700 disabled:opacity-50"
            >
              Test Embedding (Downloads ~80MB on first run)
            </button>
            <div className="mt-2">{renderResult('embedding')}</div>
          </div>

          {/* LLM Test */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">LLM Connection</h2>
            <button
              onClick={() => runTest('llm', testLLM)}
              disabled={loading['llm']}
              className="rounded bg-green-600 px-4 py-2 text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Test LLM API
            </button>
            <div className="mt-2">{renderResult('llm')}</div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-yellow-700 bg-yellow-900/20 p-6">
            <h2 className="mb-2 text-xl font-semibold text-yellow-400">Setup Instructions</h2>
            <ol className="list-inside list-decimal space-y-2 text-sm text-yellow-200">
              <li>Create Supabase project at https://supabase.com</li>
              <li>Run the SQL schema from <code className="rounded bg-gray-800 px-1">apps/web/supabase-schema.sql</code></li>
              <li>Get API keys from Supabase Settings → API</li>
              <li>Get LLM API key from https://build.nvidia.com (or your provider)</li>
              <li>Update <code className="rounded bg-gray-800 px-1">apps/web/.env.local</code> with real keys</li>
              <li>Restart dev server</li>
              <li>Run tests above to verify connections</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
