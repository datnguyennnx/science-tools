// AI Provider types
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'x-grok' | 'openrouter'

// Provider configuration with models
export interface ProviderConfig {
  id: AIProvider
  name: string
  models: Array<{ id: string; name: string }>
}

// API Key configuration
export interface APIKeyConfig {
  storageKey: string
  deviceIdKey: string
  saltString: string
  iterations: number
}

export const AI_MODELS = {
  openai: {
    chat: 'gpt-4o-mini', // OpenAI's latest small, cost-efficient reasoning model with 128K context window
    completion: 'gpt-4o-mini',
    embedding: 'text-embedding-3-small', // no change, as small embedding model still valid
  },
  anthropic: {
    chat: 'claude-4-sonnet', // Latest Claude 4 variant optimized for balanced capability and performance
    completion: 'claude-4-sonnet',
  },
  google: {
    chat: 'gemini-2.0-flash', // Gemini 2.0 Flash, latest efficient model for fast response and performance
    completion: 'gemini-2.0-flash',
  },
  'x-grok': {
    chat: 'grok-beta', // No explicit new light model found, keep beta or update when available
    completion: 'grok-beta',
  },
  openrouter: {
    chat: 'anthropic/claude-3.5-sonnet', // Popular OpenRouter model
    completion: 'anthropic/claude-3.5-sonnet',
  },
} as const

// Completion options
export interface CompletionOptions {
  provider?: AIProvider
  model?: string
  temperature?: number
  systemMessage?: string
}

// AI Configuration
export interface AIConfiguration {
  defaultProvider: AIProvider
  temperature: {
    creative: number
    balanced: number
    precise: number
  }
  timeout: number
}

// Error types (Functional approach)
export interface AIError {
  type: 'AI_ERROR'
  message: string
  provider: AIProvider
  originalError?: Error
}

// Factory function for creating AI errors
export const createAIError = (
  message: string,
  provider: AIProvider,
  originalError?: Error
): AIError => ({
  type: 'AI_ERROR',
  message,
  provider,
  originalError,
})
