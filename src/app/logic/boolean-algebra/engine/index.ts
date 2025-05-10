/**
 * Boolean Algebra Engine
 *
 * This is the main entry point for the Boolean Algebra simplification engine.
 * It provides a facade for the existing application to interact with the
 * expression tree-based simplification system.
 */

// Import types from AST module
import type { BooleanExpression, SimplificationStep } from './ast'

// Import from parser module
import {
  parseExpression,
  expressionToBooleanString,
  expressionToLatexString,
  getValidExpressionExamples,
} from './parser'

// Import from simplifier module
import { simplifyExpression as simplifyExpr, getLatexResults as getLatexRes } from './simplifier'

// Import from generator module
import {
  generateRandomExpression,
  generatePatternedExpression,
  type GeneratorOptions,
  type ExpressionPattern,
} from './generator'

// Re-export core types
export type { BooleanExpression, SimplificationStep }

// Re-export generator types and functions
export type { GeneratorOptions, ExpressionPattern }
export { generateRandomExpression, generatePatternedExpression }

/**
 * Interface for simplification results that matches the format expected
 * by the existing presentation layer.
 * The `steps` provide string representations of the expressions.
 */
export interface SimplificationResults {
  steps: {
    lawName: string // Corresponds to ruleName from SimplificationStep
    lawDefinition: string // Corresponds to ruleFormula from SimplificationStep
    expressionBefore: string // Stringified version of expressionBefore from SimplificationStep
    expressionAfter: string // Stringified version of expressionAfter from SimplificationStep
  }[]
  finalExpression: string
}

/**
 * Interface for simplification results with LaTeX formatting.
 * The `steps` provide LaTeX string representations of the expressions.
 */
export interface LatexSimplificationResults {
  steps: {
    lawName: string // Corresponds to ruleName from SimplificationStep
    lawDefinition: string // Corresponds to ruleFormula from SimplificationStep
    expressionBefore: string // LaTeX stringified version
    expressionAfter: string // LaTeX stringified version
  }[]
  finalExpression: string
}

// Create compatibility layer for ExpressionParser, using functions from the parser module
export const ExpressionParser = {
  parse: parseExpression,
  toBooleanString: expressionToBooleanString,
  toLatexString: expressionToLatexString,
  getValidExamples: getValidExpressionExamples,
}

// Export the functional APIs for simplification
export { simplifyExpr as simplifyExpression, getLatexRes as getLatexResults }
