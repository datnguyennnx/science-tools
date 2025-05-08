/**
 * Boolean Expression Generator
 *
 * This module provides utilities for generating random Boolean expressions
 * with configurable complexity and structure.
 */

/**
 * Generate a random Boolean expression of given complexity
 * @param complexity Level of complexity (1-5)
 * @param options Configuration options for expression generation
 * @returns A random Boolean expression as LaTeX string
 */
export function generateRandomExpression(
  complexity: number = 3,
  options: GeneratorOptions = {}
): string {
  // Merge default options with provided options
  const config = {
    ...defaultGeneratorOptions,
    ...options,
  }

  // Variables to use
  const variables = config.availableVariables

  // Limit variables according to complexity
  const variableLimit = Math.min(2 + complexity, variables.length)
  const availableVars = variables.slice(0, variableLimit)

  // Helper function to get a random variable
  const getRandomVar = () => availableVars[Math.floor(Math.random() * availableVars.length)]

  // Helper function to get a simple term (variable or negated variable)
  const getSimpleTerm = (): string => {
    const variable = getRandomVar()
    if (Math.random() < config.negationProbability) {
      return config.useOverlineNotation ? `\\overline{${variable}}` : `\\lnot ${variable}`
    }
    return variable
  }

  // Helper function to get a constant term (0 or 1)
  const getConstantTerm = (): string => {
    return Math.random() < 0.5 ? '\\text{T}' : '\\text{F}'
  }

  // Helper function to format negated expressions
  const formatNegation = (expr: string): string => {
    return config.useOverlineNotation ? `\\overline{${expr}}` : `\\lnot(${expr})`
  }

  // Random operations based on complexity
  const generateTerm = (level: number, forceOperation: boolean = false): string => {
    // If at lowest level and not forced to create an operation, return a simple term
    if (level <= 1 && !forceOperation) {
      // Sometimes include constants based on configuration
      if (config.includeConstants && Math.random() < config.constantProbability) {
        return getConstantTerm()
      }
      return getSimpleTerm()
    }

    // Decide which operation to use
    const operation = Math.random() < config.andProbability ? '\\land' : '\\lor'

    // For the left term, we can have a simple term or a complex one
    const leftTermComplex = Math.random() < config.nestedProbability && level > 1
    const leftTerm = leftTermComplex ? generateTerm(level - 1) : getSimpleTerm()

    // For the right term, similar logic
    const rightTermComplex = Math.random() < config.nestedProbability && level > 1
    const rightTerm = rightTermComplex ? generateTerm(level - 1) : getSimpleTerm()

    // Check if we need parentheses
    const needsParens =
      leftTerm.includes('\\land') ||
      leftTerm.includes('\\lor') ||
      rightTerm.includes('\\land') ||
      rightTerm.includes('\\lor')

    const expression = needsParens
      ? `(${leftTerm} ${operation} ${rightTerm})`
      : `${leftTerm} ${operation} ${rightTerm}`

    // Add negation to the entire expression sometimes
    return Math.random() < config.expressionNegationProbability
      ? formatNegation(expression)
      : expression
  }

  // Always force at least one operation in the expression
  return generateTerm(complexity, true)
}

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
   * Probability of using AND vs OR (0-1)
   * Higher value means more AND operations
   */
  andProbability?: number

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
   * Use \overline{} notation for negation instead of \lnot
   */
  useOverlineNotation?: boolean
}

/**
 * Default options for the expression generator
 */
export const defaultGeneratorOptions: Required<GeneratorOptions> = {
  availableVariables: ['A', 'B', 'C', 'D', 'E'],
  negationProbability: 0.3,
  andProbability: 0.5,
  nestedProbability: 0.4,
  expressionNegationProbability: 0.2,
  includeConstants: false,
  constantProbability: 0.1,
  useOverlineNotation: false,
}

/**
 * Generate expressions specifically with \overline notation
 * @param complexity Level of complexity (1-5)
 * @param options Additional configuration options
 * @returns A Boolean expression using \overline notation for negations
 */
export function generateOverlineExpression(
  complexity: number = 3,
  options: Omit<GeneratorOptions, 'useOverlineNotation'> = {}
): string {
  return generateRandomExpression(complexity, {
    ...options,
    useOverlineNotation: true,
  })
}

/**
 * Generate an expression with a guaranteed specific form or pattern
 *
 * @param pattern The pattern type to generate
 * @returns A Boolean expression matching the specified pattern
 */
export function generatePatternedExpression(
  pattern: ExpressionPattern,
  options: Partial<GeneratorOptions> = {}
): string {
  // Merge with default options
  const config = {
    ...defaultGeneratorOptions,
    ...options,
  }

  // Implementation of patterns will be added in future updates
  switch (pattern) {
    case 'deMorgan':
      // Generate expressions that can be simplified using De Morgan's laws
      return generateDeMorganPattern(config)
    case 'absorption':
      // Generate expressions that can be simplified using absorption law
      return generateAbsorptionPattern(config)
    case 'idempotent':
      // Generate expressions that can be simplified using idempotent law
      return generateIdempotentPattern(config)
    case 'distributive':
      // Generate expressions that can be simplified using distributive law
      return generateDistributivePattern(config)
    case 'complement':
      // Generate expressions using complement law
      return generateComplementPattern(config)
    default:
      // Default to a random expression
      return generateRandomExpression(3, config)
  }
}

/**
 * Available expression pattern types
 */
export type ExpressionPattern =
  | 'deMorgan'
  | 'absorption'
  | 'idempotent'
  | 'distributive'
  | 'complement'

// Helper functions to generate specific patterns

function generateDeMorganPattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]
  const var2 = variables[(variables.indexOf(var1) + 1) % variables.length]

  // Generate !(A + B) or !(A * B) which can be simplified using De Morgan's laws
  const useAnd = Math.random() < 0.5
  const operation = useAnd ? '\\land' : '\\lor'

  return options.useOverlineNotation
    ? `\\overline{${var1} ${operation} ${var2}}`
    : `\\lnot(${var1} ${operation} ${var2})`
}

function generateAbsorptionPattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]
  const var2 = variables[(variables.indexOf(var1) + 1) % variables.length]

  // Generate A + (A * B) or A * (A + B) which can be simplified using absorption law
  const useOr = Math.random() < 0.5

  return useOr ? `${var1} \\lor (${var1} \\land ${var2})` : `${var1} \\land (${var1} \\lor ${var2})`
}

function generateIdempotentPattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]

  // Generate A + A or A * A which can be simplified using idempotent law
  const useOr = Math.random() < 0.5
  return useOr ? `${var1} \\lor ${var1}` : `${var1} \\land ${var1}`
}

function generateDistributivePattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]
  const var2 = variables[(variables.indexOf(var1) + 1) % variables.length]
  const var3 = variables[(variables.indexOf(var2) + 1) % variables.length]

  // Generate A * (B + C) or A + (B * C) which demonstrates distributive law
  const useAnd = Math.random() < 0.5
  return useAnd
    ? `${var1} \\land (${var2} \\lor ${var3})`
    : `${var1} \\lor (${var2} \\land ${var3})`
}

function generateComplementPattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]

  // Generate A * !A or A + !A which demonstrates complement law
  const useAnd = Math.random() < 0.5
  const negatedVar = options.useOverlineNotation ? `\\overline{${var1}}` : `\\lnot ${var1}`

  return useAnd ? `${var1} \\land ${negatedVar}` : `${var1} \\lor ${negatedVar}`
}
