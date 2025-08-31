import { BooleanExpression } from '../ast/types'

/**
 * Checks if two BooleanExpression objects are structurally equal.
 *
 * @param expr1 The first boolean expression.
 * @param expr2 The second boolean expression.
 * @returns True if the expressions are structurally equal, false otherwise.
 */
/**
 * Optimized expression comparison with early exits and reduced recursion
 */
export function expressionsEqual(
  expr1: BooleanExpression | undefined,
  expr2: BooleanExpression | undefined
): boolean {
  // Identity check - most common case
  if (expr1 === expr2) return true

  // Handle undefined cases
  if (expr1 === undefined && expr2 === undefined) return true
  if (expr1 === undefined || expr2 === undefined) return false

  // Quick type check
  if (expr1.type !== expr2.type) return false

  // Handle leaf nodes (CONSTANT, VARIABLE) efficiently
  if ('value' in expr1 && 'value' in expr2) {
    return expr1.value === expr2.value
  }

  // Handle NOT (unary operator)
  if (expr1.type === 'NOT') {
    return expressionsEqual(expr1.left, (expr2 as BooleanExpression).left)
  }

  // Handle binary operators
  const e1_left = expr1.left
  const e1_right = expr1.right
  const e2_left = (expr2 as BooleanExpression).left
  const e2_right = (expr2 as BooleanExpression).right

  // Check direct equality first (most common case)
  if (expressionsEqual(e1_left, e2_left) && expressionsEqual(e1_right, e2_right)) {
    return true
  }

  // For commutative operators, check swapped order
  if (expr1.type === 'AND' || expr1.type === 'OR' || expr1.type === 'XOR') {
    if (expressionsEqual(e1_left, e2_right) && expressionsEqual(e1_right, e2_left)) {
      return true
    }
  }

  return false
}
