/**
 * NAND Operation Rules
 *
 * Rules for simplifying NAND operations and their relationships with other Boolean operations.
 */

import { BooleanExpression } from '../../../ast/types'
import { SimplificationRule } from '../../../ast/rules'
import { expressionsEqual } from '../../../utils/comparison'

/**
 * NAND with False: X ↑ 0 = 1
 */
function applyNandWithFalse(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'NAND' && expr.left && expr.right) {
    if (expr.left.type === 'CONSTANT' && expr.left.value === false) {
      return { type: 'CONSTANT', value: true }
    }
    if (expr.right.type === 'CONSTANT' && expr.right.value === false) {
      return { type: 'CONSTANT', value: true }
    }
  }
  return expr
}

/**
 * NAND with True: X ↑ 1 = ¬X
 */
function applyNandWithTrue(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'NAND' && expr.left && expr.right) {
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
 * NAND Self Negation: X ↑ X = ¬X
 */
function applyNandSelfNegation(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'NAND' && expr.left && expr.right) {
    if (expressionsEqual(expr.left, expr.right)) {
      return { type: 'NOT', left: expr.left }
    }
  }
  return expr
}

/**
 * Double NAND: ¬(X ↑ Y) = X ∧ Y
 */
function applyDoubleNand(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'NOT' && expr.left && expr.left.type === 'NAND') {
    const nandExpr = expr.left
    if (nandExpr.left && nandExpr.right) {
      return {
        type: 'AND',
        left: nandExpr.left,
        right: nandExpr.right,
      }
    }
  }
  return expr
}

/**
 * Get NAND simplification rules
 */
export function getNandRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'NAND with False',
        description: 'X ↑ 0 = 1',
        formula: 'X \\uparrow 0 = 1',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NAND' || !expr.left || !expr.right) return false
        return (
          (expr.left.type === 'CONSTANT' && expr.left.value === false) ||
          (expr.right.type === 'CONSTANT' && expr.right.value === false)
        )
      },
      apply: applyNandWithFalse,
    },
    {
      info: {
        name: 'NAND with True',
        description: 'X ↑ 1 = ¬X',
        formula: 'X \\uparrow 1 = \\lnot X',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NAND' || !expr.left || !expr.right) return false
        return (
          (expr.left.type === 'CONSTANT' && expr.left.value === true) ||
          (expr.right.type === 'CONSTANT' && expr.right.value === true)
        )
      },
      apply: applyNandWithTrue,
    },
    {
      info: {
        name: 'NAND Self Negation',
        description: 'X ↑ X = ¬X',
        formula: 'X \\uparrow X = \\lnot X',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NAND' || !expr.left || !expr.right) return false
        return expressionsEqual(expr.left, expr.right)
      },
      apply: applyNandSelfNegation,
    },
    {
      info: {
        name: 'Double NAND',
        description: '¬(X ↑ Y) = X ∧ Y',
        formula: '\\lnot (X \\uparrow Y) = X \\land Y',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NOT' || !expr.left) return false
        return expr.left.type === 'NAND' && !!expr.left.left && !!expr.left.right
      },
      apply: applyDoubleNand,
    },
  ]
}
