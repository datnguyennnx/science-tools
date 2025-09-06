import { AIConfiguration } from './types'

// Global AI configuration
export const AI_CONFIG: AIConfiguration = {
  defaultProvider: 'openai',
  temperature: {
    creative: 0.9,
    balanced: 0.7,
    precise: 0.3,
  },
  timeout: 60000, // 60 seconds
}
