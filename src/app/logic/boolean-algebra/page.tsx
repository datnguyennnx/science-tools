'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Import the components
import { ExpressionInput } from './components/input'
import { TruthTable, KarnaughMap } from './components/visualization'
import { StepByStepSimplification } from './components/simplification'

export default function BooleanAlgebraPage() {
  const [currentExpressionInput, setCurrentExpressionInput] = useState('')
  const [submittedExpression, setSubmittedExpression] = useState('')
  const [isSimplified, setIsSimplified] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleExpressionChange = (newExpression: string) => {
    setCurrentExpressionInput(newExpression)
  }

  const handleSimplificationStart = () => {
    setIsProcessing(true)
    setSubmittedExpression(currentExpressionInput)
    setIsSimplified(false)
  }

  const handleSimplificationComplete = (success: boolean) => {
    setIsProcessing(false)
    setIsSimplified(success)
  }

  return (
    <div className="w-full max-w-full">
      <div className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-4">
        {/* Input Section */}
        <Card className="w-full h-fit col-span-1 md:col-span-6 xl:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Boolean Algebra Input</CardTitle>
            <CardDescription className="flex flex-col space-y-1">
              <span>Supported notation formats:</span>
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
              <div className="text-center p-4 text-muted-foreground">
                {!isProcessing &&
                  submittedExpression.trim() === '' &&
                  'Enter a boolean expression and click Simplify to begin'}
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
          {/* Truth Table Section */}
          <Card className="w-full h-fit">
            <CardHeader className="pb-2">
              <CardTitle>Truth Table</CardTitle>
              <CardDescription>Evaluation for all possible inputs</CardDescription>
            </CardHeader>
            <CardContent>
              {isSimplified && submittedExpression.trim() ? (
                <TruthTable expression={submittedExpression} />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  {!isProcessing &&
                    'Enter a boolean expression and click Simplify to generate a truth table'}
                  {isProcessing && 'Processing...'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* K-Map Section */}
          <div className="w-full h-fit">
            <KarnaughMap expression={submittedExpression} />
          </div>
        </div>
      </div>
    </div>
  )
}
