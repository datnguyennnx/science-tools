import { useState, useEffect, useRef } from 'react'
import { simplifyExpression, generateRandomExpression } from '../../engine'
import { parseBoolean } from '../../engine/parser/parser'
import { formatToBoolean } from '../../engine/parser/formatter'
import type { OutputFormat } from '../../engine/generator/generator'

export interface ExpressionProcessingState {
  simplifiedResult: string
  isSimplifying: boolean
  parseError: string
}

export interface ExpressionProcessingActions {
  simplify: (expression: string) => Promise<void>
  generateRandom: (complexity: number) => string
  clearResult: () => void
}

export function useExpressionProcessing() {
  const [simplifiedResult, setSimplifiedResult] = useState('')
  const [isSimplifying, setIsSimplifying] = useState(false)
  const [parseError, setParseError] = useState('')

  // Use ref to track current processing state
  const processingRef = useRef(false)

  const simplify = async (expression: string) => {
    if (!expression.trim() || processingRef.current) return

    processingRef.current = true
    setIsSimplifying(true)
    setParseError('')
    setSimplifiedResult('')

    try {
      // Parse the expression
      const parseResult = parseBoolean(expression, { silent: true })

      if (!parseResult.success || !parseResult.expression) {
        setParseError(parseResult.error || 'Failed to parse expression')
        return
      }

      // Simplify the expression
      const standardExpression = formatToBoolean(parseResult.expression)
      const { finalExpression } = await simplifyExpression(standardExpression)

      if (!processingRef.current) return // Component unmounted

      setSimplifiedResult(finalExpression)
    } catch (error) {
      if (!processingRef.current) return // Component unmounted

      const errorMessage = error instanceof Error ? error.message : 'Failed to simplify expression'
      setParseError(errorMessage)
    } finally {
      if (processingRef.current) {
        setIsSimplifying(false)
        processingRef.current = false
      }
    }
  }

  const generateRandom = (complexity: number) => {
    const options = {
      includeConstants: complexity > 3,
      nestedProbability: 0.3 + complexity * 0.1,
      outputFormat: Math.random() < 0.5 ? 'standard' : ('latex' as OutputFormat),
    }

    const randomExpr = generateRandomExpression(complexity, options)
    return randomExpr
  }

  const clearResult = () => {
    setSimplifiedResult('')
    setParseError('')
  }

  useEffect(() => {
    return () => {
      processingRef.current = false
    }
  }, [])

  const state: ExpressionProcessingState = {
    simplifiedResult,
    isSimplifying,
    parseError,
  }

  const actions: ExpressionProcessingActions = {
    simplify,
    generateRandom,
    clearResult,
  }

  return {
    state,
    actions,
  }
}
