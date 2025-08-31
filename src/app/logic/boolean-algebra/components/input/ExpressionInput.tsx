import { Textarea } from '@/components/ui/textarea'
import { ExpressionPreview } from './ExpressionPreview'
import { ExpressionControls } from './ExpressionControls'
import { ExpressionResult } from './ExpressionResult'
import { useExpressionInput } from '../hooks/useExpressionInput'
import { useExpressionProcessing } from '../hooks/useExpressionProcessing'
import { useExpressionPreview } from '../hooks/useExpressionPreview'
import { booleanToLatex } from '@/components/KatexFormula'

interface ExpressionInputProps {
  defaultExpression?: string
  onExpressionChange?: (expression: string) => void
  onSimplificationStart?: () => void
  onResultChange?: (success: boolean) => void
  hideResult?: boolean
}

export function ExpressionInput({
  defaultExpression = '',
  onExpressionChange,
  onSimplificationStart,
  onResultChange,
  hideResult = false,
}: ExpressionInputProps) {
  // Custom hooks for state management
  const { state: inputState, actions: inputActions } = useExpressionInput(defaultExpression)
  const { state: processingState, actions: processingActions } = useExpressionProcessing()
  const { state: previewState } = useExpressionPreview(inputState.expression)

  // Handle expression changes
  const handleExpressionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newExpression = e.target.value
    inputActions.setExpression(newExpression)
    inputActions.resetError()
    processingActions.clearResult()
    onExpressionChange?.(newExpression)
  }

  // Handle simplification
  const handleSimplify = async () => {
    onSimplificationStart?.()
    inputActions.setIsProcessing(true)

    try {
      await processingActions.simplify(inputState.expression)
      onResultChange?.(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to simplify'
      inputActions.setError(errorMessage)
      onResultChange?.(false)
    } finally {
      inputActions.setIsProcessing(false)
    }
  }

  // Handle random expression generation
  const handleGenerateRandom = () => {
    const randomExpr = processingActions.generateRandom(inputState.complexity)
    inputActions.setExpression(randomExpr)
    inputActions.resetError()
    processingActions.clearResult()
    onExpressionChange?.(randomExpr)
  }

  // Handle complexity changes
  const handleComplexityChange = (newComplexity: number) => {
    inputActions.setComplexity(newComplexity)
  }

  // Determine effective processing state
  const effectiveIsProcessing = inputState.isProcessing || processingState.isSimplifying
  const effectiveError = inputState.error || processingState.parseError
  const effectiveResult = processingState.simplifiedResult

  return (
    <div className="space-y-4">
      <ExpressionControls
        expression={inputState.expression}
        complexity={inputState.complexity}
        isProcessing={effectiveIsProcessing}
        onSimplify={handleSimplify}
        onGenerateRandom={handleGenerateRandom}
        onComplexityChange={handleComplexityChange}
      />

      <ExpressionPreview
        formula={
          previewState.latexPreview ||
          (inputState.expression ? booleanToLatex(inputState.expression) : '')
        }
      />

      <Textarea
        placeholder="Enter expression using standard (A+B, A*B, !A) or LaTeX (A \lor B, A \land B, \lnot A) notation"
        value={inputState.expression}
        onChange={handleExpressionChange}
        className="min-h-[100px] font-mono whitespace-pre-wrap overflow-x-auto no-scrollbar"
        disabled={effectiveIsProcessing}
      />

      {effectiveError && !effectiveIsProcessing && (
        <div
          className="p-3 border rounded-lg"
          style={{ borderColor: 'var(--error-border)', backgroundColor: 'var(--error-background)' }}
        >
          <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--error-text-strong)' }}>
            Error
          </h3>
          <p className="text-sm" style={{ color: 'var(--error-text)' }}>
            {effectiveError}
          </p>
        </div>
      )}

      <ExpressionResult
        result={effectiveResult}
        hideResult={hideResult}
        isProcessing={effectiveIsProcessing}
      />
    </div>
  )
}
