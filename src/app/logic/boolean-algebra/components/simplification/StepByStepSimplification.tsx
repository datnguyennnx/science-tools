'use client'

import React from 'react'
import { useExpressionSimplification } from '../hooks/useExpressionSimplification'
import { SimplificationLoading } from './SimplificationLoading'
import { SimplificationError } from './SimplificationError'
import { SimplificationSteps } from './SimplificationSteps'
import { SimplificationResult } from './SimplificationResult'
import { SimplificationNoSteps } from './SimplificationNoSteps'

interface StepByStepSimplificationProps {
  expression: string
  onCopySteps?: () => void
  copySuccess?: boolean
}

export function StepByStepSimplification({
  expression,
  onCopySteps,
  copySuccess,
}: StepByStepSimplificationProps) {
  const { result, isLoading } = useExpressionSimplification(expression)

  // Show loading state
  if (isLoading || !result) {
    return <SimplificationLoading />
  }

  // Show error state
  if (result.errorOccurred) {
    return (
      <SimplificationError
        errorMessage={result.errorMessage}
        rawInput={result.rawInput}
        initialProcessedInput={result.initialProcessedInput}
      />
    )
  }

  // Check if we have steps to display
  const hasSteps = result.steps.length > 0

  return (
    <div className="w-full space-y-4">
      {/* Educational header */}
      <div className="ba-rule-description p-3 rounded-lg border border-border">
        <h3 className="font-semibold text-sm mb-1">Step-by-Step Boolean Simplification</h3>
        <p className="text-xs ba-text-muted leading-relaxed">
          This process applies Boolean algebra rules systematically to simplify your expression.
          Each step shows which algebraic law was applied and how it transforms the expression.
        </p>
      </div>

      {hasSteps ? (
        <>
          <SimplificationSteps
            steps={result.steps}
            originalExpression={expression}
            onCopySteps={onCopySteps}
            copySuccess={copySuccess}
          />
          <SimplificationResult finalExpression={result.finalExpression} />
        </>
      ) : (
        <SimplificationNoSteps finalExpression={result.finalExpression} />
      )}
    </div>
  )
}
