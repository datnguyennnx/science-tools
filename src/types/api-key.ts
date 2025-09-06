export interface EncryptedData {
  data: number[]
  iv: number[]
}

export interface APIKeyStore {
  [service: string]: string
}

export interface APIKeyManagerConfig {
  storageKey?: string
  deviceIdKey?: string
  saltString?: string
  iterations?: number
}

export type APIService = 'openai' | 'anthropic' | 'google' | 'x-grok' | 'openrouter' | string

export interface APIKeyManagerResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface APIProvider {
  id: APIService
  name: string
  icon?: React.ComponentType<{ className?: string }>
  placeholder: string
}
