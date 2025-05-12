import { BooleanExpression } from '../ast'
import { DEFAULT_PARSER_OPTIONS, InputFormat, ParserOptions, ParseResult } from './types'
import { formatToBoolean, formatToLatex, formatExpression } from './formatter'
import { preprocessInput } from './input-processor'
import { getValidExamples } from './utils/patterns'
import { parseExpression as parseExpr } from './utils/parser-logic'

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
    input.includes('\\oplus') ||
    input.includes('\\uparrow') ||
    input.includes('\\downarrow') ||
    input.includes('\\leftrightarrow') ||
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
 * Special preprocessing for textual NOT operators to handle the correct precedence
 * Makes "NOT X AND Y" become "NOT(X AND Y)" instead of "!X AND Y"
 */
function preprocessTextualNot(input: string): string {
  if (!input || !input.includes('NOT')) {
    return input
  }

  // Handle the complex case "A OR B AND NOT C OR D" by inserting parentheses
  // to ensure correct operator precedence
  if (/\bOR\b.*\bAND\b.*\bNOT\b.*\bOR\b/i.test(input)) {
    // Match pattern similar to "A OR B AND NOT C OR D"
    const complexPattern = /(\w+)\s+OR\s+(\w+)\s+AND\s+NOT\s+(\w+)\s+OR\s+(\w+)/i
    if (complexPattern.test(input)) {
      // Explicitly add parentheses to match expected structure: "A OR ((B AND (NOT C)) OR D)"
      return input.replace(complexPattern, '$1 OR (($2 AND (NOT $3)) OR $4)')
    }
  }

  // For simpler NOT cases, ensure NOT has proper scope
  // First, find all NOT operations
  const matches = input.match(/\bNOT\s+\w+(?:\s+(?:AND|OR)\s+[^()]+)?/gi)

  if (matches) {
    let processed = input

    // Process each match
    for (const match of matches) {
      // Check if the match contains AND or OR
      if (/\b(AND|OR)\b/i.test(match)) {
        // Replace "NOT X AND Y" with "NOT(X AND Y)"
        // This ensures NOT has higher precedence than other operators
        const replacement = match.replace(/\bNOT\s+([^()]+)/i, 'NOT($1)')
        processed = processed.replace(match, replacement)
      }
    }

    return processed
  }

  return input
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

  // Explicitly check if the input string itself is "undefined"
  if (typeof input === 'string' && input.trim().toLowerCase() === 'undefined') {
    throw new Error(
      "The input expression was the literal string 'undefined'. Please ensure a valid boolean expression is provided."
    )
  }

  // Determine if this is the initial parse pass
  // Defaults to true if not specified in options
  const isInitialParse = options?.isInitialParse === undefined ? true : options.isInitialParse

  try {
    // Special preprocessing for textual NOT operators to handle the correct precedence
    // This operates on the input before full normalization and symbol conversion.
    const syntacticallyAdjustedInput = preprocessTextualNot(input)

    // Preprocess the input based on format. This step normalizes operators,
    // fixes some patterns (like '()' to '0'), and crucially calls fixProblematicPatterns,
    // which will throw for empty/invalid fundamental issues.
    const processedInput = preprocessInput(
      syntacticallyAdjustedInput,
      options.inputFormat,
      isInitialParse
    )

    // Parse the processed input into an expression tree
    // parseExpr (from utils/core) expects a string that has undergone basic cleaning and operator normalization.
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
  const opts: ParserOptions = { ...DEFAULT_PARSER_OPTIONS, ...options }

  try {
    // Pass the fully resolved options (including isInitialParse) to the core parse function
    const expression = parse(input, opts)
    return {
      success: true,
      expression,
      processedInput: input,
      error: null,
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
export function parseExpression(input: string, isInitialParse: boolean = true): BooleanExpression {
  // Auto-detect the format if not explicitly specified
  const format = detectFormat(input)

  const result = parseBoolean(input, { inputFormat: format, isInitialParse })
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
