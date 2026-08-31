// Quick test script for NVIDIA NIM API
// Run with: node apps/web/test-nvidia.js

import { ChatOpenAI } from '@langchain/openai'

const client = new ChatOpenAI({
  openAIApiKey: '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',
  modelName: 'meta/llama-3.1-8b-instruct',
  configuration: {
    baseURL: 'https://integrate.api.nvidia.com/v1',
  },
  temperature: 1,
  maxTokens: 100,
})

console.log('Testing NVIDIA NIM API...')
console.log('Model: meta/llama-3.1-8b-instruct')
console.log('Endpoint: https://integrate.api.nvidia.com/v1')
console.log('')

try {
  const response = await client.invoke([
    { role: 'user', content: 'Say "Hello from NVIDIA!" and nothing else.' }
  ])

  console.log('✅ SUCCESS!')
  console.log('Response:', response.content)
} catch (error) {
  console.log('❌ FAILED!')
  console.log('Error:', error.message)
  console.log('')
  console.log('Full error:', error)
}
