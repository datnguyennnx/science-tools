/**
 * Truth Table Verification
 *
 * Provides truth table generation and equivalence verification
 * for boolean expressions. This is the most reliable method
 * for confirming that two expressions are logically equivalent.
 */

import { BooleanExpression } from '../ast/types'
import { VerificationResult, TruthTable } from '../core/boolean-types'
import { extractVariables } from '../core/boolean-utils'
import { evaluateExpression } from '../evaluator/evaluator'

/**
 * Generate all possible variable assignments for a set of variables
 */
function generateVariableAssignments(variables: string[]): Array<Record<string, boolean>> {
  const varArray = Array.from(variables)
  const numVariables = varArray.length
  const numCombinations = 1 << numVariables // 2^numVariables

  const assignments: Array<Record<string, boolean>> = []

  for (let i = 0; i < numCombinations; i++) {
    const assignment: Record<string, boolean> = {}

    for (let j = 0; j < numVariables; j++) {
      // Extract j-th bit from i to determine boolean value
      assignment[varArray[j]] = (i & (1 << j)) !== 0
    }

    assignments.push(assignment)
  }

  return assignments
}

/**
 * Evaluate an expression for a given variable assignment
 */
function evaluateForAssignment(
  expr: BooleanExpression,
  assignment: Record<string, boolean>
): boolean {
  try {
    return evaluateExpression(expr, assignment)
  } catch (error) {
    console.warn('Error evaluating expression:', error)
    return false
  }
}

/**
 * Generate a complete truth table for an expression
 */
export function generateTruthTable(expr: BooleanExpression): TruthTable {
  const variables = extractVariables(expr)
  const assignments = generateVariableAssignments(Array.from(variables))

  const rows = assignments.map(assignment => {
    const result = evaluateForAssignment(expr, assignment)
    return {
      assignment: { ...assignment },
      result1: result,
      result2: false, // Will be set when comparing two expressions
      equivalent: true, // Will be set when comparing two expressions
    }
  })

  return {
    variables: Array.from(variables),
    rows,
  }
}

/**
 * Generate a truth table comparing two expressions
 */
export function generateComparisonTruthTable(
  expr1: BooleanExpression,
  expr2: BooleanExpression
): TruthTable {
  const variables1 = extractVariables(expr1)
  const variables2 = extractVariables(expr2)
  const allVariables = new Set([...variables1, ...variables2])

  const assignments = generateVariableAssignments(Array.from(allVariables))

  const rows = assignments.map(assignment => {
    const result1 = evaluateForAssignment(expr1, assignment)
    const result2 = evaluateForAssignment(expr2, assignment)
    const equivalent = result1 === result2

    return {
      assignment: { ...assignment },
      result1,
      result2,
      equivalent,
    }
  })

  return {
    variables: Array.from(allVariables),
    rows,
  }
}

/**
 * Verify equivalence using truth table method
 */
export function verifyByTruthTable(
  expr1: BooleanExpression,
  expr2: BooleanExpression
): VerificationResult {
  const truthTable = generateComparisonTruthTable(expr1, expr2)

  // Check if all rows are equivalent
  const allEquivalent = truthTable.rows.every(row => row.equivalent)
  const totalRows = truthTable.rows.length
  const equivalentRows = truthTable.rows.filter(row => row.equivalent).length

  let details = `Truth table verification: ${equivalentRows}/${totalRows} rows equivalent`

  if (!allEquivalent) {
    const differingRows = truthTable.rows.filter(row => !row.equivalent).slice(0, 5) // Show first 5 differences

    details += '\nDiffering assignments:'
    differingRows.forEach(row => {
      const assignmentStr = Object.entries(row.assignment)
        .map(([varName, value]) => `${varName}=${value}`)
        .join(', ')
      details += `\n  ${assignmentStr}: expr1=${row.result1}, expr2=${row.result2}`
    })
  }

  return {
    isEquivalent: allEquivalent,
    method: 'truth-table',
    details,
    truthTable,
  }
}

/**
 * Check if truth table verification is feasible for given expressions
 * (i.e., if the number of variables is reasonable)
 */
export function isTruthTableVerificationFeasible(
  expr1: BooleanExpression,
  expr2: BooleanExpression,
  maxVariables = 10
): boolean {
  const variables1 = extractVariables(expr1)
  const variables2 = extractVariables(expr2)
  const totalVariables = new Set([...variables1, ...variables2]).size

  return totalVariables <= maxVariables
}

/**
 * Get the complexity of truth table verification
 */
export function getTruthTableComplexity(
  expr1: BooleanExpression,
  expr2: BooleanExpression
): { variableCount: number; rowCount: number; feasible: boolean } {
  const variables1 = extractVariables(expr1)
  const variables2 = extractVariables(expr2)
  const allVariables = new Set([...variables1, ...variables2])
  const variableCount = allVariables.size
  const rowCount = 1 << variableCount // 2^variableCount
  const feasible = variableCount <= 10

  return { variableCount, rowCount, feasible }
}
