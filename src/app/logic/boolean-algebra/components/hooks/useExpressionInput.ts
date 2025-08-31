import { useState, useEffect, useRef } from 'react'

export interface ExpressionInputState {
  expression: string
  complexity: number
  error: string
  isProcessing: boolean
}

export interface ExpressionInputActions {
  setExpression: (value: string) => void
  setError: (value: string) => void
  setComplexity: (value: number) => void
  setIsProcessing: (value: boolean) => void
  resetError: () => void
}

export function useExpressionInput(defaultExpression = '') {
  const [expression, setExpression] = useState(defaultExpression)
  const [complexity, setComplexity] = useState(3)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    setExpression(defaultExpression)
  }, [defaultExpression])

  const resetError = () => setError('')

  const actions: ExpressionInputActions = {
    setExpression,
    setError,
    setComplexity: (value: number) => setComplexity(Math.max(1, Math.min(5, value))),
    setIsProcessing,
    resetError,
  }

  const state: ExpressionInputState = {
    expression,
    complexity,
    error,
    isProcessing,
  }

  return {
    state,
    actions,
    isMounted: isMountedRef.current,
  }
}
