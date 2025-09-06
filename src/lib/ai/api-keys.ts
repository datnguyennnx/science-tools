import { APIService } from '@/types/api-key'
import { EncryptionService } from '@/lib/services/encryptionService'
import { ENCRYPTION_CONFIG, type EncryptionConfig } from '@/lib/config'

// Get API key for specific provider using unified encryption service
export const getAPIKey = async (
  provider: APIService,
  config: EncryptionConfig = ENCRYPTION_CONFIG
): Promise<string | null> => {
  return EncryptionService.getAPIKey(provider, config)
}

// Validate API key existence using unified encryption service
export const hasAPIKey = async (
  provider: APIService,
  config: EncryptionConfig = ENCRYPTION_CONFIG
): Promise<boolean> => {
  return EncryptionService.hasAPIKey(provider, config)
}
