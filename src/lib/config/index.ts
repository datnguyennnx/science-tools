// Centralized configuration for the entire AI system
// Single source of truth for all configurations

import { AIProvider, AIConfiguration } from '../ai/types'

// Encryption configuration - centralized
export const ENCRYPTION_CONFIG = {
  storageKey: 'encrypted_api_keys' as string,
  deviceIdKey: 'device_id' as string,
  saltString: 'api_key_salt_2024' as string,
  iterations: 50000 as number,
}

// API endpoints configuration
export const API_ENDPOINTS = {
  models: '/api/models',
  modelsDev: 'https://models.dev/api.json',
} as const

// Cache configuration
export const CACHE_CONFIG = {
  modelsCacheDuration: 1000 * 60 * 60, // 1 hour
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const

// Supported providers - centralized
export const SUPPORTED_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'x-grok',
  'openrouter',
] as const

export const AI_PROVIDERS: readonly AIProvider[] = SUPPORTED_PROVIDERS

// Provider-specific configurations
export const PROVIDER_CONFIGS = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: {
      chat: 'gpt-4o-mini',
      completion: 'gpt-4o-mini',
      embedding: 'text-embedding-3-small',
    },
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com',
    models: {
      chat: 'claude-4-sonnet',
      completion: 'claude-4-sonnet',
    },
  },
  google: {
    name: 'Google',
    baseUrl: 'https://generativelanguage.googleapis.com',
    models: {
      chat: 'gemini-2.0-flash',
      completion: 'gemini-2.0-flash',
    },
  },
  'x-grok': {
    name: 'xAI (Grok)',
    baseUrl: 'https://api.x.ai/v1',
    models: {
      chat: 'grok-beta',
      completion: 'grok-beta',
    },
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: {
      chat: 'anthropic/claude-3.5-sonnet',
      completion: 'anthropic/claude-3.5-sonnet',
    },
  },
} as const

// AI Configuration - centralized
export const AI_CONFIG: AIConfiguration = {
  defaultProvider: 'openai',
  temperature: {
    creative: 0.9,
    balanced: 0.7,
    precise: 0.3,
  },
  timeout: 30000, // 30 seconds
}

// UI Configuration
export const UI_CONFIG = {
  maxRetries: 3,
  toastDuration: 4000,
  modalAnimationDuration: 200,
} as const

// Feature flags
export const FEATURES = {
  aiGeneration: true,
  jsonValidation: true,
  syntaxHighlighting: true,
  realTimeValidation: false, // Temporarily disabled
} as const

// Validation rules
export const VALIDATION_RULES = {
  apiKey: {
    minLength: 10,
    maxLength: 200,
    patterns: {
      openai: /^sk-/,
      anthropic: /^sk-ant-/,
      google: /^AIza/,
      'x-grok': /^xai-/,
      openrouter: /^sk-or-v1-/,
    },
  },
  json: {
    maxSize: 1024 * 1024, // 1MB
    timeout: 5000, // 5 seconds
  },
} as const

// Error messages - centralized
export const ERROR_MESSAGES = {
  apiKeyNotFound: (provider: string) =>
    `${provider} API key not found. Please configure it in the API Key Manager.`,
  providerNotImplemented: (provider: string) => `${provider} provider not yet implemented`,
  invalidApiKey: 'Invalid API key format',
  networkError: 'Network error occurred. Please try again.',
  timeoutError: 'Request timed out. Please try again.',
  unknownError: 'An unknown error occurred',
} as const

// Encryption config type definition
export type EncryptionConfig = {
  storageKey: string
  deviceIdKey: string
  saltString: string
  iterations: number
}

// Type exports for better DX
export type { AIProvider, AIConfiguration }
export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number]
export type ProviderConfig = typeof PROVIDER_CONFIGS
export type ValidationRules = typeof VALIDATION_RULES
