/**
 * Boolean Expression Generator
 *
 * This module provides utilities for generating random Boolean expressions
 * with configurable complexity and structure.
 */

/**
 * Output format for the generated expression
 */
export type OutputFormat = 'standard' | 'latex'

/**
 * Generate a random Boolean expression of given complexity
 * @param complexity Level of complexity (1-5)
 * @param options Configuration options for expression generation
 * @returns A random Boolean expression as a string using specified notation
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

  // Get the appropriate operators based on output format
  const operators = getOperators(config.outputFormat)

  // Helper function to get a simple term (variable or negated variable)
  const getSimpleTerm = (): string => {
    const variable = getRandomVar()
    if (Math.random() < config.negationProbability) {
      return config.outputFormat === 'latex'
        ? `${operators.not} ${variable}`
        : `${operators.not}(${variable})`
    }
    return variable
  }

  // Helper function to get a constant term (0 or 1)
  const getConstantTerm = (): string => {
    return Math.random() < 0.5 ? '1' : '0'
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
    const operation = Math.random() < config.andProbability ? operators.and : operators.or

    // Always get at least simple terms for both left and right
    let leftTerm = getSimpleTerm()
    let rightTerm = getSimpleTerm()

    // If we can go deeper, consider making terms more complex
    if (level > 1) {
      // For the left term, we can have a complex one with some probability
      if (Math.random() < config.nestedProbability) {
        leftTerm = generateTerm(level - 1, false)
      }

      // For the right term, similar logic but ensure it's different
      if (Math.random() < config.nestedProbability) {
        rightTerm = generateTerm(level - 1, false)
      }
    }

    // Ensure both terms are valid (not empty)
    if (!leftTerm || leftTerm.trim() === '') leftTerm = getSimpleTerm()
    if (!rightTerm || rightTerm.trim() === '') rightTerm = getSimpleTerm()

    // Check if we need parentheses - for LaTeX, always use them for clarity
    const needsParens =
      config.outputFormat === 'latex' ||
      leftTerm.includes(operators.and) ||
      leftTerm.includes(operators.or) ||
      rightTerm.includes(operators.and) ||
      rightTerm.includes(operators.or)

    const expression = needsParens
      ? `(${leftTerm} ${operation} ${rightTerm})`
      : `${leftTerm} ${operation} ${rightTerm}`

    // Add negation to the entire expression sometimes
    if (Math.random() < config.expressionNegationProbability) {
      return config.outputFormat === 'latex'
        ? `${operators.not} ${expression}`
        : `${operators.not}(${expression})`
    }

    return expression
  }

  // Always force at least one operation in the expression
  return generateTerm(complexity, true)
}

/**
 * Get the appropriate operators based on output format
 */
function getOperators(format: OutputFormat) {
  if (format === 'latex') {
    return {
      and: '\\land',
      or: '\\lor',
      not: '\\lnot',
    }
  }

  // Standard format
  return {
    and: '*',
    or: '+',
    not: '!',
  }
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
   * Output format for the expression (standard or latex)
   */
  outputFormat?: OutputFormat

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
  andProbability: 0.5,
  nestedProbability: 0.4,
  expressionNegationProbability: 0.2,
  includeConstants: false,
  constantProbability: 0.1,
  outputFormat: 'standard',
  useOverlineNotation: false,
}

/**
 * Generate expressions with standard notation
 * @param complexity Level of complexity (1-5)
 * @param options Additional configuration options
 * @returns A Boolean expression using standard notation
 */
export function generateStandardExpression(
  complexity: number = 3,
  options: Omit<GeneratorOptions, 'outputFormat'> = {}
): string {
  return generateRandomExpression(complexity, { ...options, outputFormat: 'standard' })
}

/**
 * Generate expressions with LaTeX notation
 * @param complexity Level of complexity (1-5)
 * @param options Additional configuration options
 * @returns A Boolean expression using LaTeX notation
 */
export function generateLatexExpression(
  complexity: number = 3,
  options: Omit<GeneratorOptions, 'outputFormat'> = {}
): string {
  return generateRandomExpression(complexity, { ...options, outputFormat: 'latex' })
}

/**
 * Generate an expression with a guaranteed specific form or pattern
 *
 * @param pattern The pattern type to generate
 * @returns A Boolean expression matching the specified pattern using standard notation
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

  // Get the appropriate operators
  const operators = getOperators(options.outputFormat)

  // Generate !(A + B) or !(A * B) which can be simplified using De Morgan's laws
  const useAnd = Math.random() < 0.5
  const operation = useAnd ? operators.and : operators.or

  return options.outputFormat === 'latex'
    ? `${operators.not} (${var1} ${operation} ${var2})`
    : `${operators.not}(${var1} ${operation} ${var2})`
}

function generateAbsorptionPattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]
  const var2 = variables[(variables.indexOf(var1) + 1) % variables.length]

  // Get the appropriate operators
  const operators = getOperators(options.outputFormat)

  // Generate A + (A * B) or A * (A + B) which can be simplified using absorption law
  const useOr = Math.random() < 0.5

  if (useOr) {
    return `${var1} ${operators.or} (${var1} ${operators.and} ${var2})`
  } else {
    return `${var1} ${operators.and} (${var1} ${operators.or} ${var2})`
  }
}

function generateIdempotentPattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]

  // Get the appropriate operators
  const operators = getOperators(options.outputFormat)

  // Generate A + A or A * A which can be simplified using idempotent law
  const useOr = Math.random() < 0.5
  return useOr ? `${var1} ${operators.or} ${var1}` : `${var1} ${operators.and} ${var1}`
}

function generateDistributivePattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]
  const var2 = variables[(variables.indexOf(var1) + 1) % variables.length]
  const var3 = variables[(variables.indexOf(var2) + 1) % variables.length]

  // Get the appropriate operators
  const operators = getOperators(options.outputFormat)

  // Generate A * (B + C) or A + (B * C) which demonstrates distributive law
  const useAnd = Math.random() < 0.5

  if (useAnd) {
    return `${var1} ${operators.and} (${var2} ${operators.or} ${var3})`
  } else {
    return `${var1} ${operators.or} (${var2} ${operators.and} ${var3})`
  }
}

function generateComplementPattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]

  // Get the appropriate operators
  const operators = getOperators(options.outputFormat)

  // Generate A * !A or A + !A which demonstrates complement law
  const useAnd = Math.random() < 0.5

  const negatedVar =
    options.outputFormat === 'latex' ? `${operators.not} ${var1}` : `${operators.not}(${var1})`

  return useAnd ? `${var1} ${operators.and} ${negatedVar}` : `${var1} ${operators.or} ${negatedVar}`
}

/**
 * @deprecated Use generateLatexExpression instead
 */
export function generateOverlineExpression(
  complexity: number = 3,
  options: Omit<GeneratorOptions, 'useOverlineNotation'> = {}
): string {
  return generateRandomExpression(complexity, options)
}
