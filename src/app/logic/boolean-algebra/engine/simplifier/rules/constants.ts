/**
 * Constant Simplification Rules
 *
 * Implements boolean algebra identities involving constants (true/1 and false/0).
 * These are the fundamental simplification rules based on absorption and identity laws.
 */

import { BooleanExpression } from '../../ast/types'
import { SimplificationRule } from '../../ast/rules'

/**
 * Pattern functions for constant simplification
 * Each function checks for a specific constant identity and returns the simplified result
 */
const constantPatterns: Array<(expr: BooleanExpression) => BooleanExpression | null> = [
  // Identity Law: X ∧ 1 = X
  expr => {
    if (expr.type === 'AND') {
      if (expr.left?.type === 'CONSTANT' && expr.left.value === true && expr.right) {
        return expr.right // Return X
      }
      if (expr.right?.type === 'CONSTANT' && expr.right.value === true && expr.left) {
        return expr.left // Return X
      }
    }
    return null
  },

  // Domination Law: X ∧ 0 = 0
  expr => {
    if (expr.type === 'AND') {
      if (expr.left?.type === 'CONSTANT' && expr.left.value === false) {
        return { type: 'CONSTANT', value: false }
      }
      if (expr.right?.type === 'CONSTANT' && expr.right.value === false) {
        return { type: 'CONSTANT', value: false }
      }
    }
    return null
  },

  // Identity Law: X ∨ 0 = X
  expr => {
    if (expr.type === 'OR') {
      if (expr.left?.type === 'CONSTANT' && expr.left.value === false && expr.right) {
        return expr.right // Return X
      }
      if (expr.right?.type === 'CONSTANT' && expr.right.value === false && expr.left) {
        return expr.left // Return X
      }
    }
    return null
  },

  // Domination Law: X ∨ 1 = 1
  expr => {
    if (expr.type === 'OR') {
      if (expr.left?.type === 'CONSTANT' && expr.left.value === true) {
        return { type: 'CONSTANT', value: true }
      }
      if (expr.right?.type === 'CONSTANT' && expr.right.value === true) {
        return { type: 'CONSTANT', value: true }
      }
    }
    return null
  },

  // NOT Identity: ¬1 = 0
  expr => {
    if (expr.type === 'NOT' && expr.left?.type === 'CONSTANT' && expr.left.value === true) {
      return { type: 'CONSTANT', value: false }
    }
    return null
  },

  // NOT Identity: ¬0 = 1
  expr => {
    if (expr.type === 'NOT' && expr.left?.type === 'CONSTANT' && expr.left.value === false) {
      return { type: 'CONSTANT', value: true }
    }
    return null
  },
]

/**
 * Recursively apply constant simplification patterns
 *
 * Uses bottom-up traversal to simplify expressions containing constants.
 * Applies identity and domination laws throughout the expression tree.
 */
function applyConstantPatternsOptimized(expr: BooleanExpression): BooleanExpression {
  // Base case: leaf nodes cannot be simplified further
  if (expr.type === 'CONSTANT' || expr.type === 'VARIABLE') {
    return expr
  }

  // Recursively process children first (bottom-up approach)
  const processedLeft = expr.left ? applyConstantPatternsOptimized(expr.left) : undefined
  const processedRight = expr.right ? applyConstantPatternsOptimized(expr.right) : undefined

  // Create new expression with processed children if they changed
  let currentExpr = expr
  if (processedLeft !== expr.left || processedRight !== expr.right) {
    switch (expr.type) {
      case 'AND':
        if (processedLeft && processedRight) {
          currentExpr = { type: 'AND', left: processedLeft, right: processedRight }
        }
        break
      case 'OR':
        if (processedLeft && processedRight) {
          currentExpr = { type: 'OR', left: processedLeft, right: processedRight }
        }
        break
      case 'XOR':
        if (processedLeft && processedRight) {
          currentExpr = { type: 'XOR', left: processedLeft, right: processedRight }
        }
        break
      case 'NAND':
        if (processedLeft && processedRight) {
          currentExpr = { type: 'NAND', left: processedLeft, right: processedRight }
        }
        break
      case 'NOR':
        if (processedLeft && processedRight) {
          currentExpr = { type: 'NOR', left: processedLeft, right: processedRight }
        }
        break
      case 'NOT':
        if (processedLeft) {
          currentExpr = { type: 'NOT', left: processedLeft }
        }
        break
      // VARIABLE and CONSTANT cases handled by base case above
    }
  }

  // Apply constant simplification patterns to current node
  for (const pattern of constantPatterns) {
    const result = pattern(currentExpr)
    if (result && result !== currentExpr) {
      return result
    }
  }

  return currentExpr
}

/**
 * Get constant simplification rules
 *
 * Returns the master rule for recursive constant simplification based on
 * boolean algebra identity and domination laws.
 */
export function getConstantRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'Constant Simplification',
        description: 'Applies identity and domination laws with constants (0, 1)',
        formula: 'X \\land 1 = X,\\ X \\lor 0 = X,\\ X \\land 0 = 0,\\ X \\lor 1 = 1',
        ruleType: 'identity',
      },
      canApply: (): boolean => true, // Always applicable, let apply() decide
      apply: applyConstantPatternsOptimized,
    },
  ]
}
