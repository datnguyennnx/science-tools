/**
 * XNOR Expansion Transformer
 *
 * Expands XNOR operations into their canonical form:
 * A ↔ B = (A ∧ B) ∨ (¬A ∧ ¬B)
 *
 * This transformation is crucial for complete boolean algebra simplification
 * as it allows further algebraic manipulations on the expanded form.
 */

import { BooleanExpression, XnorNode, AndNode } from '../ast/types'
import { ExpressionTransformer } from '../core/boolean-types'

/**
 * Expand XNOR operation into canonical form
 * A ↔ B = (A ∧ B) ∨ (¬A ∧ ¬B)
 */
function expandXnorOperation(expr: XnorNode): BooleanExpression {
  if (!expr.left || !expr.right) {
    throw new Error('XNOR operation missing operands')
  }

  // A ↔ B = (A ∧ B) ∨ (¬A ∧ ¬B)
  const a = expr.left
  const b = expr.right

  const term1: AndNode = { type: 'AND', left: a, right: b } // A ∧ B
  const term2: AndNode = {
    type: 'AND',
    left: { type: 'NOT', left: a }, // ¬A
    right: { type: 'NOT', left: b }, // ¬B
  }

  return {
    type: 'OR',
    left: term1,
    right: term2,
  }
}

/**
 * Recursively expand all XNOR operations in an expression
 */
export function expandXnorRecursive(expr: BooleanExpression): BooleanExpression {
  // Handle XNOR at current level
  if (expr.type === 'XNOR') {
    const expanded = expandXnorOperation(expr)
    // Recursively expand any nested XNOR operations
    return expandXnorRecursive(expanded)
  }

  // Handle NOT operations (may contain XNOR)
  if (expr.type === 'NOT' && expr.left) {
    const processedChild = expandXnorRecursive(expr.left)
    if (processedChild !== expr.left) {
      return { type: 'NOT', left: processedChild }
    }
    return expr
  }

  // Handle binary operations
  if (expr.left && expr.right) {
    const processedLeft = expandXnorRecursive(expr.left)
    const processedRight = expandXnorRecursive(expr.right)

    if (processedLeft !== expr.left || processedRight !== expr.right) {
      // Reconstruct the node with processed children
      switch (expr.type) {
        case 'AND':
          return { type: 'AND', left: processedLeft, right: processedRight }
        case 'OR':
          return { type: 'OR', left: processedLeft, right: processedRight }
        case 'XOR':
          return { type: 'XOR', left: processedLeft, right: processedRight }
        case 'NAND':
          return { type: 'NAND', left: processedLeft, right: processedRight }
        case 'NOR':
          return { type: 'NOR', left: processedLeft, right: processedRight }
        default:
          return expr
      }
    }
  }

  return expr
}

/**
 * Main XNOR expansion transformer
 */
export const expandXnor: ExpressionTransformer = expandXnorRecursive

/**
 * Check if an expression contains XNOR operations
 */
export function containsXnor(expr: BooleanExpression): boolean {
  if (expr.type === 'XNOR') return true

  if (expr.type === 'NOT' && expr.left) {
    return containsXnor(expr.left)
  }

  if (expr.left && expr.right) {
    return containsXnor(expr.left) || containsXnor(expr.right)
  }

  return false
}

/**
 * Count XNOR operations in an expression
 */
export function countXnorOperations(expr: BooleanExpression): number {
  let count = expr.type === 'XNOR' ? 1 : 0

  if (expr.type === 'NOT' && expr.left) {
    count += countXnorOperations(expr.left)
  } else if (expr.left && expr.right) {
    count += countXnorOperations(expr.left) + countXnorOperations(expr.right)
  }

  return count
}
