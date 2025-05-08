/**
 * Contradiction Rules Module
 *
 * This module contains rules for detecting and simplifying contradictions
 * in Boolean expressions, such as (A ∧ ¬A) = 0.
 */

import { BooleanExpression } from '../../core'
import { SimplificationRule } from '../../core/rule-types'

/**
 * Helper function to deep clone expressions
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Helper function to check if two expressions are equal
 */
function expressionsEqual(
  a: BooleanExpression | undefined,
  b: BooleanExpression | undefined
): boolean {
  // Check if either is undefined
  if (!a || !b) return a === b

  // Compare type
  if (a.type !== b.type) return false

  // Compare value (for constants and variables)
  if (a.value !== undefined && b.value !== undefined) {
    return a.value === b.value
  }

  // For operations, compare children recursively
  const leftEqual = expressionsEqual(a.left, b.left)
  const rightEqual = expressionsEqual(a.right, b.right)

  return leftEqual && rightEqual
}

/**
 * Get rules for detecting and simplifying contradictions
 */
export function getContradictionRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'Deep Contradiction Detection',
        description: 'Identify and simplify contradictions at any level',
        formula: 'A ∧ ¬A = 0',
      },
      canApply: (expr: BooleanExpression): boolean => {
        // Check if this expression or any subexpression has a contradiction
        const hasContradiction = (e: BooleanExpression | undefined): boolean => {
          if (!e) return false

          // Check for direct contradiction: A ∧ ¬A or ¬A ∧ A
          if (e.type === 'AND') {
            if (e.left?.type === 'NOT' && e.left.left && expressionsEqual(e.left.left, e.right)) {
              return true
            }
            if (e.right?.type === 'NOT' && e.right.left && expressionsEqual(e.right.left, e.left)) {
              return true
            }
          }

          // Check children recursively
          return Boolean(
            (e.left && hasContradiction(e.left)) || (e.right && hasContradiction(e.right))
          )
        }

        return hasContradiction(expr)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const simplifyContradictions = (e: BooleanExpression): BooleanExpression => {
          if (!e) return e

          // First process children
          if (e.left) e.left = simplifyContradictions(e.left)
          if (e.right) e.right = simplifyContradictions(e.right)

          // Check for contradictions: A ∧ ¬A
          if (e.type === 'AND') {
            // Check for A ∧ ¬A
            if (e.left?.type === 'NOT' && e.left.left && expressionsEqual(e.left.left, e.right)) {
              return { type: 'CONSTANT', value: false }
            }
            // Check for ¬A ∧ A
            if (e.right?.type === 'NOT' && e.right.left && expressionsEqual(e.right.left, e.left)) {
              return { type: 'CONSTANT', value: false }
            }
          }

          return e
        }

        return simplifyContradictions(deepClone(expr))
      },
    },
    {
      info: {
        name: 'Tautology Recognition',
        description: 'Recognize expressions that are always true',
        formula: 'A ∨ ¬A = 1',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR') return false

        const left = expr.left
        const right = expr.right

        if (!left || !right) return false

        // Check for A ∨ ¬A pattern
        if (right.type === 'NOT' && right.left && expressionsEqual(left, right.left)) {
          return true
        }

        // Check for ¬A ∨ A pattern
        if (left.type === 'NOT' && left.left && expressionsEqual(right, left.left)) {
          return true
        }

        return false
      },
      apply: (): BooleanExpression => {
        // A ∨ ¬A is always true
        return { type: 'CONSTANT', value: true }
      },
    },
  ]
}
