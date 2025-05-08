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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
        {/* Input Section */}
        <Card className="w-full h-fit md:col-span-1 xl:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Input</CardTitle>
            <CardDescription>Enter your boolean expression</CardDescription>
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
        <Card className="w-full h-fit md:col-span-2 xl:col-span-6">
          <CardHeader className="pb-2">
            <CardTitle>Simplification</CardTitle>
            <CardDescription>Step-by-step resolution</CardDescription>
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
        <div className="md:col-span-2 xl:col-span-3 flex flex-col gap-4">
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

          {/* K-Map Section - New */}
          <div className="w-full h-fit">
            {isSimplified && submittedExpression.trim() ? (
              <KarnaughMap expression={submittedExpression} />
            ) : (
              <div className="text-center p-4 border rounded-md bg-muted/30">
                {!isProcessing ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Karnaugh Map</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>K-Map generation currently supports 2 to 4 variables.</p>
                      <p className="text-xs">
                        Enter an expression and click Simplify to visualize.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>Generating K-Map...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
