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
    // First check if we have valid config
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

    if (!url || url.includes('placeholder')) {
      throw new Error('VITE_SUPABASE_URL not configured or is placeholder')
    }

    if (!key || key.includes('placeholder')) {
      throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY not configured or is placeholder')
    }

    const { data, error } = await supabase.from('user_tiers').select('tier_name').limit(1)
    if (error) throw new Error(`Supabase query failed: ${error.message}`)
    return `Connected! Found ${data?.length || 0} tier(s): ${data?.map(t => t.tier_name).join(', ')}`
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
    const steps: string[] = []

    // Step 1: Check env vars
    const provider = import.meta.env.VITE_LLM_PROVIDER
    const model = import.meta.env.VITE_LLM_MODEL
    const baseURL = import.meta.env.VITE_LLM_BASE_URL
    const apiKey = import.meta.env.VITE_LLM_API_KEY

    steps.push(`Step 1: Environment Variables`)
    steps.push(`  Provider: ${provider}`)
    steps.push(`  Model: ${model}`)
    steps.push(`  Base URL: ${baseURL}`)
    steps.push(``)

    // Step 2: For Ollama, check model availability
    if (provider === 'ollama') {
      steps.push(`Step 2: Checking Ollama models...`)
      const checkURL = baseURL?.replace('/v1', '') || 'http://localhost:11434'

      try {
        const tagsResp = await fetch(`${checkURL}/api/tags`)
        const tagsData = await tagsResp.json()

        if (!tagsData.models || tagsData.models.length === 0) {
          throw new Error(`No Ollama models installed. Run: ollama pull ${model}`)
        }

        const hasModel = tagsData.models.some((m: any) => m.name === model)
        if (!hasModel) {
          const available = tagsData.models.map((m: any) => m.name).join(', ')
          throw new Error(`Model "${model}" not found. Available: ${available}. Run: ollama pull ${model}`)
        }

        steps.push(`  ✓ Model "${model}" found`)
        steps.push(``)
      } catch (err: any) {
        throw new Error(`${steps.join('\n')}\n\n❌ ${err.message}`)
      }
    }

    // Step 3: Test direct API call
    steps.push(`Step 3: Testing direct API call...`)
    const testURL = `${baseURL}/chat/completions`
    steps.push(`  URL: ${testURL}`)

    try {
      const directResp = await fetch(testURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(provider !== 'ollama' && apiKey && { 'Authorization': `Bearer ${apiKey}` })
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Say hello' }],
          stream: false,
          max_tokens: 20
        })
      })

      steps.push(`  Status: ${directResp.status}`)
      steps.push(`  Content-Type: ${directResp.headers.get('content-type')}`)

      if (!directResp.ok) {
        const errorText = await directResp.text()
        throw new Error(`API returned ${directResp.status}: ${errorText.substring(0, 200)}`)
      }

      const directData = await directResp.json()
      const directMessage = directData.choices?.[0]?.message?.content || 'No response'
      steps.push(`  ✓ Response: "${directMessage}"`)
      steps.push(``)
    } catch (err: any) {
      throw new Error(`${steps.join('\n')}\n\n❌ ${err.message}`)
    }

    // Step 4: Test LangChain client
    steps.push(`Step 4: Testing LangChain wrapper...`)

    try {
      const llm = createLLMClient()
      const response = await llm.invoke([
        new HumanMessage("Say 'LangChain works'")
      ])
      steps.push(`  ✓ Response: "${response.content}"`)
      steps.push(``)
      steps.push(`✅ All steps passed!`)

      return steps.join('\n')
    } catch (err: any) {
      throw new Error(`${steps.join('\n')}\n\n❌ LangChain error: ${err.message}`)
    }
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
