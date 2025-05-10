import { BooleanExpression } from '../../ast'

// Tokenizer helper
interface Token {
  type: 'VARIABLE' | 'CONSTANT' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'EOF'
  value?: string | boolean | null // Operator value for !, *, +
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const sanitizedInput = input.replace(/\s+/g, '') // Remove all whitespace

  while (i < sanitizedInput.length) {
    const char = sanitizedInput[i]

    if (char === '(') {
      tokens.push({ type: 'LPAREN' })
      i++
    } else if (char === ')') {
      tokens.push({ type: 'RPAREN' })
      i++
    } else if (char === '!') {
      tokens.push({ type: 'OPERATOR', value: '!' })
      i++
    } else if (char === '*') {
      tokens.push({ type: 'OPERATOR', value: '*' })
      i++
    } else if (char === '+') {
      tokens.push({ type: 'OPERATOR', value: '+' })
      i++
    } else if (char === '^') {
      // XOR
      tokens.push({ type: 'OPERATOR', value: '^' })
      i++
    } else if (char === '@') {
      // NAND
      tokens.push({ type: 'OPERATOR', value: '@' })
      i++
    } else if (char === '#') {
      // NOR
      tokens.push({ type: 'OPERATOR', value: '#' })
      i++
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
      // This case should ideally be caught by pre-validation
      throw new Error(`Unexpected character during tokenization: ${char}`)
    }
  }
  tokens.push({ type: 'EOF' })
  return tokens
}

let currentTokens: Token[] = []
let currentTokenIndex = 0

function current(): Token {
  if (currentTokenIndex >= currentTokens.length) {
    // Should always have EOF, but as a safeguard
    return { type: 'EOF' }
  }
  return currentTokens[currentTokenIndex]
}

function consume(expectedType?: Token['type'], expectedValue?: string | boolean): Token {
  if (currentTokenIndex >= currentTokens.length) {
    throw new Error('Attempted to consume past EOF')
  }
  const token = currentTokens[currentTokenIndex]
  if (expectedType && token.type !== expectedType) {
    throw new Error(
      `Unexpected token type: expected ${expectedType} but got ${token.type} (value: ${token.value === undefined ? 'N/A' : token.value}) near index ${currentTokenIndex}`
    )
  }
  if (expectedValue !== undefined && token.value !== expectedValue) {
    throw new Error(
      `Unexpected token value: expected ${expectedValue} but got ${token.value} (type: ${token.type}) near index ${currentTokenIndex}`
    )
  }
  currentTokenIndex++
  return token
}

// New parsing functions with operator precedence
// Highest precedence: Variables, Constants, (Expression), !Factor
function parseFactor(): BooleanExpression {
  const token = current()

  if (token.type === 'VARIABLE') {
    consume('VARIABLE')
    return { type: 'VARIABLE', value: token.value as string }
  } else if (token.type === 'CONSTANT') {
    consume('CONSTANT')
    return { type: 'CONSTANT', value: token.value as boolean }
  } else if (token.type === 'OPERATOR' && token.value === '!') {
    consume('OPERATOR', '!')
    const operand = parseFactor() // NOT has high precedence, binds tightly
    return { type: 'NOT', left: operand }
  } else if (token.type === 'LPAREN') {
    consume('LPAREN')
    const expr = parseSum() // Start parsing the lowest precedence within parentheses
    consume('RPAREN')
    return expr
  } else {
    throw new Error(
      `Unexpected token in factor: ${token.type} with value ${token.value === undefined ? '[no value]' : token.value}. Expected variable, constant, NOT, or LPAREN. Next token: ${currentTokens[currentTokenIndex + 1]?.type}`
    )
  }
}

// Middle precedence: Factor (* Factor)*
function parseTerm(): BooleanExpression {
  let left = parseFactor()

  while (current().type === 'OPERATOR' && (current().value === '*' || current().value === '@')) {
    const operatorToken = consume('OPERATOR')
    const right = parseFactor()
    if (operatorToken.value === '*') {
      left = { type: 'AND', left, right }
    } else if (operatorToken.value === '@') {
      left = { type: 'NAND', left, right }
    }
  }
  return left
}

