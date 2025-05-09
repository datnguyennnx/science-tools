import { BooleanExpression } from '../types/types'
import { DEFAULT_PARSER_OPTIONS, InputFormat, ParserOptions, ParseResult } from './types'
import { formatToBoolean, formatToLatex, formatExpression } from './formatters'
import { preprocessInput } from './inputs'
import { validateExpression, getValidExamples } from './utils/patterns'
import { parseExpression as parseExpr } from './utils/core'

// ---- Core Parsing Functions ----

/**
 * Auto-detect the format of an expression string
 */
export function detectFormat(input: string): InputFormat {
  // Check for common LaTeX markers
  if (
    // LaTeX operators with backslash
    input.includes('\\lor') ||
    input.includes('\\land') ||
    input.includes('\\lnot') ||
    input.includes('\\vee') ||
    input.includes('\\wedge') ||
    input.includes('\\neg') ||
    // Unicode symbols commonly used in LaTeX
    input.includes('∨') ||
    input.includes('∧') ||
    input.includes('¬') ||
    // LaTeX overline notation
    input.includes('\\overline')
  ) {
    return 'latex'
  }

  // Default to standard notation
  return 'standard'
}

/**
 * Parse a Boolean expression string into an expression tree
 */
export function parse(input: string, options?: Partial<ParserOptions>): BooleanExpression {
  // Auto-detect format if not specified
  if (!options?.inputFormat) {
    const detectedFormat = detectFormat(input)
    options = { ...options, inputFormat: detectedFormat }
  }

  try {
    // Check for empty or invalid input
    if (!input || input.trim() === '') {
      throw new Error('Empty expression')
    }

    // Preprocess the input based on format
    const processedInput = preprocessInput(input, options.inputFormat)

    // Validate the processed input
    const validationResult = validateExpression(processedInput)
    if (!validationResult.valid) {
      throw new Error(validationResult.error || 'Invalid expression')
    }

    // Parse the processed input into an expression tree
    return parseExpr(processedInput)
  } catch (error) {
    // Create a more specific error message for better debugging
    const format = options?.inputFormat || 'auto-detected'
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Add examples if not already included
    let enhancedError = errorMessage
    if (!errorMessage.includes('Examples')) {
      const examples = getValidExamples().slice(0, 3).join(', ')
      enhancedError += `. Examples of valid expressions: ${examples}`
    }

    throw new Error(`Failed to parse ${format} expression: ${enhancedError}`)
  }
}

/**
 * Convert a Boolean expression tree to standard notation
 */
export function toBooleanString(expr: BooleanExpression): string {
  return formatToBoolean(expr)
}

/**
 * Convert a Boolean expression tree to LaTeX notation
 */
export function toLatexString(expr: BooleanExpression): string {
  return formatToLatex(expr)
}

// ---- Enhanced API Functions ----

/**
 * Extended parse function that returns a ParseResult
 */
export function parseBoolean(input: string, options: Partial<ParserOptions> = {}): ParseResult {
  const opts = { ...DEFAULT_PARSER_OPTIONS, ...options }

  try {
    const expression = parse(input, opts)
    return {
      success: true,
      expression,
      processedInput: input,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to parse expression'

    // Return error result
    return {
      success: false,
      expression: null,
      error: errorMessage,
    }
  }
}

/**
 * Main parse function that converts a string expression into a BooleanExpression tree
 */
export function parseExpression(input: string): BooleanExpression {
  const result = parseBoolean(input)
  if (!result.success || !result.expression) {
    throw new Error(result.error || 'Failed to parse expression')
  }
  return result.expression
}

/**
 * Provides examples of valid boolean expressions
 */
export function getValidExpressionExamples(): string[] {
  return getValidExamples()
}

/**
 * Convert a BooleanExpression tree to a standardized boolean string representation
 */
export function expressionToBooleanString(expr: BooleanExpression): string {
  return formatToBoolean(expr)
}

/**
 * Convert a BooleanExpression tree to a LaTeX string representation
 */
export function expressionToLatexString(expr: BooleanExpression): string {
  return formatToLatex(expr)
}

/**
 * Formats a boolean expression tree to a string in the specified format
 */
export function formatBooleanExpression(
  expr: BooleanExpression,
  outputFormat: InputFormat = 'standard'
): string {
  return formatExpression(expr, outputFormat)
}
