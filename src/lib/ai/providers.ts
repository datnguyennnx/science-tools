// AI Provider configurations
// Centralized provider and model definitions

import { AIProvider } from './types'
import { OpenAI, Anthropic, OpenRouter } from '@lobehub/icons'
import { Key } from 'lucide-react'
import { retrieveEncryptedData, createEncryptionKey, decryptData } from '@/utils/crypto'
import { SUPPORTED_PROVIDERS, CACHE_CONFIG, API_ENDPOINTS } from '@/lib/config'

// Models.dev API response interface
interface Model {
  id: string
  name: string
  attachment: boolean
  reasoning: boolean
  temperature: boolean
  tool_call: boolean
  knowledge?: string
  release_date?: string
  last_updated?: string
  modalities: {
    input: string[]
    output: string[]
  }
  open_weights: boolean
  cost: {
    input: number
    output: number
    cache_read?: number
    cache_write?: number
  }
  limit: {
    context: number
    output: number
  }
}

interface Provider {
  id: string
  env: string[]
  npm: string
  api?: string
  name: string
  doc?: string
  models: {
    [key: string]: Model
  }
}

interface Providers {
  [key: string]: Provider
}

// Cache for models data
let modelsCache: Providers | null = null
let cacheTimestamp: number | null = null
const { modelsCacheDuration: CACHE_DURATION } = CACHE_CONFIG

// Helper functions for provider management - now API-driven
export const getProviderById = async (id: AIProvider): Promise<Provider | undefined> => {
  try {
    const providers = await fetchModelsFromAPI()
    return providers[id]
  } catch (error) {
    console.error('Failed to get provider by ID:', error)
    return undefined
  }
}

export const getProviderModels = async (providerId: AIProvider): Promise<Model[]> => {
  try {
    const provider = await getProviderById(providerId)
    return provider ? Object.values(provider.models) : []
  } catch (error) {
    console.error('Failed to get provider models:', error)
    return []
  }
}

export const getDefaultProvider = async (): Promise<Provider | undefined> => {
  try {
    const providers = await fetchModelsFromAPI()
    const firstProviderId = Object.keys(providers)[0]
    return firstProviderId ? providers[firstProviderId] : undefined
  } catch (error) {
    console.error('Failed to get default provider:', error)
    return undefined
  }
}

export const getDefaultModel = async (providerId: AIProvider): Promise<string> => {
  try {
    const models = await getProviderModels(providerId)
    return models.length > 0 ? models[0].id : ''
  } catch (error) {
    console.error('Failed to get default model:', error)
    return ''
  }
}

// Provider icon mapping for UI components
export const PROVIDER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  openai: OpenAI,
  anthropic: Anthropic,
  openrouter: OpenRouter,
}

// Combined provider/model options with icons for UI selects
export interface ModelOption {
  value: string
  label: string
  provider: AIProvider
  model: string
  icon: React.ComponentType<{ className?: string }>
}

// Fetch models from Models.dev API via our proxy
export const fetchModelsFromAPI = async (): Promise<Providers> => {
  // Check cache first
  if (modelsCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return modelsCache
  }

  try {
    const response = await fetch(API_ENDPOINTS.models, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: Providers = await response.json()
    modelsCache = data
    cacheTimestamp = Date.now()

    return data
  } catch (error) {
    console.error('Failed to fetch models from API:', error)
    // Return cached data if available, otherwise return empty object
    return modelsCache || {}
  }
}

// Get configured providers from IndexedDB
export const getConfiguredProviders = async (): Promise<string[]> => {
  try {
    const config = {
      storageKey: 'encrypted_api_keys',
      deviceIdKey: 'device_id',
      saltString: 'api_key_salt_2024',
      iterations: 50000,
    }

    const encryptedData = await retrieveEncryptedData(config.storageKey)
    if (!encryptedData) return []

    const key = await createEncryptionKey(config)
    const decrypted = await decryptData(encryptedData, key)
    const apiKeys: Record<string, string> = JSON.parse(decrypted)

    // Return array of configured service names
    return Object.keys(apiKeys)
  } catch (error) {
    console.error('Failed to get configured providers:', error)
    return []
  }
}

// Create dynamic model options from Models.dev API filtered by configured providers
export const createDynamicModelOptions = async (
  configuredProviders?: string[]
): Promise<ModelOption[]> => {
  try {
    const [apiResponse, configured] = await Promise.all([
      fetchModelsFromAPI(),
      configuredProviders || getConfiguredProviders(),
    ])

    const options: ModelOption[] = []

    // Iterate through each provider in the API response
    Object.entries(apiResponse).forEach(([providerId, providerData]) => {
      // Only include providers that are configured and we support
      if (configured.includes(providerId) && SUPPORTED_PROVIDERS.includes(providerId as any)) {
        const IconComponent = PROVIDER_ICONS[providerId] || Key

        // Iterate through each model in the provider
        Object.values(providerData.models).forEach(apiModel => {
          options.push({
            value: apiModel.id,
            label: `${providerData.name}/${apiModel.name}`,
            provider: providerId as AIProvider,
            model: apiModel.id,
            icon: IconComponent,
          })
        })
      }
    })

    // Sort by provider name, then by model name
    return options.sort((a, b) => {
      if (a.provider !== b.provider) {
        return a.provider.localeCompare(b.provider)
      }
      return a.label.localeCompare(b.label)
    })
  } catch (error) {
    console.error('Failed to create dynamic model options:', error)
    // Return empty array if API fails - no more hardcoded fallback
    return []
  }
}

// Minimal fallback for when API is completely unavailable
export const createModelOptions = (): ModelOption[] => {
  // Return empty array - the system should rely on API data
  // No more hardcoded provider data
  return []
}
