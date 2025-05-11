/**
 * Input Processing Module
 *
 * This module handles the preprocessing of boolean expressions in different formats.
 */

import { InputFormat } from './types'
import { fixProblematicPatterns } from './utils/patterns'

// ===== STANDARD FORMAT HANDLERS =====

/**
 * Preprocess a standard boolean expression
 */
export function preprocessStandardInput(input: string, isInitialParse: boolean = true): string {
  // Removed early empty input check; fixProblematicPatterns will handle it.
  let processed = input.trim()
  // If trim results in an empty string, normalizeStandardOperators will return empty string
  // then fixProblematicPatterns will be called with empty string and throw.
  processed = normalizeStandardOperators(processed)
  processed = fixProblematicPatterns(processed)
  if (isInitialParse) {
    processed = addImplicitStandardOperators(processed)
  }
  return processed
}

/**
 * Add implicit operators for standard format.
 * This should run on a string that has keywords converted to symbols
 * and ideally after all whitespace is normalized/removed.
 */
function addImplicitStandardOperators(input: string): string {
  // Input should primarily consist of A-Z, 0, 1, *, +, !, (, )
  // No general whitespace should be left.
  let processed = input
  let previous = ''
  // Loop until no more changes are made to handle all chained implicit ops like A0B -> A*0*B
  while (previous !== processed) {
    previous = processed
    processed = processed
      .replace(/([A-Z01])([A-Z01])/g, '$1*$2') // XY -> X*Y (vars or constants)
      .replace(/([A-Z01])\(/g, '$1*(') // X( -> X*(
      .replace(/\)([A-Z01])/g, ')*$1') // )X -> )*X
      .replace(/\)\(/g, ')*(') // )( -> )*(
  }
  return processed
}

/**
 * Normalize operators to standard symbolic form (*, +, !).
 * Handles keywords case-insensitively.
 */
