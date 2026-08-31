/**
 * Debug script to test LLM connection step-by-step
 * Run with: node --loader ts-node/esm apps/web/src/test/llm-debug.ts
 */

// Step 1: Check environment variables
console.log('=== Step 1: Environment Variables ===')
console.log('VITE_LLM_PROVIDER:', import.meta.env?.VITE_LLM_PROVIDER || 'NOT SET')
console.log('VITE_LLM_MODEL:', import.meta.env?.VITE_LLM_MODEL || 'NOT SET')
console.log('VITE_LLM_BASE_URL:', import.meta.env?.VITE_LLM_BASE_URL || 'NOT SET')
console.log()

// Step 2: Test direct Ollama API call
console.log('=== Step 2: Direct Ollama API Test ===')
async function testOllamaAPI() {
  try {
    const response = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        messages: [{ role: 'user', content: 'Say hello' }],
        stream: false
      })
    })

    console.log('Status:', response.status)
    console.log('Content-Type:', response.headers.get('content-type'))

    const text = await response.text()
    console.log('Response preview:', text.substring(0, 200))

    if (response.ok) {
      const json = JSON.parse(text)
      console.log('✅ Direct API works!')
      console.log('Message:', json.choices[0].message.content)
    } else {
      console.log('❌ API returned error')
    }
  } catch (error: any) {
    console.log('❌ Fetch failed:', error.message)
  }
}

await testOllamaAPI()
console.log()

// Step 3: Test LangChain client
console.log('=== Step 3: LangChain Client Test ===')
