import { useState } from 'react'
import { APIKeyStore, APIService, APIKeyManagerResult, APIKeyManagerConfig } from '../types/api-key'
import { EncryptionService, withEncryptionErrorHandling } from '../lib/services/encryptionService'
import { ENCRYPTION_CONFIG, type EncryptionConfig } from '../lib/config'
import { clearAllEncryptedData } from '../utils/crypto'

// Use centralized encryption configuration
const DEFAULT_CONFIG: EncryptionConfig = ENCRYPTION_CONFIG

export const useAPIKeyManager = (config?: APIKeyManagerConfig) => {
  const [loading, setLoading] = useState(false)

  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  // Pure function to retrieve and decrypt API keys using unified service
  const getStoredKeys = async (): Promise<APIKeyStore> => {
    const result = await withEncryptionErrorHandling(() =>
      EncryptionService.retrieveAndDecrypt(finalConfig)
    )

    return result.success && result.data ? result.data : {}
  }

  // Pure function to encrypt and store API keys using unified service
  const storeKeys = async (apiKeys: APIKeyStore): Promise<boolean> => {
    const result = await withEncryptionErrorHandling(() =>
      EncryptionService.encryptAndStore(apiKeys, finalConfig)
    )

    return result.success
  }

  // Get all API keys using unified service
  const getAllKeys = async (): Promise<APIKeyManagerResult<APIKeyStore>> => {
    setLoading(true)
    try {
      const keys = await getStoredKeys()
      return { success: true, data: keys }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      setLoading(false)
    }
  }

  // Store API key using unified service
  const storeAPIKey = async (
    service: APIService,
    apiKey: string
  ): Promise<APIKeyManagerResult<void>> => {
    setLoading(true)
    try {
      const { data: existingKeys = {} } = await getAllKeys()
      const updatedKeys = { ...existingKeys, [service]: apiKey }

      const success = await storeKeys(updatedKeys)

      return success ? { success: true } : { success: false, error: 'Failed to store API key' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      setLoading(false)
    }
  }

  // Get specific API key using unified service
  const getAPIKey = async (service: APIService): Promise<APIKeyManagerResult<string>> => {
    try {
      const apiKey = await EncryptionService.getAPIKey(service, finalConfig)

      return apiKey
        ? { success: true, data: apiKey }
        : { success: false, error: 'API key not found' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Delete API key using unified service
  const deleteAPIKey = async (service: APIService): Promise<APIKeyManagerResult<void>> => {
    setLoading(true)
    try {
      const { data: existingKeys = {} } = await getAllKeys()
      const remainingKeys = { ...existingKeys }
      delete remainingKeys[service]

      const success = await storeKeys(remainingKeys)

      return success ? { success: true } : { success: false, error: 'Failed to delete API key' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      setLoading(false)
    }
  }

  // Clear all keys
  const clearAllKeys = async (): Promise<APIKeyManagerResult<void>> => {
    try {
      await clearAllEncryptedData()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Get list of services
  const getServices = async (): Promise<APIKeyManagerResult<APIService[]>> => {
    try {
      const { data: keys, success } = await getAllKeys()

      if (!success || !keys) {
        return { success: false, error: 'Failed to retrieve keys' }
      }

      return { success: true, data: Object.keys(keys) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Export encrypted data for backup
  const exportKeys = async (): Promise<APIKeyManagerResult<string>> => {
    try {
      const keys = await getStoredKeys()
      if (Object.keys(keys).length === 0) {
        return { success: false, error: 'No data to export' }
      }

      const encrypted = await EncryptionService.encrypt(JSON.stringify(keys), finalConfig)
      return { success: true, data: JSON.stringify(encrypted) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Import encrypted data from backup
  const importKeys = async (encryptedData: string): Promise<APIKeyManagerResult<void>> => {
    try {
      // Parse the encrypted data and decrypt it
      const parsed: any = JSON.parse(encryptedData)
      const decrypted = await EncryptionService.decrypt(parsed, finalConfig)
      const keys: APIKeyStore = JSON.parse(decrypted)

      // Store the decrypted keys
      const success = await storeKeys(keys)

      return success ? { success: true } : { success: false, error: 'Failed to import keys' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid import data',
      }
    }
  }

  return {
    loading,
    storeAPIKey,
    getAPIKey,
    getAllKeys,
    deleteAPIKey,
    clearAllKeys,
    getServices,
    exportKeys,
    importKeys,
  }
}
