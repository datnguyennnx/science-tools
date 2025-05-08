import { BooleanExpression } from './core'
import { toast } from 'sonner'

/**
 * ExpressionParser class for converting between string expressions and expression trees
 */
export class ExpressionParser {
  /**
   * Parse a string expression into a BooleanExpression tree
   */
  static parse(input: string): BooleanExpression {
    try {
      // Check for empty or invalid input
      if (!input || input.trim() === '') {
        throw new Error('Empty expression')
      }

      // Immediate check for invalid JavaScript values
      if (input.includes('undefined') || input.includes('null')) {
        toast.error('Expression contains "undefined" or "null", which are invalid Boolean values')
        throw new Error(
          'The expression contains invalid JavaScript values. Please use only Boolean variables (uppercase letters A-Z), constants (0/1), and operators (+, *, !).'
        )
      }

      // Check for invalid AND operation patterns that cause errors
      if (input.includes('*  )') || input.includes('*  ')) {
        throw new Error('Invalid AND operation: missing right operand')
      }

      if (input.includes('(  *') || input.includes('  *')) {
        throw new Error('Invalid AND operation: missing left operand')
      }

      // Create a log of transformations to help debug issues
      const transformationLog: Record<string, string> = {
        original: input,
      }

      // Direct fixes for common number-before-NOT patterns before any processing
      // This guarantees these patterns are fixed regardless of context
      input = input.replace(/(\d+)\s*!/g, '$1*!')
      transformationLog.afterInitialFix = input

      // Pre-process problematic patterns BEFORE validation
      // This way we fix issues before they cause validation errors
      input = this.handleProblematicPatterns(input)
      transformationLog.afterProblematicPatterns = input

      // Check for common syntax errors after initial fix pass
      this.validateInputSyntax(input)

      // Normalize the input by removing whitespace and standardizing operators
      const normalized = this.normalizeInput(input)
      transformationLog.afterNormalization = normalized

      // Do another fix pass after normalization to catch any issues
      const finalInput = this.handleProblematicPatterns(normalized)
      transformationLog.final = finalInput

      // For deep debugging, log the transformations
      if (finalInput.includes('0!')) {
        toast.info('Expression contains number-NOT pattern that was automatically fixed')
      }

      // Use recursive descent parsing for the expression
      return this.parseExpression(finalInput)
    } catch (error) {
      if (error instanceof Error) {
        // Enhance error message with more context
        let errorMessage = error.message

        // Handle specific error types
        if (errorMessage.includes('undefined')) {
          // This is likely the "Numbers cannot directly precede the NOT operator" error
          // Replace with a clearer message that doesn't include "undefined"
          if (errorMessage.includes('Numbers cannot directly precede')) {
            errorMessage =
              'Numbers cannot directly precede the NOT operator (!). Use multiplication (*) between them, like 0*!(C).'
          } else {
            // General undefined error
            errorMessage = errorMessage.replace('undefined', 'invalid syntax')
          }
        }

        // Don't repeat "Unable to parse expression" if it's already in the message
        if (!errorMessage.includes('Unable to parse')) {
          errorMessage = `Unable to parse expression: ${input} - ${errorMessage}`
        }

        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
      throw new Error(`Unable to parse expression: ${input}`)
    }
  }

  /**
   * Validate input syntax for common errors
   */
  private static validateInputSyntax(input: string): void {
    // Before validating, check again for number-NOT patterns and fix them
    // This ensures the validation doesn't fail on patterns we can fix
    const inputWithFixes = this.handleProblematicPatterns(input)

    // Check for undefined/null values that might cause parsing errors
    if (inputWithFixes.includes('undefined') || inputWithFixes.includes('null')) {
      toast.error(
        'Invalid expression: Contains "undefined" or "null" which are not valid Boolean values'
      )
      throw new Error(
        'The expression contains invalid JavaScript values. Please use only Boolean variables (uppercase letters A-Z), constants (0/1), and operators (+, *, !).'
      )
    }

    // Check for empty parentheses
    if (inputWithFixes.includes('()')) {
      toast.error('Empty parentheses found. Use a constant (0/1) or variable instead.')
      throw new Error(
        'Empty parentheses "()" found. Use a constant (0 or 1) or a variable instead.'
      )
    }

    // Check for missing operators between terms (implicit multiplication is fine for variables, but not for numbers)
    const missingOperatorBetweenNumbers = /(\d+)\s*(\d+)/g
    if (missingOperatorBetweenNumbers.test(inputWithFixes)) {
      const match = missingOperatorBetweenNumbers.exec(inputWithFixes)
      toast.error(`Missing operator between numbers "${match?.[0]}". Use * for AND or + for OR.`)
      throw new Error(
        `Missing operator between numbers "${match?.[0]}". Use * for AND or + for OR.`
      )
    }

    // Check if there are still numbers directly preceding NOT operators after our fixes
    // This is a fallback check to catch any patterns our automatic fixes missed
    const numberBeforeNot = /(\d+)\s*!/g
    if (numberBeforeNot.test(inputWithFixes)) {
      // Show a toast notification instead of console debug
      toast.info('Number-NOT pattern detected and automatically fixed')
    }
  }

  /**
   * Convert a BooleanExpression tree to a standardized boolean string representation
   */
  static toBooleanString(expr: BooleanExpression): string {
    switch (expr.type) {
      case 'VARIABLE':
        return expr.value as string
      case 'CONSTANT':
        return (expr.value as boolean) ? '1' : '0'
      case 'NOT':
        return `!(${this.toBooleanString(expr.left!)})`
      case 'AND':
        return `(${this.toBooleanString(expr.left!)} * ${this.toBooleanString(expr.right!)})`
      case 'OR':
        return `(${this.toBooleanString(expr.left!)} + ${this.toBooleanString(expr.right!)})`
      default:
        throw new Error(`Unknown expression type: ${expr.type}`)
    }
  }

  /**
   * Convert a BooleanExpression tree to a LaTeX string representation
   */
  static toLatexString(expr: BooleanExpression): string {
    switch (expr.type) {
      case 'VARIABLE':
        return expr.value as string
      case 'CONSTANT':
        return (expr.value as boolean) ? '\\text{T}' : '\\text{F}'
      case 'NOT':
        return `\\lnot ${this.wrapIfNeeded(expr.left!, 'NOT')}`
      case 'AND':
        return `${this.wrapIfNeeded(expr.left!, 'AND')} \\land ${this.wrapIfNeeded(expr.right!, 'AND')}`
      case 'OR':
        return `${this.wrapIfNeeded(expr.left!, 'OR')} \\lor ${this.wrapIfNeeded(expr.right!, 'OR')}`
      default:
        throw new Error(`Unknown expression type: ${expr.type}`)
    }
  }

  /**
   * Normalize the input string by standardizing operators and removing whitespace
   */
  private static normalizeInput(input: string): string {
    // First handle specific LaTeX commands
    let normalized = input
      // Handle special LaTeX operators
      .replace(/\\overline{([^}]*)}/g, '!($1)') // Convert \overline{X} to !(X)
      .replace(/\\lnot\s*([A-Za-z0-9()]+)/g, '!$1') // Convert \lnot X to !X
      .replace(/\\lnot/g, '!') // Convert remaining \lnot to !
      .replace(/\\land/g, '*') // Convert \land to *
      .replace(/\\lor/g, '+') // Convert \lor to +
      .replace(/\\text{[FfAaLlSsEe]}/g, '0') // Convert \text{F} to 0
      .replace(/\\text{[TtRrUuEe]}/g, '1') // Convert \text{T} to 1

      // Handle other standard boolean operators
      .replace(/[vV∨]/g, '+') // OR operators
      .replace(/[·∧&]/g, '*') // AND operators
      .replace(/¬/g, '!') // NOT operator
      .replace(/\s+/g, '') // Remove whitespace

    // Apply a more comprehensive pattern fixing approach
    // Run the complete handleProblematicPatterns on the normalized input
    normalized = this.handleProblematicPatterns(normalized)

    // Fix empty parentheses by replacing them with constants
    // Replace () with 0 (false) when it appears in expressions
    normalized = normalized.replace(/\(\)/g, '0')

    // Add implicit AND operators
    normalized = normalized
      .replace(/([A-Z])([A-Z])/g, '$1*$2') // Add implicit AND: AB -> A*B
      .replace(/([A-Z])\(/g, '$1*(') // Add implicit AND: A( -> A*(
      .replace(/\)([A-Z])/g, ')*$1') // Add implicit AND: )A -> )*A
      .replace(/\)\(/g, ')*(') // Add implicit AND: )( -> )*(

    // Apply one more comprehensive pattern fix after adding implicit operators
    normalized = this.handleProblematicPatterns(normalized)

    // Check for any remaining LaTeX commands that we didn't handle
    const remainingLatex = normalized.match(/\\[a-zA-Z]+/g)
    if (remainingLatex) {
      throw new Error(`Unsupported LaTeX command: ${remainingLatex[0]}`)
    }

    return normalized
  }

