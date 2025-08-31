/**
 * Core Utilities for Boolean Algebra Engine
 *
 * Provides functional programming utilities, expression analysis,
 * and common operations used throughout the engine.
 */

import { BooleanExpression } from '../ast/types'
import { ExpressionTransformer, ComplexityMetrics } from './boolean-types'

/**
 * Function composition utility (right to left)
 */
export function compose<A, B>(f: (a: A) => B): (a: A) => B
export function compose<A, B, C>(f: (b: B) => C, g: (a: A) => B): (a: A) => C
export function compose<A, B, C, D>(f: (c: C) => D, g: (b: B) => C, h: (a: A) => B): (a: A) => D
export function compose<A, B, C, D, E>(
  f: (d: D) => E,
  g: (c: C) => D,
  h: (b: B) => C,
  i: (a: A) => B
): (a: A) => E
export function compose(...fns: Array<(arg: unknown) => unknown>) {
  return (value: unknown) => fns.reduceRight((acc, fn) => fn(acc), value)
}

/**
 * Function pipeline utility (left to right)
 */
export function pipe<A>(a: A): A
export function pipe<A, B>(a: A, f: (a: A) => B): B
export function pipe<A, B, C>(a: A, f: (a: A) => B, g: (b: B) => C): C
export function pipe<A, B, C, D>(a: A, f: (a: A) => B, g: (b: B) => C, h: (c: C) => D): D
export function pipe<A, B, C, D, E>(
  a: A,
  f: (a: A) => B,
  g: (b: B) => C,
  h: (c: C) => D,
  i: (d: D) => E
): E
export function pipe(value: unknown, ...fns: Array<(arg: unknown) => unknown>): unknown {
  return fns.reduce((acc, fn) => fn(acc), value)
}

/**
 * Identity function
 */
export function identity<T>(x: T): T {
  return x
}

/**
 * Constant function
 */
export function constant<T>(value: T): () => T {
  return () => value
}

/**
 * Check if two expressions are structurally equal
 */
export function expressionsEqual(a: BooleanExpression, b: BooleanExpression): boolean {
  if (a.type !== b.type) return false

  if (a.type === 'VARIABLE' && b.type === 'VARIABLE') {
    return a.value === b.value
  }

  if (a.type === 'CONSTANT' && b.type === 'CONSTANT') {
    return a.value === b.value
  }

  if (a.type === 'NOT' && b.type === 'NOT') {
    return a.left && b.left ? expressionsEqual(a.left, b.left) : false
  }

  // Binary operations
  if (a.left && a.right && b.left && b.right) {
    return expressionsEqual(a.left, b.left) && expressionsEqual(a.right, b.right)
  }

  return false
}

/**
 * Calculate expression complexity metrics
 */
export function calculateComplexity(expr: BooleanExpression): ComplexityMetrics {
  const variables = new Set<string>()

  function traverse(node: BooleanExpression, depth: number): { count: number; maxDepth: number } {
    if (node.type === 'VARIABLE') {
      variables.add(node.value)
      return { count: 1, maxDepth: depth }
    }

    if (node.type === 'CONSTANT') {
      return { count: 1, maxDepth: depth }
    }

    if (node.type === 'NOT') {
      if (!node.left) return { count: 1, maxDepth: depth }
      const result = traverse(node.left, depth + 1)
      return { count: 1 + result.count, maxDepth: Math.max(depth, result.maxDepth) }
    }

    // Binary operations
    if (node.left && node.right) {
      const leftResult = traverse(node.left, depth + 1)
      const rightResult = traverse(node.right, depth + 1)
      return {
        count: 1 + leftResult.count + rightResult.count,
        maxDepth: Math.max(depth, leftResult.maxDepth, rightResult.maxDepth),
      }
    }

    return { count: 1, maxDepth: depth }
  }

  const { count, maxDepth } = traverse(expr, 0)
  const variableCount = variables.size

  // Calculate complexity score (weighted combination of factors)
  const complexity = count * 0.4 + maxDepth * 0.3 + variableCount * 0.3

  return {
    nodeCount: count,
    depth: maxDepth,
    variableCount,
    complexity,
  }
}

/**
 * Extract all variables from an expression
 */
export function extractVariables(expr: BooleanExpression): Set<string> {
  const variables = new Set<string>()

  function traverse(node: BooleanExpression): void {
    if (node.type === 'VARIABLE') {
      variables.add(node.value)
    } else if (node.type === 'NOT' && node.left) {
      traverse(node.left)
    } else if (node.left && node.right) {
      traverse(node.left)
      traverse(node.right)
    }
  }

  traverse(expr)
  return variables
}

/**
 * Check if expression contains a specific subexpression
 */
export function containsSubexpression(expr: BooleanExpression, target: BooleanExpression): boolean {
  if (expressionsEqual(expr, target)) return true

  if (expr.type === 'NOT' && expr.left) {
    return containsSubexpression(expr.left, target)
  }

  if (expr.left && expr.right) {
    return containsSubexpression(expr.left, target) || containsSubexpression(expr.right, target)
  }

  return false
}

/**
 * Count occurrences of a specific node type
 */
export function countNodeType(expr: BooleanExpression, nodeType: string): number {
  let count = expr.type === nodeType ? 1 : 0

  if (expr.type === 'NOT' && expr.left) {
    count += countNodeType(expr.left, nodeType)
  } else if (expr.left && expr.right) {
    count += countNodeType(expr.left, nodeType) + countNodeType(expr.right, nodeType)
  }

  return count
}

/**
 * Create a memoized version of a transformer function
 */
export function memoizeTransformer(transformer: ExpressionTransformer): ExpressionTransformer {
  const cache = new Map<string, BooleanExpression>()

  return (expr: BooleanExpression): BooleanExpression => {
    // Create a simple hash of the expression for caching
    const key = JSON.stringify(expr)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = transformer(expr)
    cache.set(key, result)
    return result
  }
}

/**
 * Apply a transformer repeatedly until no changes occur
 */
export function applyUntilStable(
  expr: BooleanExpression,
  transformer: ExpressionTransformer,
  maxIterations = 10
): { expression: BooleanExpression; iterations: number } {
  let current = expr
  let iterations = 0

  while (iterations < maxIterations) {
    const next = transformer(current)
    iterations++

    if (expressionsEqual(current, next)) {
      break
    }

    current = next
  }

  return { expression: current, iterations }
}
