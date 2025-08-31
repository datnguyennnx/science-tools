import { BooleanExpression } from '../ast/types'
import { DEFAULT_PARSER_OPTIONS, InputFormat, ParserOptions, ParseResult } from './types'
import { formatToBoolean, formatToLatex, formatExpression } from './formatter'
import { preprocessInput } from './processor'
import { getValidExamples } from './utils/patterns'
import { parseExpression as parseExpr } from './utils/implementation'

// Parser cache for performance optimization
const PARSER_CACHE_SIZE = 500
const parserCache = new Map<string, BooleanExpression>()
const parserCacheKeys: string[] = []

/**
 * Add to parser cache with LRU eviction
 */
function addToParserCache(key: string, value: BooleanExpression): void {
  if (parserCache.size >= PARSER_CACHE_SIZE) {
    const oldestKey = parserCacheKeys.shift()
    if (oldestKey) {
      parserCache.delete(oldestKey)
    }
  }
  parserCache.set(key, value)
  parserCacheKeys.push(key)
}

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
    input.includes('\\overline') ||
    // General LaTeX pattern: backslash followed by letters
    /\\[a-zA-Z]+/.test(input)
  ) {
    return 'latex'
  }

  // Default to standard notation
  return 'standard'
}

/**
 * Preprocess textual NOT operators to ensure correct precedence
 */
const preprocessTextualNot = (input: string): string =>
  !input || !input.includes('NOT')
    ? input
    : input.replace(/\bNOT\s+([^()]+(?=\s+(?:AND|OR)))/gi, 'NOT($1)')

/**
 * Validates input and throws appropriate errors
 */
const validateInput = (input: string): void => {
  if (typeof input === 'string' && input.trim().toLowerCase() === 'undefined') {
    throw new Error(
      "The input expression was the literal string 'undefined'. Please ensure a valid boolean expression is provided."
    )
  }
}

/**
 * Enhances error messages with examples and context
 */
const enhanceErrorMessage = (error: unknown): string => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  return errorMessage.includes('Examples')
    ? errorMessage
    : `${errorMessage}. Examples of valid expressions: ${getValidExamples().slice(0, 3).join(', ')}`
}

/**
 * Preprocesses input through all necessary transformations
 */
const preprocessAndParse = (
  input: string,
  options: ParserOptions,
  isInitialParse: boolean
): BooleanExpression => {
  // Special preprocessing for textual NOT operators
  const syntacticallyAdjustedInput = preprocessTextualNot(input)

  // Preprocess the input based on format
  const processedInput = preprocessInput(
    syntacticallyAdjustedInput,
    options.inputFormat,
    isInitialParse
  )

  // Parse the processed input into an expression tree
  return parseExpr(processedInput)
}

/**
 * Parse a Boolean expression string into an expression tree with caching
 */
export function parse(input: string, options?: Partial<ParserOptions>): BooleanExpression {
  // Create cache key based on input and options
  const resolvedOptions = resolveParserOptions(input, options)
  const cacheKey = `${input}|${resolvedOptions.inputFormat}|${resolvedOptions.isInitialParse}`

  // Check cache first
  const cached = parserCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Validate input
  validateInput(input)

  const isInitialParse = options?.isInitialParse ?? true

  try {
    const result = preprocessAndParse(input, resolvedOptions, isInitialParse)
    addToParserCache(cacheKey, result)
    return result
  } catch (error) {
    const format = resolvedOptions.inputFormat || 'unknown'
    const enhancedError = enhanceErrorMessage(error)
    throw new Error(`Failed to parse ${format} expression: ${enhancedError}`)
  }
}

/**
 * Resolves parser options with auto-detection
 */
const resolveParserOptions = (input: string, options?: Partial<ParserOptions>): ParserOptions => {
  if (!options?.inputFormat) {
    return { ...DEFAULT_PARSER_OPTIONS, ...options, inputFormat: detectFormat(input) }
  }
  return { ...DEFAULT_PARSER_OPTIONS, ...options }
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
  // Don't include inputFormat from defaults if not explicitly provided - let auto-detection work
  const defaultOpts = options.inputFormat
    ? DEFAULT_PARSER_OPTIONS
    : { ...DEFAULT_PARSER_OPTIONS, inputFormat: undefined }
  const opts: ParserOptions = { ...defaultOpts, ...options }

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
