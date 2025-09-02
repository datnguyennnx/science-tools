import { useState } from 'react'
import {
  APIKeyStore,
  APIService,
  APIKeyManagerResult,
  APIKeyManagerConfig,
  EncryptedData,
} from '../types/api-key'
import {
  createEncryptionKey,
  encryptText,
  decryptData,
  storeEncryptedData,
  retrieveEncryptedData,
  clearAllEncryptedData,
} from '../utils/crypto'

const DEFAULT_CONFIG: Required<APIKeyManagerConfig> = {
  storageKey: 'encrypted_api_keys',
  deviceIdKey: 'device_id',
  saltString: 'api_key_salt_2024',
  iterations: 50000,
}

export const useAPIKeyManager = (config?: APIKeyManagerConfig) => {
  const [loading, setLoading] = useState(false)

  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  // Pure function to get stored encrypted data
  const getStoredData = async (): Promise<EncryptedData | null> => {
    try {
      return await retrieveEncryptedData(finalConfig.storageKey)
    } catch {
      return null
    }
  }

  // Pure function to decrypt and parse API keys
  const decryptAPIKeys = async (encryptedData: EncryptedData): Promise<APIKeyStore> => {
    try {
      const key = await createEncryptionKey(finalConfig)
      const decrypted = await decryptData(encryptedData, key)
      return JSON.parse(decrypted)
    } catch {
      return {}
    }
  }

  // Pure function to encrypt and store API keys
  const encryptAndStore = async (apiKeys: APIKeyStore): Promise<boolean> => {
    try {
      const key = await createEncryptionKey(finalConfig)
      const encrypted = await encryptText(JSON.stringify(apiKeys), key)
      await storeEncryptedData(finalConfig.storageKey, encrypted)
      return true
    } catch {
      return false
    }
  }

  // Get all API keys
  const getAllKeys = async (): Promise<APIKeyManagerResult<APIKeyStore>> => {
    setLoading(true)
    try {
      const stored = await getStoredData()
      if (!stored) {
        return { success: true, data: {} }
      }

      const keys = await decryptAPIKeys(stored)
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

  // Store API key
  const storeAPIKey = async (
    service: APIService,
    apiKey: string
  ): Promise<APIKeyManagerResult<void>> => {
    setLoading(true)
    try {
      const { data: existingKeys = {} } = await getAllKeys()
      const updatedKeys = { ...existingKeys, [service]: apiKey }

      const success = await encryptAndStore(updatedKeys)

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

  // Get specific API key
  const getAPIKey = async (service: APIService): Promise<APIKeyManagerResult<string>> => {
    try {
      const { data: keys, success } = await getAllKeys()

      if (!success || !keys) {
        return { success: false, error: 'Failed to retrieve keys' }
      }

      const apiKey = keys[service]
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

  // Delete API key
  const deleteAPIKey = async (service: APIService): Promise<APIKeyManagerResult<void>> => {
    setLoading(true)
    try {
      const { data: existingKeys = {} } = await getAllKeys()
      const remainingKeys = { ...existingKeys }
      delete remainingKeys[service]

      const success = await encryptAndStore(remainingKeys)

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
      const stored = await retrieveEncryptedData(finalConfig.storageKey)
      return stored
        ? { success: true, data: JSON.stringify(stored) }
        : { success: false, error: 'No data to export' }
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
      // Parse and store the encrypted data
      const parsed: EncryptedData = JSON.parse(encryptedData)
      await storeEncryptedData(finalConfig.storageKey, parsed)

      // Verify we can decrypt the imported data
      await decryptAPIKeys(parsed)

      return { success: true }
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
