/**
 * XNOR Operation Rules
 *
 * Rules for simplifying XNOR operations and their relationships with other Boolean operations.
 */

import { BooleanExpression } from '../../../ast/types'
import { SimplificationRule } from '../../../ast/rules'
import { expressionsEqual } from '../../../utils/comparison'

/**
 * XNOR Identity: X ↔ 0 = ¬X
 */
function applyXnorIdentity(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'XNOR' && expr.left && expr.right) {
    if (expr.left.type === 'CONSTANT' && expr.left.value === false) {
      return { type: 'NOT', left: expr.right }
    }
    if (expr.right.type === 'CONSTANT' && expr.right.value === false) {
      return { type: 'NOT', left: expr.left }
    }
  }
  return expr
}

/**
 * XNOR with True: X ↔ 1 = X
 */
function applyXnorWithTrue(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'XNOR' && expr.left && expr.right) {
    if (expr.left.type === 'CONSTANT' && expr.left.value === true) {
      return expr.right
    }
    if (expr.right.type === 'CONSTANT' && expr.right.value === true) {
      return expr.left
    }
  }
  return expr
}

/**
 * XNOR Self Equivalence: X ↔ X = 1
 */
function applyXnorSelfEquivalence(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'XNOR' && expr.left && expr.right) {
    if (expressionsEqual(expr.left, expr.right)) {
      return { type: 'CONSTANT', value: true }
    }
  }
  return expr
}

/**
 * XNOR with Complement: X ↔ ¬X = 0
 */
function applyXnorWithComplement(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'XNOR' && expr.left && expr.right) {
    if (
      expr.right.type === 'NOT' &&
      expr.right.left &&
      expressionsEqual(expr.left, expr.right.left)
    ) {
      return { type: 'CONSTANT', value: false }
    }
    if (
      expr.left.type === 'NOT' &&
      expr.left.left &&
      expressionsEqual(expr.right, expr.left.left)
    ) {
      return { type: 'CONSTANT', value: false }
    }
  }
  return expr
}

/**
 * Get XNOR simplification rules
 */
export function getXnorRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'XNOR Identity',
        description: 'X ↔ 0 = ¬X',
        formula: 'X \\leftrightarrow 0 = \\lnot X',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'XNOR' || !expr.left || !expr.right) return false
        return (
          (expr.left.type === 'CONSTANT' && expr.left.value === false) ||
          (expr.right.type === 'CONSTANT' && expr.right.value === false)
        )
      },
      apply: applyXnorIdentity,
    },
    {
      info: {
        name: 'XNOR with True',
        description: 'X ↔ 1 = X',
        formula: 'X \\leftrightarrow 1 = X',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'XNOR' || !expr.left || !expr.right) return false
        return (
          (expr.left.type === 'CONSTANT' && expr.left.value === true) ||
          (expr.right.type === 'CONSTANT' && expr.right.value === true)
        )
      },
      apply: applyXnorWithTrue,
    },
    {
      info: {
        name: 'XNOR Self Equivalence',
        description: 'X ↔ X = 1',
        formula: 'X \\leftrightarrow X = 1',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'XNOR' || !expr.left || !expr.right) return false
        return expressionsEqual(expr.left, expr.right)
      },
      apply: applyXnorSelfEquivalence,
    },
    {
      info: {
        name: 'XNOR with Complement',
        description: 'X ↔ ¬X = 0',
        formula: 'X \\leftrightarrow \\lnot X = 0',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'XNOR' || !expr.left || !expr.right) return false
        return (
          (expr.right.type === 'NOT' &&
            expr.right.left &&
            expressionsEqual(expr.left, expr.right.left)) ||
          (expr.left.type === 'NOT' &&
            expr.left.left &&
            expressionsEqual(expr.right, expr.left.left))
        )
      },
      apply: applyXnorWithComplement,
    },
  ]
}
