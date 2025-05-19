'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'

// Import the ExpressionInput statically as it's always visible and critical for input
import { ExpressionInput } from './components/input'

// Dynamically import visualization and simplification components
const TruthTable = dynamic(() => import('./components/visualization').then(mod => mod.TruthTable), {
  loading: () => null,
})

const KarnaughMap = dynamic(
  () => import('./components/visualization').then(mod => mod.KarnaughMap),
  { loading: () => null }
)

const VennDiagram = dynamic(
  () => import('./components/visualization').then(mod => mod.VennDiagram),
  { loading: () => null }
)

const StepByStepSimplification = dynamic(
  () => import('./components/simplification').then(mod => mod.StepByStepSimplification),
  { loading: () => null }
)

export default function BooleanAlgebraPage() {
  const [currentExpressionInput, setCurrentExpressionInput] = useState('')
  const [submittedExpression, setSubmittedExpression] = useState('')
  const [isSimplified, setIsSimplified] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleExpressionChange = useCallback((newExpression: string) => {
    setCurrentExpressionInput(newExpression)
  }, [])

  const handleSimplificationStart = useCallback(() => {
    setIsProcessing(true)
    setSubmittedExpression(currentExpressionInput)
    setIsSimplified(false)
  }, [currentExpressionInput])

  const handleSimplificationComplete = useCallback((success: boolean) => {
    setIsProcessing(false)
    setIsSimplified(success)
  }, [])

  return (
    <div className="w-full max-w-full">
      {/* Main grid: single column by default, 3 columns on large screens */}
      <div className={`grid grid-cols-1 lg:grid-cols-8 gap-4`}>
        {/* Column 1 (Large Screens): Input and Truth Table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Input Section */}
          <Card className="w-full h-fit">
            <CardHeader className="pb-2">
              <CardTitle>Boolean Algebra Input</CardTitle>
              <CardDescription className="flex flex-col space-y-1">
                <p>Supported notation formats:</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs pl-1">
                  <div className="font-medium">Standard:</div>
                  <div>A+B (OR), A*B (AND), !A (NOT)</div>
                  <div className="font-medium">LaTeX:</div>
                  <div>A\lor B, A\land B, \lnot A</div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpressionInput
                defaultExpression={currentExpressionInput}
                onExpressionChange={handleExpressionChange}
                onSimplificationStart={handleSimplificationStart}
                onResultChange={handleSimplificationComplete}
                isProcessing={isProcessing}
                hideResult={true}
              />
            </CardContent>
          </Card>

          {/* Truth Table is now inside the first column */}
          <TruthTable expression={submittedExpression} />
        </div>

        {/* Column 2 (Large Screens): Simplification */}
        {/* Simplification Section is now in the second column */}
        <Card className="w-full h-fit lg:col-span-4">
          <CardHeader className="pb-2 ">
            <CardTitle>Simplification</CardTitle>
            <CardDescription>
              Step-by-step resolution.{' '}
              <strong className="text-warning-foreground">
                Important: Always double-check the simplification results. Automated systems may not
                always be perfect, so verify the output for critical applications.
              </strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSimplified && submittedExpression.trim() ? (
              <StepByStepSimplification expression={submittedExpression} />
            ) : (
              <div className="text-center p-3 border-dashed border rounded-md">
                {!isProcessing && submittedExpression.trim() === '' && (
                  <p className="text-sm text-muted-foreground">
                    Enter a boolean expression and click Simplify to begin
                  </p>
                )}
                {!isProcessing &&
                  submittedExpression.trim() !== '' &&
                  !isSimplified &&
                  'Failed to simplify or no simplification needed.'}
                {isProcessing && 'Processing...'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column 3 (Large Screens): K-Map and Venn Diagram */}
        <div className="lg:col-span-2 flex flex-col  gap-4">
          <KarnaughMap expression={submittedExpression} />
          <VennDiagram expression={submittedExpression} />
        </div>
      </div>
    </div>
  )
}
