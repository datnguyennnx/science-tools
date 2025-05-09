import { BooleanExpression } from '../../types/types'

/**
 * Recursively parse a boolean expression string into an expression tree
 */
export function parseExpression(input: string): BooleanExpression {
  // Base case: empty input
  if (!input) throw new Error('Empty expression')

  // Trim whitespace
  input = input.trim()

  // Trim any outer unnecessary parentheses
  input = removeOuterParentheses(input)

  // Case: Single variable
  if (/^[A-Z]$/.test(input)) {
    return { type: 'VARIABLE', value: input }
  }

  // Case: Constant
  if (input === '0' || input === '1') {
    return { type: 'CONSTANT', value: input === '1' }
  }

  // Case: NOT expression
  if (input.startsWith('!')) {
    // Extract the operand (maintaining parentheses if present)
    let operand = input.substring(1)

    // If the operand is empty after the ! symbol, this is a syntax error
    if (operand.trim() === '') {
      throw new Error('Empty negation operator (! with no operand)')
    }

    // If the operand starts with parentheses, handle it carefully
    if (operand.startsWith('(')) {
      let level = 1
      let i = 1

      // Find the matching closing parenthesis
      while (i < operand.length && level > 0) {
        if (operand[i] === '(') level++
        else if (operand[i] === ')') level--
        i++
      }

      // Safety check for mismatched parentheses
      if (level !== 0) {
        throw new Error('Mismatched parentheses in expression')
      }

      // If the whole operand is enclosed in parentheses, we can remove them
      if (i === operand.length) {
        operand = operand.substring(1, operand.length - 1)
      }
    }

    try {
      return {
        type: 'NOT',
        left: parseExpression(operand),
      }
    } catch (error) {
      // If we couldn't parse the operand, provide better context
      if (error instanceof Error) {
        throw new Error(`Invalid operand for negation (!): ${error.message}`)
      }
      throw error
    }
  }

  // Case: Binary operation (AND or OR)
  // Find the main operator with lowest precedence outside parentheses
  let level = 0
  let orIndex = -1
  let andIndex = -1

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (char === '(') level++
    else if (char === ')') level--
    else if (level === 0) {
      if (char === '+') {
        orIndex = i
        break // Found an OR operator at top level, which has lowest precedence
      } else if (char === '*' && andIndex === -1) {
        andIndex = i // Keep looking for an OR, but mark this AND location
      }
    }

    // Safety check for unbalanced parentheses
    if (level < 0) {
      throw new Error(`Unbalanced parentheses in expression: ${input}`)
    }
  }

  // Safety check for unbalanced parentheses at the end
  if (level !== 0) {
    throw new Error(`Unbalanced parentheses in expression: ${input}`)
  }

  // If we found an OR operator, split and parse recursively
  if (orIndex !== -1) {
    const left = input.substring(0, orIndex).trim()
    const right = input.substring(orIndex + 1).trim()

    if (!left || !right) {
      throw new Error(`Invalid OR operation: missing operand in '${input}'`)
    }

    try {
      return {
        type: 'OR',
        left: parseExpression(left),
        right: parseExpression(right),
      }
    } catch (error) {
      // Provide better context for nested errors
      if (error instanceof Error) {
        throw new Error(`Error in OR expression '${input}': ${error.message}`)
      }
      throw error
    }
  }

  // If we found an AND operator, split and parse recursively
  if (andIndex !== -1) {
    const left = input.substring(0, andIndex).trim()
    const right = input.substring(andIndex + 1).trim()

    if (!left) {
      throw new Error(`Invalid AND operation: missing left operand in '${input}'`)
    }

    if (!right) {
      throw new Error(`Invalid AND operation: missing right operand in '${input}'`)
    }

    try {
      return {
        type: 'AND',
        left: parseExpression(left),
        right: parseExpression(right),
      }
    } catch (error) {
      // Provide better context for nested errors
      if (error instanceof Error) {
        throw new Error(`Error in AND expression '${input}': ${error.message}`)
      }
      throw error
    }
  }

  // If we get here, it might be a parenthesized expression
  if (input.startsWith('(') && input.endsWith(')')) {
    const innerExpr = input.substring(1, input.length - 1).trim()
    if (!innerExpr) {
      // Handle empty parentheses () as constant false
      return { type: 'CONSTANT', value: false }
    }
    return parseExpression(innerExpr)
  }

  throw new Error(`Unable to parse expression: '${input}'`)
}

/**
 * Remove unnecessary outer parentheses from an expression
 */
export function removeOuterParentheses(input: string): string {
  // If the string doesn't start and end with parentheses, return it as is
  if (!input.startsWith('(') || !input.endsWith(')')) {
    return input
  }

  // Handle empty parentheses
  if (input === '()') {
    return input
  }

  // Check if the parentheses are matching outer parentheses
  let level = 0
  for (let i = 0; i < input.length - 1; i++) {
    if (input[i] === '(') level++
    else if (input[i] === ')') level--

    // If the level becomes 0 before the end, then the outer parentheses don't match
    if (level === 0 && i < input.length - 1) {
      return input
    }
  }

  // The outer parentheses are matching, so remove them and check again recursively
  return removeOuterParentheses(input.substring(1, input.length - 1))
}
