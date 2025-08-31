'use client'

import React from 'react'
import { ExpressionError } from '../input/ExpressionError'

interface SimplificationErrorProps {
  errorMessage: string
  rawInput: string
  initialProcessedInput?: string
}

export function SimplificationError({
  errorMessage,
  rawInput,
  initialProcessedInput,
}: SimplificationErrorProps) {
  return (
    <div>
      <ExpressionError error={errorMessage} />
      <div className="ba-bg-background mt-2 p-3 border rounded">
        <p className="font-mono text-sm">Input: {rawInput}</p>
        {initialProcessedInput && initialProcessedInput !== rawInput && (
          <p className="font-mono text-sm mt-1">Processed as: {initialProcessedInput}</p>
        )}
      </div>
    </div>
  )
}
