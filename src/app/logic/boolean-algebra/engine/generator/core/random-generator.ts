/**
 * Random Expression Generator
 *
 * Core functionality for generating random Boolean expressions with configurable complexity.
 */

import { OutputFormat, OperatorType, GeneratorOptions, defaultGeneratorOptions } from '../types'
import { operatorSymbols } from '../symbols'

/**
 * Generate a random Boolean expression of given complexity
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

  // Validate and default output format
  const validFormats = Object.keys(operatorSymbols) as OutputFormat[]
  const outputFormat = validFormats.includes(config.outputFormat) ? config.outputFormat : 'standard'

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
      const notSymbol = getOperatorSymbol('NOT', outputFormat)
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
    const operationSymbol = getOperatorSymbol(randomOpType, outputFormat)

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

    // Determine if parentheses are needed (simplistic check, may need refinement)
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
      const notSymbol = getOperatorSymbol('NOT', outputFormat)
      return outputFormat === 'latex'
        ? `${notSymbol} ${expression}` // LaTeX usually uses prefix notation with space
        : `${notSymbol}(${expression})` // Standard uses functional notation
    }

    return expression
  }

  // Always force at least one operation in the expression if complexity > 0
  return generateTerm(complexity, complexity > 0 && allowedBinaryOperators.length > 0)
}
