import React from 'react'
import { XCircle } from 'lucide-react'

interface ExpressionErrorProps {
  error: string
  className?: string
}

// Error patterns and their helpful messages
const ERROR_PATTERNS = {
  'Invalid syntax: "0!"':
    'Use proper syntax for constants and operators. For example, use "0*!(D)" instead of "0!(D)".',
  'Numbers cannot directly precede the NOT operator':
    'Add a multiplication operator (*) between the number and NOT operator. For example, use "0*!(B)" instead of "0!(B)".',
  'Empty parentheses':
    'Avoid empty parentheses "()" in your expression. Use a constant (0, 1) or variable instead.',
  'Missing operator': 'Make sure to use proper operators (* for AND, + for OR) between terms.',
  'Mismatched parentheses': 'Check that all opening parentheses have matching closing parentheses.',
  'Invalid JavaScript values':
    'Your expression contains an invalid term. Check for any undefined variables or syntax errors.',
} as const

// Process error message to extract user-friendly information
function processErrorMessage(error: string) {
  let userFriendlyMessage = error

  // Clean up error messages
  if (error.includes('Unable to parse expression:')) {
    const match = error.match(/Unable to parse expression: .+? - (.+)/)
    if (match && match[1]) {
      userFriendlyMessage = match[1]
    }
  }

  // Find matching common error pattern
  let additionalHelp = ''
  for (const [errorPattern, help] of Object.entries(ERROR_PATTERNS)) {
    if (userFriendlyMessage.includes(errorPattern)) {
      additionalHelp = help
      break
    }
  }

  return { userFriendlyMessage, additionalHelp }
}

export function ExpressionError({ error, className = '' }: ExpressionErrorProps) {
  const { userFriendlyMessage, additionalHelp } = processErrorMessage(error)

  return (
    <div
      className={`p-4 bg-[var(--error-background)] border border-[var(--error-border)] rounded-md text-[var(--error-text)] ${className}`}
    >
      <div className="flex gap-2 items-start">
        <XCircle className="h-5 w-5 text-[var(--error-icon)] mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-[var(--error-text-strong)]">Expression Error</h4>
          <p className="mt-1">{userFriendlyMessage}</p>

          {additionalHelp && (
            <p className="mt-2 text-sm border-t border-[var(--error-border)] pt-2">
              {additionalHelp}
            </p>
          )}

          {userFriendlyMessage.includes('0!') && (
            <div className="mt-2 text-sm border-t border-[var(--error-border)] pt-2">
              <p className="font-semibold">Example fix:</p>
              <code className="block bg-[var(--error-background)] p-1 rounded mt-1">
                <s style={{ color: 'var(--error-text)' }}>0!(B)</s> →{' '}
                <span className="font-semibold" style={{ color: 'oklch(0.65 0.18 145)' }}>
                  0*!(B)
                </span>
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
