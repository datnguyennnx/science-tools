/**
 * AST-based Distributive Laws
 */

import { BooleanExpression } from '../../ast'
import { SimplificationRule } from '../../ast/rule-types'
import { deepClone } from '../../utils'

export function getDistributiveRules(): SimplificationRule[] {
  const rules: SimplificationRule[] = []

  // Rule 1: X * (Y + Z) => (X * Y) + (X * Z)  (Distribution of AND over OR - Left)
  rules.push({
    info: {
      name: 'Distribute AND over OR (Left)',
      description: 'X * (Y + Z) => (X * Y) + (X * Z)',
      formula: 'X \\land (Y \\lor Z) = (X \\land Y) \\lor (X \\land Z)',
    },
    canApply: (expr: BooleanExpression): boolean => {
      return Boolean(
        expr.type === 'AND' &&
          expr.left && // X
          expr.right &&
          expr.right.type === 'OR' && // (Y + Z)
          expr.right.left && // Y
          expr.right.right // Z
      )
    },
    apply: (expr: BooleanExpression): BooleanExpression => {
      const X = deepClone(expr.left!)
      const Y = deepClone(expr.right!.left!)
      const Z = deepClone(expr.right!.right!)

      const XY: BooleanExpression = { type: 'AND', left: X, right: Y }
      const XZ: BooleanExpression = { type: 'AND', left: deepClone(X), right: Z } // Clone X again for the second term

      const finalExpr: BooleanExpression = { type: 'OR', left: XY, right: XZ }
      return finalExpr
    },
  })

  // Rule 2: (X + Y) * Z => (X * Z) + (Y * Z) (Distribution of AND over OR - Right)
  rules.push({
    info: {
      name: 'Distribute AND over OR (Right)',
      description: '(X + Y) * Z => (X * Z) + (Y * Z)',
      formula: '(X \\lor Y) \\land Z = (X \\land Z) \\lor (Y \\land Z)',
    },
    canApply: (expr: BooleanExpression): boolean => {
      return Boolean(
        expr.type === 'AND' &&
          expr.right && // Z
          expr.left &&
          expr.left.type === 'OR' && // (X + Y)
          expr.left.left && // X
          expr.left.right // Y
      )
    },
    apply: (expr: BooleanExpression): BooleanExpression => {
      const X = deepClone(expr.left!.left!)
      const Y = deepClone(expr.left!.right!)
      const Z = deepClone(expr.right!)

      const XZ: BooleanExpression = { type: 'AND', left: X, right: Z }
      const YZ: BooleanExpression = { type: 'AND', left: Y, right: deepClone(Z) } // Clone Z again

      const finalExpr: BooleanExpression = { type: 'OR', left: XZ, right: YZ }
      return finalExpr
    },
  })

  // TODO: Add factorization rules (e.g., XY + XZ => X(Y+Z))
  // TODO: Add distribution of OR over AND rules (e.g., X + YZ => (X+Y)(X+Z))

  return rules
}
