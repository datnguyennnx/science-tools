/**
 * Expression Processor
 *
 * Preprocesses boolean expressions from different input formats (standard, LaTeX).
 * Handles operator normalization, implicit multiplication, and pattern fixing.
 */

import { InputFormat } from './types'
import { fixProblematicPatterns } from './utils/patterns'

// ===== STANDARD FORMAT HANDLERS =====

/**
 * Preprocess standard boolean expression format
 */
export function preprocessStandardInput(input: string, isInitialParse: boolean = true): string {
  let processed = input.trim()
  processed = normalizeStandardOperators(processed)
  processed = fixProblematicPatterns(processed)
  if (isInitialParse) {
    processed = addImplicitStandardOperators(processed)
  }
  return processed
}

/**
 * Add implicit AND operators for standard format
 */
function addImplicitStandardOperators(input: string): string {
  let processed = input
  let previous = ''
  while (previous !== processed) {
    previous = processed
    processed = processed
      .replace(/([A-Z01])([A-Z01])/g, '$1*$2')
      .replace(/([A-Z01])\(/g, '$1*(')
      .replace(/\)([A-Z01])/g, ')*$1')
      .replace(/\)\(/g, ')*(')
  }
  return processed
}

/**
 * Normalize operators to standard symbolic form
 */
export function normalizeStandardOperators(input: string): string {
  let processed = input.trim()

  if (processed === '') {
    return ''
  }

  processed = processed.replace(/\bNOT\b\s*\((.*?)\)/gi, '!($1)')
  processed = processed.replace(/\bNOT\b/gi, '!')
  processed = processed.replace(/~/g, '!')
  processed = processed.replace(/¬/g, '!')

  processed = processed.replace(/\bAND\b/gi, '*')
  processed = processed.replace(/&&/g, '*')
  processed = processed.replace(/&/g, '*')
  processed = processed.replace(/∧∧/g, '*')
  processed = processed.replace(/∧/g, '*')
  processed = processed.replace(/·/g, '*')

  processed = processed.replace(/\bOR\b/gi, '+')
  processed = processed.replace(/\|\|/g, '+')
  processed = processed.replace(/\|/g, '+')
  processed = processed.replace(/∨∨/g, '+')
  processed = processed.replace(/∨/g, '+')

  processed = processed.replace(/\bXOR\b/gi, '^')
  processed = processed.replace(/\bNAND\b/gi, '@')
  processed = processed.replace(/\bNOR\b/gi, '#')
  processed = processed.replace(/\bXNOR\b/gi, '<=>')
  processed = processed.replace(/↔/g, '<=>') // Unicode biconditional

  processed = processed.replace(/\s*\*\s*/g, '*')
  processed = processed.replace(/\s*\+\s*/g, '+')
  processed = processed.replace(/\s*!\s*/g, '!')
  processed = processed.replace(/\s*\^\s*/g, '^')
  processed = processed.replace(/\s*@\s*/g, '@')
  processed = processed.replace(/\s*#\s*/g, '#')

  // Handle Unicode symbols for XOR and NOR
  processed = processed.replace(/⊕/g, '^') // Unicode XOR to caret
  processed = processed.replace(/↓/g, '#') // Unicode NOR to hash
  processed = processed.replace(/\s*<=>\s*/g, '<=>')

  processed = processed.replace(/\s+/g, '')

  return processed
}

// ===== LATEX FORMAT HANDLERS =====

/**
 * Preprocess LaTeX boolean expression format
 */
export function preprocessLatexInput(input: string, isInitialParse: boolean = true): string {
  let processed = input.trim()

  processed = processed.replace(
    /\\(?:[:;]|quad|qquad|smallspace|medspace|largespace|thinspace|negthinspace|thickspace)|~/g,
    ' '
  )

  processed = normalizeLatexOperators(processed)
  processed = fixProblematicPatterns(processed)

  if (isInitialParse) {
    processed = addImplicitLatexOperators(processed)
  }
  return processed
}

/**
 * Add implicit operators for LaTeX format
 */
function addImplicitLatexOperators(input: string): string {
  return addImplicitStandardOperators(input)
}

/**
 * Convert LaTeX operators to standard boolean operators
 */
// Helper function to process any remaining LaTeX operators that weren't caught in the main loop
function processRemainingOperator(match: string, command: string): string {
  const operatorMap: { [key: string]: string } = {
    leftrightarrow: ' XNOR ',
    Leftrightarrow: ' XNOR ',
    rightarrow: ' OR ',
    leftarrow: ' OR ',
    Leftarrow: ' OR ',
    Rightarrow: ' OR ',
    uparrow: ' NAND ',
    downarrow: ' NOR ',
    to: ' OR ',
    gets: ' OR ', // ← alternative
    iff: ' XNOR ',
    equiv: ' XNOR ',
    cong: ' XNOR ',
    approx: ' XNOR ',
    parr: ' XNOR ',
    parrow: ' XNOR ',
    cdot: ' AND ',
    times: ' AND ',
    div: ' OR ',
    pm: ' XOR ',
    mp: ' XOR ',
    not: ' NOT ',
    sim: ' XOR ',
    lnot: ' NOT ',
    neg: ' NOT ',
    land: ' AND ',
    wedge: ' AND ',
    lor: ' OR ',
    vee: ' OR ',
    oplus: ' XOR ',
    overline: ' NOT(', // Special handling for overline
    bar: ' NOT(',
  }

  if (operatorMap[command]) {
    if (command === 'overline' || command === 'bar') {
      // Handle overline specially - it needs parentheses
      return operatorMap[command] + match.replace(/\\[a-zA-Z]+\s*\{([^}]*)\}/, '$1') + ') '
    }
    return operatorMap[command]
  }

  return match // No replacement found
}

