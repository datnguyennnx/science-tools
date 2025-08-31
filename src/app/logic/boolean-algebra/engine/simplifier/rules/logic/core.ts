/**
 * Core Distributive Laws
 *
 * Handles the fundamental distributive laws:
 * - X(Y + Z) = XY + XZ
 * - X + YZ = (X + Y)(X + Z)
 */

import { BooleanExpression } from '../../../ast/types'
import { SimplificationRule } from '../../../ast/rules'
import { expressionsEqual } from '../../../utils/comparison'

/**
 * Apply distributive law: X(Y + Z) = XY + XZ
 */
function applyDistributiveLeft(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'AND' && expr.left && expr.right) {
    const left = expr.left
    const right = expr.right

    // Check if right side is OR: X(Y + Z)
    if (right.type === 'OR' && right.left && right.right) {
      // Transform to: (X * Y) + (X * Z)
      return {
        type: 'OR',
        left: {
          type: 'AND',
          left: left,
          right: right.left,
        },
        right: {
          type: 'AND',
          left: { ...left }, // Clone to avoid reference issues
          right: right.right,
        },
      }
    }
  }

  return expr
}

/**
 * Apply distributive law: (X + Y)Z = XZ + YZ
 */
function applyDistributiveRight(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'AND' && expr.left && expr.right) {
    const left = expr.left
    const right = expr.right

    // Check if left side is OR: (X + Y)Z
    if (left.type === 'OR' && left.left && left.right) {
      // Transform to: (X * Z) + (Y * Z)
      return {
        type: 'OR',
        left: {
          type: 'AND',
          left: left.left,
          right: right,
        },
        right: {
          type: 'AND',
          left: left.right,
          right: { ...right }, // Clone to avoid reference issues
        },
      }
    }
  }

  return expr
}

/**
 * Apply reverse distributive law: XY + XZ = X(Y + Z)
 */
function applyFactorLeft(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'OR' && expr.left && expr.right) {
    const left = expr.left
    const right = expr.right

    // Check pattern: XY + XZ
    if (
      left.type === 'AND' &&
      right.type === 'AND' &&
      left.left &&
      left.right &&
      right.left &&
      right.right
    ) {
      // Check if first operands are the same: X
      if (expressionsEqual(left.left, right.left)) {
        // Transform to: X(Y + Z)
        return {
          type: 'AND',
          left: left.left,
          right: {
            type: 'OR',
            left: left.right,
            right: right.right,
          },
        }
      }

      // Check if second operands are the same: Y
      if (expressionsEqual(left.right, right.right)) {
        // Transform to: Y(X + Z)
        return {
          type: 'AND',
          left: left.right,
          right: {
            type: 'OR',
            left: left.left,
            right: right.left,
          },
        }
      }
    }
  }

  return expr
}

/**
 * Apply reverse distributive law: XZ + YZ = (X + Y)Z
 */
function applyFactorRight(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'OR' && expr.left && expr.right) {
    const left = expr.left
    const right = expr.right

    // Check pattern: XZ + YZ
    if (
      left.type === 'AND' &&
      right.type === 'AND' &&
      left.left &&
      left.right &&
      right.left &&
      right.right
    ) {
      // Check if second operands are the same: Z
      if (expressionsEqual(left.right, right.right)) {
        // Transform to: (X + Y)Z
        return {
          type: 'AND',
          left: {
            type: 'OR',
            left: left.left,
            right: right.left,
          },
          right: left.right,
        }
      }

      // Check if first operands are the same: Z
      if (expressionsEqual(left.left, right.left)) {
        // Transform to: Z(X + Y)
        return {
          type: 'AND',
          left: left.left,
          right: {
            type: 'OR',
            left: left.right,
            right: right.right,
          },
        }
      }
    }
  }

  return expr
}

/**
 * Get core distributive law rules
 */
export function getDistributiveCoreRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'Distributive Law Left',
        description: 'X(Y + Z) = XY + XZ',
        formula: 'X \\land (Y \\lor Z) = (X \\land Y) \\lor (X \\land Z)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'AND' || !expr.left || !expr.right) return false
        return expr.right.type === 'OR' && !!expr.right.left && !!expr.right.right
      },
      apply: applyDistributiveLeft,
    },
    {
      info: {
        name: 'Distributive Law Right',
        description: '(X + Y)Z = XZ + YZ',
        formula: '(X \\lor Y) \\land Z = (X \\land Z) \\lor (Y \\land Z)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'AND' || !expr.left || !expr.right) return false
        return expr.left.type === 'OR' && !!expr.left.left && !!expr.left.right
      },
      apply: applyDistributiveRight,
    },
    {
      info: {
        name: 'Factorization Left',
        description: 'XY + XZ = X(Y + Z)',
        formula: '(X \\land Y) \\lor (X \\land Z) = X \\land (Y \\lor Z)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR' || !expr.left || !expr.right) return false

        if (expr.left.type !== 'AND' || expr.right.type !== 'AND') return false
        if (!expr.left.left || !expr.left.right || !expr.right.left || !expr.right.right)
          return false

        // Check if first operands are the same OR second operands are the same
        return (
          expressionsEqual(expr.left.left, expr.right.left) ||
          expressionsEqual(expr.left.right, expr.right.right)
        )
      },
      apply: applyFactorLeft,
    },
    {
      info: {
        name: 'Factorization Right',
        description: 'XZ + YZ = (X + Y)Z',
        formula: '(X \\land Z) \\lor (Y \\land Z) = (X \\lor Y) \\land Z',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR' || !expr.left || !expr.right) return false

        if (expr.left.type !== 'AND' || expr.right.type !== 'AND') return false
        if (!expr.left.left || !expr.left.right || !expr.right.left || !expr.right.right)
          return false

        // Check if second operands are the same OR first operands are the same
        return (
          expressionsEqual(expr.left.right, expr.right.right) ||
          expressionsEqual(expr.left.left, expr.right.left)
        )
      },
      apply: applyFactorRight,
    },
  ]
}
