import { BooleanExpression } from '../ast/types'
/**
 * Input format types supported by the parser
 */
export type InputFormat = 'standard' | 'latex'

/**
 * Parser options for customizing parsing behavior
 */
export interface ParserOptions {
  /**
   * The input format to expect
   */
  inputFormat?: InputFormat

  /**
   * Whether to automatically fix common errors in expressions
   */
  autoFix?: boolean

  /**
   * Whether to throw errors or return null on parse failure
   */
  silent?: boolean

  /**
   * Indicates if this is the first pass of parsing, to control certain preprocessing steps.
   * Defaults to true.
   */
  isInitialParse?: boolean
}

/**
 * Default parser options
 */
export const DEFAULT_PARSER_OPTIONS: ParserOptions = {
  inputFormat: 'standard',
  autoFix: true,
  silent: false,
  isInitialParse: true,
}

/**
 * Result of the parsing process
 */
export interface ParseResult {
  /**
   * The parsed expression tree
   */
  expression: BooleanExpression | null

  /**
   * Whether the parse was successful
   */
  success: boolean

  /**
   * Error message if parsing failed
   */
  error?: string | null

  /**
   * The input that was parsed (after preprocessing)
   */
  processedInput?: string
}
