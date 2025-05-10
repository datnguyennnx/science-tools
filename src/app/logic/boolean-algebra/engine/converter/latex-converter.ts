/**
 * Convert LaTeX expressions to Boolean algebra notation with robust error checking
 */
export function latexToBoolean(latex: string): string {
  if (!latex || !latex.trim()) return ''

  try {
    // Sanitize input for undefined/null values
    if (latex.includes('undefined') || latex.includes('null')) {
      throw new Error(
        'The expression contains invalid JavaScript values. Please use only valid Boolean variables (A-Z).'
      )
    }

    // Step 1: Normalize existing and trim whitespace.
    // Subsequent steps will handle specific LaTeX command conversions.
    let processedLatex = latex.replace(/\s+/g, ' ').trim()

    // Step 2: Handle LaTeX constants and basic commands
    // Convert LaTeX operators to standard operators WITH SPACES first
    processedLatex = processedLatex
      .replace(/\\text{T}/g, '1')
      .replace(/\\text{F}/g, '0')
      .replace(/\\text{TRUE}/gi, '1')
      .replace(/\\text{FALSE}/gi, '0')
      .replace(/\\mathrm{T}/g, '1')
      .replace(/\\mathrm{F}/g, '0')
      .replace(/\\lnot/g, ' NOT_TEMP ')
      .replace(/\\neg/g, ' NOT_TEMP ')
      .replace(/\\overline{([^}]*)}/g, ' NOT_TEMP ($1) ')
      .replace(/\\land/g, ' * ') // Converted to * with spaces
      .replace(/\\lor/g, ' + ') // Converted to + with spaces
      .replace(/\\wedge/g, ' * ')
      .replace(/\\vee/g, ' + ')
      .replace(/\\cdot/g, ' * ')
      .replace(/∧/g, ' * ')
      .replace(/∨/g, ' + ')
      .replace(/¬/g, ' NOT_TEMP ')

    // Step 2.5: NOW check for invalid AND/OR operations using standard ops but WITH SPACES
    // These checks are now more effective as they see '*' and '+'.
    if (processedLatex.match(/\*\s*(\)|$)/)) {
      throw new Error('Invalid AND operation: missing right operand')
    }
    if (processedLatex.match(/(^|\()\s*\*/)) {
      throw new Error('Invalid AND operation: missing left operand')
    }
    if (processedLatex.match(/\+\s*(\)|$)/)) {
      throw new Error('Invalid OR operation: missing right operand')
    }
    if (processedLatex.match(/(^|\()\s*\+/)) {
      throw new Error('Invalid OR operation: missing left operand')
    }

    // Step 3: Convert placeholder NOT_TEMP to actual negation, ensuring parentheses
    // This ensures that whatever NOT_TEMP was applied to gets wrapped in !(...) if it's not already simple
    // First, handle cases where NOT_TEMP is followed by a parenthesized expression or a single variable/constant
    processedLatex = processedLatex.replace(/NOT_TEMP\s*\(([^)]*)\)/g, '!($1)')
    processedLatex = processedLatex.replace(/NOT_TEMP\s*([A-Z01](?!\w))/g, '!($1)') // Single char var/const
    // If NOT_TEMP is still there, it might be preceding something that needs grouping
    // This is a bit of a catch-all, might need refinement
    processedLatex = processedLatex.replace(/NOT_TEMP\s*([^\s\(\)]+)/g, '!($1)')
    processedLatex = processedLatex.replace(/NOT_TEMP/g, '!') // Cleanup any remaining NOT_TEMP to just !

    // Step 4: Remove all remaining spaces to prepare for implicit multiplication and final parsing
    processedLatex = processedLatex.replace(/\s+/g, '')

    // Handle potentially empty parentheses if they weren't part of an overline or other structure
    processedLatex = processedLatex.replace(/\(\)/g, '0')

    // Step 5: Handle implicit multiplication
    // Order is important here to avoid conflicts
    const insertImplicitMultiplication = (text: string): string => {
      let newText = text
      // Rule 1: VAR_OR_CONST followed by LPAREN:  A( -> A*(
      newText = newText.replace(/([A-Z01])\(/g, '$1*(')
      // Rule 2: RPAREN followed by VAR_OR_CONST: )A -> )*A
      newText = newText.replace(/\)([A-Z01])/g, ')*$1')
      // Rule 3: RPAREN followed by LPAREN: )( -> )*(
      newText = newText.replace(/\)\(/g, ')*(')
      // Rule 4: VAR_OR_CONST followed by VAR_OR_CONST: AB -> A*B, 1A -> 1*A, A1 -> A*1
      newText = newText.replace(/([A-Z01])([A-Z01])/g, '$1*$2')
      return newText
    }

    // Apply multiplication rules multiple times to handle complex cases like ABC -> A*B*C
    for (let i = 0; i < 3; i++) {
      const beforeIteration = processedLatex
      processedLatex = insertImplicitMultiplication(processedLatex)
      if (beforeIteration === processedLatex) break // Optimization: stop if no changes
    }

    // Step 6: Final cleanup
    processedLatex = processedLatex.replace(/\*{2,}/g, '*').replace(/\+{2,}/g, '+')
    // Double negation: !!X -> X. This was removed from preprocessing.
    // The main parser (fixProblematicPatterns) also had this, which was removed.
    // So, !! should remain for the parser to handle as NOT(NOT(...)).

    // Handle expressions like !()+X which could be produced by complex LaTeX, now !(0)+X
    processedLatex = processedLatex.replace(/!\(0\)/g, '1')

    // Step 7: Check for unbalanced parentheses (simple check, parser will do more)
    const openParenCount = (processedLatex.match(/\(/g) || []).length
    const closeParenCount = (processedLatex.match(/\)/g) || []).length

    if (openParenCount !== closeParenCount) {
      // This simple balancing might be too naive. The main parser should handle this.
      // For now, we can throw or let the main parser catch it.
      // Throwing here might be better to pinpoint LaTeX conversion issues.
      throw new Error(
        `Unbalanced parentheses after LaTeX conversion: ${openParenCount} opening, ${closeParenCount} closing. Original: "${latex}", Processed: "${processedLatex}"`
      )
    }

    // Check for missing operands again after all transformations (spaces removed)
    // This regex is for space-less strings.
    if (processedLatex.match(/(\*|\+)($|\))|(^|\()(\*|\+)/)) {
      const problemMatch = processedLatex.match(/(\*|\+)($|\))|(^|\()(\*|\+)/)
      const problemSegment = problemMatch ? problemMatch[0] : 'unknown segment'
      throw new Error(
        `Expression has a missing operand near "${problemSegment}" after conversion from LaTeX. Processed: "${processedLatex}"`
      )
    }

    // Ensure no leftover LaTeX commands (backslashes) remain
    if (processedLatex.includes('\\')) {
      console.warn('LaTeX conversion may be incomplete, LaTeX commands remain:', processedLatex)
      // Optionally, throw an error if strict conversion is required
      // throw new Error(`Incomplete LaTeX conversion. Leftover commands in: ${processedLatex}`)
    }

    // Final undefined check
    if (processedLatex.includes('undefined') || processedLatex.includes('null')) {
      throw new Error('The processed expression contains invalid JavaScript values')
    }

    return processedLatex
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    // Only show toast if not already shown in specific error conditions
    if (
      !errorMessage.includes('missing operand') &&
      !errorMessage.includes('invalid JavaScript values')
    ) {
      // toast.error removed
    }
    throw error
  }
}
