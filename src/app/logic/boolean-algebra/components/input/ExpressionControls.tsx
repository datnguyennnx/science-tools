import { Button } from '@/components/ui/button'
import { Loader2, Shuffle } from 'lucide-react'

interface ExpressionControlsProps {
  expression: string
  complexity: number
  isProcessing: boolean
  onSimplify: () => void
  onGenerateRandom: () => void
  onComplexityChange: (complexity: number) => void
}

export function ExpressionControls({
  expression,
  complexity,
  isProcessing,
  onSimplify,
  onGenerateRandom,
  onComplexityChange,
}: ExpressionControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm">Auto-detecting input format</div>
        <div className="flex items-center gap-1">
          <p className="text-xs ba-text-muted">Complexity:</p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => onComplexityChange(complexity - 1)}
              disabled={complexity <= 1}
            >
              -
            </Button>
            <p className="text-xs font-medium w-4 text-center">{complexity}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => onComplexityChange(complexity + 1)}
              disabled={complexity >= 5}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={onSimplify}
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

        <Button variant="outline" onClick={onGenerateRandom} disabled={isProcessing}>
          <Shuffle className="mr-2 h-4 w-4" />
          Random Expression
        </Button>
      </div>
    </div>
  )
}