export function normalizeStandardOperators(input: string): string {
  let processed = input.trim() // Trim input at the beginning

  if (processed === '') {
    // Handle empty or whitespace-only input by returning empty string
    return ''
  }

  // Normalize NOT variants first (textual, symbolic, Unicode)
  // Case 1: NOT (expression) -> !(expression)
  processed = processed.replace(/\bNOT\b\s*\((.*?)\)/gi, '!($1)')
  // General NOT keyword (case-insensitive) to ! operator
  processed = processed.replace(/\bNOT\b/gi, '!')
  // Symbolic NOT: ~A -> !A
  processed = processed.replace(/~/g, '!')
  // Unicode NOT: ¬A -> !A
  processed = processed.replace(/¬/g, '!')

  // Normalize AND variants (textual, symbolic, Unicode)
  // Replace textual AND first
  processed = processed.replace(/\bAND\b/gi, '*')
  // Replace symbolic AND (&& before & to avoid issues)
  processed = processed.replace(/&&/g, '*')
  processed = processed.replace(/&/g, '*')
  // Unicode AND (∧∧ before ∧)
  processed = processed.replace(/∧∧/g, '*')
  processed = processed.replace(/∧/g, '*')
  processed = processed.replace(/·/g, '*') // Middle dot for AND, as per one of the tests

  // Normalize OR variants (textual, symbolic, Unicode)
  // Replace textual OR first
  processed = processed.replace(/\bOR\b/gi, '+')
  // Replace symbolic OR (|| before | to avoid issues)
  processed = processed.replace(/\|\|/g, '+') // Escaped pipe for regex
  processed = processed.replace(/\|/g, '+') // Escaped pipe for regex
  // Unicode OR (∨∨ before ∨)
  processed = processed.replace(/∨∨/g, '+')
  processed = processed.replace(/∨/g, '+')

  // Convert other keywords (XOR, NAND, NOR)
  processed = processed.replace(/\bXOR\b/gi, '^')
  processed = processed.replace(/\bNAND\b/gi, '@')
  processed = processed.replace(/\bNOR\b/gi, '#')
  processed = processed.replace(/\bXNOR\b/gi, '<=>') // Added XNOR

  // Remove all spaces around the final set of operators *, +, !, ^, @, #
  // This ensures expressions like "A * B" become "A*B"
  processed = processed.replace(/\s*\*\s*/g, '*')
  processed = processed.replace(/\s*\+\s*/g, '+')
  processed = processed.replace(/\s*!\s*/g, '!')
  processed = processed.replace(/\s*\^\s*/g, '^')
  processed = processed.replace(/\s*@\s*/g, '@')
  processed = processed.replace(/\s*#\s*/g, '#')
  processed = processed.replace(/\s*<=>\s*/g, '<=>') // Added XNOR

  // After all operator normalization and specific space removal around them,
  // remove any remaining whitespace globally to compact the expression.
  processed = processed.replace(/\s+/g, '')

  // The rule for "NOT followed by a single uppercase variable or 0/1"
  // `processed = processed.replace(/\bNOT\b\s+([A-Z01](?!\w))/gi, '!$1')`
  // is now covered by the general `processed.replace(/\bNOT\b/gi, '!')`
  // followed by space removal. E.g., "NOT A" -> "! A" -> "!A".

  // Simplification rules like !!A to A are part of the simplifier, not preprocessor.
  // The parser should correctly build NOT(NOT(A)) from "!!A".

  return processed
}

// ===== LATEX FORMAT HANDLERS =====

/**
 * Preprocess a LaTeX boolean expression
 */
export function preprocessLatexInput(input: string, isInitialParse: boolean = true): string {
  // Removed early empty input check; fixProblematicPatterns will handle it.
  let processed = input.trim()
  // If trim results in an empty string, spacing removal and normalizeLatexOperators might still produce empty,
  // then fixProblematicPatterns will be called with empty string and throw.

  // Remove LaTeX spacing commands first
  processed = processed.replace(
    /\\(?:[:;]|quad|qquad|smallspace|medspace|largespace|thinspace|negthinspace|thickspace)|~/g,
    ' '
  )

  processed = normalizeLatexOperators(processed) // This normalizes to standard ops, then calls normalizeStandardOperators
  processed = fixProblematicPatterns(processed)
  // Implicit operators for LaTeX are handled by addImplicitStandardOperators after LaTeX specific normalization.
  if (isInitialParse) {
    processed = addImplicitLatexOperators(processed) // addImplicitLatexOperators itself calls addImplicitStandardOperators
    // This might be redundant if normalizeLatexOperators already calls normalizeStandardOperators
    // Let's ensure addImplicitLatexOperators is also conditional or smart
  }
  return processed
}

/**
 * Add implicit operators for LaTeX format (delegates to standard after normalization)
 */
function addImplicitLatexOperators(input: string): string {
  // This function is called IF isInitialParse is true for LaTeX.
  // It should just call the standard one, as input is already normalized to standard symbols by normalizeLatexOperators.
  return addImplicitStandardOperators(input)
}

/**
 * Convert LaTeX operators to standard boolean operators (*, +, !).
 */
export function normalizeLatexOperators(input: string): string {
  // First, ensure we have spaces around LaTeX commands for easier processing
  let normalized = ' ' + input.replace(/\\/g, ' \\') + ' '

  // Handle LaTeX logical operators with proper spacing to avoid partial matches
  normalized = normalized.replace(/\\lnot\b/g, ' NOT ')
  normalized = normalized.replace(/\\neg\b/g, ' NOT ')
  normalized = normalized.replace(/\\land\b/g, ' AND ')
  normalized = normalized.replace(/\\wedge\b/g, ' AND ')
  normalized = normalized.replace(/\\lor\b/g, ' OR ')
  normalized = normalized.replace(/\\vee\b/g, ' OR ')

  // Handle Unicode mathematical operators
  normalized = normalized.replace(/∧/g, ' AND ')
  normalized = normalized.replace(/∨/g, ' OR ')
  normalized = normalized.replace(/¬/g, ' NOT ')

  // Handle \overline notation for NOT - the most complex case
  // First, replace all \overline{X} with NOT(X) where X can be any content
  let prevNormalized
  do {
    prevNormalized = normalized
    // Replace \overline{X} with NOT(X) - handle content with braces
    normalized = normalized.replace(/\\overline\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}/g, ' NOT($1) ')
    // Also handle simple case of \overline X (without braces)
    normalized = normalized.replace(/\\overline\s+([A-Za-z0-9])/g, ' NOT($1) ')
  } while (normalized !== prevNormalized) // Repeat until no more replacements

  // Textual constants
  normalized = normalized.replace(/\\text\s*{\s*(?:TRUE|T)\s*}/gi, '1')
  normalized = normalized.replace(/\\text\s*{\s*(?:FALSE|F)\s*}/gi, '0')

  // Normalize keywords to symbols and remove whitespace
  normalized = normalizeStandardOperators(normalized.trim())

  return normalized
}

// ===== MAIN INPUT PROCESSOR =====

/**
 * Main entry point - preprocess an input expression based on its format
 */
export function preprocessInput(
  input: string,
  format: InputFormat = 'standard',
  isInitialParse: boolean = true // New flag
): string {
  switch (format) {
    case 'latex':
      return preprocessLatexInput(input, isInitialParse) // Pass flag
    case 'standard':
    default:
      return preprocessStandardInput(input, isInitialParse) // Pass flag
  }
}

/**
 * Normalize operators for an input expression based on its format
 * (This function might be redundant if preprocessInput calls the normalizers directly)
 */
export function normalizeOperators(input: string, format: InputFormat = 'standard'): string {
  switch (format) {
    case 'latex':
      return normalizeLatexOperators(input)
    case 'standard':
    default:
      return normalizeStandardOperators(input)
  }
}
