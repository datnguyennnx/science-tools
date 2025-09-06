import { useState } from 'react'
import { SYSTEM_MESSAGE, USER_PROMPT_TEMPLATE } from '../../prompts/user-prompts'
import { generateCompletion } from '@/lib/ai/core'
import { AIProvider } from '@/lib/ai/types'

export interface AIGeneratedJsonResult {
  json: string
  promptUsed: string
  category: string
  complexity: string
  generatedAt: Date
}

export interface UseAIGeneratedJsonReturn {
  generateJsonFromPrompt: (userPrompt: string, model?: string, provider?: AIProvider) => void
  isGenerating: boolean
  error: string | null
  lastResult: AIGeneratedJsonResult | null
}

export function useAIGeneratedJson(
  onSuccess?: (result: AIGeneratedJsonResult) => void
): UseAIGeneratedJsonReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<AIGeneratedJsonResult | null>(null)

  // Prepare system prompt and user message for AI provider
  const preparePrompt = (userPrompt: string) => {
    return {
      systemMessage: SYSTEM_MESSAGE,
      userMessage: USER_PROMPT_TEMPLATE(userPrompt),
    }
  }

  // Send prepared prompt to AI provider
  const sendToProvider = async (
    systemMessage: string,
    userMessage: string,
    model?: string,
    provider?: AIProvider
  ) => {
    const result = await generateCompletion(userMessage, {
      provider,
      model,
      temperature: 0.7,
      systemMessage,
    })

    // Validate response
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response from AI service')
    }

    if (!('text' in result) || typeof result.text !== 'string') {
      throw new Error('AI response missing text content')
    }

    if (!result.text || result.text.trim() === '') {
      throw new Error('AI returned empty response. Please try again.')
    }

    return result.text
  }

  // Process AI response - keep raw results without validation
  const processResponse = (responseText: string) => {
    // Return the raw AI response without any cleaning or validation
    return responseText
  }

  // Handle errors consistently
  const handleError = (err: unknown) => {
    let errorMessage = 'Failed to generate JSON'

    if (err instanceof Error) {
      errorMessage = err.message || 'Unknown error occurred'
    } else if (typeof err === 'object' && err !== null) {
      if ('message' in err && typeof err.message === 'string') {
        errorMessage = err.message
      } else if ('error' in err && typeof err.error === 'string') {
        errorMessage = err.error
      } else if (Object.keys(err).length === 0) {
        errorMessage =
          'AI service returned an empty error. Please check your API key and try again.'
      } else {
        errorMessage = `AI Error: ${JSON.stringify(err)}`
      }
    } else if (typeof err === 'string') {
      errorMessage = err
    }

    setError(errorMessage)
    console.error('AI JSON generation error:', err, 'Message:', errorMessage)
  }

  const generateJsonFromPrompt = (userPrompt: string, model?: string, provider?: AIProvider) => {
    // Start the async operation without waiting
    ;(async () => {
      setIsGenerating(true)
      setError(null)

      try {
        // 1. Prepare system prompt and user message
        const { systemMessage, userMessage } = preparePrompt(userPrompt)

        // 2. Send to AI provider
        const responseText = await sendToProvider(systemMessage, userMessage, model, provider)

        // 3. Process response and extract JSON
        const formattedJson = processResponse(responseText)

        // 4. Create result data
        const resultData: AIGeneratedJsonResult = {
          json: formattedJson,
          promptUsed: 'userPrompt',
          category: 'custom',
          complexity: 'medium',
          generatedAt: new Date(),
        }

        setLastResult(resultData)

        if (onSuccess) {
          onSuccess(resultData)
        }
      } catch (err) {
        handleError(err)
      } finally {
        setIsGenerating(false)
      }
    })()
  }

  return {
    generateJsonFromPrompt,
    isGenerating,
    error,
    lastResult,
  }
}
