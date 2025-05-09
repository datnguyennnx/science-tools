/**
 * Boolean Algebra Engine
 *
 * This is the main entry point for the Boolean Algebra simplification engine.
 * It provides a facade for the existing application to interact with the
 * expression tree-based simplification system.
 */

import { toast } from 'sonner'

// Import from core module
import type { BooleanExpression, SimplificationStep } from './core'
import {
  parseExpression,
  expressionToBooleanString,
  expressionToLatexString,
  getValidExpressionExamples,
} from './core'

// Import from simplification module
import { BooleanSimplifier } from './simplification'

// Import from conversion module
import { latexToBoolean } from './conversion'

// Import from generation module
import {
  generateRandomExpression,
  generatePatternedExpression,
  type GeneratorOptions,
  type ExpressionPattern,
} from './generation'

// Import sanitization utility
import { sanitizeExpression } from './utils'

// Re-export types
export type { BooleanExpression, SimplificationStep, GeneratorOptions, ExpressionPattern }

// Re-export generator functions
export { generateRandomExpression, generatePatternedExpression }

/**
 * Import the boolean laws from the simplification module
 */
import { booleanLaws } from './simplification/constants'
export { booleanLaws }

/**
 * Interface for simplification results that matches the format expected
 * by the existing presentation layer
 */
export interface SimplificationResults {
  steps: {
    lawName: string
    lawDefinition: string
    expressionBefore: string
    expressionAfter: string
  }[]
  finalExpression: string
}

/**
 * Interface for simplification results with LaTeX formatting
 */
export interface LatexSimplificationResults {
  steps: {
    lawName: string
    lawDefinition: string
    expressionBefore: string
    expressionAfter: string
  }[]
  finalExpression: string
}

/**
 * Get basic simplification steps in the old format for backward compatibility
 */
export function getSimplificationSteps(expression: string) {
  try {
    // Sanitize the expression
    const sanitizedExpression = sanitizeExpression(expression)

    // Create a simplifier instance
    const simplifier = new BooleanSimplifier()

    // Get results with string formatting
    const results = simplifier.simplifyExpression(sanitizedExpression)

    return {
      steps: results.steps.map(step => ({
        expressionBefore: step.before,
        lawName: step.ruleName,
        lawDefinition: step.ruleFormula,
        expressionAfter: step.after,
      })),
      finalExpression: results.finalExpression,
    }
  } catch (error) {
    // Show toast notification with error
    const errorMessage = error instanceof Error ? error.message : String(error)
    toast.error(errorMessage)

    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Error simplifying expression: ${error.message}`)
    }
    throw new Error('Failed to simplify expression')
  }
}

/**
 * Simplify a boolean expression and return the results in the format
 * expected by the existing application
 */
export function simplifyBooleanExpression(expression: string): LatexSimplificationResults {
  try {
    // Sanitize and validate the expression
    if (!expression || expression.trim() === '') {
      return {
        steps: [],
        finalExpression: '',
      }
    }

    // Sanitize the expression to catch 'undefined' values
    const sanitizedExpression = sanitizeExpression(expression)

    // First convert from LaTeX to our internal boolean representation
    const booleanExpr = latexToBoolean(sanitizedExpression)

    // Create a simplifier instance
    const simplifier = new BooleanSimplifier()

    // Get results with LaTeX formatting
    const results = simplifier.getLatexResults(booleanExpr)

    // Convert to the interface expected by the presentation layer
    return {
      steps: results.steps.map(step => ({
        lawName: step.ruleName,
        lawDefinition: step.ruleFormula,
        expressionBefore: step.beforeLatex,
        expressionAfter: step.afterLatex,
      })),
      finalExpression: results.finalLatex,
    }
  } catch (error) {
    // Show toast notification with error
    const errorMessage = error instanceof Error ? error.message : String(error)
    toast.error(errorMessage)

    // Instead of returning an empty result, throw the error to allow proper error handling
    if (error instanceof Error) {
      throw new Error(`Error simplifying expression: ${error.message}`)
    }
    throw new Error('Failed to simplify expression')
  }
}

// Create compatibility layer for ExpressionParser
export const ExpressionParser = {
  parse: parseExpression,
  toBooleanString: expressionToBooleanString,
  toLatexString: expressionToLatexString,
  getValidExamples: getValidExpressionExamples,
}

// Re-export BooleanSimplifier
export { BooleanSimplifier }
