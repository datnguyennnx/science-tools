import { EncryptedData, APIKeyManagerConfig } from '../types/api-key'
import { createSecureStorage } from './indexed-db-storage'

const DEFAULT_CONFIG: Required<APIKeyManagerConfig> = {
  storageKey: 'encrypted_api_keys',
  deviceIdKey: 'device_id',
  saltString: 'api_key_salt_2024',
  iterations: 50000,
}

export const generateDeviceId = (): string => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Initialize storage instance
const secureStorage = createSecureStorage()

// Keep device ID in localStorage for quick access (it's not sensitive)
export const getOrCreateDeviceId = (config = DEFAULT_CONFIG): string => {
  const stored = localStorage.getItem(config.deviceIdKey)
  if (stored) return stored

  const newId = generateDeviceId()
  localStorage.setItem(config.deviceIdKey, newId)
  return newId
}

// IndexedDB storage functions
export const storeEncryptedData = async (key: string, data: EncryptedData): Promise<void> => {
  await secureStorage.setItem(key, data)
}

export const retrieveEncryptedData = async (key: string): Promise<EncryptedData | null> => {
  return await secureStorage.getItem(key)
}

export const deleteEncryptedData = async (key: string): Promise<void> => {
  await secureStorage.removeItem(key)
}

export const clearAllEncryptedData = async (): Promise<void> => {
  await secureStorage.clear()
}

export const deriveKeyFromString = async (
  keyString: string,
  config = DEFAULT_CONFIG
): Promise<CryptoKey> => {
  const encoder = new TextEncoder()

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(keyString),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  const salt = encoder.encode(config.saltString)

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: config.iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export const createEncryptionKey = async (config = DEFAULT_CONFIG): Promise<CryptoKey> => {
  const deviceId = getOrCreateDeviceId(config)
  return deriveKeyFromString(deviceId, config)
}

export const encryptText = async (text: string, key: CryptoKey): Promise<EncryptedData> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

  return {
    data: Array.from(new Uint8Array(encrypted)),
    iv: Array.from(iv),
  }
}

export const decryptData = async (
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<string> => {
  const data = new Uint8Array(encryptedData.data)
  const iv = new Uint8Array(encryptedData.iv)

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)

  return new TextDecoder().decode(decrypted)
}
