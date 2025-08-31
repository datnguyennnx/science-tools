/**
 * XOR Operation Rules
 *
 * Rules for simplifying XOR operations and their relationships with other Boolean operations.
 */

import { BooleanExpression } from '../../../ast/types'
import { SimplificationRule } from '../../../ast/rules'
import { expressionsEqual } from '../../../utils/comparison'

/**
 * XOR Identity: X ⊕ 0 = X
 */
function applyXorIdentity(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'XOR' && expr.left && expr.right) {
    if (expr.left.type === 'CONSTANT' && expr.left.value === false) {
      return expr.right
    }
    if (expr.right.type === 'CONSTANT' && expr.right.value === false) {
      return expr.left
    }
  }
  return expr
}

/**
 * XOR with True: X ⊕ 1 = ¬X
 */
function applyXorWithTrue(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'XOR' && expr.left && expr.right) {
    if (expr.left.type === 'CONSTANT' && expr.left.value === true) {
      return { type: 'NOT', left: expr.right }
    }
    if (expr.right.type === 'CONSTANT' && expr.right.value === true) {
      return { type: 'NOT', left: expr.left }
    }
  }
  return expr
}

/**
 * XOR Self Cancellation: X ⊕ X = 0
 */
function applyXorSelfCancellation(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'XOR' && expr.left && expr.right) {
    if (expressionsEqual(expr.left, expr.right)) {
      return { type: 'CONSTANT', value: false }
    }
  }
  return expr
}

/**
 * XOR with Complement: X ⊕ ¬X = 1
 */
function applyXorWithComplement(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'XOR' && expr.left && expr.right) {
    if (
      expr.right.type === 'NOT' &&
      expr.right.left &&
      expressionsEqual(expr.left, expr.right.left)
    ) {
      return { type: 'CONSTANT', value: true }
    }
    if (
      expr.left.type === 'NOT' &&
      expr.left.left &&
      expressionsEqual(expr.right, expr.left.left)
    ) {
      return { type: 'CONSTANT', value: true }
    }
  }
  return expr
}

/**
 * Get XOR simplification rules
 */
export function getXorRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'XOR Identity',
        description: 'X ⊕ 0 = X',
        formula: 'X \\oplus 0 = X',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'XOR' || !expr.left || !expr.right) return false
        return (
          (expr.left.type === 'CONSTANT' && expr.left.value === false) ||
          (expr.right.type === 'CONSTANT' && expr.right.value === false)
        )
      },
      apply: applyXorIdentity,
    },
    {
      info: {
        name: 'XOR with True',
        description: 'X ⊕ 1 = ¬X',
        formula: 'X \\oplus 1 = \\lnot X',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'XOR' || !expr.left || !expr.right) return false
        return (
          (expr.left.type === 'CONSTANT' && expr.left.value === true) ||
          (expr.right.type === 'CONSTANT' && expr.right.value === true)
        )
      },
      apply: applyXorWithTrue,
    },
    {
      info: {
        name: 'XOR Self Cancellation',
        description: 'X ⊕ X = 0',
        formula: 'X \\oplus X = 0',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'XOR' || !expr.left || !expr.right) return false
        return expressionsEqual(expr.left, expr.right)
      },
      apply: applyXorSelfCancellation,
    },
    {
      info: {
        name: 'XOR with Complement',
        description: 'X ⊕ ¬X = 1',
        formula: 'X \\oplus \\lnot X = 1',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'XOR' || !expr.left || !expr.right) return false
        return (
          (expr.right.type === 'NOT' &&
            expr.right.left &&
            expressionsEqual(expr.left, expr.right.left)) ||
          (expr.left.type === 'NOT' &&
            expr.left.left &&
            expressionsEqual(expr.right, expr.left.left))
        )
      },
      apply: applyXorWithComplement,
    },
  ]
}
