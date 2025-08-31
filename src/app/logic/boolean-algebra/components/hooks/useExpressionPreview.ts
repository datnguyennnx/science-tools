import { useState, useEffect, useRef } from 'react'
import { parseBoolean } from '../../engine/parser/parser'
import { formatToLatex } from '../../engine/parser/formatter'
import { booleanToLatex } from '@/components/KatexFormula'

export interface ExpressionPreviewState {
  latexPreview: string
  previewError: string
}

export function useExpressionPreview(expression: string, debounceMs = 500) {
  const [latexPreview, setLatexPreview] = useState('')
  const [previewError, setPreviewError] = useState('')

  // Use refs for debounce timing
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastExpressionRef = useRef('')

  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Skip if expression hasn't changed
    if (expression === lastExpressionRef.current) {
      return
    }

    lastExpressionRef.current = expression

    // If expression is empty, clear preview
    if (!expression.trim()) {
      setLatexPreview('')
      setPreviewError('')
      return
    }

    // Set up debounce timer
    debounceTimerRef.current = setTimeout(() => {
      updatePreview(expression)
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [expression, debounceMs])

  const updatePreview = async (expr: string) => {
    if (!expr.trim()) return

    try {
      // Try to parse and convert to LaTeX
      const parseResult = parseBoolean(expr, { silent: true })

      if (parseResult.success && parseResult.expression) {
        const latex = formatToLatex(parseResult.expression)
        setLatexPreview(latex)
        setPreviewError('')
      } else {
        // Fallback to basic LaTeX conversion
        const fallbackLatex = booleanToLatex(expr)
        setLatexPreview(fallbackLatex)
        setPreviewError('')
      }
    } catch {
      // Fallback to basic conversion if parsing fails
      try {
        const fallbackLatex = booleanToLatex(expr)
        setLatexPreview(fallbackLatex)
        setPreviewError('')
      } catch {
        setPreviewError('Unable to generate preview')
        setLatexPreview('')
      }
    }
  }

  const state: ExpressionPreviewState = {
    latexPreview,
    previewError,
  }

  return {
    state,
  }
}
