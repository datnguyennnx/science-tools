import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Shuffle } from 'lucide-react'
import { getSimplificationSteps, generateRandomExpression } from '../../engine'
import { KatexFormula, booleanToLatex } from '@/components/KatexFormula'
import { toast } from 'sonner'

/**
 * Sanitize input to catch problematic patterns before processing
 */
function sanitizeInput(input: string): { sanitized: string; error?: string } {
  // Check for 'undefined' or 'null' literals that would cause errors
  if (input.includes('undefined') || input.includes('null')) {
    return {
      sanitized: input,
      error:
        'Expression contains "undefined" or "null", which are invalid Boolean values. Please use only variables (A-Z), constants (0/1), and operators.',
    }
  }

  // Check for invalid AND operation patterns
  if (input.includes('*  )') || input.includes('*  ')) {
    return {
      sanitized: input,
      error: 'Invalid AND operation: missing right operand',
    }
  }

  if (input.includes('(  *') || input.includes('  *')) {
    return {
      sanitized: input,
      error: 'Invalid AND operation: missing left operand',
    }
  }

  return { sanitized: input }
}

interface ExpressionInputProps {
  defaultExpression?: string
  onExpressionChange?: (expression: string) => void
  onSimplificationStart?: () => void
  onResultChange?: (success: boolean) => void
  isProcessing?: boolean
  hideResult?: boolean
}

export function ExpressionInput({
  defaultExpression = '',
  onExpressionChange,
  onSimplificationStart,
  onResultChange,
  isProcessing = false,
  hideResult = false,
}: ExpressionInputProps) {
  const [expression, setExpression] = useState(defaultExpression)
  const [latexPreview, setLatexPreview] = useState('')
  const [localSimplifiedResult, setLocalSimplifiedResult] = useState('')
  const [error, setError] = useState('')
  const [complexity, setComplexity] = useState(3) // Default complexity level

  useEffect(() => {
    setExpression(defaultExpression)
  }, [defaultExpression])

  useEffect(() => {
    onExpressionChange?.(expression)
    setLatexPreview(expression)
  }, [expression, onExpressionChange])

  const handleExpressionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newExpression = e.target.value
    setExpression(newExpression)

    // Pre-check for invalid patterns but don't stop the user from typing them
    const { error } = sanitizeInput(newExpression)
    if (error) {
      setError(error)
    } else {
      setError('')
    }
  }

  const handleSimplify = () => {
    onSimplificationStart?.()
    setError('')
    setLocalSimplifiedResult('')

    if (!expression.trim()) {
      setError('Expression cannot be empty.')
      onResultChange?.(false)
      return
    }

    // Sanitize input before processing
    const { sanitized, error: sanitizeError } = sanitizeInput(expression)
    if (sanitizeError) {
      setError(sanitizeError)
      toast.error(sanitizeError)
      onResultChange?.(false)
      return
    }

    try {
      const { finalExpression } = getSimplificationSteps(sanitized)
      setLocalSimplifiedResult(finalExpression)
      onResultChange?.(true)
    } catch (err) {
      console.error('Error simplifying expression:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Invalid expression or unable to simplify.'
      setError(errorMessage)
      toast.error(errorMessage)
      onResultChange?.(false)
    }
  }

  const handleGenerateRandom = () => {
    // Use the imported generator with custom options
    const options = {
      includeConstants: complexity > 3, // Include constants only in higher complexity levels
      nestedProbability: 0.3 + complexity * 0.1, // Increase nesting with complexity
    }

    const randomExpr = generateRandomExpression(complexity, options)
    setExpression(randomExpr)
    setError('')
  }

  // Adjust complexity level
  const handleComplexityChange = (newComplexity: number) => {
    setComplexity(Math.max(1, Math.min(5, newComplexity)))
  }

  return (
    <div className="space-y-4">
      {expression.trim() && (
        <div className="p-3 border rounded bg-muted/50">
          <h3 className="text-sm font-medium mb-1 text-muted-foreground">Input Preview (LaTeX):</h3>
          <div className="overflow-x-auto max-w-full no-scrollbar">
            <KatexFormula formula={latexPreview} block={true} className="py-1 " />
          </div>
        </div>
      )}
      <div>
        <Textarea
          placeholder="Enter your boolean expression (e.g., A * (B + !C) or A(B+!C) or A\overline{C})"
          value={expression}
          onChange={handleExpressionChange}
          className="min-h-[100px] font-mono whitespace-pre-wrap overflow-x-auto"
          disabled={isProcessing}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleSimplify} disabled={isProcessing || !expression.trim()}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Simplifying...
            </>
          ) : (
            'Simplify'
          )}
        </Button>

        <Button variant="outline" onClick={handleGenerateRandom} disabled={isProcessing}>
          <Shuffle className="mr-2 h-4 w-4" />
          Random Expression
        </Button>

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-muted-foreground">Complexity:</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => handleComplexityChange(complexity - 1)}
              disabled={complexity <= 1}
            >
              -
            </Button>
            <span className="text-xs font-medium w-4 text-center">{complexity}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => handleComplexityChange(complexity + 1)}
              disabled={complexity >= 5}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {error && !isProcessing && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {localSimplifiedResult && !hideResult && !isProcessing && (
        <div className="p-4 border rounded bg-muted">
          <h2 className="font-semibold mb-2">Simplified Result (Local):</h2>
          <div className="flex flex-col gap-2">
            <div className="font-mono overflow-x-auto whitespace-pre-wrap break-words no-scrollbar">
              {localSimplifiedResult}
            </div>
            <div className="pt-2 border-t">
              <h3 className="text-sm font-medium mb-1">LaTeX Representation:</h3>
              <div className="overflow-x-auto max-w-full">
                <KatexFormula
                  formula={booleanToLatex(localSimplifiedResult)}
                  block={true}
                  className="py-2 no-scrollbar"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
