'use client'

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
  let processedLatex = latex.replace(/\\s+/g, ' ').trim()

  // Step 1: Handle LaTeX commands with consistent replacements
  // Replace commands that don't need parentheses added
  processedLatex = processedLatex
    .replace(/\\text{F}/g, '0') // False
    .replace(/\\text{T}/g, '1') // True
    // Replace LaTeX logic symbols *before* complex regex checks
    .replace(/\\lnot/g, '!') // Basic NOT replacement
    .replace(/\\land/g, '*') // AND operator (fixed double backslash)
    .replace(/\\lor/g, '+') // OR operator (fixed double backslash)
    .replace(/\\overline\\s*\\{([^}]*)\\}/g, '!($1)') // Overline (fixed double backslash)

  // Step 2: Cleanup potentially problematic patterns left by simple replacement
  // (The complex regexes for \\lnot are removed as the simple replacement above is usually sufficient
  // and less error-prone before parsing. The boolean parser should handle precedence.)

  // Step 3: Clean up any leftover spaces and other symbols
  processedLatex = processedLatex.replace(/\\s+/g, '')

  // Handle potentially empty parentheses introduced by replacements like !{}
  processedLatex = processedLatex.replace(/\\(\\)/g, '') // Replace () possibly left by !{}

  // Step 4: Handle implicit multiplication
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

  // Step 5: Final cleanup
  processedLatex = processedLatex
    .replace(/\*{2,}/g, '*') // Replace multiple * with a single *
    .replace(/\+{2,}/g, '+') // Replace multiple + with a single +
    .replace(/!!/g, '') // Double negation: !!X -> X

  // Handle expressions like !0 which could be produced
  processedLatex = processedLatex.replace(/!0/g, '1') // !0 -> 1 (NOT false is true)
  processedLatex = processedLatex.replace(/!1/g, '0') // !1 -> 0 (NOT true is false)

  // Ensure no leftover LaTeX commands remain
  if (processedLatex.includes('\\')) {
    toast.warning('LaTeX conversion may be incomplete')
  }

  return processedLatex
}
