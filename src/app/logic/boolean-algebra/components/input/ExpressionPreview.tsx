import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import KatexFormula component
const KatexFormulaComponent = dynamic(
  () => import('@/components/KatexFormula').then(mod => mod.KatexFormula),
  {
    loading: () => null,
    ssr: false, // KaTeX manipulation is client-side heavy
  }
)

interface ExpressionPreviewProps {
  formula: string
}

export function ExpressionPreview({ formula }: ExpressionPreviewProps) {
  return (
    <div className="ba-expression-preview rounded-lg border p-3">
      <div className="mb-2">
        <h3 className="text-sm font-medium">Preview</h3>
      </div>
      <div className="overflow-x-auto max-w-full no-scrollbar">
        <Suspense fallback={null}>
          <KatexFormulaComponent formula={formula} block={true} className="py-1" />
        </Suspense>
      </div>
    </div>
  )
}
