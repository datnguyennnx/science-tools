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
export function preprocessStandardInput(input: string): string {
  // Trim whitespace
  let processed = input.trim()

  // Normalize operators
  processed = normalizeStandardOperators(processed)

  // Fix any problematic patterns
  processed = fixProblematicPatterns(processed)

  // Handle implicit operators
  processed = addImplicitStandardOperators(processed)

  return processed
}

/**
 * Add implicit operators for standard format
 */
function addImplicitStandardOperators(input: string): string {
  return input
    .replace(/([A-Z0-9])([A-Z])/g, '$1*$2') // Add implicit AND: AB → A*B or 1A → 1*A
    .replace(/([A-Z0-9])\(/g, '$1*(') // Add implicit AND: A( → A*(
    .replace(/\)([A-Z0-9])/g, ')*$1') // Add implicit AND: )A → )*A
    .replace(/\)\(/g, ')*(') // Add implicit AND: )( → )*(
}

/**
 * Normalize operators to standard form
 */
export function normalizeStandardOperators(input: string): string {
  return input
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/[&∧·]/g, '*') // Replace alternate AND symbols
    .replace(/[|∨+]/g, '+') // Replace alternate OR symbols
    .replace(/[~¬]/g, '!') // Replace alternate NOT symbols
}

// ===== LATEX FORMAT HANDLERS =====

/**
 * Preprocess a LaTeX boolean expression
 */
export function preprocessLatexInput(input: string): string {
  // Trim whitespace
  let processed = input.trim()

  // Handle LaTeX spacing commands
  processed = processed.replace(/\\:/g, ' ').replace(/\\;/g, ' ').replace(/~/, ' ')

  // Convert LaTeX operators to standard operators
  processed = normalizeLatexOperators(processed)

  // Fix any problematic patterns
  processed = fixProblematicPatterns(processed)

  // Handle implicit operators
  processed = addImplicitLatexOperators(processed)

  return processed
}

/**
 * Add implicit operators for LaTeX format
 */
function addImplicitLatexOperators(input: string): string {
  return input
    .replace(/([A-Z])([A-Z])/g, '$1*$2') // Add implicit AND: AB → A*B
    .replace(/([A-Z])\(/g, '$1*(') // Add implicit AND: A( → A*(
    .replace(/\)([A-Z])/g, ')*$1') // Add implicit AND: )A → )*A
    .replace(/\)\(/g, ')*(') // Add implicit AND: )( → )*(
}

/**
 * Convert LaTeX operators to standard boolean operators
 */
export function normalizeLatexOperators(input: string): string {
  // First replace any spaces around LaTeX commands to ensure proper detection
  let normalized = input.replace(/\s*(\\[a-z]+)\s*/g, '$1')

  normalized = normalized
    // Handle LaTeX operators with various spacing patterns
    .replace(/\\overline\s*{([^}]*)}/g, '!($1)') // \overline{X} → !(X)
    .replace(/\\overline\s*(\w)/g, '!$1') // \overline X → !X

    // Handle LaTeX logical operators with various formats
    .replace(/\\lnot\s*{([^}]*)}/g, '!($1)') // \lnot{X} → !(X)
    .replace(/\\lnot\s*([A-Za-z0-9()]+)/g, '!$1') // \lnot X → !X
    .replace(/\\neg\s*{([^}]*)}/g, '!($1)') // \neg{X} → !(X)
    .replace(/\\neg\s*([A-Za-z0-9()]+)/g, '!$1') // \neg X → !X

    // Handle various LaTeX AND operators
    .replace(/\\land/g, '*') // \land → *
    .replace(/\\wedge/g, '*') // \wedge → *

    // Handle various LaTeX OR operators
    .replace(/\\lor/g, '+') // \lor → +
    .replace(/\\vee/g, '+') // \vee → +

    // Handle LaTeX text commands for constants
    .replace(/\\text{[FfAaLlSsEe]}/g, '0') // \text{F} → 0
    .replace(/\\text{[TtRrUuEe]}/g, '1') // \text{T} → 1

    // Handle Unicode and alternative symbols
    .replace(/[vV∨]/g, '+') // v, V, ∨ → +
    .replace(/[·∧&]/g, '*') // ·, ∧, & → *
    .replace(/[¬~]/g, '!') // ¬, ~ → !

    // Basic cleanup
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/\\lnot/g, '!') // Catch any remaining \lnot
    .replace(/\\neg/g, '!') // Catch any remaining \neg

  // Check for any remaining LaTeX commands that we didn't handle
  const remainingLatex = normalized.match(/\\[a-zA-Z]+/g)
  if (remainingLatex) {
    throw new Error(`Unsupported LaTeX command: ${remainingLatex[0]}`)
  }

  return normalized
}

// ===== MAIN INPUT PROCESSOR =====

/**
 * Main entry point - preprocess an input expression based on its format
 */
export function preprocessInput(input: string, format: InputFormat = 'standard'): string {
  switch (format) {
    case 'latex':
      return preprocessLatexInput(input)
    case 'standard':
    default:
      return preprocessStandardInput(input)
  }
}

/**
 * Normalize operators for an input expression based on its format
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
