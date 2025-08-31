/**
 * NOR Operation Rules
 *
 * Rules for simplifying NOR operations and their relationships with other Boolean operations.
 */

import { BooleanExpression } from '../../../ast/types'
import { SimplificationRule } from '../../../ast/rules'
import { expressionsEqual } from '../../../utils/comparison'

/**
 * NOR with False: X ↓ 0 = ¬X
 */
function applyNorWithFalse(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'NOR' && expr.left && expr.right) {
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
 * NOR with True: X ↓ 1 = 0
 */
function applyNorWithTrue(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'NOR' && expr.left && expr.right) {
    if (expr.left.type === 'CONSTANT' && expr.left.value === true) {
      return { type: 'CONSTANT', value: false }
    }
    if (expr.right.type === 'CONSTANT' && expr.right.value === true) {
      return { type: 'CONSTANT', value: false }
    }
  }
  return expr
}

/**
 * NOR Self Negation: X ↓ X = ¬X
 */
function applyNorSelfNegation(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'NOR' && expr.left && expr.right) {
    if (expressionsEqual(expr.left, expr.right)) {
      return { type: 'NOT', left: expr.left }
    }
  }
  return expr
}

/**
 * Double NOR: ¬(X ↓ Y) = X ∨ Y
 */
function applyDoubleNor(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'NOT' && expr.left && expr.left.type === 'NOR') {
    const norExpr = expr.left
    if (norExpr.left && norExpr.right) {
      return {
        type: 'OR',
        left: norExpr.left,
        right: norExpr.right,
      }
    }
  }
  return expr
}

/**
 * Get NOR simplification rules
 */
export function getNorRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'NOR with False',
        description: 'X ↓ 0 = ¬X',
        formula: 'X \\downarrow 0 = \\lnot X',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NOR' || !expr.left || !expr.right) return false
        return (
          (expr.left.type === 'CONSTANT' && expr.left.value === false) ||
          (expr.right.type === 'CONSTANT' && expr.right.value === false)
        )
      },
      apply: applyNorWithFalse,
    },
    {
      info: {
        name: 'NOR with True',
        description: 'X ↓ 1 = 0',
        formula: 'X \\downarrow 1 = 0',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NOR' || !expr.left || !expr.right) return false
        return (
          (expr.left.type === 'CONSTANT' && expr.left.value === true) ||
          (expr.right.type === 'CONSTANT' && expr.right.value === true)
        )
      },
      apply: applyNorWithTrue,
    },
    {
      info: {
        name: 'NOR Self Negation',
        description: 'X ↓ X = ¬X',
        formula: 'X \\downarrow X = \\lnot X',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NOR' || !expr.left || !expr.right) return false
        return expressionsEqual(expr.left, expr.right)
      },
      apply: applyNorSelfNegation,
    },
    {
      info: {
        name: 'Double NOR',
        description: '¬(X ↓ Y) = X ∨ Y',
        formula: '\\lnot (X \\downarrow Y) = X \\lor Y',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NOT' || !expr.left) return false
        return expr.left.type === 'NOR' && !!expr.left.left && !!expr.left.right
      },
      apply: applyDoubleNor,
    },
  ]
}
