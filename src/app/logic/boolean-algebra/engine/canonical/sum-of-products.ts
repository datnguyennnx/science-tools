/**
 * Sum of Products (SoP) Canonical Form
 *
 * Converts boolean expressions to Sum of Products canonical form.
 * SoP form: F = ∑ m_i where each m_i is a minterm
 *
 * This is also known as the "canonical sum" or "standard sum" form.
 */

import { BooleanExpression, VariableNode } from '../ast/types'
import { ExpressionTransformer } from '../core/boolean-types'
import { extractVariables } from '../core/boolean-utils'
import { expandXnor } from '../transformers'

/**
 * Convert an expression to Sum of Products canonical form
 */
export function toSumOfProducts(expr: BooleanExpression): BooleanExpression {
  // First expand any XNOR operations
  const expandedExpr = expandXnor(expr)

  // Then convert to canonical SoP form
  return convertToCanonicalSop(expandedExpr)
}

/**
 * Convert expression to canonical Sum of Products form
 */
function convertToCanonicalSop(expr: BooleanExpression): BooleanExpression {
  const variables = Array.from(extractVariables(expr)).sort()

  if (variables.length === 0) {
    // Constant expression
    return expr
  }

  // Generate all minterms where the expression evaluates to true
  const minterms: BooleanExpression[] = []

  // For each possible assignment of variables
  const numCombinations = 1 << variables.length
  for (let i = 0; i < numCombinations; i++) {
    const assignment: Record<string, boolean> = {}

    // Create assignment from binary representation of i
    for (let j = 0; j < variables.length; j++) {
      assignment[variables[j]] = (i & (1 << j)) !== 0
    }

    // Evaluate expression with this assignment
    if (evaluateExpression(expr, assignment)) {
      // Create minterm for this assignment
      const minterm = createMinterm(variables, assignment)
      minterms.push(minterm)
    }
  }

  if (minterms.length === 0) {
    // Expression is always false
    return { type: 'CONSTANT', value: false }
  }

  if (minterms.length === 1) {
    // Single minterm
    return minterms[0]
  }

  // Combine minterms with OR operations
  return minterms.reduce((acc, minterm) => ({
    type: 'OR',
    left: acc,
    right: minterm,
  }))
}

/**
 * Create a minterm from a variable assignment
 * A minterm is a product of all variables (or their negations)
 */
function createMinterm(
  variables: string[],
  assignment: Record<string, boolean>
): BooleanExpression {
  const terms: BooleanExpression[] = []

  for (const variable of variables) {
    const value = assignment[variable]
    const varNode: VariableNode = { type: 'VARIABLE', value: variable }

    if (value) {
      // Variable is true, include as-is
      terms.push(varNode)
    } else {
      // Variable is false, include negated
      terms.push({ type: 'NOT', left: varNode })
    }
  }

  if (terms.length === 1) {
    return terms[0]
  }

  // Combine terms with AND operations
  return terms.reduce((acc, term) => ({
    type: 'AND',
    left: acc,
    right: term,
  }))
}

/**
 * Evaluate a boolean expression given variable assignments
 */
function evaluateExpression(expr: BooleanExpression, assignment: Record<string, boolean>): boolean {
  switch (expr.type) {
    case 'CONSTANT':
      return expr.value

    case 'VARIABLE':
      return assignment[expr.value] ?? false

    case 'NOT':
      if (!expr.left) return false
      return !evaluateExpression(expr.left, assignment)

    case 'AND':
      if (!expr.left || !expr.right) return false
      return evaluateExpression(expr.left, assignment) && evaluateExpression(expr.right, assignment)

    case 'OR':
      if (!expr.left || !expr.right) return false
      return evaluateExpression(expr.left, assignment) || evaluateExpression(expr.right, assignment)

    case 'XOR':
      if (!expr.left || !expr.right) return false
      const left = evaluateExpression(expr.left, assignment)
      const right = evaluateExpression(expr.right, assignment)
      return left !== right

    case 'XNOR':
      if (!expr.left || !expr.right) return false
      const leftXnor = evaluateExpression(expr.left, assignment)
      const rightXnor = evaluateExpression(expr.right, assignment)
      return leftXnor === rightXnor

    case 'NAND':
      if (!expr.left || !expr.right) return false
      return !(
        evaluateExpression(expr.left, assignment) && evaluateExpression(expr.right, assignment)
      )

    case 'NOR':
      if (!expr.left || !expr.right) return false
      return !(
        evaluateExpression(expr.left, assignment) || evaluateExpression(expr.right, assignment)
      )

    default:
      return false
  }
}

/**
 * Check if an expression is already in Sum of Products form
 */
export function isSumOfProducts(expr: BooleanExpression): boolean {
  if (expr.type === 'CONSTANT' || expr.type === 'VARIABLE') {
    return true
  }

  if (expr.type === 'NOT') {
    // NOT of a single variable is allowed in SoP
    return expr.left?.type === 'VARIABLE' || false
  }

  if (expr.type === 'AND') {
    // AND of literals is allowed
    return isLiteral(expr.left) && isLiteral(expr.right)
  }

  if (expr.type === 'OR') {
    // OR of minterms is the definition of SoP
    return isMinterm(expr.left) && isMinterm(expr.right)
  }

  return false
}

/**
 * Check if an expression is a literal (variable or its negation)
 */
function isLiteral(expr: BooleanExpression | undefined): boolean {
  if (!expr) return false
  if (expr.type === 'VARIABLE') return true
  if (expr.type === 'NOT') return expr.left?.type === 'VARIABLE' || false
  return false
}

/**
 * Check if an expression is a minterm (AND of literals)
 */
function isMinterm(expr: BooleanExpression | undefined): boolean {
  if (!expr) return false
  if (isLiteral(expr)) return true
  if (expr.type === 'AND') {
    return isLiteral(expr.left) && isLiteral(expr.right)
  }
  return false
}

/**
 * Main SoP transformer
 */
export const toSopCanonical: ExpressionTransformer = toSumOfProducts
