/**
 * Boolean Expression Evaluation
 *
 * This module provides functions to evaluate boolean expressions.
 */

import { BooleanExpression } from '../ast/types'

// Simple LRU cache for expression evaluations
const EVALUATION_CACHE_SIZE = 1000
const evaluationCache = new Map<string, boolean>()
const cacheKeys: string[] = []

/**
 * Generate cache key for expression evaluation
 */
function getEvaluationCacheKey(
  expr: BooleanExpression,
  variableValues: Record<string, boolean>
): string {
  const exprStr = JSON.stringify(expr)
  const varsStr = Object.entries(variableValues)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(',')
  return `${exprStr}|${varsStr}`
}

/**
 * Add to cache with LRU eviction
 */
function addToEvaluationCache(key: string, value: boolean): void {
  if (evaluationCache.size >= EVALUATION_CACHE_SIZE) {
    const oldestKey = cacheKeys.shift()
    if (oldestKey) {
      evaluationCache.delete(oldestKey)
    }
  }
  evaluationCache.set(key, value)
  cacheKeys.push(key)
}

/**
 * Evaluate a boolean expression with the given variable values
 * Includes memoization for performance optimization
 *
 * @param expr The boolean expression to evaluate
 * @param variableValues A map of variable names to boolean values
 * @returns The boolean result of evaluating the expression
 */
export function evaluateExpression(
  expr: BooleanExpression,
  variableValues: Record<string, boolean>
): boolean {
  // Try cache first
  const cacheKey = getEvaluationCacheKey(expr, variableValues)
  const cached = evaluationCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  // Evaluate and cache the result
  const result = evaluateExpressionUncached(expr, variableValues)
  addToEvaluationCache(cacheKey, result)
  return result
}

/**
 * Internal evaluation function without caching
 */
function evaluateExpressionUncached(
  expr: BooleanExpression,
  variableValues: Record<string, boolean>
): boolean {
  switch (expr.type) {
    case 'CONSTANT':
      // Type assertion to ensure TypeScript knows value is a boolean for CONSTANT
      return expr.value as boolean

    case 'VARIABLE': {
      // Type assertion to ensure TypeScript knows value is a string for VARIABLE
      const variableName = expr.value as string
      return variableValues[variableName] ?? false
    }

    case 'AND': {
      if (!expr.left || !expr.right) {
        throw new Error('Invalid AND expression: missing operands')
      }
      return (
        evaluateExpressionUncached(expr.left, variableValues) &&
        evaluateExpressionUncached(expr.right, variableValues)
      )
    }

    case 'OR': {
      if (!expr.left || !expr.right) {
        throw new Error('Invalid OR expression: missing operands')
      }
      return (
        evaluateExpressionUncached(expr.left, variableValues) ||
        evaluateExpressionUncached(expr.right, variableValues)
      )
    }

    case 'XOR': {
      if (!expr.left || !expr.right) {
        throw new Error('Invalid XOR expression: missing operands')
      }
      return (
        evaluateExpressionUncached(expr.left, variableValues) !==
        evaluateExpressionUncached(expr.right, variableValues)
      )
    }

    case 'NAND': {
      if (!expr.left || !expr.right) {
        throw new Error('Invalid NAND expression: missing operands')
      }
      return !(
        evaluateExpressionUncached(expr.left, variableValues) &&
        evaluateExpressionUncached(expr.right, variableValues)
      )
    }

    case 'NOR': {
      if (!expr.left || !expr.right) {
        throw new Error('Invalid NOR expression: missing operands')
      }
      return !(
        evaluateExpressionUncached(expr.left, variableValues) ||
        evaluateExpressionUncached(expr.right, variableValues)
      )
    }

    case 'XNOR': {
      if (!expr.left || !expr.right) {
        throw new Error('Invalid XNOR expression: missing operands')
      }
      return (
        evaluateExpressionUncached(expr.left, variableValues) ===
        evaluateExpressionUncached(expr.right, variableValues)
      )
    }

    case 'NOT': {
      if (!expr.left) {
        throw new Error('Invalid NOT expression: missing operand')
      }
      return !evaluateExpressionUncached(expr.left, variableValues)
    }

    default:
      throw new Error(`Unknown expression type: ${(expr as { type: string }).type}`)
  }
}

/**
 * Generate a truth table for a boolean expression
 *
 * @param expr The boolean expression to evaluate
 * @param variables The variable names to include in the truth table
 * @returns Array of rows, each containing variable values and the result
 */
export function generateTruthTable(
  expr: BooleanExpression,
  variables: string[]
): Array<{ variables: Record<string, boolean>; result: boolean }> {
  const results: Array<{ variables: Record<string, boolean>; result: boolean }> = []

  // Calculate the total number of combinations (2^n where n is the number of variables)
  const totalCombinations = Math.pow(2, variables.length)

  // Generate all possible combinations of variable values
  for (let i = 0; i < totalCombinations; i++) {
    const variableValues: Record<string, boolean> = {}

    // Set each variable's value based on the binary representation of i
    for (let j = 0; j < variables.length; j++) {
      // Check if the jth bit of i is set
      variableValues[variables[j]] = !!(i & (1 << (variables.length - j - 1)))
    }

    // Evaluate the expression with these values
    const result = evaluateExpression(expr, variableValues)

    // Add this row to the results
    results.push({
      variables: variableValues,
      result,
    })
  }

  return results
}
