import { BooleanExpression } from '../../../engine'
import { CellPosition, KMapConfig } from './types'

/**
 * Extracts variables from a parsed expression tree
 */
export function extractVariablesFromTree(
  expr: BooleanExpression,
  vars = new Set<string>()
): string[] {
  if (expr.type === 'VARIABLE' && typeof expr.value === 'string') {
    vars.add(expr.value)
  }

  if (expr.left) {
    extractVariablesFromTree(expr.left, vars)
  }

  if (expr.right) {
    extractVariablesFromTree(expr.right, vars)
  }

  return Array.from(vars).sort()
}

/**
 * Evaluates a boolean expression for a given set of variable values
 */
export function evaluateExpression(
  expr: BooleanExpression,
  variableValues: Record<string, boolean>
): boolean {
  if (expr.type === 'CONSTANT') {
    return expr.value as boolean
  }

  if (expr.type === 'VARIABLE') {
    const varName = expr.value as string
    return variableValues[varName] ?? false
  }

  if (expr.type === 'NOT') {
    return !evaluateExpression(expr.left!, variableValues)
  }

  if (expr.type === 'AND') {
    return (
      evaluateExpression(expr.left!, variableValues) &&
      evaluateExpression(expr.right!, variableValues)
    )
  }

  if (expr.type === 'OR') {
    return (
      evaluateExpression(expr.left!, variableValues) ||
      evaluateExpression(expr.right!, variableValues)
    )
  }

  return false
}

/**
 * Creates the K-Map configuration based on the number of variables
 */
export function createKMapConfig(variables: string[]): KMapConfig {
  const numVars = variables.length
  let rowHeaders: string[] = []
  let colHeaders: string[] = []
  let rowVarLabel = ''
  let colVarLabel = ''
  let kMapOrder: CellPosition[][] = []

  if (numVars === 2) {
    rowVarLabel = variables[0]
    colVarLabel = variables[1]
    rowHeaders = ['0', '1']
    colHeaders = ['0', '1']
    kMapOrder = [
      [
        { row: 0, col: 0, minterm: 0 },
        { row: 0, col: 1, minterm: 1 },
      ],
      [
        { row: 1, col: 0, minterm: 2 },
        { row: 1, col: 1, minterm: 3 },
      ],
    ]
  } else if (numVars === 3) {
    rowVarLabel = variables[0]
    colVarLabel = variables.slice(1).join('')
    rowHeaders = ['0', '1']
    colHeaders = ['00', '01', '11', '10'] // Gray code for BC
    kMapOrder = [
      [
        { row: 0, col: 0, minterm: 0 },
        { row: 0, col: 1, minterm: 1 },
        { row: 0, col: 2, minterm: 3 },
        { row: 0, col: 3, minterm: 2 },
      ],
      [
        { row: 1, col: 0, minterm: 4 },
        { row: 1, col: 1, minterm: 5 },
        { row: 1, col: 2, minterm: 7 },
        { row: 1, col: 3, minterm: 6 },
      ],
    ]
  } else if (numVars === 4) {
    rowVarLabel = variables.slice(0, 2).join('')
    colVarLabel = variables.slice(2).join('')
    rowHeaders = ['00', '01', '11', '10'] // Gray code for AB
    colHeaders = ['00', '01', '11', '10'] // Gray code for CD
    kMapOrder = [
      [
        { row: 0, col: 0, minterm: 0 },
        { row: 0, col: 1, minterm: 1 },
        { row: 0, col: 2, minterm: 3 },
        { row: 0, col: 3, minterm: 2 },
      ],
      [
        { row: 1, col: 0, minterm: 4 },
        { row: 1, col: 1, minterm: 5 },
        { row: 1, col: 2, minterm: 7 },
        { row: 1, col: 3, minterm: 6 },
      ],
      [
        { row: 2, col: 0, minterm: 12 },
        { row: 2, col: 1, minterm: 13 },
        { row: 2, col: 2, minterm: 15 },
        { row: 2, col: 3, minterm: 14 },
      ],
      [
        { row: 3, col: 0, minterm: 8 },
        { row: 3, col: 1, minterm: 9 },
        { row: 3, col: 2, minterm: 11 },
        { row: 3, col: 3, minterm: 10 },
      ],
    ]
  }

  return { rowHeaders, colHeaders, rowVarLabel, colVarLabel, kMapOrder }
}
