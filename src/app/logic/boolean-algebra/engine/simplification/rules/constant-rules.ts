/**
 * Constant Rules Module
 *
 * This module contains rules for simplifying Boolean expressions with constants
 * (true and false values).
 */

import { BooleanExpression } from '../types'
import { SimplificationRule } from '../rule-types'

/**
 * Get rules for handling constants in expressions
 */
export function getConstantRules(): SimplificationRule[] {
  return [
    // X ∧ true = X
    {
      info: {
        name: 'AND with True',
        description: 'A ∧ true = A',
        formula: 'A \\land 1 = A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'AND') return false

        return (
          (expr.left?.type === 'CONSTANT' && expr.left.value === true) ||
          (expr.right?.type === 'CONSTANT' && expr.right.value === true)
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        if (expr.left?.type === 'CONSTANT' && expr.left.value === true) {
          return expr.right!
        }
        return expr.left!
      },
    },

    // X ∧ false = false
    {
      info: {
        name: 'AND with False',
        description: 'A ∧ false = false',
        formula: 'A \\land 0 = 0',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'AND') return false

        return (
          (expr.left?.type === 'CONSTANT' && expr.left.value === false) ||
          (expr.right?.type === 'CONSTANT' && expr.right.value === false)
        )
      },
      apply: (): BooleanExpression => {
        return { type: 'CONSTANT', value: false }
      },
    },

    // X ∨ true = true
    {
      info: {
        name: 'OR with True',
        description: 'A ∨ true = true',
        formula: 'A \\lor 1 = 1',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR') return false

        return (
          (expr.left?.type === 'CONSTANT' && expr.left.value === true) ||
          (expr.right?.type === 'CONSTANT' && expr.right.value === true)
        )
      },
      apply: (): BooleanExpression => {
        return { type: 'CONSTANT', value: true }
      },
    },

    // X ∨ false = X
    {
      info: {
        name: 'OR with False',
        description: 'A ∨ false = A',
        formula: 'A \\lor 0 = A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR') return false

        return (
          (expr.left?.type === 'CONSTANT' && expr.left.value === false) ||
          (expr.right?.type === 'CONSTANT' && expr.right.value === false)
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        if (expr.left?.type === 'CONSTANT' && expr.left.value === false) {
          return expr.right!
        }
        return expr.left!
      },
    },

    // !true = false
    {
      info: {
        name: 'NOT True',
        description: '¬true = false',
        formula: '\\lnot 1 = 0',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NOT' && expr.left?.type === 'CONSTANT' && expr.left.value === true
      },
      apply: (): BooleanExpression => {
        return { type: 'CONSTANT', value: false }
      },
    },

    // !false = true
    {
      info: {
        name: 'NOT False',
        description: '¬false = true',
        formula: '\\lnot 0 = 1',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NOT' && expr.left?.type === 'CONSTANT' && expr.left.value === false
      },
      apply: (): BooleanExpression => {
        return { type: 'CONSTANT', value: true }
      },
    },
  ]
}
