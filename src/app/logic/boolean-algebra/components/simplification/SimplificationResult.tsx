'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KatexFormula } from '@/components/KatexFormula'

interface SimplificationResultProps {
  finalExpression: string
}

export function SimplificationResult({ finalExpression }: SimplificationResultProps) {
  return (
    <div className="mt-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium px-2 py-1">
              Final Result
            </Badge>
            <span className="text-sm ba-text-muted">Simplified Boolean Expression</span>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto no-scrollbar">
          <div className="ba-success-result mb-2 p-2 rounded-md">
            <p className="text-xs leading-relaxed">
              This is the most simplified form of your Boolean expression using algebraic rules and
              minimization techniques.
            </p>
          </div>
          <div className="ba-formula-section rounded overflow-x-auto max-w-full no-scrollbar">
            <KatexFormula formula={finalExpression} block={true} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
