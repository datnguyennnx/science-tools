/**
 * Minimization Pipeline Creation
 *
 * This module contains functions for creating minimization pipelines
 * that combine multiple minimization techniques in a specific order.
 */

import { MinimizationConfig, FinalResultFormat } from './config'
import { applyBasicRules } from './basic'
import { applyTermCombinations } from './terms'
import { applyFinalSimplification } from './final'
import {
  createPipeline,
  fixedPointTransform,
  andPredicates,
  hasVariableCount,
  isExpressionType,
} from './utils'
import { createKMapMinimization, createQuineMcCluskeyMinimization } from './transformers'

/**
 * Create comprehensive minimization pipeline
 */
export const createComprehensiveMinimizationPipeline = (config: MinimizationConfig) => {
  const pipeline = createPipeline()
    // Start with basic rules (idempotent, contradiction, etc.)
    .add(applyBasicRules)
    // Apply term combination
    .add(fixedPointTransform(applyTermCombinations, config.maxIterations))
    // Apply K-map for 3-4 variables
    .addConditional(
      andPredicates(hasVariableCount(3, 4), isExpressionType('OR')),
      createKMapMinimization(),
      undefined
    )
    // Apply Quine-McCluskey for 5+ variables
    .addConditional(hasVariableCount(5), createQuineMcCluskeyMinimization(), undefined)
    // Final cleanup with basic rules and term combination
    .add(applyBasicRules)
    .add(fixedPointTransform(applyTermCombinations, config.maxIterations))

  // Apply final simplification for minimal form if requested
  if (config.finalResultFormat === FinalResultFormat.MINIMAL) {
    pipeline.add(applyFinalSimplification)
  }

  return pipeline
}

/**
 * Create a simple minimization pipeline (basic rules only)
 */
export const createSimpleMinimizationPipeline = () => {
  return createPipeline().add(applyBasicRules)
}

/**
 * Create term combination focused pipeline
 */
export const createTermCombinationPipeline = (config: MinimizationConfig) => {
  return createPipeline()
    .add(applyBasicRules)
    .add(fixedPointTransform(applyTermCombinations, config.maxIterations))
}

/**
 * Create specialized pipeline for small expressions (2-4 variables)
 */
export const createSmallExpressionPipeline = (config: MinimizationConfig) => {
  return createPipeline()
    .add(applyBasicRules)
    .add(fixedPointTransform(applyTermCombinations, config.maxIterations))
    .addConditional(hasVariableCount(3, 4), createKMapMinimization(), undefined)
}

/**
 * Create specialized pipeline for large expressions (5+ variables)
 */
export const createLargeExpressionPipeline = (config: MinimizationConfig) => {
  return createPipeline()
    .add(applyBasicRules)
    .add(fixedPointTransform(applyTermCombinations, config.maxIterations))
    .add(createQuineMcCluskeyMinimization())
}
