'use client'

import React from 'react'
import { XCircle } from 'lucide-react'

interface ExpressionErrorProps {
  error: string
  className?: string
}

export function ExpressionError({ error, className = '' }: ExpressionErrorProps) {
  // Extract important parts from the error message to make it more user-friendly
  let userFriendlyMessage = error

  // Clean up error messages
  if (error.includes('Unable to parse expression:')) {
    // Extract the specific error part
    const match = error.match(/Unable to parse expression: .+? - (.+)/)
    if (match && match[1]) {
      userFriendlyMessage = match[1]
    }
  }

  // Handle specific error types with additional help
  const commonErrors = {
    'Invalid syntax: "0!"':
      'Use proper syntax for constants and operators. For example, use "0*!(D)" instead of "0!(D)".',
    'Numbers cannot directly precede the NOT operator':
      'Add a multiplication operator (*) between the number and NOT operator. For example, use "0*!(B)" instead of "0!(B)".',
    'Empty parentheses':
      'Avoid empty parentheses "()" in your expression. Use a constant (0, 1) or variable instead.',
    'Missing operator': 'Make sure to use proper operators (* for AND, + for OR) between terms.',
    'Mismatched parentheses':
      'Check that all opening parentheses have matching closing parentheses.',
    undefined: 'Check your expression for any undefined variables or incorrect syntax patterns.',
    'Invalid JavaScript values':
      'Your expression contains an invalid term. Check for any undefined variables or syntax errors.',
  }

  // Find matching common error to provide additional help
  let additionalHelp = ''
  for (const [errorPattern, help] of Object.entries(commonErrors)) {
    if (userFriendlyMessage.includes(errorPattern)) {
      additionalHelp = help
      break
    }
  }

  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-md text-red-700 ${className}`}>
      <div className="flex gap-2 items-start">
        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-red-800">Expression Error</h4>
          <p className="mt-1">{userFriendlyMessage}</p>
          {additionalHelp && (
            <p className="mt-2 text-sm border-t border-red-200 pt-2">{additionalHelp}</p>
          )}
          {userFriendlyMessage.includes('0!') && (
            <div className="mt-2 text-sm border-t border-red-200 pt-2">
              <p className="font-semibold">Example fix:</p>
              <code className="block bg-red-50 p-1 rounded mt-1">
                <p className="line-through">0!(B)</p> → <p className="font-semibold">0*!(B)</p>
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
