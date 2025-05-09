/**
 * Utilities Module
 *
 * This module exports common utility functions used throughout the boolean algebra engine.
 */

import { validateExpression } from '../parsing/utils/patterns'
import { getValidExpressionExamples } from '../parsing/parser'

// Re-export utilities for convenience
export { getValidExpressionExamples }

/**
 * Validate a boolean expression string
 */
export function validateBooleanExpression(expression: string) {
  return validateExpression(expression)
}