// XOR precedence: Term (^ Term)*
function parseXorTerm(): BooleanExpression {
  let left = parseTerm()

  while (current().type === 'OPERATOR' && current().value === '^') {
    consume('OPERATOR', '^')
    const right = parseTerm()
    left = { type: 'XOR', left, right }
  }
  return left
}

// Lowest precedence: XorTerm (+ XorTerm)* or XorTerm (# XorTerm)*
function parseSum(): BooleanExpression {
  let left = parseXorTerm()

  while (current().type === 'OPERATOR' && (current().value === '+' || current().value === '#')) {
    const operatorToken = consume('OPERATOR')
    const right = parseXorTerm()
    if (operatorToken.value === '+') {
      left = { type: 'OR', left, right }
    } else if (operatorToken.value === '#') {
      left = { type: 'NOR', left, right }
    }
  }
  return left
}

/**
 * Recursively parse a boolean expression string into an expression tree.
 * This function is the core AST builder and expects its input to have been
 * pre-processed (normalized, basic patterns fixed/validated) by the calling orchestrator (e.g., from parser.ts).
 */
export function parseExpression(input: string): BooleanExpression {
  const processedInput = input.trim()
  if (processedInput === '') {
    throw new Error(
      'Expression became empty after processing. Original input may have been invalid or only whitespace.'
    )
  }

  currentTokens = tokenize(processedInput) // Tokenize the input
  currentTokenIndex = 0 // Reset index

  try {
    const expression = parseSum() // Call the new top-level parsing function

    if (current().type !== 'EOF') {
      throw new Error(
        `Failed to parse complete expression. Unparsed tokens remain. Next token: ${current().type} value: ${current().value === undefined ? '[no value]' : current().value}`
      )
    }

    // The new parser structure should inherently handle balanced parentheses if grammar is correct
    // Keeping a basic check for now, can be removed if parser is robust
    const openCount = (processedInput.match(/\(/g) || []).length
    const closeCount = (processedInput.match(/\)/g) || []).length
    if (openCount !== closeCount) {
      throw new Error(
        `Unbalanced parentheses (final check): found ${openCount} opening and ${closeCount} closing parentheses.`
      )
    }

    return expression
  } catch (error) {
    const originalMessage = error instanceof Error ? error.message : String(error)
    const examples = ['A+B', 'A*B', '!(A+B)', '(A+B)*(C+D)']
    // Improve error context
    throw new Error(
      `Failed to parse expression: "${input}". Error: ${originalMessage}. Examples of valid expressions: ${examples.join(', ')}`
    )
  }
}

/**
 * Remove unnecessary outer parentheses from an expression
 */
export function removeOuterParentheses(input: string): string {
  // Handle null/undefined or empty strings
  if (!input) {
    return ''
  }

  // Handle non-string inputs
  if (typeof input !== 'string') {
    return String(input)
  }

  // Special case: empty parentheses ()
  if (input === '()') {
    return '()'
  }

  let sanitized = input.trim()
  while (sanitized.startsWith('(') && sanitized.endsWith(')')) {
    let balance = 0
    let S = -1
    let E = -1
    let validOuterPair = true

    if (sanitized.length <= 2) {
      break
    }

    for (let i = 0; i < sanitized.length; i++) {
      if (sanitized[i] === '(') {
        if (S === -1 && i === 0) S = 1
        balance++
      } else if (sanitized[i] === ')') {
        balance--
        if (balance === 0 && i === sanitized.length - 1) {
          E = i
        } else if (balance === 0 && i < sanitized.length - 1) {
          validOuterPair = false
          break
        }
      }
      if (balance < 0) {
        validOuterPair = false
        break
      }
    }

    if (validOuterPair && balance === 0 && S === 1 && E === sanitized.length - 1) {
      sanitized = sanitized.substring(S, E)
    } else {
      break
    }
  }
  return sanitized
}
