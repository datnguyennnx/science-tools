/**
 * Idempotent Rules Module
 *
 * This module contains rules for idempotent laws in Boolean algebra:
 * - A AND A = A
 * - A OR A = A
 */

import { BooleanExpression } from '../../ast/types'
import { SimplificationRule } from '../../ast/rules'
import { expressionsEqual } from '../../utils/comparison'

// Optimized recursive apply function for A AND A = A
function applyAndIdempotenceRecursive(expr: BooleanExpression): BooleanExpression {
  let processedLeft = expr.left
  if (expr.left) {
    processedLeft = applyAndIdempotenceRecursive(expr.left)
  }

  let processedRight = expr.right
  if (expr.right) {
    processedRight = applyAndIdempotenceRecursive(expr.right)
  }

  const childrenChanged = processedLeft !== expr.left || processedRight !== expr.right
  let currentExprToEvaluate = expr

  if (childrenChanged) {
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
    }
  }

  if (
    currentExprToEvaluate.type === 'AND' &&
    currentExprToEvaluate.left &&
    currentExprToEvaluate.right &&
    expressionsEqual(currentExprToEvaluate.left, currentExprToEvaluate.right)
  ) {
    return currentExprToEvaluate.left // Return the already processed child
  }
  return currentExprToEvaluate
}

// Optimized recursive apply function for A OR A = A
function applyOrIdempotenceRecursive(expr: BooleanExpression): BooleanExpression {
  let processedLeft = expr.left
  if (expr.left) {
    processedLeft = applyOrIdempotenceRecursive(expr.left)
  }

  let processedRight = expr.right
  if (expr.right) {
    processedRight = applyOrIdempotenceRecursive(expr.right)
  }

  const childrenChanged = processedLeft !== expr.left || processedRight !== expr.right
  let currentExprToEvaluate = expr

  if (childrenChanged) {
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
    }
  }

  if (
    currentExprToEvaluate.type === 'OR' &&
    currentExprToEvaluate.left &&
    currentExprToEvaluate.right &&
    expressionsEqual(currentExprToEvaluate.left, currentExprToEvaluate.right)
  ) {
    return currentExprToEvaluate.left // Return the already processed child
  }
  return currentExprToEvaluate
}

/**
 * Get rules for idempotent laws
 */
export function getIdempotentRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'AND Idempotence',
        description: 'A ∧ A = A',
        formula: 'A \\land A = A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        // canApply can be kept simple. The apply function will determine actual changes.
        // A more precise canApply could recursively check for A&A patterns.
        if (expr.type === 'AND') return true // Potential top-level match
        // For recursive rules, often canApply is true if children exist or specific type match.
        // This allows the recursive apply to traverse the tree.
        if (expr.left || expr.right) return true
        return false
      },
      apply: applyAndIdempotenceRecursive, // Use the optimized recursive function
    },
    {
      info: {
        name: 'OR Idempotence',
        description: 'A ∨ A = A',
        formula: 'A \\lor A = A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type === 'OR') return true
        if (expr.left || expr.right) return true
        return false
      },
      apply: applyOrIdempotenceRecursive, // Use the optimized recursive function
    },
  ]
}
