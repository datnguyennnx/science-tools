'use client'

import { useState, useEffect } from 'react'
import {
  getLatexResults as simplifyBooleanExpression,
  type ExtendedLatexResults,
  type LatexSimplificationStep,
} from '../../engine'

export interface SimplificationStep {
  ruleName: string
  ruleFormula: string
  ruleDescription?: string
  beforeLatex: string
  afterLatex: string
}

export interface SimplificationResult {
  steps: SimplificationStep[]
  finalExpression: string
  errorOccurred: boolean
  errorMessage: string
  rawInput: string
  initialProcessedInput: string
}

export interface SimplificationState {
  result: SimplificationResult | null
  isLoading: boolean
}

export function useExpressionSimplification(expression: string): SimplificationState {
  const [result, setResult] = useState<SimplificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    const processExpression = async () => {
      setIsLoading(true)

      const steps: SimplificationStep[] = []
      let finalSimplifiedLatex = ''
      let errorOccurred = false
      let errorMessage = ''
      let processedExpression = ''

      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (isMounted) {
          setResult({
            steps: [],
            finalExpression: expression || '',
            errorOccurred: true,
            errorMessage:
              'Simplification timed out. The expression may be too complex or there may be an issue with the engine.',
            rawInput: expression,
            initialProcessedInput: expression,
          })
          setIsLoading(false)
        }
      }, 15000) // 15 second timeout

      if (!expression.trim()) {
        finalSimplifiedLatex = ''
        errorOccurred = false
        errorMessage = ''
      } else if (expression.includes('undefined') || expression.includes('null')) {
        errorOccurred = true
        errorMessage =
          'Expression contains "undefined" or "null", which are invalid Boolean values. Please use only variables (A-Z), constants (0/1), and operators.'
      } else {
        try {
          const simplificationResult: ExtendedLatexResults =
            await simplifyBooleanExpression(expression)

          // Clear timeout since we got a result
          if (timeoutId) clearTimeout(timeoutId)

          // Check if component is still mounted before updating state
          if (!isMounted) return

          simplificationResult.steps.forEach((s: LatexSimplificationStep) => {
            steps.push({
              ruleName: s.ruleName,
              ruleFormula: s.ruleFormula,
              ruleDescription: s.ruleDescription,
              beforeLatex: s.beforeLatex,
              afterLatex: s.afterLatex,
            })
          })
          finalSimplifiedLatex = simplificationResult.finalLatex
          processedExpression = expression
        } catch (err) {
          // Clear timeout since we got an error
          if (timeoutId) clearTimeout(timeoutId)

          // Check if component is still mounted before updating state
          if (!isMounted) return

          errorOccurred = true
          errorMessage = err instanceof Error ? err.message : 'Failed to simplify expression.'
          finalSimplifiedLatex = processedExpression || expression
        }
      }

      // Only update state if component is still mounted
      if (isMounted) {
        setResult({
          steps,
          finalExpression: finalSimplifiedLatex,
          errorOccurred,
          errorMessage,
          rawInput: expression,
          initialProcessedInput: errorOccurred ? processedExpression || expression : expression,
        })
        setIsLoading(false)
      }
    }

    processExpression()

    // Cleanup function
    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [expression])

  return { result, isLoading }
}
