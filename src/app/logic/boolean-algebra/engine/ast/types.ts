/**
 * Core Expression Engine Types
 *
 * Defines the AST structure for boolean algebra expressions.
 */

/**
 * Boolean expression node types supporting standard boolean algebra operations
 */
export type ExpressionNodeType =
  | 'VARIABLE' // Boolean variable (A, B, C, ...)
  | 'CONSTANT' // Boolean constant (0, 1)
  | 'NOT' // Logical NOT operation
  | 'AND' // Logical AND operation
  | 'OR' // Logical OR operation
  | 'XOR' // Logical XOR operation
  | 'NAND' // Logical NAND operation
  | 'NOR' // Logical NOR operation
  | 'XNOR' // Logical XNOR operation

/**
 * Leaf node representing a boolean variable
 */
export interface VariableNode {
  type: 'VARIABLE'
  value: string // Variable name (e.g., 'A', 'B', 'C')
  left?: undefined // Leaf nodes have no children
  right?: undefined
}

/**
 * Leaf node representing a boolean constant
 */
export interface ConstantNode {
  type: 'CONSTANT'
  value: boolean // Boolean value (true = 1, false = 0)
  left?: undefined // Leaf nodes have no children
  right?: undefined
}

/**
 * Unary NOT operation node
 */
export interface NotNode {
  type: 'NOT'
  left: BooleanExpression // Expression to negate
  value?: undefined // No value for operation nodes
  right?: undefined // Unary operation has only one operand
}

/**
 * Binary AND operation node
 */
export interface AndNode {
  type: 'AND'
  left: BooleanExpression
  right: BooleanExpression
  value?: undefined
}

/**
 * Binary OR operation node
 */
export interface OrNode {
  type: 'OR'
  left: BooleanExpression
  right: BooleanExpression
  value?: undefined
}

/**
 * Binary XOR operation node
 */
export interface XorNode {
  type: 'XOR'
  left: BooleanExpression
  right: BooleanExpression
  value?: undefined
}

/**
 * Binary NAND operation node
 */
export interface NandNode {
  type: 'NAND'
  left: BooleanExpression
  right: BooleanExpression
  value?: undefined
}

/**
 * Binary NOR operation node
 */
export interface NorNode {
  type: 'NOR'
  left: BooleanExpression
  right: BooleanExpression
  value?: undefined
}

/**
 * Binary XNOR operation node
 */
export interface XnorNode {
  type: 'XNOR'
  left: BooleanExpression
  right: BooleanExpression
  value?: undefined
}

/**
 * Boolean expression tree representation using discriminated union types
 * This ensures type safety and allows TypeScript to narrow types based on the 'type' field
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
 * Metadata for a simplification rule
 */
export interface RuleInfo {
  name: string // Human-readable rule name
  description: string // Detailed explanation of the rule
  formula: string // LaTeX mathematical formula representation
  ruleType?: string // Optional classification (e.g., 'distribution', 'absorption')
}

/**
 * Single step in the boolean algebra simplification process
 */
export interface SimplificationStep {
  ruleName: string // Name of the applied rule
  ruleFormula: string // LaTeX formula of the applied rule
  ruleDescription?: string // Detailed description of the rule and its application
  expressionBefore: string // Expression string before applying rule
  expressionAfter: string // Expression string after applying rule
  expressionTreeBefore?: BooleanExpression // Optional AST before rule application
  expressionTreeAfter?: BooleanExpression // Optional AST after rule application
  phase?: string // Optional phase identifier for multi-phase simplification
}

/**
 * Complete result of a boolean algebra simplification process
 */
export interface SimplificationResult {
  originalExpression: string // Original input expression
  simplifiedExpression: BooleanExpression // Final simplified AST
  simplifiedExpressionString: string // Final simplified expression as string
  simplifiedExpressionLatex: string // Final simplified expression in LaTeX format
  steps: SimplificationStep[] // Step-by-step transformation history
  totalApplications: number // Total number of rule applications
  iterations: number // Number of simplification iterations
  ruleApplicationCounts: Record<string, number> // Count of each rule's applications
  maxIterationsReached: boolean // Whether maximum iterations were reached
}

/**
 * LaTeX-formatted simplification step for UI display
 */
export interface LatexSimplificationStep {
  ruleName: string
  ruleFormula: string
  ruleDescription?: string // Detailed description of the rule and its application
  beforeLatex: string // LaTeX representation of expression before rule
  afterLatex: string // LaTeX representation of expression after rule
  phase?: string
}

/**
 * Extended results with LaTeX formatting for comprehensive display
 */
export interface ExtendedLatexResults {
  steps: LatexSimplificationStep[] // All steps in LaTeX format
  finalLatex: string // Final simplified expression in LaTeX
  originalExpression: string // Original input expression
  simplifiedExpressionString: string // Final simplified expression as standard string
}
