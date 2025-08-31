/**
 * Main Minimizer Implementation
 *
 * This module contains the main minimization function that orchestrates
 * the minimization process using various strategies and techniques.
 */

import { BooleanExpression } from '../../ast/types'
import {
  MinimizationConfig,
  DEFAULT_MINIMIZATION_CONFIG,
  MinimizationStrategy,
  FinalResultFormat,
} from './config'
import { analyzeExpression } from './analyzer'
import {
  createTermCombinationMinimization,
  createKMapMinimization,
  createQuineMcCluskeyMinimization,
} from './transformers'
import { createComprehensiveMinimizationPipeline } from './pipeline'
import { applyFinalSimplification } from './final'
import { expressionsEqual } from '../../utils/comparison'

/**
 * Result of minimization process
 */
export interface MinimizationResult {
  intermediate?: BooleanExpression // Result after minimization but before final simplification
  minimal?: BooleanExpression // Fully simplified minimal form
  expression: BooleanExpression // The main result (minimal if available, otherwise intermediate)
}

/**
 * Main minimization function with multiple result format options
 */
export const minimizeExpression = (
  expr: BooleanExpression,
  config: Partial<MinimizationConfig> = {}
): BooleanExpression | MinimizationResult => {
  const activeConfig = { ...DEFAULT_MINIMIZATION_CONFIG, ...config }

  // For backward compatibility, if format is not BOTH, return just the expression
  if (activeConfig.finalResultFormat !== FinalResultFormat.BOTH) {
    return minimizeToSingleResult(expr, activeConfig)
  }

  // Return both intermediate and minimal forms
  return minimizeToBothResults(expr, activeConfig)
}

/**
 * Minimize expression to a single result (backward compatible)
 */
const minimizeToSingleResult = (
  expr: BooleanExpression,
  config: MinimizationConfig
): BooleanExpression => {
  // Determine strategy if not specified
  const strategy =
    config.strategy === MinimizationStrategy.COMPREHENSIVE
      ? analyzeExpression(expr)
      : config.strategy

  try {
    let result: BooleanExpression

    switch (strategy) {
      case MinimizationStrategy.TERM_COMBINATION:
        result = createTermCombinationMinimization(config)(expr)
        break

      case MinimizationStrategy.KARNAUGH_MAP:
        result = createKMapMinimization()(expr)
        break

      case MinimizationStrategy.QUINE_MCCLUSKEY:
        result = createQuineMcCluskeyMinimization()(expr)
        break

      case MinimizationStrategy.COMPREHENSIVE:
      default:
        result = createComprehensiveMinimizationPipeline(config).execute(expr)
        break
    }

    // Apply final simplification if requested
    if (config.finalResultFormat === FinalResultFormat.MINIMAL) {
      result = applyFinalSimplification(result)
    }

    return result
  } catch (error) {
    console.warn('[Minimization] Failed to minimize expression:', error)
    return expr // Return original expression on error
  }
}

/**
 * Minimize expression and return both intermediate and minimal forms
 */
const minimizeToBothResults = (
  expr: BooleanExpression,
  config: MinimizationConfig
): MinimizationResult => {
  // Get the intermediate result (without final simplification)
  const intermediateConfig = { ...config, finalResultFormat: FinalResultFormat.INTERMEDIATE }
  const intermediate = minimizeToSingleResult(expr, intermediateConfig)

  // Get the minimal result (with final simplification)
  const minimal = applyFinalSimplification(intermediate)

  // Determine the main result
  const expression = expressionsEqual(minimal, intermediate) ? intermediate : minimal

  return {
    intermediate,
    minimal,
    expression,
  }
}

/**
 * Minimize expression with specific strategy
 */
export const minimizeWithStrategy = (
  expr: BooleanExpression,
  strategy: MinimizationStrategy,
  config: Partial<MinimizationConfig> = {}
): BooleanExpression | MinimizationResult => {
  const activeConfig = { ...DEFAULT_MINIMIZATION_CONFIG, ...config, strategy }
  return minimizeExpression(expr, activeConfig)
}

/**
 * Quick minimization for simple expressions
 */
export const quickMinimize = (expr: BooleanExpression): BooleanExpression => {
  const result = minimizeExpression(expr, {
    strategy: MinimizationStrategy.TERM_COMBINATION,
    maxIterations: 3,
    finalResultFormat: FinalResultFormat.MINIMAL,
  })

  // If result is MinimizationResult, return the expression field
  return typeof result === 'object' && 'expression' in result
    ? result.expression
    : (result as BooleanExpression)
}

/**
 * Get intermediate form only
 */
export const getIntermediateForm = (expr: BooleanExpression): BooleanExpression => {
  const result = minimizeExpression(expr, {
    finalResultFormat: FinalResultFormat.INTERMEDIATE,
  })

  return typeof result === 'object' && 'intermediate' in result
    ? result.intermediate!
    : (result as BooleanExpression)
}

/**
 * Get minimal form only
 */
export const getMinimalForm = (expr: BooleanExpression): BooleanExpression => {
  const result = minimizeExpression(expr, {
    finalResultFormat: FinalResultFormat.MINIMAL,
  })

  return typeof result === 'object' && 'minimal' in result
    ? result.minimal!
    : (result as BooleanExpression)
}

/**
 * Get both intermediate and minimal forms
 */
export const getBothForms = (expr: BooleanExpression): MinimizationResult => {
  const result = minimizeExpression(expr, {
    finalResultFormat: FinalResultFormat.BOTH,
  })

  return result as MinimizationResult
}
