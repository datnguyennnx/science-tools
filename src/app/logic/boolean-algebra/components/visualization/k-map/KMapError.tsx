'use client'

import React from 'react'
import { KMapResultError } from './types'

interface KMapErrorProps {
  result: KMapResultError
}

export function KMapError({ result }: KMapErrorProps) {
  return (
    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center h-full min-h-[15rem] text-center">
      <div className="text-center max-w-md">
        <p className="mb-2 text-base font-medium">
          K-Map generation currently supports 2 to 5 variables. Detected
          {result.variables?.length || 0} variables.
        </p>
        {result.variables && (
          <p className="text-sm">Detected variables: {result.variables.join(', ')}</p>
        )}
        <p className="text-sm mt-2">
          Please provide a valid boolean expression with 2 to 5 unique variables [A-Z].
        </p>
      </div>
    </div>
  )
}
