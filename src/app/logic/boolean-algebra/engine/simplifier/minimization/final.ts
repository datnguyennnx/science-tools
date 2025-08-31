/**
 * Final Simplification for Boolean Expressions
 *
 * This module contains functions for applying final simplification techniques
 * to achieve the most minimal form of Boolean expressions, such as converting
 * (A ∨ (¬A ∧ D)) to (A ∨ D).
 */

import { BooleanExpression } from '../../ast/types'
import { SimplificationRule } from '../../ast/rules'
import { expressionsEqual } from '../../utils/comparison'

/**
 * Apply distributive law to simplify expressions like (A ∨ (¬A ∧ D)) to (A ∨ D)
 */
export const applyDistributiveSimplification = (expr: BooleanExpression): BooleanExpression => {
  // Pattern: (X ∨ (¬X ∧ Y)) = (X ∨ Y)
  // This uses: X ∨ (¬X ∧ Y) = (X ∨ ¬X) ∧ (X ∨ Y) = 1 ∧ (X ∨ Y) = X ∨ Y

  if (expr.type !== 'OR' || !expr.left || !expr.right) {
    return expr
  }

  const left = expr.left
  const right = expr.right

  // Check if right side is (¬X ∧ Y) and left side is X
  if (right.type === 'AND' && right.left && right.right) {
    const andLeft = right.left
    const andRight = right.right

    // Case 1: right = (¬left ∧ something)
    if (andLeft.type === 'NOT' && andLeft.left && expressionsEqual(andLeft.left, left)) {
      // Found pattern: X ∨ (¬X ∧ Y) where Y = andRight
      return {
        type: 'OR',
        left: left,
        right: andRight,
      }
    }

    // Case 2: right = (something ∧ ¬left)
    if (andRight.type === 'NOT' && andRight.left && expressionsEqual(andRight.left, left)) {
      // Found pattern: X ∨ (Y ∧ ¬X) where Y = andLeft
      return {
        type: 'OR',
        left: left,
        right: andLeft,
      }
    }
  }

  // Check if left side is (¬X ∧ Y) and right side is X
  if (left.type === 'AND' && left.left && left.right) {
    const andLeft = left.left
    const andRight = left.right

    // Case 3: left = (¬right ∧ something)
    if (andLeft.type === 'NOT' && andLeft.left && expressionsEqual(andLeft.left, right)) {
      // Found pattern: (¬X ∧ Y) ∨ X where Y = andRight
      return {
        type: 'OR',
        left: right,
        right: andRight,
      }
    }

    // Case 4: left = (something ∧ ¬right)
    if (andRight.type === 'NOT' && andRight.left && expressionsEqual(andRight.left, right)) {
      // Found pattern: (Y ∧ ¬X) ∨ X where Y = andLeft
      return {
        type: 'OR',
        left: right,
        right: andLeft,
      }
    }
  }

  return expr
}

/**
 * Apply absorption law to simplify expressions like (A ∨ (A ∧ D)) to A
 */
export const applyAbsorptionSimplification = (expr: BooleanExpression): BooleanExpression => {
  if (expr.type !== 'OR' || !expr.left || !expr.right) {
    return expr
  }

  const left = expr.left
  const right = expr.right

  // Check for X ∨ (X ∧ Y) = X pattern
  if (right.type === 'AND' && right.left && right.right) {
    if (expressionsEqual(left, right.left) || expressionsEqual(left, right.right)) {
      return left
    }
  }

  // Check for (X ∧ Y) ∨ X = X pattern
  if (left.type === 'AND' && left.left && left.right) {
    if (expressionsEqual(right, left.left) || expressionsEqual(right, left.right)) {
      return right
    }
  }

  return expr
}

/**
 * Apply final simplification rules that achieve minimal form
 */
export const applyFinalSimplification = (expr: BooleanExpression): BooleanExpression => {
  let currentExpr = expr
  let changed = true
  let iterations = 0
  const maxIterations = 5

  while (changed && iterations < maxIterations) {
    changed = false
    iterations++

    // Apply distributive simplification
    const afterDistributive = applyDistributiveSimplification(currentExpr)
    if (!expressionsEqual(afterDistributive, currentExpr)) {
      currentExpr = afterDistributive
      changed = true
    }

    // Apply absorption simplification
    const afterAbsorption = applyAbsorptionSimplification(currentExpr)
    if (!expressionsEqual(afterAbsorption, currentExpr)) {
      currentExpr = afterAbsorption
      changed = true
    }
  }

  return currentExpr
}

/**
 * Get final simplification rules for the pipeline
 */
export function getFinalSimplificationRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'Distributive Final Simplification',
        description: 'Apply distributive law for final minimal form (X ∨ (¬X ∧ Y) = X ∨ Y)',
        formula: 'X \\lor (\\lnot X \\land Y) = X \\lor Y',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR' || !expr.left || !expr.right) return false

        const left = expr.left
        const right = expr.right

        // Check pattern X ∨ (¬X ∧ Y)
        if (right.type === 'AND' && right.left && right.right) {
          const andLeft = right.left
          const andRight = right.right
          if (
            (andLeft.type === 'NOT' && andLeft.left && expressionsEqual(andLeft.left, left)) ||
            (andRight.type === 'NOT' && andRight.left && expressionsEqual(andRight.left, left))
          ) {
            return true
          }
        }

        // Check pattern (¬X ∧ Y) ∨ X
        if (left.type === 'AND' && left.left && left.right) {
          const andLeft = left.left
          const andRight = left.right
          if (
            (andLeft.type === 'NOT' && andLeft.left && expressionsEqual(andLeft.left, right)) ||
            (andRight.type === 'NOT' && andRight.left && expressionsEqual(andRight.left, right))
          ) {
            return true
          }
        }

        return false
      },
      apply: applyDistributiveSimplification,
    },
    {
      info: {
        name: 'Absorption Final Simplification',
        description: 'Apply absorption law for final minimal form (X ∨ (X ∧ Y) = X)',
        formula: 'X \\lor (X \\land Y) = X',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR' || !expr.left || !expr.right) return false

        const left = expr.left
        const right = expr.right

        // Check X ∨ (X ∧ Y) pattern
        if (right.type === 'AND' && right.left && right.right) {
          if (expressionsEqual(left, right.left) || expressionsEqual(left, right.right)) {
            return true
          }
        }

        // Check (X ∧ Y) ∨ X pattern
        if (left.type === 'AND' && left.left && left.right) {
          if (expressionsEqual(right, left.left) || expressionsEqual(right, left.right)) {
            return true
          }
        }

        return false
      },
      apply: applyAbsorptionSimplification,
    },
  ]
}
