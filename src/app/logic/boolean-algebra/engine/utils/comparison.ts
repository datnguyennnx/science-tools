import { BooleanExpression } from '../ast/types'

/**
 * Checks if two BooleanExpression objects are structurally equal.
 *
 * @param expr1 The first boolean expression.
 * @param expr2 The second boolean expression.
 * @returns True if the expressions are structurally equal, false otherwise.
 */
export function expressionsEqual(
  expr1: BooleanExpression | undefined,
  expr2: BooleanExpression | undefined
): boolean {
  if (expr1 === undefined && expr2 === undefined) return true
  if (expr1 === undefined || expr2 === undefined) return false

  // A common and reasonably effective way to check for deep equality
  // for JSON-compatible objects like BooleanExpression.
  // For more complex scenarios or objects with functions/cycles, a more robust library might be needed.
  return JSON.stringify(expr1) === JSON.stringify(expr2)
}
