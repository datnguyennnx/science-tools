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
  if (expr1 === expr2) return true // Identity check

  if (expr1 === undefined && expr2 === undefined) return true
  if (expr1 === undefined || expr2 === undefined) return false

  if (expr1.type !== expr2.type) return false

  // Check for value equality for types that have it (CONSTANT, VARIABLE)
  if ('value' in expr1 && 'value' in expr2) {
    if (expr1.value !== expr2.value) return false
    if (expr1.type === 'CONSTANT' || expr1.type === 'VARIABLE') return true
  }

  // For unary operators like NOT, compare their single operand.
  if (expr1.type === 'NOT') {
    const expr2_not = expr2 as BooleanExpression
    return expressionsEqual(expr1.left, expr2_not.left)
  }

  // For binary operators (AND, OR, XOR, NAND, NOR etc.):
  // They must have the same structure regarding presence of left/right children.
  const e1_left = expr1.left
  const e1_right = expr1.right
  // Cast expr2 once for convenience, assuming type equality is already checked
  const e2_node = expr2 as BooleanExpression
  const e2_left = e2_node.left
  const e2_right = e2_node.right

  // Check structural equality of children
  const leftChildrenEqual = expressionsEqual(e1_left, e2_left)
  const rightChildrenEqual = expressionsEqual(e1_right, e2_right)

  if (leftChildrenEqual && rightChildrenEqual) {
    // Structure A op B vs A op B is equal
    return true
  }

  // For commutative operators (AND, OR, XOR), check swapped children
  if (expr1.type === 'AND' || expr1.type === 'OR' || expr1.type === 'XOR') {
    const leftSwappedWithRightEqual = expressionsEqual(e1_left, e2_right)
    const rightSwappedWithLeftEqual = expressionsEqual(e1_right, e2_left)
    if (leftSwappedWithRightEqual && rightSwappedWithLeftEqual) {
      // Structure A op B vs B op A is equal
      return true
    }
  }

  // If we've reached here, it means the children are not equal in a way that satisfies
  // direct or commutative equality for binary operators.
  // This also correctly handles cases where one expression has a child and the other doesn't
  // because expressionsEqual(someNode, undefined) would be false, causing one of the
  // variables (leftChildrenEqual, rightChildrenEqual, etc.) to be false.

  // Leaf nodes without children (e.g. hypothetical future leaf types not IDENTIFIER/CONSTANT)
  // would have their e1_left, e1_right, e2_left, e2_right all undefined.
  // In this case, leftChildrenEqual and rightChildrenEqual would both be true, leading to return true above.
  // This correctly covers them.

  return false // Default to not equal
}
