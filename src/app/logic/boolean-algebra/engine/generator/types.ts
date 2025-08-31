/**
 * Generator Types and Configuration
 *
 * Type definitions and configuration options for the expression generator.
 */

/**
 * Output format for the generated expression
 */
export type OutputFormat = 'standard' | 'latex'

/**
 * Available operator types for generation
 */
export type OperatorType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'XNOR'

/**
 * Expression pattern types for patterned generation
 */
export type ExpressionPattern =
  | 'deMorgan'
  | 'absorption'
  | 'idempotent'
  | 'distributive'
  | 'complement'

/**
 * Options for customizing expression generation
 */
export interface GeneratorOptions {
  /**
   * Available variables to use in expressions
   */
  availableVariables?: string[]

  /**
   * Probability of negating a variable (0-1)
   */
  negationProbability?: number

  /**
   * Probability of creating nested expressions (0-1)
   */
  nestedProbability?: number

  /**
   * Probability of negating an entire expression (0-1)
   */
  expressionNegationProbability?: number

  /**
   * Whether to include constants (True/False) in expressions
   */
  includeConstants?: boolean

  /**
   * Probability of using a constant instead of a variable (0-1)
   */
  constantProbability?: number

  /**
   * Output format for the expression (standard or latex)
   */
  outputFormat?: OutputFormat

  /**
   * Which operators are allowed during generation. Defaults to all operators.
   */
  allowedOperators?: OperatorType[]

  /**
   * Legacy option - previously used LaTeX overline notation
   * Now standardized to use ! for negation in all cases
   * @deprecated This option no longer has an effect as all negations use ! symbols
   */
  useOverlineNotation?: boolean
}

/**
 * Default options for the expression generator
 */
export const defaultGeneratorOptions: Required<GeneratorOptions> = {
  availableVariables: ['A', 'B', 'C', 'D', 'E'],
  negationProbability: 0.3,
  nestedProbability: 0.4,
  expressionNegationProbability: 0.2,
  includeConstants: false,
  constantProbability: 0.1,
  outputFormat: 'standard',
  allowedOperators: ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'],
  useOverlineNotation: false,
}
