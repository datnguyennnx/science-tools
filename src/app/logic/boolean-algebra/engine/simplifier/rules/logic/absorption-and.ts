/**
 * AND Absorption Laws
 *
 * Handles absorption laws for AND operations:
 * - X(X + Y) = X
 * - X(X' + Y) = XY
 */

import { BooleanExpression } from '../../../ast/types'
import { SimplificationRule } from '../../../ast/rules'
import { expressionsEqual } from '../../../utils/comparison'

// Optimized recursive apply function for X(X + Y) = X (AND Absorption)
function applyAbsorptionXmultXplusYRecursive(expr: BooleanExpression): BooleanExpression {
  let processedLeft = expr.left
  if (expr.left) {
    processedLeft = applyAbsorptionXmultXplusYRecursive(expr.left)
  }

  let processedRight = expr.right
  if (expr.right) {
    processedRight = applyAbsorptionXmultXplusYRecursive(expr.right)
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
    currentExprToEvaluate.type === 'AND' &&
    currentExprToEvaluate.left &&
    currentExprToEvaluate.right
  ) {
    const left = currentExprToEvaluate.left
    const right = currentExprToEvaluate.right

    // Case 1: X(X + Y) = X
    if (right.type === 'OR' && right.left && right.right) {
      if (expressionsEqual(left, right.left)) {
        return left
      }
      if (expressionsEqual(left, right.right)) {
        return left
      }
    }

    // Case 2: (X + Y)X = X
    if (left.type === 'OR' && left.left && left.right) {
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
 * Get AND absorption rules
 */
export function getAndAbsorptionRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'AND Absorption X(X + Y)',
        description: 'X(X + Y) = X (absorption law for AND)',
        formula: 'X \\land (X \\lor Y) = X',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'AND' || !expr.left || !expr.right) return false

        const left = expr.left
        const right = expr.right

        // Check X(X + Y) pattern
        if (right.type === 'OR' && right.left && right.right) {
          return expressionsEqual(left, right.left) || expressionsEqual(left, right.right)
        }

        // Check (X + Y)X pattern
        if (left.type === 'OR' && left.left && left.right) {
          return expressionsEqual(right, left.left) || expressionsEqual(right, left.right)
        }

        return false
      },
      apply: applyAbsorptionXmultXplusYRecursive,
    },
  ]
}
