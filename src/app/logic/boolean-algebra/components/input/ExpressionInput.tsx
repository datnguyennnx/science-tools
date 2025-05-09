import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Shuffle } from 'lucide-react'
import { getSimplificationSteps, generateRandomExpression } from '../../engine'
import { InputFormat, ParserOptions } from '../../engine/core/parsing/types'
import { KatexFormula, booleanToLatex } from '@/components/KatexFormula'
import { toast } from 'sonner'
import { parse as parseExpr, detectFormat } from '../../engine/core/parsing/parser'
import {
  formatToBoolean as toBooleanString,
  formatToLatex as toLatexString,
} from '../../engine/core/parsing/formatters'
import { BooleanExpression } from '../../engine/core/types/types'
import { OutputFormat } from '../../engine/generation/generator'

/**
 * Detect input format (standard or LaTeX) based on content
 */
function detectInputFormat(input: string): InputFormat {
  // Use the parser's built-in detectFormat function
  return detectFormat(input)
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
  // State for the expression
  const [expression, setExpression] = useState(defaultExpression)
  const [alternativePreview, setAlternativePreview] = useState('')
  const [localSimplifiedResult, setLocalSimplifiedResult] = useState('')
  const [error, setError] = useState('')
  const [complexity, setComplexity] = useState(3) // Default complexity level

  // Create wrapper functions for the parser
  const parse = (input: string, options: Partial<ParserOptions> = {}) => {
    try {
      // First auto-detect the format if not specified
      const inputFormat = options.inputFormat || detectInputFormat(input)

      // Parse the expression
      const expr = parseExpr(input)
      return { success: true, expression: expr, format: inputFormat }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse expression'
      if (options.showToasts) {
        toast.error(errorMessage)
      }
      return { success: false, expression: null, error: errorMessage }
    }
  }

  const formatBoolean = (expr: BooleanExpression) => toBooleanString(expr)
  const formatLatex = (expr: BooleanExpression) => toLatexString(expr)

  useEffect(() => {
    setExpression(defaultExpression)
  }, [defaultExpression])

  // Update previews whenever expression changes
  useEffect(() => {
    if (!expression.trim()) {
      setAlternativePreview('')
      onExpressionChange?.('')
      return
    }

    onExpressionChange?.(expression)
    updatePreview(expression)
  }, [expression, onExpressionChange])

  // Function to update preview based on current expression
  const updatePreview = (expr: string) => {
    if (!expr.trim()) return

    // Auto-detect the input format
    const detectedFormat = detectInputFormat(expr)

    // Parse with silent error handling and auto-format detection
    const result = parse(expr, {
      showToasts: false,
      silent: true,
      // Let the parser auto-detect format based on the expression
    })

    if (result.success && result.expression) {
      // Show alternative format in preview
      if (detectedFormat === 'standard') {
        setAlternativePreview(formatLatex(result.expression))
      } else {
        setAlternativePreview(formatBoolean(result.expression))
      }
      setError('')
    } else if (result.error) {
      // Only show errors in the UI, don't toast during typing
      setError(result.error)
    }
  }

  const handleExpressionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newExpression = e.target.value
    setExpression(newExpression)
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

    // Let the parser auto-detect format
    const parseResult = parse(expression, {
      showToasts: true,
    })

    if (!parseResult.success) {
      onResultChange?.(false)
      return
    }

    try {
      // Use the standardized expression format for simplification
      const standardExpression = formatBoolean(parseResult.expression!)
      const { finalExpression } = getSimplificationSteps(standardExpression)
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
      // Randomly choose between standard and LaTeX format
      outputFormat: Math.random() < 0.5 ? 'standard' : ('latex' as OutputFormat),
    }

    // Generate expression with randomly selected format
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
      <div className="flex items-center justify-between">
        <div className="text-sm">Auto-detecting input format</div>
        <div className="flex items-center gap-1">
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

      {/* Preview section - positioned above textarea */}
      <div className="rounded-lg border bg-muted/50 p-3">
        <div className="mb-2">
          <h3 className="text-sm font-medium">Preview</h3>
        </div>
        <div className="overflow-x-auto max-w-full no-scrollbar">
          <KatexFormula
            formula={alternativePreview || (expression ? booleanToLatex(expression) : '')}
            block={true}
            className="py-1"
          />
        </div>
      </div>

      <Textarea
        placeholder="Enter expression using standard (A+B, A*B, !A) or LaTeX (A \lor B, A \land B, \lnot A) notation"
        value={expression}
        onChange={handleExpressionChange}
        className="min-h-[100px] font-mono whitespace-pre-wrap overflow-x-auto"
        disabled={isProcessing}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={handleSimplify}
          disabled={isProcessing || !expression.trim()}
          className="min-w-[120px]"
          variant="default"
        >
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
      </div>

      {error && !isProcessing && (
        <div className="p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Error</h3>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {localSimplifiedResult && !hideResult && !isProcessing && (
        <div className="w-full p-3 border rounded-lg bg-muted mt-4">
          <h2 className="font-semibold mb-2">Simplified Result:</h2>
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
