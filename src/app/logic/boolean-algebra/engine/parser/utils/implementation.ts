/**
 * Parser Implementation
 *
 * Core boolean expression parser using recursive descent with operator precedence.
 * Implements proper boolean algebra operator precedence rules.
 */

import { BooleanExpression } from '../../ast/types'

/**
 * Token representation for the parser
 */
interface Token {
  type: 'VARIABLE' | 'CONSTANT' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'EOF'
  value?: string | boolean | null
}

/**
 * Tokenize boolean expression string into parser tokens
 * Removes whitespace and converts input string to a sequence of tokens
 */
function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  const sanitizedInput = input.replace(/\s+/g, '') // Remove all whitespace

  let i = 0
  while (i < sanitizedInput.length) {
    const char = sanitizedInput[i]
    const nextChar = sanitizedInput[i + 1]
    const thirdChar = sanitizedInput[i + 2]

    switch (char) {
      case '(':
        tokens.push({ type: 'LPAREN' })
        i++
        break
      case ')':
        tokens.push({ type: 'RPAREN' })
        i++
        break
      case '!':
        tokens.push({ type: 'OPERATOR', value: '!' })
        i++
        break
      case '*':
        tokens.push({ type: 'OPERATOR', value: '*' })
        i++
        break
      case '+':
        tokens.push({ type: 'OPERATOR', value: '+' })
        i++
        break
      case '^':
        tokens.push({ type: 'OPERATOR', value: '^' })
        i++
        break
      case '@':
        tokens.push({ type: 'OPERATOR', value: '@' })
        i++
        break
      case '#':
        tokens.push({ type: 'OPERATOR', value: '#' })
        i++
        break
      default:
        // Handle multi-character operators
        if (char === '<' && nextChar === '=' && thirdChar === '>') {
          tokens.push({ type: 'OPERATOR', value: '<=>' })
          i += 3
        } else if (char === '0') {
          tokens.push({ type: 'CONSTANT', value: false })
          i++
        } else if (char === '1') {
          tokens.push({ type: 'CONSTANT', value: true })
          i++
        } else if (/[A-Z]/.test(char)) {
          tokens.push({ type: 'VARIABLE', value: char })
          i++
        } else {
          throw new Error(`Unexpected character during tokenization: ${char}`)
        }
    }
  }

  tokens.push({ type: 'EOF' })
  return tokens
}

// Parser state - maintained for current token stream processing
let currentTokens: Token[] = []
let currentTokenIndex = 0

/**
 * Get the current token without advancing the parser position
 */
function current(): Token {
  if (currentTokenIndex >= currentTokens.length) {
    return { type: 'EOF' }
  }
  return currentTokens[currentTokenIndex]
}

/**
 * Consume and return the current token, advancing the parser position
 * Optionally validates token type and value before consuming
 */
function consume(expectedType?: Token['type'], expectedValue?: string | boolean): Token {
  if (currentTokenIndex >= currentTokens.length) {
    throw new Error('Attempted to consume past EOF')
  }
  const token = currentTokens[currentTokenIndex]

  // Validate token type if expected
  if (expectedType && token.type !== expectedType) {
    throw new Error(
      `Unexpected token type: expected ${expectedType} but got ${token.type} (value: ${token.value ?? 'N/A'}) near index ${currentTokenIndex}`
    )
  }

  // Validate token value if expected
  if (expectedValue !== undefined && token.value !== expectedValue) {
    throw new Error(
      `Unexpected token value: expected ${expectedValue} but got ${token.value} (type: ${token.type}) near index ${currentTokenIndex}`
    )
  }

  currentTokenIndex++
  return token
}

/**
 * Parse primary expressions (highest precedence)
 * Handles: variables, constants, and parenthesized expressions
 */
function parsePrimary(): BooleanExpression {
  const token = current()

  switch (token.type) {
    case 'VARIABLE':
      consume('VARIABLE')
      return { type: 'VARIABLE', value: token.value as string }

    case 'CONSTANT':
      consume('CONSTANT')
      return { type: 'CONSTANT', value: token.value as boolean }

    case 'LPAREN':
      consume('LPAREN')
      const expr = parseSum() // Parse full expression within parentheses
      consume('RPAREN')
      return expr

    default:
      throw new Error(
        `Unexpected token in primary expression: ${token.type} with value ${token.value ?? '[no value]'}. Expected variable, constant, or left parenthesis.`
      )
  }
}

/**
 * Parse unary NOT expressions
 * Handles: !expression and chained NOT operations like !!A
 */
function parseUnary(): BooleanExpression {
  if (current().type === 'OPERATOR' && current().value === '!') {
    consume('OPERATOR', '!')
    const operand = parseUnary() // Right-associative for chained NOT
    return { type: 'NOT', left: operand }
  }
  return parsePrimary()
}