  /**
   * Parse an expression using recursive descent parsing
   */
  private static parseExpression(input: string): BooleanExpression {
    // Base case: empty input
    if (!input) throw new Error('Empty expression')

    // Trim any outer unnecessary parentheses
    input = this.removeOuterParentheses(input)

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

      // Special case: Empty negation
      if (operand === '') {
        throw new Error('Empty negation operator')
      }

      // If the operand starts with parentheses, we need to extract the matching closing parenthesis
      if (operand.startsWith('(')) {
        let level = 1
        let i = 1

        while (i < operand.length && level > 0) {
          if (operand[i] === '(') level++
          else if (operand[i] === ')') level--
          i++
        }

        if (level !== 0) {
          throw new Error('Mismatched parentheses in expression')
        }

        // If the whole operand is enclosed in parentheses, remove them
        if (i === operand.length) {
          operand = operand.substring(1, operand.length - 1)
        }
      }

      return {
        type: 'NOT',
        left: this.parseExpression(operand),
      }
    }

    // Case: Binary operation (AND or OR)
    // Find the main operator with lowest precedence (+ has lower precedence than *)
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
          break // We found an OR operator, which has lowest precedence, so we're done
        } else if (char === '*' && andIndex === -1) {
          andIndex = i // Keep looking for an OR, which has lower precedence
        }
      }
    }

    // If we found an OR operator, split and parse recursively
    if (orIndex !== -1) {
      const left = input.substring(0, orIndex)
      const right = input.substring(orIndex + 1)

      if (!left || !right) {
        throw new Error(`Invalid OR operation: ${input}`)
      }

      return {
        type: 'OR',
        left: this.parseExpression(left),
        right: this.parseExpression(right),
      }
    }

    // If we found an AND operator, split and parse recursively
    if (andIndex !== -1) {
      const left = input.substring(0, andIndex)
      const right = input.substring(andIndex + 1)

      if (!left) {
        throw new Error(`Invalid AND operation: missing left operand in ${input}`)
      }

      if (!right) {
        throw new Error(`Invalid AND operation: missing right operand in ${input}`)
      }

      // Check for empty spaces or invalid operands
      if (left.trim() === '' || right.trim() === '') {
        throw new Error(`Invalid AND operation: ${input}`)
      }

      return {
        type: 'AND',
        left: this.parseExpression(left),
        right: this.parseExpression(right),
      }
    }

    // If we get here, it might be a parenthesized expression
    if (input.startsWith('(') && input.endsWith(')')) {
      const innerExpr = input.substring(1, input.length - 1)
      if (!innerExpr) {
        // Handle empty parentheses () as constant false
        return { type: 'CONSTANT', value: false }
      }
      return this.parseExpression(innerExpr)
    }

    throw new Error(`Unable to parse expression: ${input}`)
  }

  /**
   * Remove unnecessary outer parentheses from an expression
   */
  private static removeOuterParentheses(input: string): string {
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
    return this.removeOuterParentheses(input.substring(1, input.length - 1))
  }

  /**
   * Add parentheses around an expression if needed based on operator precedence
   */
  private static wrapIfNeeded(expr: BooleanExpression, parentOp: string): string {
    // Determine if the expression needs to be wrapped in parentheses
    const needsParens =
      (parentOp === 'NOT' && (expr.type === 'AND' || expr.type === 'OR')) ||
      (parentOp === 'AND' && expr.type === 'OR')

    const latex = this.toLatexString(expr)
    return needsParens ? `(${latex})` : latex
  }

  /**
   * Handle known problematic patterns that cause parsing issues
   */
  private static handleProblematicPatterns(input: string): string {
    // Use a recursive approach to handle deeply nested patterns
    // This allows us to find patterns no matter how deeply they're nested
    function fixRecursively(expr: string): string {
      // Fix common patterns
      let fixed = expr
        // Number-NOT pattern with parentheses
        .replace(/(\d+)\s*!\s*\(([^)]*)\)/g, '$1*!($2)')
        // Number-NOT pattern with single variable
        .replace(/(\d+)\s*!\s*([A-Za-z])/g, '$1*!$2')
        // Generic number-NOT pattern
        .replace(/(\d+)\s*!/g, '$1*!')

      // Find all subexpressions in parentheses
      const subexprs: Array<{ original: string; content: string }> = []
      let depth = 0
      let start = -1

      for (let i = 0; i < fixed.length; i++) {
        if (fixed[i] === '(') {
          if (depth === 0) {
            start = i
          }
          depth++
        } else if (fixed[i] === ')') {
          depth--
          if (depth === 0 && start !== -1) {
            // Extract the subexpression including parentheses
            const subexpr = fixed.substring(start, i + 1)
            subexprs.push({
              original: subexpr,
              content: fixed.substring(start + 1, i),
            })
            start = -1
          }
        }
      }

      // Fix each subexpression recursively
      for (const sub of subexprs) {
        const fixedContent = fixRecursively(sub.content)
        if (fixedContent !== sub.content) {
          // Replace the subexpression in the original string
          fixed = fixed.replace(sub.original, '(' + fixedContent + ')')
        }
      }

      // Apply generic fixes one more time after fixing subexpressions
      return fixed
        .replace(/(\d+)\s*!\s*\(([^)]*)\)/g, '$1*!($2)')
        .replace(/(\d+)\s*!\s*([A-Za-z])/g, '$1*!$2')
        .replace(/(\d+)\s*!/g, '$1*!')
    }

    // Start the recursive fixing process
    let processed = fixRecursively(input)

    // Add an additional safety pass with our existing patterns
    // We'll need multiple passes to handle complex nested expressions
    for (let i = 0; i < 2; i++) {
      // Handle complex nested patterns with multiple NOT operators
      processed = processed.replace(
        /!\s*\(\s*(\d+)\s*!\s*\(([^)]*)\)\s*\*\s*!\s*\(([^)]*)\)/g,
        (match: string, num: string, expr1: string, expr2: string) => {
          return `!(${num}*!(${expr1})*!(${expr2})`
        }
      )

      // Handle nested patterns - like !(0!(C)) or similar nested structures
      processed = processed.replace(
        /!\s*\(\s*(\d+)\s*!\s*\(([^)]*)\)\s*([+*]*)\s*([^)]*)\)/g,
        (match: string, num: string, innerExpr: string, op: string, rest: string) => {
          return `!(${num}*!(${innerExpr})${op}${rest})`
        }
      )

      // Further fix any patterns that may have been created or missed
      processed = processed.replace(/(\d+)\s*!\s*\(([^)]*)\)/g, '$1*!($2)')
      processed = processed.replace(/(\d+)\s*!\s*([A-Za-z])/g, '$1*!$2')
      processed = processed.replace(/(\d+)\s*!/g, '$1*!')
    }

    // Final safety check
    if (processed.match(/\d+!/)) {
      toast.warning('Fixed problematic pattern in expression with numbers and negation')
      processed = processed.replace(/(\d+)([!])/g, '$1*$2')
    }

    return processed
  }
}
