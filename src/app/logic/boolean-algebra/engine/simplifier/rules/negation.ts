/**
 * Negation Rules Module
 *
 * This module contains rules for handling multiple negations and simplifying
 * expressions containing negation operators.
 */

import { BooleanExpression } from '../../ast/types'
import { SimplificationRule } from '../../ast/rules'

// Helper for the 'apply' method. Recursively simplifies !!X to X.
const applyDoubleNegationRecursively = (expression: BooleanExpression): BooleanExpression => {
  // Case 1: Current node is NOT
  if (expression.type === 'NOT') {
    // Handle incomplete NOT node (should ideally not happen if AST is well-formed)
    if (!expression.left) {
      return expression // No change, return original
    }

    const operand = expression.left
    const processedOperand = applyDoubleNegationRecursively(operand) // Recurse

    // Subcase 1.1: Double negation pattern ¬(¬A) found, simplifies to A
    if (processedOperand.type === 'NOT') {
      // Return the inner expression 'A' (which is processedOperand.left).
      // This 'A' is already the result of recursive simplification.
      // If 'A' was originally undefined, this will correctly return undefined.
      return processedOperand.left
    }

    // Subcase 1.2: No double negation pattern at this level.
    // Check if the operand itself was changed by the recursive call.
    if (processedOperand !== operand) {
      // Operand changed (e.g., ¬(¬¬B) became ¬(B)).
      // Return a new NOT node with the new (simplified) operand.
      return { type: 'NOT', left: processedOperand }
    }

    // Operand did not change, and no double negation at this level. Original expression is fine.
    return expression // No change to this NOT node or its (unchanged) operand
  }
  // Case 2: Current node is a binary operator (AND, OR, etc.) or other non-NOT, non-leaf node
  else if (expression.left || expression.right) {
    const processedLeft = expression.left
      ? applyDoubleNegationRecursively(expression.left)
      : undefined
    const processedRight = expression.right
      ? applyDoubleNegationRecursively(expression.right)
      : undefined

    // If either child changed, a new parent node must be created.
    if (processedLeft !== expression.left || processedRight !== expression.right) {
      // Type-safe reconstruction with switch statement instead of spread
      switch (expression.type) {
        case 'AND':
          if (processedLeft && processedRight)
            return { type: 'AND', left: processedLeft, right: processedRight }
          break
        case 'OR':
          if (processedLeft && processedRight)
            return { type: 'OR', left: processedLeft, right: processedRight }
          break
        case 'XOR':
          if (processedLeft && processedRight)
            return { type: 'XOR', left: processedLeft, right: processedRight }
          break
        case 'NAND':
          if (processedLeft && processedRight)
            return { type: 'NAND', left: processedLeft, right: processedRight }
          break
        case 'NOR':
          if (processedLeft && processedRight)
            return { type: 'NOR', left: processedLeft, right: processedRight }
          break
        // NOT case is handled separately above
        // VARIABLE and CONSTANT don't have children to process
      }
      // If we couldn't reconstruct using one of the above cases (unexpected type)
      // return the original expression to avoid potential errors
      return expression
    }

    // No children changed. Original expression is fine.
    return expression
  }

  // Case 3: Base case - Leaf nodes (IDENTIFIER, CONSTANT) or unexpected node structure
  // These nodes are not affected by double negation rule directly and have no children to process for it.
  return expression // No change
}

// Helper for the 'canApply' method.
const canDoubleNegationBeAppliedRecursively = (
  expression: BooleanExpression | undefined
): boolean => {
  if (!expression) {
    return false
  }

  // Check current node for a directly applicable !!X pattern
  if (
    expression.type === 'NOT' &&
    expression.left && // Operand of outer NOT must exist
    expression.left.type === 'NOT' // Operand of outer NOT must itself be a NOT node
  ) {
    return true
  }

  // Recursively check children
  // Only proceed with recursion if .left (or .right) exists.
  if (expression.left && canDoubleNegationBeAppliedRecursively(expression.left)) {
    return true
  }
  if (expression.right && canDoubleNegationBeAppliedRecursively(expression.right)) {
    return true
  }

  return false
}

/**
 * Get rules for handling chains of negations
 */
export function getNegationRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'Double Negation Elimination (Recursive)',
        description: 'Recursively simplifies ¬¬A to A',
        formula: '\\lnot\\lnot A = A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return canDoubleNegationBeAppliedRecursively(expr)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        return applyDoubleNegationRecursively(expr)
      },
    },
  ]
}