export function normalizeLatexOperators(input: string): string {
  let normalized = ' ' + input + ' '

  // Handle overline notation variations first (most complex patterns)
  let prevNormalized
  do {
    prevNormalized = normalized
    // Handle complex overline with nested braces
    normalized = normalized.replace(/\\overline\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, ' NOT($1) ')
    normalized = normalized.replace(/\\overline\s*\{([^}]+)\}/g, ' NOT($1) ')
    normalized = normalized.replace(/\\overline\s+([A-Za-z0-9])/g, ' NOT($1) ')
    normalized = normalized.replace(/\\bar\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, ' NOT($1) ')
    normalized = normalized.replace(/\\bar\s*\{([^}]+)\}/g, ' NOT($1) ')
    normalized = normalized.replace(/\\bar\s+([A-Za-z0-9])/g, ' NOT($1) ')
  } while (normalized !== prevNormalized)

  // LaTeX logical operators - comprehensive mapping with multiple variations
  // Core logical operators (most common) - process in specific order to avoid conflicts
  normalized = normalized.replace(/\\lnot/g, ' NOT ')
  normalized = normalized.replace(/\\neg/g, ' NOT ')
  normalized = normalized.replace(/\\land/g, ' AND ')
  normalized = normalized.replace(/\\wedge/g, ' AND ')
  normalized = normalized.replace(/\\lor/g, ' OR ')
  normalized = normalized.replace(/\\vee/g, ' OR ')
  normalized = normalized.replace(/\\oplus/g, ' XOR ')

  // Arrow operators (longer names first to avoid partial matches)
  // Process in order of specificity - longer/more specific patterns first
  normalized = normalized.replace(/\\leftrightarrow/g, ' XNOR ') // ↔
  normalized = normalized.replace(/\\Leftrightarrow/g, ' XNOR ') // ⇔
  normalized = normalized.replace(/\\rightarrow/g, ' OR ') // →
  normalized = normalized.replace(/\\leftarrow/g, ' OR ') // ←
  normalized = normalized.replace(/\\Leftarrow/g, ' OR ') // ⇐
  normalized = normalized.replace(/\\Rightarrow/g, ' OR ') // ⇒
  normalized = normalized.replace(/\\uparrow/g, ' NAND ') // ↑ (up arrow = NAND)
  normalized = normalized.replace(/\\downarrow/g, ' NOR ') // ↓ (down arrow = NOR)
  normalized = normalized.replace(/\\to/g, ' OR ') // →
  normalized = normalized.replace(/\\gets/g, ' OR ') // ← (alternative)

  // Biconditional/XNOR operators (multiple variations)
  normalized = normalized.replace(/\\iff/g, ' XNOR ') // if and only if
  normalized = normalized.replace(/\\equiv/g, ' XNOR ') // equivalent
  normalized = normalized.replace(/\\cong/g, ' XNOR ') // congruent
  normalized = normalized.replace(/\\approx/g, ' XNOR ') // approximately equal
  normalized = normalized.replace(/\\parr/g, ' XNOR ') // bidirectional arrow
  normalized = normalized.replace(/\\parrow/g, ' XNOR ') // bidirectional arrow

  // Additional LaTeX operators
  normalized = normalized.replace(/\\cdot/g, ' AND ') // multiplication dot
  normalized = normalized.replace(/\\times/g, ' AND ') // multiplication symbol
  normalized = normalized.replace(/\\div/g, ' OR ') // division (sometimes used for OR)
  normalized = normalized.replace(/\\pm/g, ' XOR ') // plus/minus (sometimes used for XOR)
  normalized = normalized.replace(/\\mp/g, ' XOR ') // minus/plus (sometimes used for XOR)
  normalized = normalized.replace(/\\not/g, ' NOT ') // standalone not
  normalized = normalized.replace(/\\sim/g, ' XOR ') // similarity (sometimes used for XOR)

  // Handle any remaining LaTeX commands that might exist
  // Be extremely conservative - only remove commands that are clearly LaTeX and not part of processed operators
  // First, ensure all known operators have been processed
  const knownOperators = [
    'leftrightarrow',
    'Leftrightarrow',
    'rightarrow',
    'leftarrow',
    'Leftarrow',
    'Rightarrow',
    'uparrow',
    'downarrow',
    'to',
    'gets',
    'iff',
    'equiv',
    'cong',
    'approx',
    'parr',
    'parrow',
    'cdot',
    'times',
    'div',
    'pm',
    'mp',
    'not',
    'sim',
    'lnot',
    'neg',
    'land',
    'wedge',
    'lor',
    'vee',
    'oplus',
    'overline',
    'bar',
    'text',
    'mathrm',
  ]

  // Only remove LaTeX commands that are NOT in our known operators list (in case we missed some)
  // This prevents removing parts of valid processed operators
  normalized = normalized.replace(/\\([a-zA-Z]+)(?:\s*\{[^}]*\})*/g, (match, command) => {
    // If this is a known operator that should have been processed, something went wrong
    if (knownOperators.includes(command)) {
      // Instead of warning, try to process it again with the specific replacement
      const processedMatch = processRemainingOperator(match, command)
      if (processedMatch !== match) {
        return processedMatch // Successfully processed
      }
      // If still not processed, leave it to cause a clear error
      return match
    }
    return '' // Remove unknown LaTeX commands
  })

  // Final verification: Check for any remaining backslashes followed by letters
  const remainingLatex = normalized.match(/\\[a-zA-Z]+/g)
  if (remainingLatex && remainingLatex.length > 0) {
    console.warn('Warning: Unprocessed LaTeX commands found:', remainingLatex)
  }

  normalized = normalized.replace(/∧/g, ' AND ')
  normalized = normalized.replace(/∨/g, ' OR ')
  normalized = normalized.replace(/¬/g, ' NOT ')
  normalized = normalized.replace(/⊕/g, ' XOR ') // Unicode XOR symbol
  normalized = normalized.replace(/↓/g, ' NOR ') // Unicode NOR symbol
  normalized = normalized.replace(/↔/g, ' XNOR ') // Unicode biconditional

  normalized = normalized.replace(/\\text\s*{\s*(?:TRUE|T)\s*}/gi, ' 1 ')
  normalized = normalized.replace(/\\text\s*{\s*(?:FALSE|F)\s*}/gi, ' 0 ')
  normalized = normalized.replace(/\\mathrm\s*{\s*(?:TRUE|T)\s*}/gi, ' 1 ')
  normalized = normalized.replace(/\\mathrm\s*{\s*(?:FALSE|F)\s*}/gi, ' 0 ')

  // Final cleanup: Remove any remaining backslashes that might be standalone
  // This is very conservative to avoid removing backslashes from valid content
  normalized = normalized.replace(/\\(?![a-zA-Z])/g, '') // Only remove backslashes NOT followed by letters

  normalized = normalizeStandardOperators(normalized.trim())

  return normalized
}

// ===== MAIN INPUT PROCESSOR =====

/**
 * Main entry point for preprocessing expressions based on format
 */
export function preprocessInput(
  input: string,
  format: InputFormat = 'standard',
  isInitialParse: boolean = true
): string {
  switch (format) {
    case 'latex':
      return preprocessLatexInput(input, isInitialParse)
    case 'standard':
    default:
      return preprocessStandardInput(input, isInitialParse)
  }
}

/**
 * Normalize operators based on input format
 */
export function normalizeOperators(input: string, format: InputFormat = 'standard'): string {
  switch (format) {
    case 'latex':
      return normalizeLatexOperators(input)
    case 'standard':
    default:
      return normalizeStandardOperators(input)
  }
}
