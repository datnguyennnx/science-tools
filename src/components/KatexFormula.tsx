'use client'

import { InlineMath, BlockMath } from 'react-katex'
interface KatexFormulaProps {
  formula: string
  block?: boolean
  className?: string
}

export function KatexFormula({ formula, block = false, className = '' }: KatexFormulaProps) {
  // Sanitize the formula to ensure it can be properly processed by KaTeX
  let sanitizedFormula = formula

  try {
    // Try to fix common issues in LaTeX expressions
    if (formula.includes('\\not') || formula.includes('\\text')) {
      // Fix raw LaTeX expressions that use \not and \text
      sanitizedFormula = formula
        .replace(/\\not\s+(\w)/g, '\\lnot $1') // Replace \not X with \lnot X
        .replace(/\\not\s*{([^}]*)}/g, '\\lnot{$1}') // Replace \not{X} with \lnot{X}
        .replace(/\$\\text/g, '\\text') // Fix any $\text that might appear
        .replace(/\\text{([^}]*)}/g, '\\text{$1}') // Ensure \text is properly formatted
    }

    // Render using BlockMath or InlineMath
    return (
      <div className={className}>
        {block ? <BlockMath math={sanitizedFormula} /> : <InlineMath math={sanitizedFormula} />}
      </div>
    )
  } catch (error) {
    return (
      <div className={`${className} p-2 bg-red-50 text-red-500 rounded font-mono text-sm `}>
        Error: {(error as Error).message || 'Invalid LaTeX syntax'}
      </div>
    )
  }
}

// Convert Boolean algebra notation to LaTeX
export function booleanToLatex(expression: string): string {
  if (!expression.trim()) return ''

  // Check if the input already contains LaTeX commands
  // Look for common LaTeX patterns: \not, \land, \lor, \text, etc.
  const hasLatexCommands = /\\(not|lnot|land|lor|text|\{|\})/.test(expression)

  // Enhanced detection - check for patterns that look like raw LaTeX
  if (hasLatexCommands || expression.includes('\\not') || expression.includes('\\text')) {
    // For raw LaTeX, ensure certain formatting is correct
    return expression
      .replace(/\\not\s+/g, '\\lnot ') // Convert \not to \lnot with proper spacing
      .replace(/\\not{/g, '\\lnot{') // Convert \not{ to \lnot{
  }

  // If not already LaTeX, replace boolean operators with LaTeX equivalents
  return expression
    .replace(/\*/g, '\\land ') // AND operator
    .replace(/\+/g, '\\lor ') // OR operator
    .replace(/<=>/g, '\\leftrightarrow ') // XNOR
    .replace(/\^/g, '\\oplus ') // XOR
    .replace(/@/g, '\\uparrow ') // NAND
    .replace(/#/g, '\\downarrow ') // NOR
    .replace(/!/g, '\\lnot ') // NOT operator
    .replace(/0/g, '\\text{F}') // False
    .replace(/1/g, '\\text{T}') // True
}

// Convert LaTeX back to Boolean algebra notation
export function latexToBoolean(latex: string): string {
  if (!latex.trim()) return ''

  // Step 1: Normalize spacing
  let processedLatex = latex.replace(/\s+/g, ' ').trim()

  // Step 2: Replace known LaTeX commands and text constants
  // Replace commands WITHOUT adding extra spaces around operators initially
  processedLatex = processedLatex
    .replace(/\text{F}/gi, '0')
    .replace(/\text{T}/gi, '1')
    .replace(/\mathrm{F}/gi, '0')
    .replace(/\mathrm{T}/gi, '1')
    .replace(/\lnot|\neg/g, '!') // NOT
    .replace(/\land|\wedge/g, '*') // AND
    .replace(/\lor|\vee/g, '+') // OR
    .replace(/\oplus/g, '^') // XOR
    .replace(/\\uparrow/g, '@') // NAND - Escaped backslash in regex
    .replace(/\downarrow/g, '#') // NOR
    .replace(/\leftrightarrow/g, '<=>') // XNOR
    // Handle overline recursively
    .replace(/\overline\s*\{([^}]*)\}/g, (match, content) => `!(${latexToBoolean(content)})`)

  // Step 3: Force remaining alphabetic characters (variables) to uppercase
  processedLatex = processedLatex.replace(/[a-z]+/gi, match => match.toUpperCase()) // Ensure ALL letters become uppercase

  // Step 4: Aggressive cleanup of leftover LaTeX commands/artifacts
  processedLatex = processedLatex.replace(/\\[a-zA-Z]+/g, '') // Remove command words like \textit etc.
  processedLatex = processedLatex.replace(/[\\{}]/g, '') // Remove stray backslashes or braces

  // Step 5: Remove ALL whitespace (critical before implicit multiplication)
  processedLatex = processedLatex.replace(/\s+/g, '')

  // Step 6: Handle potentially empty parentheses from cleanup
  processedLatex = processedLatex.replace(/\(\)/g, '') // Remove ()

  // Step 7: Handle implicit multiplication
  const insertImplicitMultiplication = (text: string): string => {
    // Add * between two variables/constants or a variable/constant and a parenthesis
    // (Ensure this logic only targets A-Z and 0-1 now)
    return text
      .replace(/([A-Z01])([A-Z01])/g, '$1*$2') // AB -> A*B, 1A -> 1*A, A1 -> A*1
      .replace(/([A-Z01])\(/g, '$1*(') // A( -> A*( , 1( -> 1*(
      .replace(/\)([A-Z01])/g, ')*$1') // )A -> )*A , )1 -> )*1
      .replace(/\)\(/g, ')*(') // )( -> )*(
  }

  // Apply multiplication rules multiple times
  let previousText
  for (let i = 0; i < 5; i++) {
    // Increase iterations slightly just in case
    previousText = processedLatex
    processedLatex = insertImplicitMultiplication(processedLatex)
    if (processedLatex === previousText) break // Optimization
  }

  // Step 8: Final cleanup of operators and constants
  processedLatex = processedLatex
    .replace(/\*{2,}/g, '*') // Replace multiple * with single *
    .replace(/\+{2,}/g, '+') // Replace multiple + with single +
  // Parser handles !!

  // Handle constants simplification only after all structure is set
  processedLatex = processedLatex.replace(/!0/g, '1') // !0 -> 1
  processedLatex = processedLatex.replace(/!1/g, '0') // !1 -> 0

  // Final validation check (optional)
  if (/[^A-Z01*+!^@#<=>()]/.test(processedLatex)) {
    console.warn('Potential invalid characters remain after LaTeX conversion:', processedLatex)
    // throw new Error(`Invalid characters detected after LaTeX conversion: ${processedLatex}`);
  }

  return processedLatex
}
