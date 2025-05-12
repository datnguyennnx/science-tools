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
 * Available operator types for generation
 */
export type OperatorType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'XNOR'

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

  // --- Validate and default output format ---
  const validFormats = Object.keys(operatorSymbols) as OutputFormat[]
  const outputFormat = validFormats.includes(config.outputFormat) ? config.outputFormat : 'standard' // Default to standard if invalid
  // --- End validation ---

  // Variables to use
  const variables = config.availableVariables

  // Limit variables according to complexity
  const variableLimit = Math.min(2 + complexity, variables.length)
  const availableVars = variables.slice(0, variableLimit)

  // Filter available binary operators based on config
  const allowedBinaryOperators = config.allowedOperators.filter(op => op !== 'NOT') as Exclude<
    OperatorType,
    'NOT'
  >[]
  const canNegate = config.allowedOperators.includes('NOT')

  // Helper function to get a random variable
  const getRandomVar = () => availableVars[Math.floor(Math.random() * availableVars.length)]

  // Get the appropriate operators based on output format
  const getOperatorSymbol = (op: OperatorType, format: OutputFormat) => {
    const symbols = operatorSymbols[format]
    return symbols[op]
  }

  // Helper function to get a simple term (variable or negated variable)
  const getSimpleTerm = (): string => {
    const variable = getRandomVar()
    if (canNegate && Math.random() < config.negationProbability) {
      const notSymbol = getOperatorSymbol('NOT', outputFormat) // Use validated outputFormat
      return outputFormat === 'latex'
        ? `${notSymbol} ${variable}` // LaTeX usually uses prefix notation with space
        : `${notSymbol}(${variable})` // Standard uses functional notation
    }
    return variable
  }

  // Helper function to get a constant term (0 or 1)
  const getConstantTerm = (): string => {
    return Math.random() < 0.5 ? '1' : '0'
  }

  // Random operations based on complexity
  const generateTerm = (level: number, forceOperation: boolean = false): string => {
    // Base case: If at lowest level and not forced, return a simple term or constant
    if (level <= 1 && !forceOperation) {
      if (config.includeConstants && Math.random() < config.constantProbability) {
        return getConstantTerm()
      }
      return getSimpleTerm()
    }

    // Ensure there are binary operators allowed to make an operation
    if (allowedBinaryOperators.length === 0) {
      // If no binary operators allowed, fallback to simple term/constant
      if (config.includeConstants && Math.random() < config.constantProbability) {
        return getConstantTerm()
      }
      return getSimpleTerm()
    }

    // Decide which *allowed* binary operation to use
    const randomOpType =
      allowedBinaryOperators[Math.floor(Math.random() * allowedBinaryOperators.length)]
    const operationSymbol = getOperatorSymbol(randomOpType, outputFormat) // Use validated outputFormat

    // Generate operands
    let leftTerm = getSimpleTerm() // Start with simple terms
    let rightTerm = getSimpleTerm()

    // If we can go deeper, consider making terms more complex
    if (level > 1) {
      if (Math.random() < config.nestedProbability) {
        leftTerm = generateTerm(level - 1, false) // Recursive call
      }
      if (Math.random() < config.nestedProbability) {
        rightTerm = generateTerm(level - 1, false) // Recursive call
      }
    }

    // Ensure both terms are valid (not empty) - Redundant check, should be handled by base cases
    // if (!leftTerm || leftTerm.trim() === '') leftTerm = getSimpleTerm();
    // if (!rightTerm || rightTerm.trim() === '') rightTerm = getSimpleTerm();

    // Determine if parentheses are needed (simplistic check, may need refinement)
    // For LaTeX, often desirable for clarity, especially with mixed operators.
    // Standard notation often relies on precedence, but parentheses help avoid ambiguity.
    const needsParens =
      outputFormat === 'latex' || // Use validated outputFormat
      level > 1 || // Add parens for nested expressions
      leftTerm.includes(' ') || // Basic check if terms themselves contain operators
      rightTerm.includes(' ')

    const expression = needsParens
      ? `(${leftTerm} ${operationSymbol} ${rightTerm})`
      : `${leftTerm} ${operationSymbol} ${rightTerm}`

    // Add negation to the entire expression sometimes, if NOT is allowed
    if (canNegate && Math.random() < config.expressionNegationProbability) {
      const notSymbol = getOperatorSymbol('NOT', outputFormat) // Use validated outputFormat
      return outputFormat === 'latex'
        ? `${notSymbol} ${expression}` // LaTeX usually uses prefix notation with space
        : `${notSymbol}(${expression})` // Standard uses functional notation
    }

    return expression
  }
  // Always force at least one operation in the expression if complexity > 0
  return generateTerm(complexity, complexity > 0 && allowedBinaryOperators.length > 0)
}

