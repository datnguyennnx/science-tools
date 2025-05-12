import type { BooleanExpression } from '../../../engine'

export interface TruthTableProps {
  expression: string
  variables?: string[]
}

export interface SubExpressionStep {
  str: string // String representation for display and key
  ast: BooleanExpression // AST node for evaluation
  isFinal: boolean // True if this is the main (final) expression
}

/**
 * Truth Table result type for waiting state
 */
export type TruthTableResultWaiting = {
  status: 'waiting'
  message: string
}

/**
 * Truth Table result type for error state
 */
export type TruthTableResultError = {
  status: 'error'
  message: string
  details?: string
  rawInput: string // Keep track of the input that caused the error
}

/**
 * Data structure for a single row in the truth table
 */
export interface TruthTableRowData {
  variableValues: Record<string, boolean>
  stepResults: Record<string, boolean>
}

/**
 * Truth Table result type for success state
 */
export type TruthTableResultSuccess = {
  status: 'success'
  variables: string[]
  subExpressionSteps: SubExpressionStep[]
  rows: TruthTableRowData[]
  rawInput: string
  processedExpression: string
}

/**
 * Union type for all possible Truth Table result states
 */
export type TruthTableResult =
  | TruthTableResultWaiting
  | TruthTableResultError
  | TruthTableResultSuccess
