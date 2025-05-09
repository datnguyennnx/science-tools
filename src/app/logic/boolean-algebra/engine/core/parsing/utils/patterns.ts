import { toast } from 'sonner'

/**
 * Common patterns used for fixing expressions
 */
export const PATTERNS = {
  NEGATION_WITHOUT_OPERAND: /!(?=\s*[\)\+\*]|$)/g,
  AND_MISSING_RIGHT: /\*(?=\s*[\)\+]|$)/g,
  AND_MISSING_LEFT: /(?<=^|\(|\+)\s*\*/g,
  OR_MISSING_RIGHT: /\+(?=\s*[\)]|$)/g,
  OR_MISSING_LEFT: /(?<=^|\()\s*\+/g,
  NUMBER_BEFORE_NOT_PARENS: /(\d+)\s*!\s*\(([^)]*)\)/g,
  NUMBER_BEFORE_NOT_VAR: /(\d+)\s*!\s*([A-Za-z])/g,
  NUMBER_BEFORE_NOT: /(\d+)\s*!/g,
  EMPTY_PARENS: /\(\s*\)/g,
  MISMATCHED_PARENS_OPEN: /\(\s*$/g,
  MISMATCHED_PARENS_CLOSE: /^\s*\)/g,
  NESTED_NEGATION: /!\s*\(\s*!\s*\(/g,
  INVALID_VARIABLE: /(?<!\\)[a-z_][a-zA-Z0-9_]*/g,
  UNDEFINED_TOKEN: /undefined/g,
  NULL_TOKEN: /null/g,
  LATEX_OPERATORS: /\\(lor|land|lnot|vee|wedge|neg)(\s|$|\{|\(|\))/,
}

/**
 * Fix common pattern errors in boolean expressions
 * @param input The input expression string
 * @param showToasts Whether to show toast notifications for fixed issues
 * @returns The fixed expression string
 */
export function fixProblematicPatterns(input: string, showToasts = true): string {
  // Fix missing operands
  let fixed = fixMissingOperands(input)

  // Fix number-before-negation patterns
  fixed = fixed
    .replace(PATTERNS.NUMBER_BEFORE_NOT_PARENS, '$1*!($2)')
    .replace(PATTERNS.NUMBER_BEFORE_NOT_VAR, '$1*!$2')
    .replace(PATTERNS.NUMBER_BEFORE_NOT, '$1*!')

  // Fix empty parentheses
  fixed = fixed.replace(PATTERNS.EMPTY_PARENS, '0')

  // Apply a recursive approach to find and fix deeply nested patterns
  fixed = processNestedExpressions(fixed)

  // Show a toast if we detected and fixed issues
  if (showToasts && fixed !== input) {
    toast.info('Fixed problematic patterns in your expression')
  }

  return fixed
}

/**
 * Fix missing operands in expressions
 */
export function fixMissingOperands(expr: string): string {
  let fixed = expr

  // Fix negation symbols that are missing an operand (e.g., "!" or "! ")
  // Replace with "!0" (false)
  fixed = fixed.replace(PATTERNS.NEGATION_WITHOUT_OPERAND, '!0')

  // Fix AND operations missing right operand (e.g., "A *" or "A * )")
  fixed = fixed.replace(PATTERNS.AND_MISSING_RIGHT, '*1')

  // Fix AND operations missing left operand (e.g., "* B" or "(* B")
  fixed = fixed.replace(PATTERNS.AND_MISSING_LEFT, '1*')

  // Fix OR operations missing right operand (e.g., "A +" or "A + )")
  fixed = fixed.replace(PATTERNS.OR_MISSING_RIGHT, '+0')

  // Fix OR operations missing left operand (e.g., "+ B" or "(+ B")
  fixed = fixed.replace(PATTERNS.OR_MISSING_LEFT, '0+')

  return fixed
}

/**
 * Process nested expressions recursively to fix issues
 */
export function processNestedExpressions(expr: string): string {
  // First apply fixes to the entire expression
  let result = fixMissingOperands(expr)

  // Find all subexpressions in parentheses
  const subexprs: Array<{ original: string; content: string; start: number; end: number }> = []
  let depth = 0
  let start = -1

  for (let i = 0; i < result.length; i++) {
    if (result[i] === '(') {
      if (depth === 0) {
        start = i
      }
      depth++
    } else if (result[i] === ')') {
      depth--
      if (depth === 0 && start !== -1) {
        // Extract the subexpression including parentheses
        const subexpr = result.substring(start, i + 1)
        subexprs.push({
          original: subexpr,
          content: result.substring(start + 1, i),
          start,
          end: i + 1,
        })
        start = -1
      }
    }
  }

  // Process subexpressions from innermost to outermost
  // Sort by length in descending order to process innermost first
  subexprs.sort((a, b) => a.original.length - b.original.length)

  // Process each subexpression
  for (const sub of subexprs) {
    const fixedContent = processNestedExpressions(sub.content)
    if (fixedContent !== sub.content) {
      // Replace the subexpression in the original string
      result = result.substring(0, sub.start) + '(' + fixedContent + ')' + result.substring(sub.end)
    }
  }

  // Apply fixes after processing subexpressions
  return fixMissingOperands(result)
}

/**
 * Validate an expression for common errors
 * @param input The input expression
 * @returns Object with validation result and error message if invalid
 */
export function validateExpression(input: string): { valid: boolean; error?: string } {
  // Check for undefined/null tokens
  if (PATTERNS.UNDEFINED_TOKEN.test(input)) {
    return {
      valid: false,
      error:
        'Expression contains "undefined", which is an invalid token. Use uppercase letters A-Z for variables.',
    }
  }

  if (PATTERNS.NULL_TOKEN.test(input)) {
    return {
      valid: false,
      error:
        'Expression contains "null", which is an invalid token. Use only Boolean variables (A-Z), constants (0/1), and operators (+, *, !).',
    }
  }

  // Check if contains LaTeX operators
  const hasLatexOperators = PATTERNS.LATEX_OPERATORS.test(input)

  // Check for invalid variable names, but be smart about LaTeX syntax
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
    if (filteredVars.length > 0 && !hasLatexOperators) {
      return {
        valid: false,
        error: `Invalid variable name: "${filteredVars[0]}". Please use only uppercase letters A-Z for variable names.`,
      }
    }
  }

  // Check for empty parentheses
  if (PATTERNS.EMPTY_PARENS.test(input)) {
    return {
      valid: false,
      error: 'Empty parentheses "()" found. Use a constant (0 or 1) or a variable instead.',
    }
  }

  // Check for operators missing operands
  if (/\*\s*[\)\+]|^[\+\*]|\(\s*[\+\*]|\+\s*[\)]|\!\s*[\)\+\*]/.test(input)) {
    return {
      valid: false,
      error: 'Invalid syntax: operators missing operands.',
    }
  }

  return { valid: true }
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
