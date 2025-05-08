import { toast } from 'sonner'

/**
 * Convert LaTeX expressions to Boolean algebra notation with robust error checking
 */
export function latexToBoolean(latex: string): string {
  if (!latex || !latex.trim()) return ''

  // Sanitize input for undefined/null values
  if (latex.includes('undefined') || latex.includes('null')) {
    toast.error(
      'Invalid expression: Contains "undefined" or "null" which are not valid Boolean values'
    )
    throw new Error(
      'The expression contains invalid JavaScript values. Please use only valid Boolean variables (A-Z).'
    )
  }

  // First, normalize spacing to make processing more consistent
  let processedLatex = latex.replace(/\s+/g, ' ').trim()

  // Check for invalid AND operation patterns before processing
  if (processedLatex.includes('*  )') || processedLatex.includes('*  ')) {
    toast.error('Invalid AND operation: missing right operand')
    throw new Error('Invalid AND operation: missing right operand')
  }

  if (processedLatex.includes('(  *') || processedLatex.includes('  *')) {
    toast.error('Invalid AND operation: missing left operand')
    throw new Error('Invalid AND operation: missing left operand')
  }

  // Step 1: Handle LaTeX commands with consistent replacements
  processedLatex = processedLatex
    .replace(/\\text{F}/g, '0') // False
    .replace(/\\text{T}/g, '1') // True

  // Step 2: Handle negations carefully
  processedLatex = processedLatex.replace(/\\lnot\s*(\S)(?!\S*\})/g, '!($1)')
  processedLatex = processedLatex.replace(/\\lnot\s*\{([^}]*)\}/g, '!($1)')
  processedLatex = processedLatex.replace(/\\overline\s*\{([^}]*)\}/g, '!($1)')

  // Step 3: Replace binary operators
  processedLatex = processedLatex
    .replace(/\\land/g, '*') // AND operator
    .replace(/\\lor/g, '+') // OR operator

  // Step 4: Clean up any leftover spaces and other symbols
  processedLatex = processedLatex.replace(/\s+/g, '')

  // Handle potentially empty parentheses
  processedLatex = processedLatex.replace(/\(\)/g, '0') // Replace () with 0 (FALSE)

  // Step 5: Handle implicit multiplication
  const insertImplicitMultiplication = (text: string): string => {
    return text
      .replace(/([A-Z01])([A-Z01])/g, '$1*$2') // Add * between variables: AB -> A*B
      .replace(/([A-Z01])\(/g, '$1*(') // Add * between a variable and a parenthesis: A( -> A*(
      .replace(/\)([A-Z01])/g, ')*$1') // Add * after a parenthesis: )A -> )*A
      .replace(/\)\(/g, ')*(') // Add * between parentheses: )( -> )*(
  }

  // Apply multiplication rules multiple times to handle complex cases
  for (let i = 0; i < 3; i++) {
    processedLatex = insertImplicitMultiplication(processedLatex)
  }

  // Final cleanup
  processedLatex = processedLatex
    .replace(/\*{2,}/g, '*') // Replace multiple * with a single *
    .replace(/\+{2,}/g, '+') // Replace multiple + with a single +
    .replace(/!!/g, '') // Double negation: !!X -> X

  // Handle expressions like !()+X which could be produced by complex LaTeX
  processedLatex = processedLatex.replace(/!\(0\)/g, '1') // !() -> 1 (NOT false is true)

  // Ensure no leftover LaTeX commands remain
  if (processedLatex.includes('\\')) {
    console.warn('LaTeX conversion may be incomplete, LaTeX commands remain:', processedLatex)
    toast.warning('LaTeX conversion may be incomplete')
  }

  // Final undefined check
  if (processedLatex.includes('undefined') || processedLatex.includes('null')) {
    toast.error('Generated expression contains invalid values')
    throw new Error('The processed expression contains invalid JavaScript values')
  }

  return processedLatex
}
