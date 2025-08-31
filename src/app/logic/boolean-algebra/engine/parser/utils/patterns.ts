import { detectFormat } from '../parser'

/**
 * Common patterns used for fixing expressions
 */
export const PATTERNS = {
  NEGATION_WITHOUT_OPERAND: /!(?=\s*[\)\+\*]|$)/,
  AND_MISSING_RIGHT: /\*(?=\s*[\)\+]|$)/g,
  AND_MISSING_LEFT: /(?<=^|\(|\+)\s*\*/,
  OR_MISSING_RIGHT: /\+(?=\s*[\)]|$)/g,
  OR_MISSING_LEFT: /(?<=^|\()\s*\+/,
  NUMBER_BEFORE_NOT_PARENS: /(\d+)\s*!\s*\(([^)]*)\)/g,
  NUMBER_BEFORE_NOT_VAR: /(\d+)\s*!\s*([A-Za-z])/g,
  NUMBER_BEFORE_NOT: /(\d+)\s*!/g,
  EMPTY_PARENS: /\(\s*\)/,
  MISMATCHED_PARENS_OPEN: /\(\s*$/g,
  MISMATCHED_PARENS_CLOSE: /^\s*\)/g,
  NESTED_NEGATION: /!\s*\(\s*!\s*\(/g,
  INVALID_VARIABLE: /(?<!\\)[a-z_][a-zA-Z0-9_]*/g,
  UNDEFINED_TOKEN: /undefined/,
  NULL_TOKEN: /null/,
  LATEX_OPERATORS:
    /\\(lor|land|lnot|vee|wedge|neg|oplus|uparrow|downarrow|leftrightarrow|parr|parrow|iff|equiv|cong|approx|cdot|times|div|pm|mp|overline|bar|not|sim|to|rightarrow|leftarrow|Leftarrow|Rightarrow)(\s|$|\{|\(|\))/,
  UNKNOWN_OPERATOR: /\b(?:XOR|XNOR|NAND|NOR|IMPL|EQUIV)\b/i,
  OPERAND_ISSUES: /\*\s*[\)\+]|^[\+\*]|\(\s*[\+\*]|\+\s*[\)]|\!\s*[\)\+\*]/,
}

/**
 * Fix common pattern errors in boolean expressions
 * @param input The input expression string
 * @returns The fixed expression string
 */
export function fixProblematicPatterns(input: string): string {
  // Check for empty input
  if (!input || input.trim() === '') {
    // The previous check for test context via stack trace is fragile.
    // If tests need to assert behavior on empty strings without throwing,
    // they should catch the error or use a different pathway if the function's contract is to throw on empty.
    // Given the function now always throws for general empty input, tests should expect this.
    throw new Error('Empty expression')
  }

  // Check for empty parentheses explicitly
  if (PATTERNS.EMPTY_PARENS.test(input)) {
    throw new Error('Empty parentheses "()" found. Use a constant (0 or 1) or a variable instead.')
  }

  // Check for undefined/null tokens first
  if (PATTERNS.UNDEFINED_TOKEN.test(input)) {
    throw new Error(
      'Expression contains "undefined", which is an invalid token. Use uppercase letters A-Z for variables.'
    )
  }

  if (PATTERNS.NULL_TOKEN.test(input)) {
    throw new Error(
      'Expression contains "null", which is an invalid token. Use only Boolean variables (A-Z), constants (0/1), and operators (+, *, !).'
    )
  }

  // Check for invalid variable names explicitly
  // Skip lowercase validation for LaTeX format as it will be converted to uppercase later
  const format = detectFormat(input)
  if (format !== 'latex' && /[a-z]/.test(input)) {
    throw new Error(
      'Invalid variable name: Lowercase letters are not allowed. Please use only uppercase letters A-Z for variable names.'
    )
  }

  // Check for variables with numbers or underscores
  if (/[A-Z][0-9_]/.test(input)) {
    throw new Error(
      'Invalid variable name: Variables cannot contain numbers or underscores. Please use only uppercase letters A-Z for variable names.'
    )
  }

  const invalidVariables = input.match(PATTERNS.INVALID_VARIABLE)
  if (invalidVariables) {
    // Filter out known words that might be matched
    const knownWords = [
      'and',
      'or',
      'not',
      'true',
      'false',
      'lor',
      'land',
      'lnot',
      'vee',
      'wedge',
      'neg',
    ]
    const filteredVars = invalidVariables.filter(v => !knownWords.includes(v.toLowerCase()))

    // Skip variable validation if we detected LaTeX operators (they might include 'lor', 'land', etc.)
    if (
      filteredVars.length > 0 &&
      !input.includes('\\overline') &&
      !input.includes('\\lor') &&
      !input.includes('\\land')
    ) {
      throw new Error(
        `Invalid variable name: "${filteredVars[0]}". Please use only uppercase letters A-Z for variable names.`
      )
    }
  }

  // Check for patterns that should throw errors and not be fixed
  const validationResult = validateExpression(input, false) // false indicates that we DO want to check for missing operands
  if (!validationResult.valid) {
    throw new Error(validationResult.error)
  }

  // Only fix simple formatting issues, not serious problems
  let fixed = input

  // Fix number-before-negation patterns which is just a formatting/syntax issue
  fixed = fixed
    .replace(PATTERNS.NUMBER_BEFORE_NOT_PARENS, '$1*!($2)')
    .replace(PATTERNS.NUMBER_BEFORE_NOT_VAR, '$1*!$2')
    .replace(PATTERNS.NUMBER_BEFORE_NOT, '$1*!')

  // Double negation: !!X -> X. This was removed as it should be a simplification rule.
  // while (fixed.includes('!!')) {
  //  fixed = fixed.replace(/!!/g, '');
  // }

  return fixed
}

