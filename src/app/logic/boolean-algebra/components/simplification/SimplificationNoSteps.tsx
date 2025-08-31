'use client'

import React from 'react'
import { KatexFormula } from '@/components/KatexFormula'
import { Badge } from '@/components/ui/badge'

interface SimplificationNoStepsProps {
  finalExpression?: string
}

export function SimplificationNoSteps({ finalExpression }: SimplificationNoStepsProps) {
  return (
    <div className="mt-2">
      <div className="ba-bg-muted p-4 text-center border-dashed border-2 border-border rounded-md no-scrollbar">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Badge variant="outline" className="font-medium px-2 py-1">
            Already Simplified
          </Badge>
        </div>
        <p className="mb-3 text-sm ba-text-muted leading-relaxed">
          Your Boolean expression is already in its simplest form. No further algebraic
          simplifications could be applied using the available Boolean algebra rules and
          minimization techniques.
        </p>
        {finalExpression && (
          <div className="mt-3">
            <p className="font-medium mb-2 text-sm">Your Expression:</p>
            <div className="ba-formula-section rounded overflow-x-auto max-w-full no-scrollbar">
              <KatexFormula formula={finalExpression} block={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