/**
 * Parse AND/NAND expressions (left-associative)
 * Precedence: higher than OR but lower than NOT
 * Handles: expr * expr and expr @ expr
 */
function parseAndTerm(): BooleanExpression {
  let left = parseUnary()

  while (current().type === 'OPERATOR' && (current().value === '*' || current().value === '@')) {
    const operatorToken = consume('OPERATOR')
    const right = parseUnary()

    if (operatorToken.value === '*') {
      left = { type: 'AND', left, right }
    } else if (operatorToken.value === '@') {
      left = { type: 'NAND', left, right }
    }
  }
  return left
}

/**
 * Parse XOR expressions (left-associative)
 * Precedence: higher than OR but lower than AND
 * Handles: expr ^ expr
 */
function parseXorTerm(): BooleanExpression {
  let left = parseAndTerm()

  while (current().type === 'OPERATOR' && current().value === '^') {
    consume('OPERATOR', '^')
    const right = parseAndTerm()
    left = { type: 'XOR', left, right }
  }
  return left
}

/**
 * Parse XNOR expressions (left-associative)
 * Precedence: higher than OR but lower than XOR
 * Handles: expr <=> expr
 */
function parseXnorTerm(): BooleanExpression {
  let left = parseXorTerm()

  while (current().type === 'OPERATOR' && current().value === '<=>') {
    consume('OPERATOR', '<=>')
    const right = parseXorTerm()
    left = { type: 'XNOR', left, right }
  }
  return left
}

/**
 * Parse OR/NOR expressions (lowest precedence, left-associative)
 * Precedence: lowest among binary operators
 * Handles: expr + expr and expr # expr
 */
function parseSum(): BooleanExpression {
  let left = parseXnorTerm()

  while (current().type === 'OPERATOR' && (current().value === '+' || current().value === '#')) {
    const operatorToken = consume('OPERATOR')
    const right = parseXnorTerm()

    if (operatorToken.value === '+') {
      left = { type: 'OR', left, right }
    } else if (operatorToken.value === '#') {
      left = { type: 'NOR', left, right }
    }
  }
  return left
}

/**
 * Parse boolean expression string into AST
 *
 * Core parser function that tokenizes input and builds expression tree.
 * Expects pre-processed input with normalized operators and patterns.
 */
export function parseExpression(input: string): BooleanExpression {
  const processedInput = input.trim()
  if (processedInput === '') {
    throw new Error(
      'Empty expression after processing. Original input may have been invalid or contained only whitespace.'
    )
  }

  // Tokenize and parse
  currentTokens = tokenize(processedInput)
  currentTokenIndex = 0

  try {
    const expression = parseSum() // Start parsing from lowest precedence

    // Verify all tokens consumed
    if (current().type !== 'EOF') {
      throw new Error(
        `Incomplete parse: unconsumed tokens remain. Next token: ${current().type} value: ${current().value ?? '[no value]'}`
      )
    }

    // Verify balanced parentheses
    const openCount = (processedInput.match(/\(/g) || []).length
    const closeCount = (processedInput.match(/\)/g) || []).length
    if (openCount !== closeCount) {
      throw new Error(`Unbalanced parentheses: ${openCount} opening, ${closeCount} closing.`)
    }

    return expression
  } catch (error) {
    const originalMessage = error instanceof Error ? error.message : String(error)
    const examples = ['A+B', 'A*B', '!(A+B)', '(A+B)*(C+D)']
    throw new Error(
      `Parse failed for "${input}": ${originalMessage}. Valid examples: ${examples.join(', ')}`
    )
  }
}

/**
 * Remove unnecessary outer parentheses from expression string
 *
 * Iteratively removes balanced outer parentheses that don't affect precedence.
 * Preserves parentheses that are required for correct parsing.
 */
export function removeOuterParentheses(input: string): string {
  // Handle edge cases
  if (!input) return ''
  if (typeof input !== 'string') return String(input)
  if (input === '()') return '()' // Special case for empty parentheses

  let result = input.trim()

  // Iteratively remove outer parentheses while they form a valid outer pair
  while (result.startsWith('(') && result.endsWith(')')) {
    let balance = 0
    let isValidOuterPair = true

    // Check if removing outer parentheses would be valid
    for (let i = 0; i < result.length; i++) {
      if (result[i] === '(') {
        balance++
      } else if (result[i] === ')') {
        balance--
        // If balance goes to zero before end, these aren't simple outer parentheses
        if (balance === 0 && i < result.length - 1) {
          isValidOuterPair = false
          break
        }
      }
      // Invalid nesting
      if (balance < 0) {
        isValidOuterPair = false
        break
      }
    }

    // Remove outer parentheses if valid
    if (isValidOuterPair && balance === 0) {
      result = result.substring(1, result.length - 1)
    } else {
      break // Cannot remove more
    }
  }

  return result
}