/**
 * Mapping of operator types to their string representations for each format.
 */
const operatorSymbols: Record<OutputFormat, Record<OperatorType, string>> = {
  standard: {
    AND: '*',
    OR: '+',
    NOT: '!',
    XOR: '^',
    NAND: '@', // Assuming '@' for NAND
    NOR: '#', // Assuming '#' for NOR
    XNOR: '<=>', // Assuming '<=>' for XNOR
  },
  latex: {
    AND: '\\land',
    OR: '\\lor',
    NOT: '\\lnot',
    XOR: '\\oplus',
    NAND: '\\uparrow',
    NOR: '\\downarrow',
    XNOR: '\\leftrightarrow',
  },
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
   * Probability of using AND vs OR (0-1) - Deprecated in favor of allowedOperators
   * @deprecated Use allowedOperators instead. This property has no effect.
   */
  andProbability?: number // Kept for backward compatibility signature but not used

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
  andProbability: 0.5, // Kept for signature compatibility, but not used in new logic
  nestedProbability: 0.4,
  expressionNegationProbability: 0.2,
  includeConstants: false,
  constantProbability: 0.1,
  outputFormat: 'standard',
  allowedOperators: ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'], // Default to all
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

  // --- Validate and default output format ---
  const validFormats = Object.keys(operatorSymbols) as OutputFormat[]
  const outputFormat = validFormats.includes(options.outputFormat)
    ? options.outputFormat
    : 'standard'
  // --- End validation ---

  // Get the appropriate operators based on config and allowed operators
  const allowedBinary = options.allowedOperators.filter(op => op !== 'NOT') as Exclude<
    OperatorType,
    'NOT'
  >[]
  const canNegate = options.allowedOperators.includes('NOT')
  const getSym = (op: OperatorType) => operatorSymbols[outputFormat][op] // Use validated outputFormat

  if (!canNegate || allowedBinary.length < 1) {
    // Cannot form DeMorgan pattern without NOT and at least one binary op
    return generateRandomExpression(2, options) // fallback
  }

  // Ensure we use AND or OR if available, otherwise pick random allowed binary op
  const useAnd =
    options.allowedOperators.includes('AND') &&
    (!options.allowedOperators.includes('OR') || Math.random() < 0.5)
  const opType: Exclude<OperatorType, 'NOT'> = useAnd
    ? 'AND'
    : options.allowedOperators.includes('OR')
      ? 'OR'
      : allowedBinary[0] // Fallback to first allowed if AND/OR not available

  const operationSymbol = getSym(opType)
  const notSymbol = getSym('NOT')

  return outputFormat === 'latex'
    ? `${notSymbol} (${var1} ${operationSymbol} ${var2})`
    : `${notSymbol}(${var1} ${operationSymbol} ${var2})`
}

function generateAbsorptionPattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]
  const var2 = variables[(variables.indexOf(var1) + 1) % variables.length]

  // --- Validate and default output format ---
  const validFormats = Object.keys(operatorSymbols) as OutputFormat[]
  const outputFormat = validFormats.includes(options.outputFormat)
    ? options.outputFormat
    : 'standard'
  // --- End validation ---

  // Get the appropriate operators based on config and allowed operators
  const getSym = (op: OperatorType) => operatorSymbols[outputFormat][op] // Use validated outputFormat
  const canUseAnd = options.allowedOperators.includes('AND')
  const canUseOr = options.allowedOperators.includes('OR')

  if (!canUseAnd || !canUseOr) {
    // Cannot form Absorption pattern without both AND and OR
    return generateRandomExpression(2, options) // fallback
  }

  const andSym = getSym('AND')
  const orSym = getSym('OR')

  // Generate A + (A * B) or A * (A + B) which can be simplified using absorption law
  const useOrForm = Math.random() < 0.5 // Determines if it's A + (A*B) form

  if (useOrForm) {
    return `${var1} ${orSym} (${var1} ${andSym} ${var2})`
  } else {
    return `${var1} ${andSym} (${var1} ${orSym} ${var2})`
  }
}

function generateIdempotentPattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]

  // --- Validate and default output format ---
  const validFormats = Object.keys(operatorSymbols) as OutputFormat[]
  const outputFormat = validFormats.includes(options.outputFormat)
    ? options.outputFormat
    : 'standard'
  // --- End validation ---

  // Get the appropriate operators based on config and allowed operators
  const allowedBinary = options.allowedOperators.filter(op => op !== 'NOT') as Exclude<
    OperatorType,
    'NOT'
  >[]
  const getSym = (op: OperatorType) => operatorSymbols[outputFormat][op] // Use validated outputFormat

  if (allowedBinary.length < 1) {
    // Need at least one binary op
    return generateRandomExpression(1, options) // fallback
  }

  // Prefer AND or OR if available
  const canUseAnd = options.allowedOperators.includes('AND')
  const canUseOr = options.allowedOperators.includes('OR')
  const useOr = canUseOr && (!canUseAnd || Math.random() < 0.5)

  const opType: Exclude<OperatorType, 'NOT'> = useOr ? 'OR' : canUseAnd ? 'AND' : allowedBinary[0] // Fallback if AND/OR not available

  const opSymbol = getSym(opType)
  return `${var1} ${opSymbol} ${var1}`
}

function generateDistributivePattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]
  const var2 = variables[(variables.indexOf(var1) + 1) % variables.length]
  const var3 = variables[(variables.indexOf(var2) + 1) % variables.length]

  // --- Validate and default output format ---
  const validFormats = Object.keys(operatorSymbols) as OutputFormat[]
  const outputFormat = validFormats.includes(options.outputFormat)
    ? options.outputFormat
    : 'standard'
  // --- End validation ---

  // Get the appropriate operators based on config and allowed operators
  const getSym = (op: OperatorType) => operatorSymbols[outputFormat][op] // Use validated outputFormat
  const canUseAnd = options.allowedOperators.includes('AND')
  const canUseOr = options.allowedOperators.includes('OR')

  if (!canUseAnd || !canUseOr) {
    // Need both AND and OR
    return generateRandomExpression(3, options) // fallback
  }

  const andSym = getSym('AND')
  const orSym = getSym('OR')

  // Generate A * (B + C) or A + (B * C) which demonstrates distributive law
  const useAndOutside = Math.random() < 0.5

  if (useAndOutside) {
    return `${var1} ${andSym} (${var2} ${orSym} ${var3})`
  } else {
    return `${var1} ${orSym} (${var2} ${andSym} ${var3})`
  }
}

function generateComplementPattern(options: Required<GeneratorOptions>): string {
  const variables = options.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]

  // --- Validate and default output format ---
  const validFormats = Object.keys(operatorSymbols) as OutputFormat[]
  const outputFormat = validFormats.includes(options.outputFormat)
    ? options.outputFormat
    : 'standard'
  // --- End validation ---

  // Get the appropriate operators based on config and allowed operators
  const allowedBinary = options.allowedOperators.filter(op => op !== 'NOT') as Exclude<
    OperatorType,
    'NOT'
  >[]
  const canNegate = options.allowedOperators.includes('NOT')
  const getSym = (op: OperatorType) => operatorSymbols[outputFormat][op] // Use validated outputFormat

  if (!canNegate || allowedBinary.length < 1) {
    // Need NOT and at least one binary op
    return generateRandomExpression(1, options) // fallback
  }

  const notSymbol = getSym('NOT')
  // Prefer AND or OR if available
  const canUseAnd = options.allowedOperators.includes('AND')
  const canUseOr = options.allowedOperators.includes('OR')
  const useAnd = canUseAnd && (!canUseOr || Math.random() < 0.5)

  const opType: Exclude<OperatorType, 'NOT'> = useAnd ? 'AND' : canUseOr ? 'OR' : allowedBinary[0] // Fallback if AND/OR not available
  const opSymbol = getSym(opType)

  const negatedVar = outputFormat === 'latex' ? `${notSymbol} ${var1}` : `${notSymbol}(${var1})`

  return `${var1} ${opSymbol} ${negatedVar}`
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
