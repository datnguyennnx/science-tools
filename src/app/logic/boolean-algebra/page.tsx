'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Import the components
import { ExpressionInput } from './components/input'
import { TruthTable, KarnaughMap, VennDiagram } from './components/visualization'
import { StepByStepSimplification } from './components/simplification'

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
      <div className={`grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-4`}>
        {/* Input Section */}
        <Card className="w-full h-fit col-span-1 md:col-span-6 xl:col-span-3">
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

        {/* Simplification Section */}
        <Card className="w-full h-fit col-span-1 md:col-span-6 xl:col-span-6">
          <CardHeader className="pb-2">
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

        {/* Truth Table Section & K-Map Section Group */}
        <div className="col-span-1 md:col-span-6 xl:col-span-3 flex flex-col gap-4">
          <TruthTable expression={submittedExpression} />
          <KarnaughMap expression={submittedExpression} />
          <VennDiagram expression={submittedExpression} />
        </div>
      </div>
    </div>
  )
}
