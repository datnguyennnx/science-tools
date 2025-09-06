import { createOpenAI } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { getAPIKey } from './api-keys'
import { AIProvider, AI_MODELS, createAIError } from './types'

// Provider factory functions for functional composition
const providerFactories = {
  openai: async (model?: string) => {
    const key = await getAPIKey('openai')
    if (!key) {
      throw createAIError(
        'OpenAI API key not found. Please configure it in the API Key Manager.',
        'openai'
      )
    }
    return {
      client: createOpenAI({ apiKey: key })(model || AI_MODELS.openai.chat),
      provider: 'openai' as const,
    }
  },

  openrouter: async (model?: string) => {
    const key = await getAPIKey('openrouter')
    if (!key) {
      throw createAIError(
        'OpenRouter API key not found. Please configure it in the API Key Manager.',
        'openrouter'
      )
    }
    return {
      client: createOpenRouter({ apiKey: key }).chat(model || AI_MODELS.openrouter.chat),
      provider: 'openrouter' as const,
    }
  },

  // Placeholder factories for providers not yet implemented
  anthropic: async () => {
    throw createAIError('Anthropic provider not yet implemented', 'anthropic')
  },

  google: async () => {
    throw createAIError('Google provider not yet implemented', 'google')
  },

  'x-grok': async () => {
    throw createAIError('Grok provider not yet implemented', 'x-grok')
  },
} as const

// Create AI client using functional factory pattern
export const createAIClient = async (provider: AIProvider, model?: string) => {
  const factory = providerFactories[provider]
  if (!factory) {
    throw createAIError(`Unsupported AI provider: ${provider}`, provider)
  }

  return factory(model)
}

// Generate text completion
export const generateCompletion = async (
  prompt: string,
  options: {
    provider?: AIProvider
    model?: string
    temperature?: number
    systemMessage?: string
  } = {}
) => {
  const { provider = 'openai', model, temperature = 0.7, systemMessage } = options

  try {
    const { client } = await createAIClient(provider, model)

    const messages: Array<{ role: 'system' | 'user'; content: string }> = []

    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage })
    }

    messages.push({ role: 'user', content: prompt })

    const result = await generateText({
      model: client,
      messages,
      temperature,
    })

    return {
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
    }
  } catch (error) {
    throw createAIError(
      `Completion generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      provider,
      error instanceof Error ? error : undefined
    )
  }
}
