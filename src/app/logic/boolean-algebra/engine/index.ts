/**
 * Boolean Algebra Engine
 *
 * This is the main entry point for the Boolean Algebra simplification engine.
 * It provides a facade for the existing application to interact with the
 * expression tree-based simplification system.
 */

// Import types from AST module
import type {
  BooleanExpression,
  SimplificationStep,
  SimplificationResult,
  LatexSimplificationStep,
  ExtendedLatexResults,
} from './ast'
import type { SimplifierConfig } from './simplifier'

// Import from parser module
import {
  parseExpression,
  expressionToBooleanString,
  expressionToLatexString,
  getValidExpressionExamples,
} from './parser'

// Import from simplifier module
import { simplify, simplifyExpression as simplifyExprString } from './simplifier'

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
export const getLatexRes = (
  expression: string | BooleanExpression,
  config?: Partial<SimplifierConfig>
): ExtendedLatexResults => {
  const result: SimplificationResult = simplify(expression, config)
  const latexSteps: LatexSimplificationStep[] = result.steps.map((step: SimplificationStep) => ({
    ruleName: step.ruleName,
    ruleFormula: step.ruleFormula, // This is already LaTeX from rule definition
    beforeLatex: step.expressionTreeBefore
      ? expressionToLatexString(step.expressionTreeBefore)
      : // : step.expressionBefore, // Fallback if tree not available
        expressionToLatexString(parseExpression(step.expressionBefore)), // Ensure LaTeX
    afterLatex: step.expressionTreeAfter
      ? expressionToLatexString(step.expressionTreeAfter)
      : // : step.expressionAfter, // Fallback if tree not available
        expressionToLatexString(parseExpression(step.expressionAfter)), // Ensure LaTeX
    phase: step.phase,
  }))
  return {
    steps: latexSteps,
    finalLatex: result.simplifiedExpressionLatex,
    originalExpression: result.originalExpression,
    simplifiedExpressionString: result.simplifiedExpressionString,
  }
}

export {
  simplifyExprString as simplifyExpression,
  getLatexRes as getLatexResults,
  simplify as simplifyFull,
  type ExtendedLatexResults,
  type LatexSimplificationStep,
}
