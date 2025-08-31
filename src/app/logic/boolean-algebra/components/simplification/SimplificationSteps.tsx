'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { KatexFormula, booleanToLatex } from '@/components/KatexFormula'
import type { SimplificationStep } from '../hooks/useExpressionSimplification'
import { RULE_MAPPINGS } from './constants'

interface SimplificationStepsProps {
  steps: SimplificationStep[]
  originalExpression: string
  onCopySteps?: () => void
  copySuccess?: boolean
}

// Enhanced step information mapping for better user understanding
const getEnhancedStepInfo = (ruleName: string, ruleFormula: string, ruleDescription?: string) => {
  // Prepare clean name for fallback use
  const cleanName = ruleName
    // Handle concatenated words by adding spaces before capital letters
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Handle common acronyms
    .replace(/\bSop\b/g, 'Sum of Products (SOP)')
    .replace(/\bPos\b/g, 'Product of Sums (POS)')
    .replace(/\bXor\b/g, 'XOR')
    .replace(/\bXnor\b/g, 'XNOR')
    .replace(/\bNor\b/g, 'NOR')
    .replace(/\bNand\b/g, 'NAND')
    .replace(/\bAnd\b/g, 'AND')
    .replace(/\bOr\b/g, 'OR')
    .replace(/\bNot\b/g, 'NOT')
    // Handle parentheses and clean up
    .replace(/\(/g, ' (')
    .replace(/\)/g, ') ')
    // Clean up extra spaces and format
    .replace(/\s+/g, ' ')
    .trim()
    // Capitalize first letter of each word
    .split(' ')
    .map(word => {
      // Handle special cases like (SOP)
      if (word.startsWith('(') && word.endsWith(')')) {
        return word
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
    // Clean up any remaining formatting issues
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')

  // Use imported rule mappings for clean code organization
  const ruleMappings = RULE_MAPPINGS

  // Try to find an exact match first
  if (ruleMappings[ruleName]) {
    return ruleMappings[ruleName]
  }

  // Try to find a partial match or similar rule
  const similarRule = Object.keys(ruleMappings).find(
    key =>
      ruleName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(ruleName.toLowerCase())
  )

  if (similarRule) {
    return ruleMappings[similarRule]
  }

  // More aggressive matching for common patterns
  const normalizedRuleName = ruleName.toLowerCase().replace(/[^a-z0-9]/g, '')
  for (const [key, value] of Object.entries(ruleMappings)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (normalizedRuleName.includes(normalizedKey) || normalizedKey.includes(normalizedRuleName)) {
      return value
    }
  }

  // Fallback: use the pre-calculated clean name
  return {
    displayName: cleanName,
    description: ruleDescription || `Apply ${cleanName.toLowerCase()} to simplify the expression`,
    formula: ruleFormula || '',
  }
}

export function SimplificationSteps({
  steps,
  originalExpression,
  onCopySteps,
  copySuccess,
}: SimplificationStepsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold mb-2 text-sm">Steps</h4>

        {/* Copy Steps Button - positioned between original expression and steps */}
        {onCopySteps && (
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={onCopySteps}>
              {copySuccess ? (
                <>
                  <Check className="h-4 w-4" style={{ color: 'oklch(0.65 0.18 145)' }} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Steps
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {/* Original equation step */}
        <Card key="original-expression" className="ba-step-card">
          <CardContent className="p-2 sm:p-3">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
              <Badge variant="outline" className="font-medium px-1 sm:px-2 text-xs sm:text-sm">
                Step 0
              </Badge>
              <p className="font-medium text-xs sm:text-sm">Original Expression</p>
            </div>
            <div className="ba-formula-section rounded p-2 overflow-x-auto max-w-full no-scrollbar">
              <KatexFormula formula={booleanToLatex(originalExpression)} block={true} />
            </div>
          </CardContent>
        </Card>

        {/* Simplification steps */}
        {steps.map((step, idx) => {
          // Get enhanced step information
          const enhancedInfo = getEnhancedStepInfo(
            step.ruleName,
            step.ruleFormula,
            step.ruleDescription
          )

          // Create a unique hash based on the step content
          const stepHash = btoa(
            encodeURIComponent(
              `${enhancedInfo.displayName}-${step.beforeLatex.slice(0, 10)}-${step.afterLatex.slice(0, 10)}-${idx}`
            )
          ).replace(/[^a-zA-Z0-9]/g, '')

          return (
            <Card key={`step-${stepHash}`} className="ba-step-card">
              <CardContent className="p-2 sm:p-3">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                  <Badge variant="outline" className="font-medium px-1 sm:px-2 text-xs sm:text-sm">
                    Step {idx + 1}
                  </Badge>
                  <p className="font-medium text-xs sm:text-sm">{enhancedInfo.displayName}</p>
                </div>

                {/* Enhanced Rule Description - Educational Enhancement */}
                <div className="mb-3 space-y-2">
                  {/* Rule Description */}
                  <div className="ba-rule-description p-3 rounded-md no-scrollbar">
                    <p className="text-sm leading-relaxed">{enhancedInfo.description}</p>
                  </div>

                  {/* Mathematical Formula - Only show if formula exists */}
                  {enhancedInfo.formula &&
                    (Array.isArray(enhancedInfo.formula)
                      ? enhancedInfo.formula.length > 0
                      : enhancedInfo.formula.trim()) && (
                      <div className="ba-formula-section p-3 rounded-md no-scrollbar">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">Formula:</div>
                          <div className="flex-1 overflow-x-auto no-scrollbar">
                            {Array.isArray(enhancedInfo.formula) ? (
                              <div className="space-y-2">
                                {enhancedInfo.formula.map(formulaItem => (
                                  <KatexFormula
                                    key={btoa(formulaItem).slice(0, 10)}
                                    formula={formulaItem}
                                    block={true}
                                    className="text-sm"
                                  />
                                ))}
                              </div>
                            ) : (
                              <KatexFormula
                                formula={enhancedInfo.formula}
                                block={true}
                                className="text-sm"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Debug info - only show in development mode with proper environment check
                  {typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && (
                    <div className="ba-debug mt-2 p-2 rounded no-scrollbar">
                      <details className="cursor-pointer">
                        <summary className="text-xs font-medium">
                          🔧 Debug Info
                        </summary>
                        <div className="mt-2 space-y-1 text-xs font-mono">
                          <div>
                            <strong>Rule:</strong> {step.ruleName}
                          </div>
                          <div>
                            <strong>Description:</strong> {step.ruleDescription}
                          </div>
                          {enhancedInfo.formula && (
                            <div>
                              <strong>Formula:</strong> {enhancedInfo.formula}
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  )} */}
                </div>

                <div className="ba-formula-section rounded p-2 overflow-x-auto max-w-full no-scrollbar">
                  <KatexFormula formula={step.beforeLatex} block={true} />
                </div>

                <div className="flex justify-center my-1">
                  <p>↓</p>
                </div>

                <div className="ba-formula-section rounded p-2 overflow-x-auto max-w-full no-scrollbar">
                  <KatexFormula formula={step.afterLatex} block={true} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
