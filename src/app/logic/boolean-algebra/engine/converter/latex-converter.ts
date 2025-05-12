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

    // Step 2: Handle LaTeX constants and basic commands sequentially
    // Constants
    processedLatex = processedLatex.replace(/\\text{T}/g, '1')
    processedLatex = processedLatex.replace(/\\text{F}/g, '0')
    processedLatex = processedLatex.replace(/\\text{TRUE}/gi, '1')
    processedLatex = processedLatex.replace(/\\text{FALSE}/gi, '0')
    processedLatex = processedLatex.replace(/\\mathrm{T}/g, '1')
    processedLatex = processedLatex.replace(/\\mathrm{F}/g, '0')

    // Operators (ensure commands with overlapping prefixes are ordered carefully if needed)
    // Using NOT_TEMP placeholder for negation to handle precedence later
    processedLatex = processedLatex.replace(/\\lnot/g, ' NOT_TEMP ')
    processedLatex = processedLatex.replace(/\\neg/g, ' NOT_TEMP ')
    processedLatex = processedLatex.replace(/\\overline{([^}]*)}/g, ' NOT_TEMP ($1) ') // Specific overline handling
    processedLatex = processedLatex.replace(/\\land/g, ' * ')
    processedLatex = processedLatex.replace(/\\lor/g, ' + ')
    processedLatex = processedLatex.replace(/\\wedge/g, ' * ')
    processedLatex = processedLatex.replace(/\\vee/g, ' + ')
    processedLatex = processedLatex.replace(/\\cdot/g, ' * ')
    processedLatex = processedLatex.replace(/\\oplus/g, ' ^ ')
    processedLatex = processedLatex.replace(/\\uparrow/g, ' @ ') // Corrected regex
    processedLatex = processedLatex.replace(/\\downarrow/g, ' # ')
    processedLatex = processedLatex.replace(/\\leftrightarrow/g, ' <=> ')

    // Unicode symbols
    processedLatex = processedLatex.replace(/∧/g, ' * ')
    processedLatex = processedLatex.replace(/∨/g, ' + ')
    processedLatex = processedLatex.replace(/¬/g, ' NOT_TEMP ')

    // Step 2.5: NOW check for invalid AND/OR operations using standard ops but WITH SPACES
    // These checks are now more effective as they see '*' and '+'.
    if (/\*\s*(\)|$)/.test(processedLatex)) {
      // Missing right operand for AND
      throw new Error('Invalid AND operation: missing right operand')
    }
    if (/(^|\()\s*\*/.test(processedLatex)) {
      // Missing left operand for AND - Use test()
      throw new Error('Invalid AND operation: missing left operand')
    }
    if (/\+\s*(\)|$)/.test(processedLatex)) {
      // Missing right operand for OR
      throw new Error('Invalid OR operation: missing right operand')
    }
    if (/(^|\()\s*\+/.test(processedLatex)) {
      // Missing left operand for OR
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

    // Step 5: Convert all variables to uppercase *after* removing spaces
    // This ensures variable names are consistently uppercase before implicit multiplication
    processedLatex = processedLatex.replace(/[a-zA-Z]+/g, match => match.toUpperCase())

    // Step 6: Handle potentially empty parentheses if they weren't part of an overline or other structure
    processedLatex = processedLatex.replace(/\(\)/g, '0')

    // Step 7: Handle implicit multiplication
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

    // Step 8: Final cleanup
    processedLatex = processedLatex.replace(/\*{2,}/g, '*').replace(/\+{2,}/g, '+')
    // Double negation: !!X -> X. This was removed from preprocessing.
    // The main parser (fixProblematicPatterns) also had this, which was removed.
    // So, !! should remain for the parser to handle as NOT(NOT(...)).

    // Handle expressions like !()+X which could be produced by complex LaTeX, now !(0)+X
    processedLatex = processedLatex.replace(/!\(0\)/g, '1')

    // Step 9: Check for unbalanced parentheses (simple check, parser will do more)
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

    // Step 10: Check for missing operands again after all transformations (spaces removed)
    if (processedLatex.match(/(\*|\+)($|\))|(^|\()(\*|\+)/)) {
      const problemMatch = processedLatex.match(/(\*|\+)($|\))|(^|\()(\*|\+)/)
      const problemSegment = problemMatch ? problemMatch[0] : 'unknown segment'
      throw new Error(
        `Expression has a missing operand near "${problemSegment}" after conversion from LaTeX. Processed: "${processedLatex}"`
      )
    }

    // Step 10.5: Add general cleanup for unknown commands and braces before the final backslash check
    processedLatex = processedLatex.replace(/\\\\[a-zA-Z]+/g, '') // Corrected regex for unknown commands (e.g., \\unknown)
    processedLatex = processedLatex.replace(/[{}]/g, '') // Remove any stray braces

    // Step 11: Ensure no leftover LaTeX commands (backslashes) remain
    if (processedLatex.includes('\\\\')) {
      throw new Error(
        `Incomplete LaTeX conversion. Leftover commands found in processed string: "${processedLatex}". Original: "${latex}"`
      )
    }

    // Step 12: Final undefined check
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
