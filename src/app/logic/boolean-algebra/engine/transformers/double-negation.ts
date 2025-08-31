/**
 * Double Negation Elimination Transformer
 *
 * Eliminates double negations: ¬¬A = A
 *
 * This transformation is fundamental to boolean algebra and should be
 * applied early in the simplification process to reduce complexity.
 */

import { BooleanExpression } from '../ast/types'
import { ExpressionTransformer } from '../core/boolean-types'

/**
 * Eliminate double negations recursively
 * ¬¬A = A
 */
export function eliminateDoubleNegationRecursive(expr: BooleanExpression): BooleanExpression {
  // Handle double negation: ¬¬A = A
  if (expr.type === 'NOT' && expr.left?.type === 'NOT' && expr.left.left) {
    // Found ¬¬A pattern, eliminate by returning A
    return eliminateDoubleNegationRecursive(expr.left.left)
  }

  // Handle NOT operations (may contain double negations)
  if (expr.type === 'NOT' && expr.left) {
    const processedChild = eliminateDoubleNegationRecursive(expr.left)
    if (processedChild !== expr.left) {
      return { type: 'NOT', left: processedChild }
    }
    return expr
  }

  // Handle binary operations
  if (expr.left && expr.right) {
    const processedLeft = eliminateDoubleNegationRecursive(expr.left)
    const processedRight = eliminateDoubleNegationRecursive(expr.right)

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
 * Main double negation elimination transformer
 */
export const eliminateDoubleNegation: ExpressionTransformer = eliminateDoubleNegationRecursive

/**
 * Check if an expression contains double negations
 */
export function containsDoubleNegation(expr: BooleanExpression): boolean {
  if (expr.type === 'NOT' && expr.left?.type === 'NOT') {
    return true
  }

  if (expr.type === 'NOT' && expr.left) {
    return containsDoubleNegation(expr.left)
  }

  if (expr.left && expr.right) {
    return containsDoubleNegation(expr.left) || containsDoubleNegation(expr.right)
  }

  return false
}

/**
 * Count double negation patterns in an expression
 */
export function countDoubleNegations(expr: BooleanExpression): number {
  let count = 0

  function traverse(node: BooleanExpression): void {
    if (node.type === 'NOT' && node.left?.type === 'NOT') {
      count++
    }

    if (node.type === 'NOT' && node.left) {
      traverse(node.left)
    } else if (node.left && node.right) {
      traverse(node.left)
      traverse(node.right)
    }
  }

  traverse(expr)
  return count
}

/**
 * Check if an expression has nested negations beyond double negation
 * (e.g., ¬¬¬A which should be simplified to ¬A)
 */
export function hasNestedNegations(expr: BooleanExpression): boolean {
  if (expr.type === 'NOT' && expr.left?.type === 'NOT' && expr.left.left?.type === 'NOT') {
    return true
  }

  if (expr.type === 'NOT' && expr.left) {
    return hasNestedNegations(expr.left)
  }

  if (expr.left && expr.right) {
    return hasNestedNegations(expr.left) || hasNestedNegations(expr.right)
  }

  return false
}

/**
 * Simplify nested negations (e.g., ¬¬¬A = ¬A)
 */
export function simplifyNestedNegations(expr: BooleanExpression): BooleanExpression {
  function simplifyNegations(node: BooleanExpression): BooleanExpression {
    if (node.type === 'NOT' && node.left) {
      const simplifiedChild = simplifyNegations(node.left)

      // Handle triple negation: ¬¬¬A = ¬A
      if (
        simplifiedChild.type === 'NOT' &&
        simplifiedChild.left?.type === 'NOT' &&
        simplifiedChild.left.left
      ) {
        return { type: 'NOT', left: simplifiedChild.left.left }
      }

      // Handle double negation: ¬¬A = A
      if (simplifiedChild.type === 'NOT' && simplifiedChild.left) {
        return simplifiedChild.left
      }

      return { type: 'NOT', left: simplifiedChild }
    }

    // Handle binary operations
    if (node.left && node.right) {
      const processedLeft = simplifyNegations(node.left)
      const processedRight = simplifyNegations(node.right)

      switch (node.type) {
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
        case 'NOR':
          return { type: 'NOR', left: processedLeft, right: processedRight }
        default:
          return node
      }
    }

    return node
  }

  return simplifyNegations(expr)
}
