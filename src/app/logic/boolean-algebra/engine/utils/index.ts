/**
 * Utils Module
 *
 * This module exports utility functions used throughout the engine.
 */

/**
 * Sanitize boolean expressions to catch common issues
 * before they reach the parser
 */
export function sanitizeExpression(expression: string): string {
  // Check for 'undefined' or 'null' literals that would cause errors
  if (expression.includes('undefined') || expression.includes('null')) {
    throw new Error(
      'The expression contains invalid JavaScript values. Please use only valid Boolean variables (A-Z).'
    )
  }

  // Check for empty expressions
  if (!expression || expression.trim() === '') {
    throw new Error('Empty expression')
  }

  // Check for invalid AND operation patterns
  if (expression.includes('*  )') || expression.includes('*  ')) {
    throw new Error('Invalid AND operation: missing right operand')
  }

  if (expression.includes('(  *') || expression.includes('  *')) {
    throw new Error('Invalid AND operation: missing left operand')
  }

  return expression
}
