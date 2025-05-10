import { validateExpression as validateExpressionInternal } from '../parser/utils/patterns'

/**
 * Sanitize boolean expressions to catch common issues
 * before they reach the parser.
 * This is a preliminary check for glaring errors.
 */
export function sanitizeExpression(expression: string): string {
  // Check for 'undefined' or 'null' literals that would cause errors
  if (expression.includes('undefined') || expression.includes('null')) {
    throw new Error(
      'The expression contains invalid JavaScript values. Please use only valid Boolean variables (A-Z), constants (0/1), and operators.'
    )
  }

  // Check for empty expressions
  if (!expression || expression.trim() === '') {
    throw new Error('Empty expression. Input cannot be blank.')
  }

  // Normalize spacing to make processing more consistent for subsequent checks
  const processedExpression = expression.replace(/\s+/g, ' ').trim()

  // Check for invalid AND operation patterns (examples)
  // More comprehensive checks are in validateExpressionInternal
  if (processedExpression.includes('* )') || processedExpression.includes('*  ')) {
    // Note: checking for space after * before )
    throw new Error('Invalid AND operation: missing right operand near *. Example: A * B.')
  }

  if (processedExpression.includes('( *') || processedExpression.includes('  *')) {
    // Note: checking for space before * after (
    throw new Error('Invalid AND operation: missing left operand near *. Example: A * B.')
  }

  // Check for trailing operators
  if (processedExpression.match(/([*+!]\s*)$/)) {
    throw new Error(
      `Expression ends with an operator: "${processedExpression.match(/([*+!]\s*)$/)?.[0]}". Operators must be followed by operands. Example: A+B.`
    )
  }

  // Check for leading binary operators
  if (processedExpression.match(/^\s*([*+])/)) {
    throw new Error(
      `Expression starts with a binary operator: "${processedExpression.match(/^\s*([*+])/)?.[0]}". Binary operators must be preceded by operands. Example: A+B.`
    )
  }

  return expression // Return original expression if basic checks pass
}

/**
 * Validate a boolean expression string using the more comprehensive internal validator.
 */
export function validateBooleanExpression(expression: string): { valid: boolean; error?: string } {
  // First, perform initial sanitization
  try {
    sanitizeExpression(expression)
  } catch (e: unknown) {
    return { valid: false, error: e instanceof Error ? e.message : String(e) }
  }
  // Then, use the detailed internal validation logic
  return validateExpressionInternal(expression)
}
