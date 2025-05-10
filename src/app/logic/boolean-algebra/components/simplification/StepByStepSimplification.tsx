'use client'

import { useMemo } from 'react'
import { getLatexResults as simplifyBooleanExpression } from '../../engine'
import { KatexFormula } from '@/components/KatexFormula'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExpressionError } from '../input/ExpressionError'

interface StepByStepSimplificationProps {
  expression: string
}

export function StepByStepSimplification({ expression }: StepByStepSimplificationProps) {
  const memoizedSimplification = useMemo(() => {
    const steps: Array<{
      ruleName: string
      ruleFormula: string
      beforeLatex: string
      afterLatex: string
    }> = []
    let finalSimplifiedLatex = ''
    let errorOccurred = false
    let errorMessage = ''
    let processedExpression = ''

    if (!expression.trim()) {
      return {
        steps,
        finalExpression: '',
        errorOccurred: false,
        errorMessage,
        rawInput: expression,
      }
    }

    // Pre-sanitize to catch undefined values before they reach the simplifier
    if (expression.includes('undefined') || expression.includes('null')) {
      return {
        steps,
        finalExpression: '',
        errorOccurred: true,
        errorMessage:
          'Expression contains "undefined" or "null", which are invalid Boolean values. Please use only variables (A-Z), constants (0/1), and operators.',
        rawInput: expression,
      }
    }

    try {
      // The new engine handles LaTeX conversion internally
      const simplificationResult = simplifyBooleanExpression(expression)

      simplificationResult.steps.forEach(s =>
        steps.push({
          ruleName: s.ruleName,
          ruleFormula: s.ruleFormula,
          beforeLatex: s.beforeLatex,
          afterLatex: s.afterLatex,
        })
      )
      finalSimplifiedLatex = simplificationResult.finalLatex
      processedExpression = expression
    } catch (err) {
      console.error('Error in simplification logic:', err)
      errorOccurred = true
      errorMessage = err instanceof Error ? err.message : 'Failed to simplify expression.'
      finalSimplifiedLatex = processedExpression || expression
    }

    return {
      steps,
      finalExpression: finalSimplifiedLatex,
      errorOccurred,
      errorMessage,
      rawInput: expression,
      initialProcessedInput: errorOccurred ? processedExpression || expression : expression,
    }
  }, [expression])

  if (memoizedSimplification.errorOccurred) {
    return (
      <div>
        <ExpressionError error={memoizedSimplification.errorMessage} />
        <div className="mt-2 p-3 border rounded bg-background">
          <p className="font-mono text-sm">Input: {memoizedSimplification.rawInput}</p>
          {memoizedSimplification.initialProcessedInput &&
            memoizedSimplification.initialProcessedInput !== memoizedSimplification.rawInput && (
              <p className="font-mono text-sm mt-1">
                Processed as: {memoizedSimplification.initialProcessedInput}
              </p>
            )}
        </div>
      </div>
    )
  }

  // Check if we have steps to display
  const hasSteps = memoizedSimplification.steps.length > 0

  return (
    <div className="w-full">
      {hasSteps ? (
        <>
          <div className="mb-2">
            <h4 className="font-semibold mb-2 text-sm">Steps</h4>
            <div className="space-y-2">
              {/* Original equation step */}
              <Card key="original-expression">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="font-medium px-1 sm:px-2 text-xs sm:text-sm"
                    >
                      Step 0
                    </Badge>
                    <span className="font-medium text-xs sm:text-sm">Original Expression</span>
                  </div>
                  <div className="rounded bg-muted/80 p-2 overflow-x-auto max-w-full no-scrollbar">
                    <KatexFormula formula={expression} block={true} />
                  </div>
                </CardContent>
              </Card>

              {/* Simplification steps */}
              {memoizedSimplification.steps.map((step, idx) => (
                <Card
                  key={`${step.ruleName}-${step.beforeLatex}-${step.afterLatex.substring(0, 15)}`}
                >
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="font-medium px-1 sm:px-2 text-xs sm:text-sm"
                      >
                        Step {idx + 1}
                      </Badge>
                      <span className="font-medium text-xs sm:text-sm">{step.ruleName}</span>
                      <div className="flex flex-wrap items-center mt-1 w-full sm:w-auto sm:mt-0 sm:ml-auto">
                        <div className="overflow-x-auto max-w-full no-scrollbar">
                          <KatexFormula formula={step.ruleFormula} block={false} />
                        </div>
                      </div>
                    </div>

                    <div className="rounded bg-muted/80 p-2 overflow-x-auto max-w-full no-scrollbar">
                      <KatexFormula formula={step.beforeLatex} block={true} />
                    </div>

                    <div className="flex justify-center my-1">
                      <span>↓</span>
                    </div>

                    <div className="rounded bg-muted/80 p-2 overflow-x-auto max-w-full no-scrollbar ">
                      <KatexFormula formula={step.afterLatex} block={true} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <Card>
              <CardHeader>Simplified Result</CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="rounded bg-muted/80 p-2 overflow-x-auto max-w-full no-scrollbar">
                  <KatexFormula formula={memoizedSimplification.finalExpression} block={true} />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="p-3 text-center border-dashed border rounded-md">
          <p className="mb-2 text-sm">
            No explicit simplification steps applied. Expression might be already simplified or no
            specific laws were triggered by the current ruleset.
          </p>
          {memoizedSimplification.finalExpression && (
            <div className="mt-2">
              <p className="font-medium mb-1 text-sm">Expression:</p>
              <div className="overflow-x-auto max-w-full no-scrollbar">
                <KatexFormula formula={memoizedSimplification.finalExpression} block={true} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
