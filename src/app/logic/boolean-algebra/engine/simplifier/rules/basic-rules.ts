/**
 * Basic Boolean Algebra Simplification Rules
 *
 * These rules handle fundamental Boolean algebra transformations like
 * double negation, De Morgan's laws, etc.
 */

import { BooleanExpression } from '../../ast'
import { SimplificationRule } from '../../ast/rule-types'

/**
 * Get basic tree-based simplification rules
 */
export function getBasicRules(): SimplificationRule[] {
  return [
    // Double Negation
    {
      info: {
        name: 'Double Negation',
        description: '¬¬A = A',
        formula: '\\lnot\\lnot A = A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NOT' && expr.left?.type === 'NOT'
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        return expr.left!.left!
      },
    },

    // De Morgan's Law (AND)
    {
      info: {
        name: "De Morgan's Law (AND)",
        description: '¬(A ∧ B) = ¬A ∨ ¬B',
        formula: '\\lnot(A \\land B) = \\lnot A \\lor \\lnot B',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NOT' && expr.left?.type === 'AND'
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const andExpr = expr.left!
        return {
          type: 'OR',
          left: {
            type: 'NOT',
            left: andExpr.left!,
          },
          right: {
            type: 'NOT',
            left: andExpr.right!,
          },
        }
      },
    },

    // De Morgan's Law (OR)
    {
      info: {
        name: "De Morgan's Law (OR)",
        description: '¬(A ∨ B) = ¬A ∧ ¬B',
        formula: '\\lnot(A \\lor B) = \\lnot A \\land \\lnot B',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NOT' && expr.left?.type === 'OR'
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const orExpr = expr.left!
        return {
          type: 'AND',
          left: {
            type: 'NOT',
            left: orExpr.left!,
          },
          right: {
            type: 'NOT',
            left: orExpr.right!,
          },
        }
      },
    },
  ]
}
