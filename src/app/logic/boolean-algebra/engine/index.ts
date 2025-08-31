/**
 * Boolean Algebra Engine
 *
 * This is the main entry point for the Boolean Algebra simplification engine.
 * It provides a facade for the existing application to interact with the
 * expression tree-based simplification system.
 *
 * REFACTORING STATUS: Complete modular refactor with enhanced capabilities
 * - Complete algebraic simplification with XNOR expansion
 * - Double negation elimination and NOR expansion
 * - Truth table and algebraic verification
 * - Canonical form conversion (SoP/PoS)
 * - Functional programming patterns throughout
 * - Comprehensive error handling and performance optimization
 */

// Import types from AST module
import type {
  BooleanExpression,
  SimplificationStep,
  SimplificationResult,
  LatexSimplificationStep,
  ExtendedLatexResults,
} from './ast'
import type { SimplificationConfig } from './core/boolean-types'

// Import from parser module
import {
  parseExpression,
  expressionToBooleanString,
  expressionToLatexString,
  getValidExpressionExamples,
} from './parser/parser'

// Import from modular simplifier system
import { simplifyCompletely, simplifyExpression as simplifyExprString } from './simplifier/core'

// Import from generator module
import {
  generateRandomExpression,
  generatePatternedExpression,
  type GeneratorOptions,
  type ExpressionPattern,
} from './generator'

// Import from evaluator module
import { evaluateExpression, generateTruthTable } from './evaluator/evaluator'

// Re-export core types
export type { BooleanExpression, SimplificationStep }

// Re-export generator types and functions
export type { GeneratorOptions, ExpressionPattern }
export { generateRandomExpression, generatePatternedExpression }

// Re-export evaluator functions
export { evaluateExpression, generateTruthTable }

/**
 * Unified interface for simplification results
 */
export interface SimplificationResults {
  steps: Array<{
    lawName: string
    lawDefinition: string
    expressionBefore: string
    expressionAfter: string
  }>
  finalExpression: string
}

// Create compatibility layer for ExpressionParser, using functions from the parser module
export const ExpressionParser = {
  parse: parseExpression,
  toBooleanString: expressionToBooleanString,
  toLatexString: expressionToLatexString,
  getValidExamples: getValidExpressionExamples,
}

// Helper function to convert step to LaTeX with timeout protection
const stepToLatex = (step: SimplificationStep): LatexSimplificationStep => {
  try {
    let beforeLatex: string
    let afterLatex: string

    if (step.expressionTreeBefore) {
      beforeLatex = expressionToLatexString(step.expressionTreeBefore)
    } else {
      // For string expressions, try to convert but with fallback
      try {
        beforeLatex = expressionToLatexString(parseExpression(step.expressionBefore))
      } catch {
        beforeLatex = step.expressionBefore // Fallback to original string
      }
    }

    if (step.expressionTreeAfter) {
      afterLatex = expressionToLatexString(step.expressionTreeAfter)
    } else {
      try {
        afterLatex = expressionToLatexString(parseExpression(step.expressionAfter))
      } catch {
        afterLatex = step.expressionAfter // Fallback to original string
      }
    }

    return {
      ruleName: step.ruleName,
      ruleFormula: step.ruleFormula,
      ruleDescription: step.ruleDescription,
      beforeLatex,
      afterLatex,
      phase: step.phase,
    }
  } catch (error) {
    console.warn('[Engine] Failed to convert step to LaTeX:', error)
    // Return a simplified version on error
    return {
      ruleName: step.ruleName,
      ruleFormula: step.ruleFormula,
      ruleDescription: step.ruleDescription,
      beforeLatex: step.expressionBefore,
      afterLatex: step.expressionAfter,
      phase: step.phase,
    }
  }
}

// Export the functional APIs for simplification
export const getLatexRes = async (
  expression: string | BooleanExpression,
  config?: Partial<SimplificationConfig>
): Promise<ExtendedLatexResults> => {
  try {
    // Convert string to BooleanExpression if needed with timeout protection
    let exprToSimplify: BooleanExpression

    if (typeof expression === 'string') {
      // Add timeout for parsing to prevent blocking
      const parseTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Parsing timeout - expression too complex')), 3000)
      })

      const parsePromise = new Promise<BooleanExpression>((resolve, reject) => {
        try {
          const result = parseExpression(expression)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      exprToSimplify = await Promise.race([parsePromise, parseTimeoutPromise])
    } else {
      exprToSimplify = expression
    }

    // Add timeout for simplification to prevent blocking
    const simplifyTimeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Simplification timeout - expression too complex')), 8000)
    })

    const simplifyPromise = new Promise<SimplificationResult>((resolve, reject) => {
      try {
        const result = simplifyCompletely(exprToSimplify, config)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })

    const result = await Promise.race([simplifyPromise, simplifyTimeoutPromise])

    // Convert steps to LaTeX with timeout protection
    const latexConversionTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('LaTeX conversion timeout')), 2000)
    })

    const latexConversionPromise = new Promise<ExtendedLatexResults>((resolve, reject) => {
      try {
        const latexResult = {
          steps: result.steps.map(stepToLatex),
          finalLatex: result.simplifiedExpressionLatex,
          originalExpression: result.originalExpression,
          simplifiedExpressionString: result.simplifiedExpressionString,
        }
        resolve(latexResult)
      } catch (error) {
        reject(error)
      }
    })

    return await Promise.race([latexConversionPromise, latexConversionTimeout])
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred during simplification'
    console.error('[Engine] getLatexRes failed:', errorMessage)

    // Return a basic result for error cases
    return {
      steps: [],
      finalLatex: typeof expression === 'string' ? expression : '',
      originalExpression: typeof expression === 'string' ? expression : '',
      simplifiedExpressionString: typeof expression === 'string' ? expression : '',
    }
  }
}

// Backward compatibility aliases
export const simplify = simplifyCompletely
export const simplifyFull = simplifyCompletely

export {
  simplifyExprString as simplifyExpression,
  getLatexRes as getLatexResults,
  type ExtendedLatexResults,
  type LatexSimplificationStep,
}
