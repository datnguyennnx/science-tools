/**
 * NOR Expansion Transformer
 *
 * Expands NOR operations into their canonical form:
 * A ↓ B = ¬(A ∨ B)
 *
 * This transformation allows further algebraic manipulations
 * and is essential for complete boolean algebra simplification.
 */

import { BooleanExpression, NorNode, OrNode } from '../ast/types'
import { ExpressionTransformer } from '../core/boolean-types'

/**
 * Expand NOR operation into canonical form
 * A ↓ B = ¬(A ∨ B)
 */
function expandNorOperation(expr: NorNode): BooleanExpression {
  if (!expr.left || !expr.right) {
    throw new Error('NOR operation missing operands')
  }

  // A ↓ B = ¬(A ∨ B)
  const orExpression: OrNode = {
    type: 'OR',
    left: expr.left,
    right: expr.right,
  }

  return {
    type: 'NOT',
    left: orExpression,
  }
}

/**
 * Recursively expand all NOR operations in an expression
 */
export function expandNorRecursive(expr: BooleanExpression): BooleanExpression {
  // Handle NOR at current level
  if (expr.type === 'NOR') {
    const expanded = expandNorOperation(expr)
    // Recursively expand any nested NOR operations
    return expandNorRecursive(expanded)
  }

  // Handle NOT operations (may contain NOR)
  if (expr.type === 'NOT' && expr.left) {
    const processedChild = expandNorRecursive(expr.left)
    if (processedChild !== expr.left) {
      return { type: 'NOT', left: processedChild }
    }
    return expr
  }

  // Handle binary operations
  if (expr.left && expr.right) {
    const processedLeft = expandNorRecursive(expr.left)
    const processedRight = expandNorRecursive(expr.right)

    if (processedLeft !== expr.left || processedRight !== expr.right) {
      // Reconstruct the node with processed children
      switch (expr.type) {
        case 'AND':
          return { type: 'AND', left: processedLeft, right: processedRight }
        case 'OR':
          return { type: 'OR', left: processedLeft, right: processedRight }
        case 'XOR':
          return { type: 'XOR', left: processedLeft, right: processedRight }
        case 'XNOR':
          return { type: 'XNOR', left: processedLeft, right: processedRight }
        case 'NAND':
          return { type: 'NAND', left: processedLeft, right: processedRight }
        default:
          return expr
      }
    }
  }

  return expr
}

/**
 * Main NOR expansion transformer
 */
export const expandNor: ExpressionTransformer = expandNorRecursive

/**
 * Check if an expression contains NOR operations
 */
export function containsNor(expr: BooleanExpression): boolean {
  if (expr.type === 'NOR') return true

  if (expr.type === 'NOT' && expr.left) {
    return containsNor(expr.left)
  }

  if (expr.left && expr.right) {
    return containsNor(expr.left) || containsNor(expr.right)
  }

  return false
}

/**
 * Count NOR operations in an expression
 */
export function countNorOperations(expr: BooleanExpression): number {
  let count = expr.type === 'NOR' ? 1 : 0

  if (expr.type === 'NOT' && expr.left) {
    count += countNorOperations(expr.left)
  } else if (expr.left && expr.right) {
    count += countNorOperations(expr.left) + countNorOperations(expr.right)
  }

  return count
}

/**
 * Check if NOR expansion would be beneficial
 * (i.e., if there are NOR operations that could benefit from expansion)
 */
export function shouldExpandNor(expr: BooleanExpression): boolean {
  // Expand NOR if it appears in complex expressions where expansion
  // might enable further simplifications
  if (expr.type === 'NOR') {
    return true
  }

  // Expand NOR if it's nested within other operations
  if (expr.type === 'NOT' && expr.left?.type === 'NOR') {
    return true
  }

  // Expand NOR if it's part of distributive patterns
  if ((expr.type === 'AND' || expr.type === 'OR') && expr.left && expr.right) {
    const hasNorInLeft = containsNor(expr.left)
    const hasNorInRight = containsNor(expr.right)
    return hasNorInLeft || hasNorInRight
  }

  return false
}
