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
  | 'XNOR'

// Base interface for common properties (optional, can be integrated directly)
// export interface BaseNode {
//   type: ExpressionNodeType;
// }

export interface VariableNode {
  type: 'VARIABLE'
  value: string
  left?: undefined // Explicitly undefined for leaf nodes
  right?: undefined // Explicitly undefined for leaf nodes
}

export interface ConstantNode {
  type: 'CONSTANT'
  value: boolean
  left?: undefined
  right?: undefined
}

export interface NotNode {
  type: 'NOT'
  left: BooleanExpression // Operand
  value?: undefined
  right?: undefined
}

export interface AndNode {
  type: 'AND'
  left: BooleanExpression
  right: BooleanExpression
  value?: undefined
}

export interface OrNode {
  type: 'OR'
  left: BooleanExpression
  right: BooleanExpression
  value?: undefined
}

export interface XorNode {
  type: 'XOR'
  left: BooleanExpression
  right: BooleanExpression
  value?: undefined
}

export interface NandNode {
  type: 'NAND'
  left: BooleanExpression
  right: BooleanExpression
  value?: undefined
}

export interface NorNode {
  type: 'NOR'
  left: BooleanExpression
  right: BooleanExpression
  value?: undefined
}

export interface XnorNode {
  type: 'XNOR'
  left: BooleanExpression
  right: BooleanExpression
  value?: undefined
}

/**
 * Boolean expression tree representation - now a union of specific node types
 */
export type BooleanExpression =
  | VariableNode
  | ConstantNode
  | NotNode
  | AndNode
  | OrNode
  | XorNode
  | NandNode
  | NorNode
  | XnorNode

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
  expressionBefore: string
  expressionAfter: string
  expressionTreeBefore?: BooleanExpression
  expressionTreeAfter?: BooleanExpression
  phase?: string
}

/**
 * The result of a simplification process
 */
export interface SimplificationResult {
  originalExpression: string
  simplifiedExpression: BooleanExpression
  simplifiedExpressionString: string
  simplifiedExpressionLatex: string
  steps: SimplificationStep[]
  totalApplications: number
  iterations: number
  ruleApplicationCounts: Record<string, number>
  maxIterationsReached: boolean
}

// New types for LaTeX formatted simplification results
export interface LatexSimplificationStep {
  ruleName: string
  ruleFormula: string
  beforeLatex: string
  afterLatex: string
  phase?: string
}

export interface ExtendedLatexResults {
  steps: LatexSimplificationStep[]
  finalLatex: string
  originalExpression: string
  simplifiedExpressionString: string // The non-LaTeX string form
}
