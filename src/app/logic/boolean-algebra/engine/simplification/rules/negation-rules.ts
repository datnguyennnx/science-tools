/**
 * Negation Rules Module
 *
 * This module contains rules for handling multiple negations and simplifying
 * expressions containing negation operators.
 */

import { BooleanExpression } from '../../core'
import { SimplificationRule } from '../../core/types/rule-types'

/**
 * Get rules for handling chains of negations
 */
export function getNegationRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'Chain Negation Simplification',
        description: 'Simplify chains of negation operators',
        formula: '¬¬¬...¬A = ¬A or A (depending on count)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        // Find any subexpression with multiple consecutive NOTs
        const hasChainNegation = (e: BooleanExpression | undefined): boolean => {
          if (!e) return false
          if (e.type === 'NOT' && e.left?.type === 'NOT') return true
          return Boolean(
            (e.left && hasChainNegation(e.left)) || (e.right && hasChainNegation(e.right))
          )
        }

        return hasChainNegation(expr)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Helper function to simplify multiple negations at any depth
        const simplifyNegations = (e: BooleanExpression): BooleanExpression => {
          if (!e) return e

          // First simplify children
          if (e.left) e.left = simplifyNegations(e.left)
          if (e.right) e.right = simplifyNegations(e.right)

          // Then handle this node
          if (e.type === 'NOT' && e.left?.type === 'NOT') {
            // Count consecutive NOTs
            let negCount = 1
            let current: BooleanExpression | undefined = e
            let innerExpr: BooleanExpression | undefined = undefined

            while (current && current.type === 'NOT') {
              negCount++
              current = current.left
              if (current && current.type !== 'NOT') {
                innerExpr = current
                break
              }
            }

            // If we found the end of the NOT chain
            if (innerExpr) {
              // Even count of NOTs cancel out to the inner expression
              if (negCount % 2 === 0) {
                return innerExpr
              }
              // Odd count simplifies to a single NOT
              else {
                return { type: 'NOT', left: innerExpr }
              }
            }
          }

          return e
        }

        return simplifyNegations(structuredClone(expr))
      },
    },
  ]
}

// Helper function to deep clone expressions
function structuredClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
