import { pipeline } from '@xenova/transformers'

let embeddingPipeline: any = null

/**
 * Generate embeddings for text using all-MiniLM-L6-v2 model (384 dimensions).
 * The model is lazy-loaded and cached after first use.
 *
 * @param text - Text to embed
 * @returns 384-dimensional embedding vector
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!embeddingPipeline) {
    // Lazy load the model on first use (downloads ~80MB, cached afterward)
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    )
  }

  const result = await embeddingPipeline(text, {
    pooling: 'mean',
    normalize: true
  })

  return Array.from(result.data) as number[]
}
