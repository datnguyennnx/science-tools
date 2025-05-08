'use client'

import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import { toast } from 'sonner'

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

    // Log for debugging if needed
    // console.log('Original:', formula);
    // console.log('Sanitized:', sanitizedFormula);

    // Render using BlockMath or InlineMath
    return (
      <div className={className}>
        {block ? <BlockMath math={sanitizedFormula} /> : <InlineMath math={sanitizedFormula} />}
      </div>
    )
  } catch (error) {
    // If KaTeX fails to render, fall back to plain text
    toast.error(`Error rendering LaTeX: ${error instanceof Error ? error.message : String(error)}`)
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
    .replace(/!/g, '\\lnot ') // NOT operator
    .replace(/0/g, '\\text{F}') // False
    .replace(/1/g, '\\text{T}') // True
}

// Convert LaTeX back to Boolean algebra notation
export function latexToBoolean(latex: string): string {
  if (!latex.trim()) return ''

  // First, normalize spacing to make processing more consistent
  let processedLatex = latex.replace(/\s+/g, ' ').trim()

  // Step 1: Handle LaTeX commands with consistent replacements
  // Replace commands that don't need parentheses added
  processedLatex = processedLatex
    .replace(/\\text{F}/g, '0') // False
    .replace(/\\text{T}/g, '1') // True

  // Step 2: Handle negations carefully - replace \lnot and \overline
  // Process one at a time to avoid nested replacement issues
  // Replace \lnot X with !(X) - adding parentheses for clarity
  processedLatex = processedLatex.replace(/\\lnot\s*(\S)(?!\S*\})/g, '!($1)')
  // Replace \lnot{X} with !(X)
  processedLatex = processedLatex.replace(/\\lnot\s*\{([^}]*)\}/g, '!($1)')
  // Replace \overline{X} with !(X)
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
  // Note: We do this after the operators are standardized
  const insertImplicitMultiplication = (text: string): string => {
    // Add * between two variables or a variable and a parenthesis
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

  // Remove any duplicate operators that may have been introduced
  processedLatex = processedLatex
    .replace(/\*{2,}/g, '*') // Replace multiple * with a single *
    .replace(/\+{2,}/g, '+') // Replace multiple + with a single +
    .replace(/!!/g, '') // Double negation: !!X -> X

  // Handle expressions like !()+X which could be produced by complex LaTeX
  processedLatex = processedLatex.replace(/!\(0\)/g, '1') // !() -> 1 (NOT false is true)

  // Ensure no leftover LaTeX commands remain
  if (processedLatex.includes('\\')) {
    toast.warning('LaTeX conversion may be incomplete')
  }

  return processedLatex
}
