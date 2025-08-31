/**
 * Transformer Factories for Boolean Expression Minimization
 *
 * This module contains factory functions for creating various expression transformers
 * used in the minimization process.
 */

import { BooleanExpression } from '../../ast/types'
import { ExpressionTransformer } from './utils'
import { MinimizationConfig } from './config'
import { applyBasicRules } from './basic'
import { applyTermCombinations } from './terms'
import { minimizeWithKMap } from './kmap'
import { minimizeWithQuineMcCluskey } from './qmc'
import { composeTransformers, fixedPointTransform, safeTransform } from './utils'

/**
 * Create term combination minimization transformer
 */
export const createTermCombinationMinimization = (
  config: MinimizationConfig
): ExpressionTransformer => {
  return fixedPointTransform(
    composeTransformers(
      applyBasicRules, // Apply basic rules first
      applyTermCombinations // Then apply term combination
    ),
    config.maxIterations
  )
}

/**
 * Create Karnaugh map minimization transformer
 */
export const createKMapMinimization = (): ExpressionTransformer => {
  return safeTransform(minimizeWithKMap)
}

/**
 * Create Quine-McCluskey minimization transformer
 */
export const createQuineMcCluskeyMinimization = (): ExpressionTransformer => {
  return safeTransform(minimizeWithQuineMcCluskey)
}

/**
 * Create identity transformer (no-op)
 */
export const createIdentityTransformer = (): ExpressionTransformer => {
  return (expr: BooleanExpression) => expr
}

/**
 * Create a transformer that applies basic rules only
 */
export const createBasicRulesTransformer = (): ExpressionTransformer => {
  return applyBasicRules
}

/**
 * Create a transformer that combines multiple minimization techniques
 */
export const createCombinedTransformer = (config: MinimizationConfig): ExpressionTransformer => {
  return composeTransformers(
    createBasicRulesTransformer(),
    createTermCombinationMinimization(config),
    createKMapMinimization(),
    createQuineMcCluskeyMinimization()
  )
}
