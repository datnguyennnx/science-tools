/**
 * Functional Programming Utilities for Boolean Expression Minimization
 *
 * This module provides functional programming patterns and utilities
 * for working with Boolean expressions in a functional style.
 */

import { BooleanExpression } from '../../ast/types'

/**
 * Functional interface for expression transformers
 */
export type ExpressionTransformer = (expr: BooleanExpression) => BooleanExpression

/**
 * Functional interface for expression predicates
 */
export type ExpressionPredicate = (expr: BooleanExpression) => boolean

/**
 * Compose multiple transformers into a single transformer
 */
export const composeTransformers = (
  ...transformers: ExpressionTransformer[]
): ExpressionTransformer => {
  return (expr: BooleanExpression) =>
    transformers.reduce((acc, transformer) => transformer(acc), expr)
}

/**
 * Apply a transformer conditionally based on a predicate
 */
export const conditionalTransform = (
  predicate: ExpressionPredicate,
  transformer: ExpressionTransformer,
  fallback: ExpressionTransformer = expr => expr
): ExpressionTransformer => {
  return (expr: BooleanExpression) => (predicate(expr) ? transformer(expr) : fallback(expr))
}

/**
 * Apply a transformer with error handling
 */
export const safeTransform = (
  transformer: ExpressionTransformer,
  fallback: ExpressionTransformer = expr => expr
): ExpressionTransformer => {
  return (expr: BooleanExpression) => {
    try {
      return transformer(expr)
    } catch (error) {
      console.warn('[FunctionalUtils] Transformer failed:', error)
      return fallback(expr)
    }
  }
}

/**
 * Create a transformer that applies another transformer multiple times until no change
 */
export const fixedPointTransform = (
  transformer: ExpressionTransformer,
  maxIterations: number = 10
): ExpressionTransformer => {
  return (expr: BooleanExpression) => {
    let current = expr
    let iterations = 0

    while (iterations < maxIterations) {
      const next = transformer(current)
      if (JSON.stringify(next) === JSON.stringify(current)) {
        break
      }
      current = next
      iterations++
    }

    return current
  }
}

/**
 * Combine multiple predicates with AND logic
 */
export const andPredicates = (...predicates: ExpressionPredicate[]): ExpressionPredicate => {
  return (expr: BooleanExpression) => predicates.every(predicate => predicate(expr))
}

/**
 * Create a predicate that checks expression type
 */
export const isExpressionType = (type: string): ExpressionPredicate => {
  return (expr: BooleanExpression) => expr.type === type
}

/**
 * Create a predicate that checks variable count
 */
export const hasVariableCount = (min: number, max?: number): ExpressionPredicate => {
  return (expr: BooleanExpression) => {
    const variables = new Set<string>()
    const collectVars = (e: BooleanExpression) => {
      if (e.type === 'VARIABLE') {
        variables.add(e.value)
      } else if (e.left) {
        collectVars(e.left)
      }
      if (e.right) {
        collectVars(e.right)
      }
    }
    collectVars(expr)
    const count = variables.size
    return count >= min && (max === undefined || count <= max)
  }
}

/**
 * Functional pipeline for expression processing
 */
export class ExpressionPipeline {
  private transformers: ExpressionTransformer[] = []

  /**
   * Add a transformer to the pipeline
   */
  add(transformer: ExpressionTransformer): ExpressionPipeline {
    this.transformers.push(transformer)
    return this
  }

  /**
   * Add a conditional transformer
   */
  addConditional(
    predicate: ExpressionPredicate,
    transformer: ExpressionTransformer,
    fallback?: ExpressionTransformer
  ): ExpressionPipeline {
    return this.add(conditionalTransform(predicate, transformer, fallback))
  }

  /**
   * Add a safe transformer with error handling
   */
  addSafe(
    transformer: ExpressionTransformer,
    fallback?: ExpressionTransformer
  ): ExpressionPipeline {
    return this.add(safeTransform(transformer, fallback))
  }

  /**
   * Execute the pipeline
   */
  execute(expr: BooleanExpression): BooleanExpression {
    return composeTransformers(...this.transformers)(expr)
  }

  /**
   * Create a fixed-point version of the pipeline
   */
  fixedPoint(maxIterations: number = 10): ExpressionTransformer {
    return fixedPointTransform(this.execute.bind(this), maxIterations)
  }
}

/**
 * Create a new expression pipeline
 */
export const createPipeline = (): ExpressionPipeline => new ExpressionPipeline()

/**
 * Identity transformer (returns expression unchanged)
 */
export const identity: ExpressionTransformer = expr => expr
