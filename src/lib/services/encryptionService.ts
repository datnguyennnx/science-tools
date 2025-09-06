import { EncryptedData } from '@/types/api-key'
import {
  createEncryptionKey,
  encryptText,
  decryptData,
  storeEncryptedData,
  retrieveEncryptedData,
} from '@/utils/crypto'
import { ENCRYPTION_CONFIG, type EncryptionConfig } from '@/lib/config'

// Pure function to encrypt data with configuration
export const encryptWithConfig = async (
  data: string,
  config: EncryptionConfig = ENCRYPTION_CONFIG
): Promise<EncryptedData> => {
  const key = await createEncryptionKey(config)
  return encryptText(data, key)
}

// Pure function to decrypt data with configuration
export const decryptWithConfig = async (
  encryptedData: EncryptedData,
  config: EncryptionConfig = ENCRYPTION_CONFIG
): Promise<string> => {
  const key = await createEncryptionKey(config)
  return decryptData(encryptedData, key)
}

// Pure function to encrypt and store API keys
export const encryptAndStore = async (
  apiKeys: Record<string, string>,
  config: EncryptionConfig = ENCRYPTION_CONFIG
): Promise<void> => {
  const encrypted = await encryptWithConfig(JSON.stringify(apiKeys), config)
  await storeEncryptedData(config.storageKey, encrypted)
}

// Pure function to retrieve and decrypt API keys
export const retrieveAndDecrypt = async (
  config: EncryptionConfig = ENCRYPTION_CONFIG
): Promise<Record<string, string> | null> => {
  const encrypted = await retrieveEncryptedData(config.storageKey)
  if (!encrypted) return null

  const decrypted = await decryptWithConfig(encrypted, config)
  return JSON.parse(decrypted)
}

// Pure function to get specific API key
export const getAPIKey = async (
  service: string,
  config: EncryptionConfig = ENCRYPTION_CONFIG
): Promise<string | null> => {
  const keys = await retrieveAndDecrypt(config)
  return keys?.[service] || null
}

// Pure function to check if API key exists
export const hasAPIKey = async (
  service: string,
  config: EncryptionConfig = ENCRYPTION_CONFIG
): Promise<boolean> => {
  const key = await getAPIKey(service, config)
  return key !== null
}

// Encryption service object with functional composition
export const EncryptionService = {
  encrypt: encryptWithConfig,
  decrypt: decryptWithConfig,
  encryptAndStore,
  retrieveAndDecrypt,
  getAPIKey,
  hasAPIKey,
} as const

// Type-safe result wrapper for operations that might fail
export interface EncryptionResult<T> {
  success: boolean
  data?: T
  error?: string
}

// Functional wrapper for error handling
export const withEncryptionErrorHandling = <T>(
  operation: () => Promise<T>
): Promise<EncryptionResult<T>> => {
  return operation()
    .then(data => ({ success: true, data }))
    .catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Encryption operation failed',
    }))
}