/**
 * Fix missing operands in expressions
 */
export function fixMissingOperands(expr: string): string {
  // We no longer silently fix these issues, as they should produce errors
  // Instead, we'll detect them in validateExpression
  return expr
}

/**
 * Validate an expression for common errors
 * @param input The input expression
 * @param skipOperandCheck Skip checking for missing operands (used during fixes)
 * @returns Object with validation result and error message if invalid
 */
export function validateExpression(
  input: string,
  skipOperandCheck = false
): { valid: boolean; error?: string } {
  // Handle empty input explicitly as invalid
  if (!input || input.trim() === '') {
    return { valid: false, error: 'Empty expression. Input cannot be blank.' }
  }

  // Check for JavaScript literals that should never be in valid expressions
  if (input.includes('undefined') || input.includes('null')) {
    return {
      valid: false,
      error: `Expression contains JavaScript literals ("undefined" or "null") which are not valid in Boolean expressions.`,
    }
  }

  // --- Detect format to decide on validation rules ---
  const format = detectFormat(input)

  // --- Skip most pattern checks for LaTeX as it has its own normalization ---
  if (format === 'latex') {
    // For LaTeX, only check for clearly invalid things like unbalanced parens or undefined/null
    const unbalanced = hasUnbalancedParentheses(input)
    if (unbalanced) {
      return {
        valid: false,
        error: `Unbalanced parentheses in expression: "${input}".`,
      }
    }
    // Assume LaTeX is valid enough for the normalizer to handle, unless fundamentally broken (like unbalanced parens)
    return { valid: true }
  }

  // --- Continue with standard format validation rules ---

  // Check for missing operands only if we're not skipping that check
  if (!skipOperandCheck) {
    // Check for trailing operators (more common issue)
    const _match = input.match(PATTERNS.AND_MISSING_RIGHT) || input.match(PATTERNS.OR_MISSING_RIGHT)
    // This part has an issue: if _match is null, operatorType and operator will be based on presence of '*' or '+' in the whole input.
    // This might lead to incorrect error messages if the input doesn't have the assumed operator but has other issues.
    // However, if _match is null, this block is skipped. If _match is not null, it means a trailing * or + was found.
    if (_match) {
      // Explicitly check if _match is not null
      const operatorType = _match[0].includes('*') ? 'AND' : 'OR'
      const operator = operatorType === 'AND' ? '*' : '+'
      return {
        valid: false,
        error: `Missing right operand for ${operatorType} operator (${operator}) at "${_match[0]}". Example: A${operator}B. Examples of valid expressions: ${getValidExamples().slice(0, 3).join(', ')}`,
      }
    }

    // Check for leading operators
    if (PATTERNS.AND_MISSING_LEFT.test(input) || PATTERNS.OR_MISSING_LEFT.test(input)) {
      const operatorType = input.match(PATTERNS.AND_MISSING_LEFT) ? 'AND' : 'OR' // Determine based on which pattern matched
      const operator = operatorType === 'AND' ? '*' : '+'
      const matchForError =
        input.match(PATTERNS.AND_MISSING_LEFT)?.[0] ||
        input.match(PATTERNS.OR_MISSING_LEFT)?.[0] ||
        ''

      return {
        valid: false,
        error: `Missing left operand for ${operatorType} operator (${operator}) at "${matchForError}". Example: A${operator}B. Examples of valid expressions: ${getValidExamples().slice(0, 3).join(', ')}`,
      }
    }

    // Check for negation without operand
    if (PATTERNS.NEGATION_WITHOUT_OPERAND.test(input)) {
      const matchForError = input.match(PATTERNS.NEGATION_WITHOUT_OPERAND)?.[0] || ''
      return {
        valid: false,
        error: `Missing operand for negation operator (!) at "${matchForError}". Example: !A. Examples of valid expressions: ${getValidExamples().slice(0, 3).join(', ')}`,
      }
    }

    // Check for empty parentheses
    if (PATTERNS.EMPTY_PARENS.test(input)) {
      return {
        valid: false,
        error: `Empty parentheses () detected. Parentheses must contain an expression. Examples of valid expressions: ${getValidExamples().slice(0, 3).join(', ')}`,
      }
    }
  }

  // Check for invalid variable names ONLY for standard format
  const invalidVariableMatches = input.match(PATTERNS.INVALID_VARIABLE)
  if (invalidVariableMatches) {
    // Check if the match is actually a keyword (case-insensitive)
    const potentialKeywords = ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR']
    const filteredMatches = invalidVariableMatches.filter(
      match => !potentialKeywords.includes(match.toUpperCase())
    )

    if (filteredMatches.length > 0) {
      return {
        valid: false,
        error: `Invalid variable name: "${filteredMatches[0]}". Only uppercase letters A-Z are allowed for variables. Examples of valid expressions: ${getValidExamples().slice(0, 3).join(', ')}`,
      }
    }
  }

  // Check for unknown operators after other structural checks
  if (PATTERNS.UNKNOWN_OPERATOR.test(input)) {
    const unknownOpMatch = input.match(PATTERNS.UNKNOWN_OPERATOR)
    if (unknownOpMatch) {
      return {
        valid: false,
        error: `Unknown operator: "${unknownOpMatch[0]}". Supported operators are +, *, !. Examples of valid expressions: ${getValidExamples().slice(0, 3).join(', ')}`,
      }
    }
  }

  // Check for unbalanced parentheses
  const unbalanced = hasUnbalancedParentheses(input)
  if (unbalanced) {
    return {
      valid: false,
      error: `Unbalanced parentheses in expression: "${input}". Examples of valid expressions: ${getValidExamples().slice(0, 3).join(', ')}`,
    }
  }

  // If we passed all validations, the expression is valid
  return { valid: true }
}

