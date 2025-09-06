import { generateCompletion as coreGenerateCompletion } from './core'
import { AI_CONFIG } from './config'
import { CompletionOptions } from './types'

// Text completion (non-streaming)
export async function generateCompletion(prompt: string, options: CompletionOptions = {}) {
  const {
    provider = AI_CONFIG.defaultProvider,
    model,
    temperature = AI_CONFIG.temperature.balanced,
    systemMessage,
  } = options

  return coreGenerateCompletion(prompt, { provider, model, temperature, systemMessage })
}
