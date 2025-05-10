import { BooleanExpression } from '../ast/types' // Adjusted path

/**
 * Create a deep clone of a BooleanExpression
 */
export const deepClone = (expr: BooleanExpression): BooleanExpression => {
  const clone: BooleanExpression = {
    type: expr.type,
  }

  if (expr.value !== undefined) {
    clone.value = expr.value
  }

  if (expr.left) {
    clone.left = deepClone(expr.left)
  }

  if (expr.right) {
    clone.right = deepClone(expr.right)
  }

  return clone
}
