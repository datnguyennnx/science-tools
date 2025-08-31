import { Suspense } from 'react'
import { booleanToLatex } from '@/components/KatexFormula'
import dynamic from 'next/dynamic'

// Dynamically import KatexFormula component
const KatexFormulaComponent = dynamic(
  () => import('@/components/KatexFormula').then(mod => mod.KatexFormula),
  {
    loading: () => null,
    ssr: false,
  }
)

interface ExpressionResultProps {
  result: string
  hideResult?: boolean
  isProcessing?: boolean
}

export function ExpressionResult({
  result,
  hideResult = false,
  isProcessing = false,
}: ExpressionResultProps) {
  if (!result || hideResult || isProcessing) {
    return null
  }

  return (
    <div className="ba-expression-result w-full p-3 border rounded-lg mt-4 no-scrollbar">
      <h2 className="font-semibold mb-2">Simplified Result:</h2>
      <div className="flex flex-col gap-2">
        <div className="font-mono overflow-x-auto whitespace-pre-wrap break-words no-scrollbar">
          {result}
        </div>
        <div className="pt-2 border-t">
          <h3 className="text-sm font-medium mb-1">LaTeX Representation:</h3>
          <div className="overflow-x-auto max-w-full no-scrollbar">
            <Suspense fallback={null}>
              <KatexFormulaComponent
                formula={booleanToLatex(result)}
                block={true}
                className="py-2 no-scrollbar"
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
