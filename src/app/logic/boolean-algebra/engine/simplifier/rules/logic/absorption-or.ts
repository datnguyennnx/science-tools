/**
 * OR Absorption Laws
 *
 * Handles absorption laws for OR operations:
 * - X + XY = X
 * - X + X'Y = X + Y
 */

import { BooleanExpression } from '../../../ast/types'
import { SimplificationRule } from '../../../ast/rules'
import { expressionsEqual } from '../../../utils/comparison'

// Optimized recursive apply function for X + XY = X (OR Absorption)
function applyAbsorptionXplusXYRecursive(expr: BooleanExpression): BooleanExpression {
  let processedLeft = expr.left
  if (expr.left) {
    processedLeft = applyAbsorptionXplusXYRecursive(expr.left)
  }

  let processedRight = expr.right
  if (expr.right) {
    processedRight = applyAbsorptionXplusXYRecursive(expr.right)
  }

  const childrenChanged = processedLeft !== expr.left || processedRight !== expr.right
  let currentExprToEvaluate = expr

  if (childrenChanged) {
    // Replace spread with type-safe reconstruction
    switch (expr.type) {
      case 'AND':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'AND', left: processedLeft, right: processedRight }
        break
      case 'OR':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'OR', left: processedLeft, right: processedRight }
        break
      case 'XOR':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'XOR', left: processedLeft, right: processedRight }
        break
      case 'NAND':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'NAND', left: processedLeft, right: processedRight }
        break
      case 'NOR':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'NOR', left: processedLeft, right: processedRight }
        break
      case 'NOT':
        if (processedLeft) currentExprToEvaluate = { type: 'NOT', left: processedLeft }
        break
      // For VARIABLE and CONSTANT, this code path shouldn't be hit
    }
  }

  // Apply absorption logic to current node
  if (
    currentExprToEvaluate.type === 'OR' &&
    currentExprToEvaluate.left &&
    currentExprToEvaluate.right
  ) {
    const left = currentExprToEvaluate.left
    const right = currentExprToEvaluate.right

    // Case 1: X + XY = X
    if (right.type === 'AND' && right.left && right.right) {
      if (expressionsEqual(left, right.left)) {
        return left
      }
      if (expressionsEqual(left, right.right)) {
        return left
      }
    }

    // Case 2: XY + X = X
    if (left.type === 'AND' && left.left && left.right) {
      if (expressionsEqual(right, left.left)) {
        return right
      }
      if (expressionsEqual(right, left.right)) {
        return right
      }
    }
  }

  // Return the (possibly modified) expression tree
  return currentExprToEvaluate
}

/**
 * Get OR absorption rules
 */
export function getOrAbsorptionRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'OR Absorption X + XY',
        description: 'X + XY = X (absorption law for OR)',
        formula: 'X \\lor (X \\land Y) = X',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR' || !expr.left || !expr.right) return false

        const left = expr.left
        const right = expr.right

        // Check X + XY pattern
        if (right.type === 'AND' && right.left && right.right) {
          return expressionsEqual(left, right.left) || expressionsEqual(left, right.right)
        }

        // Check XY + X pattern
        if (left.type === 'AND' && left.left && left.right) {
          return expressionsEqual(right, left.left) || expressionsEqual(right, left.right)
        }

        return false
      },
      apply: applyAbsorptionXplusXYRecursive,
    },
  ]
}
