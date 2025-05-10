/**
 * Core Expression Engine Types
 */

/**
 * Boolean expression tree node types
 */
export type ExpressionNodeType =
  | 'VARIABLE'
  | 'CONSTANT'
  | 'NOT'
  | 'AND'
  | 'OR'
  | 'XOR'
  | 'NAND'
  | 'NOR'

/**
 * Boolean expression tree representation
 */
export interface BooleanExpression {
  type: ExpressionNodeType
  value?: string | boolean // For variables (A, B, C) or constants (true/false)
  left?: BooleanExpression // Left child for binary operations or operand for NOT
  right?: BooleanExpression // Right child for binary operations
}

/**
 * Rule information for describing a simplification step
 */
export interface RuleInfo {
  name: string
  description: string
  formula: string // LaTeX formula representation of the rule
}

/**
 * A single step in the simplification process
 */
export interface SimplificationStep {
  ruleName: string
  ruleFormula: string
  expressionBefore: BooleanExpression
  expressionAfter: BooleanExpression
}

/**
 * The result of a simplification process
 */
export interface SimplificationResult {
  steps: SimplificationStep[]
  finalExpression: BooleanExpression
}