/**
 * Check if an expression has unbalanced parentheses
 */
export function hasUnbalancedParentheses(expr: string): boolean {
  let balance = 0

  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') {
      balance++
    } else if (expr[i] === ')') {
      balance--
    }

    if (balance < 0) {
      return true // Closing parenthesis without matching opening
    }
  }

  return balance > 0 // If balance not zero, we have unclosed parentheses
}

/**
 * Get a list of valid expression examples
 */
export function getValidExamples(): string[] {
  return [
    'A + B',
    'A * B',
    '!(A + B)',
    'A * !B',
    '(A + B) * C',
    'A + (B * C)',
    '0 + 1',
    'A * (B + !C)',
    '!(A * B) + C',
  ]
}

/**
 * Validates the structure of nested expressions recursively.
 * It checks for balanced parentheses and ensures that all
 * sub-expressions (expressions within parentheses) are also valid.
 * This function does not modify the expression content but throws errors
 * if structural issues or invalid sub-expressions are found.
 */
export function validateNestedExpressionStructure(expr: string): string {
  // Early check for empty input
  if (!expr || expr.trim() === '') {
    throw new Error('Empty expression') // Directly throw for empty expression
  }

  // Count parentheses to check balance before processing
  let openCount = 0
  let closeCount = 0

  for (const char of expr) {
    if (char === '(') openCount++
    if (char === ')') closeCount++

    // Detect case where close comes before open
    if (closeCount > openCount) {
      throw new Error(
        'Unbalanced parentheses: closing parenthesis without matching opening parenthesis'
      )
    }
  }

  // Check for overall balance
  if (openCount !== closeCount) {
    throw new Error(
      `Unbalanced parentheses: ${openCount} opening and ${closeCount} closing parentheses`
    )
  }

  // Process subexpressions from innermost to outermost
  // Sort by length in ascending order to process innermost first (shorter subexpressions are typically deeper)
  const subexprs: Array<{ original: string; content: string; start: number; end: number }> = []
  let depth = 0
  let start = -1

  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') {
      if (depth === 0) {
        start = i
      }
      depth++
    } else if (expr[i] === ')') {
      depth--
      if (depth === 0 && start !== -1) {
        // Extract the subexpression including parentheses
        const subexpr = expr.substring(start, i + 1)
        subexprs.push({
          original: subexpr,
          content: expr.substring(start + 1, i),
          start,
          end: i + 1,
        })
        start = -1
      }
    }
  }

  // Process each subexpression
  for (const sub of subexprs) {
    // Check if the subexpression is valid instead of fixing it
    const validationResult = validateExpression(sub.content, false)
    if (!validationResult.valid) {
      throw new Error(validationResult.error)
    }
  }

  return expr
}
