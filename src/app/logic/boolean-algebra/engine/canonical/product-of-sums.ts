/**
 * Product of Sums (PoS) Canonical Form
 *
 * Converts boolean expressions to Product of Sums canonical form.
 * PoS form: F = ∏ M_i where each M_i is a maxterm
 *
 * This is also known as the "canonical product" or "standard product" form.
 */

import { BooleanExpression, VariableNode } from '../ast/types'
import { ExpressionTransformer } from '../core/boolean-types'
import { extractVariables } from '../core/boolean-utils'
import { expandXnor } from '../transformers'

/**
 * Convert an expression to Product of Sums canonical form
 */
export function toProductOfSums(expr: BooleanExpression): BooleanExpression {
  // First expand any XNOR operations
  const expandedExpr = expandXnor(expr)

  // Then convert to canonical PoS form
  return convertToCanonicalPos(expandedExpr)
}

/**
 * Convert expression to canonical Product of Sums form
 */
function convertToCanonicalPos(expr: BooleanExpression): BooleanExpression {
  const variables = Array.from(extractVariables(expr)).sort()

  if (variables.length === 0) {
    // Constant expression
    return expr
  }

  // Generate all maxterms where the expression evaluates to false
  const maxterms: BooleanExpression[] = []

  // For each possible assignment of variables
  const numCombinations = 1 << variables.length
  for (let i = 0; i < numCombinations; i++) {
    const assignment: Record<string, boolean> = {}

    // Create assignment from binary representation of i
    for (let j = 0; j < variables.length; j++) {
      assignment[variables[j]] = (i & (1 << j)) !== 0
    }

    // Evaluate expression with this assignment
    if (!evaluateExpression(expr, assignment)) {
      // Create maxterm for this assignment (where expression is false)
      const maxterm = createMaxterm(variables, assignment)
      maxterms.push(maxterm)
    }
  }

  if (maxterms.length === 0) {
    // Expression is always true
    return { type: 'CONSTANT', value: true }
  }

  if (maxterms.length === 1) {
    // Single maxterm
    return maxterms[0]
  }

  // Combine maxterms with AND operations
  return maxterms.reduce((acc, maxterm) => ({
    type: 'AND',
    left: acc,
    right: maxterm,
  }))
}

/**
 * Create a maxterm from a variable assignment
 * A maxterm is a sum of all variables (or their negations)
 */
function createMaxterm(
  variables: string[],
  assignment: Record<string, boolean>
): BooleanExpression {
  const terms: BooleanExpression[] = []

  for (const variable of variables) {
    const value = assignment[variable]
    const varNode: VariableNode = { type: 'VARIABLE', value: variable }

    if (value) {
      // Variable is true, include negated (since we want maxterm where expr is false)
      terms.push({ type: 'NOT', left: varNode })
    } else {
      // Variable is false, include as-is
      terms.push(varNode)
    }
  }

  if (terms.length === 1) {
    return terms[0]
  }

  // Combine terms with OR operations
  return terms.reduce((acc, term) => ({
    type: 'OR',
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
 * Check if an expression is already in Product of Sums form
 */
export function isProductOfSums(expr: BooleanExpression): boolean {
  if (expr.type === 'CONSTANT' || expr.type === 'VARIABLE') {
    return true
  }

  if (expr.type === 'NOT') {
    // NOT of a single variable is allowed in PoS
    return expr.left?.type === 'VARIABLE' || false
  }

  if (expr.type === 'OR') {
    // OR of literals is allowed
    return isLiteral(expr.left) && isLiteral(expr.right)
  }

  if (expr.type === 'AND') {
    // AND of maxterms is the definition of PoS
    return isMaxterm(expr.left) && isMaxterm(expr.right)
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
 * Check if an expression is a maxterm (OR of literals)
 */
function isMaxterm(expr: BooleanExpression | undefined): boolean {
  if (!expr) return false
  if (isLiteral(expr)) return true
  if (expr.type === 'OR') {
    return isLiteral(expr.left) && isLiteral(expr.right)
  }
  return false
}

/**
 * Main PoS transformer
 */
export const toPosCanonical: ExpressionTransformer = toProductOfSums
