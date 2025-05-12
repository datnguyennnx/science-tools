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
