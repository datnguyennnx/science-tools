/**
 * Boolean Expression Generator - Main Module
 *
 * Main entry point for Boolean expression generation functionality.
 * Combines random and patterned generation with a clean API.
 */

import { generateRandomExpression, generatePatternedExpression } from './core'
import {
  OutputFormat,
  OperatorType,
  GeneratorOptions,
  ExpressionPattern,
  defaultGeneratorOptions,
} from './types'

// Re-export types for external usage
export type { OutputFormat, OperatorType, GeneratorOptions, ExpressionPattern }
export { defaultGeneratorOptions }

// Re-export core functions
export { generateRandomExpression, generatePatternedExpression }

// Convenience functions for specific formats
export function generateStandardExpression(
  complexity: number = 3,
  options: Omit<GeneratorOptions, 'outputFormat'> = {}
): string {
  return generateRandomExpression(complexity, { ...options, outputFormat: 'standard' })
}

export function generateLatexExpression(
  complexity: number = 3,
  options: Omit<GeneratorOptions, 'outputFormat'> = {}
): string {
  return generateRandomExpression(complexity, { ...options, outputFormat: 'latex' })
}

// Backward compatibility aliases
export const generateOverlineExpression = generateLatexExpression
