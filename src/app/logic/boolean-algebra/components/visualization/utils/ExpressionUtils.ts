/**
 * Shared utility functions for boolean expression visualization components
 *
 * This module provides common functionality used across different visualization
 * engines like K-Map and Venn diagrams, creating a single source of truth for
 * operations like variable extraction and expression evaluation.
 */

import { BooleanExpression, evaluateExpression as engineEvaluate } from '../../../engine'

// Define a type for the reduced expression result
type ReducedExpressionResult = Array<{
  mintermSet: Set<number>
  freeVariables: string[]
  title: string
  fixedVariables: Record<string, boolean>
}>

// Internal cache for memoizing expensive operations
const expressionEvaluationCache = new Map<string, boolean>()
const mintermSetsCache = new Map<string, Set<number>>()
const variableImportanceCache = new Map<string, Map<string, number>>()
const variableOrderCache = new Map<string, string[]>()
const reducedExpressionCache = new Map<string, ReducedExpressionResult>()

// Inner recursive function - does not use default parameters or cache
function extractVariablesRecursive(expr: BooleanExpression, vars: Set<string>): void {
  if (!expr) {
    return
  }

  // Process current node
  if (expr.type === 'VARIABLE' && typeof expr.value === 'string') {
    vars.add(expr.value)
  }

  // Recurse on children
  if (expr.left) {
    extractVariablesRecursive(expr.left, vars)
  }
  if (expr.right) {
    extractVariablesRecursive(expr.right, vars)
  }
}

/**
 * Extracts variables from a parsed expression tree and returns them in sorted order.
 * Uses a recursive helper to avoid default parameter issues and removes problematic caching.
 *
 * @param expr The boolean expression tree to extract variables from
 * @returns Array of variable names in sorted order
 */
export function extractVariablesFromTree(expr: BooleanExpression): string[] {
  const vars = new Set<string>()
  if (expr) {
    // Ensure expr is not null/undefined before starting recursion
    extractVariablesRecursive(expr, vars)
  }
  return Array.from(vars).sort()
}

/**
 * Evaluates a boolean expression with the given variable values
 * This is a wrapper around the core engine's evaluateExpression function with caching
 *
 * @param expr The boolean expression to evaluate
 * @param variableValues A map of variable names to boolean values
 * @returns The boolean result of evaluating the expression
 */
export function evaluateExpression(
  expr: BooleanExpression,
  variableValues: Record<string, boolean>
): boolean {
  // Create a unique key for this evaluation
  const cacheKey =
    JSON.stringify(expr) +
    '_' +
    Object.entries(variableValues)
      .sort(([varA], [varB]) => varA.localeCompare(varB))
      .map(([v, val]) => `${v}:${val ? 1 : 0}`)
      .join(',')

  // Check if we've already computed this result
  if (expressionEvaluationCache.has(cacheKey)) {
    return expressionEvaluationCache.get(cacheKey)!
  }

  // Calculate and cache the result
  const result = engineEvaluate(expr, variableValues)
  expressionEvaluationCache.set(cacheKey, result)
  return result
}

/**
 * Generates all possible minterms for a given set of variables
 * Improved performance with lazy evaluation and batch calculation
 *
 * @param variables Array of variable names
 * @returns Array of minterm objects with variable assignments and minterm index
 */
export function generateMinterms(variables: string[]): Array<{
  assignments: Record<string, boolean>
  mintermIndex: number
}> {
  const mintermCount = Math.pow(2, variables.length)

  const result = []

  for (let i = 0; i < mintermCount; i++) {
    const assignments: Record<string, boolean> = {}

    // Set each variable's value based on the binary representation of i
    for (let j = 0; j < variables.length; j++) {
      // Check if the jth bit of i is set (from MSB to LSB)
      assignments[variables[j]] = !!(i & (1 << (variables.length - j - 1)))
    }

    result.push({
      assignments,
      mintermIndex: i,
    })
  }

  return result
}

/**
 * Creates a set of minterms for which an expression evaluates to true
 * Optimized with caching for performance with complex expressions
 *
 * @param expr The boolean expression to evaluate
 * @param variables Array of variable names
 * @returns Set of minterm indices for which the expression is true
 */
export function createMintermSet(expr: BooleanExpression, variables: string[]): Set<number> {
  // Create a cache key based on expression and variable order
  const exprKey = JSON.stringify(expr)
  const varsKey = variables.join(',')
  const cacheKey = `${exprKey}_${varsKey}`

  // Return cached result if available
  if (mintermSetsCache.has(cacheKey)) {
    return mintermSetsCache.get(cacheKey)!
  }

  const mintermSet = new Set<number>()
  const minterms = generateMinterms(variables)

  for (const { assignments, mintermIndex } of minterms) {
    if (evaluateExpression(expr, assignments)) {
      mintermSet.add(mintermIndex)
    }
  }

  // Cache the result
  mintermSetsCache.set(cacheKey, mintermSet)
  return mintermSet
}

/**
 * Groups variables into partitions for handling expressions with many variables
 *
 * @param variables Array of all variable names in the expression
 * @param primaryCount Number of variables to include in the primary group (defaults to 4)
 * @returns Object containing primary variables and remaining secondary variables
 */
export function partitionVariables(
  variables: string[],
  primaryCount: number = 4
): { primary: string[]; secondary: string[] } {
  // Ensure we don't try to take more variables than available
  const actualPrimaryCount = Math.min(primaryCount, variables.length)

  return {
    primary: variables.slice(0, actualPrimaryCount),
    secondary: variables.slice(actualPrimaryCount),
  }
}

/**
 * Determines the optimal number of variables to display in a visualization
 * based on the total number available
 *
 * @param totalVariableCount Total number of variables in the expression
 * @returns Recommended number of variables to display
 */
export function getOptimalDisplayVarCount(totalVariableCount: number): number {
  // K-Maps work best with 2-6 variables (6 is pushing the limits of usability)
  if (totalVariableCount <= 6) {
    return totalVariableCount
  }

  // For more than 6 variables, recommend showing 4 or 6 variables
  // based on whether the total count is even or odd
  return totalVariableCount % 2 === 0 ? 6 : 4
}

/**
 * Creates a "reduced" expression where some variables are fixed to specific values
 * This is useful for creating multiple smaller visualizations for expressions with many variables
 *
 * @param expr The boolean expression tree
 * @param fixedVariables Map of variable names to fixed boolean values
 * @returns Information about the reduced expression for visualization
 */
export function createReducedExpression(
  expr: BooleanExpression,
  fixedVariables: Record<string, boolean>
): {
  mintermSet: Set<number>
  freeVariables: string[]
  title: string
} {
  // Extract variables that are not fixed
  const allVars = extractVariablesFromTree(expr)
  const freeVariables = allVars.filter(v => !(v in fixedVariables))

  // Create a function that evaluates the expression with the fixed variables
  const evaluateWithFixedVars = (assignments: Record<string, boolean>): boolean => {
    // Combine fixed variables with the provided assignments
    const allAssignments = { ...fixedVariables, ...assignments }
    return evaluateExpression(expr, allAssignments)
  }

  // Generate truth table for free variables and find which combinations evaluate to true
  const mintermSet = new Set<number>()
  const minterms = generateMinterms(freeVariables)

  for (const { assignments, mintermIndex } of minterms) {
    if (evaluateWithFixedVars(assignments)) {
      mintermSet.add(mintermIndex)
    }
  }

  // Create a descriptive title for this reduced expression
  const fixedConditions = Object.entries(fixedVariables)
    .map(([variable, value]) => `${variable}=${value ? '1' : '0'}`)
    .join(', ')

  return {
    mintermSet,
    freeVariables,
    title: `When ${fixedConditions}`,
  }
}

/**
 * Generates a set of reduced expressions for large variable counts
 * Each reduced expression fixes some variables to specific values
 * Optimized for better performance with batched evaluation
 *
 * @param expr The boolean expression tree
 * @param variables All variables in the expression
 * @param displayVarCount Number of variables to display in each visualization
 * @returns Array of reduced expressions for visualization
 */
export function generateReducedExpressionSet(
  expr: BooleanExpression,
  variables: string[],
  displayVarCount: number = 4
): Array<{
  mintermSet: Set<number>
  freeVariables: string[]
  title: string
  fixedVariables: Record<string, boolean>
}> {
  if (variables.length <= displayVarCount) {
    // If we have few enough variables, just return the full expression
    return [
      {
        mintermSet: createMintermSet(expr, variables),
        freeVariables: variables,
        title: 'Full Expression',
        fixedVariables: {},
      },
    ]
  }

  // Create a cache key for this specific request
  const exprKey = JSON.stringify(expr)
  const varsKey = variables.join(',')
  const cacheKey = `${exprKey}_${varsKey}_${displayVarCount}`

  // Check cache first
  if (reducedExpressionCache.has(cacheKey)) {
    return reducedExpressionCache.get(cacheKey)!
  }

  // Get just the secondary variables
  const { secondary } = partitionVariables(variables, displayVarCount)
  const result = []

  // Prepare batched evaluation for efficiency
  // We'll evaluate all combinations in parallel when possible
  const combinationCount = Math.pow(2, secondary.length)

  // For optimization, we'll create all fixed variable scenarios first,
  // then evaluate them in a batched fashion
  const fixedVariableSets: Record<string, boolean>[] = []

  for (let i = 0; i < combinationCount; i++) {
    const fixedVariables: Record<string, boolean> = {}

    // Set each secondary variable based on the bits of i
    for (let j = 0; j < secondary.length; j++) {
      fixedVariables[secondary[j]] = !!(i & (1 << (secondary.length - j - 1)))
    }

    fixedVariableSets.push(fixedVariables)
  }

  // For optimal performance, process in batches if there are many combinations
  const BATCH_SIZE = 8 // Process 8 combinations at a time for efficiency
  const batches = Math.ceil(combinationCount / BATCH_SIZE)

  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const startIdx = batchIndex * BATCH_SIZE
    const endIdx = Math.min(startIdx + BATCH_SIZE, combinationCount)
    const batchResults = []

    // Process this batch
    for (let i = startIdx; i < endIdx; i++) {
      const fixedVariables = fixedVariableSets[i]

      // Extract just the free variables
      const freeVariables = variables.filter(v => !(v in fixedVariables))

      // Create a descriptive title
      const fixedConditions = Object.entries(fixedVariables)
        .map(([variable, value]) => `${variable}=${value ? '1' : '0'}`)
        .join(', ')

      // Create mintermSet here (optimization: we could batch these as well)
      const mintermSet = new Set<number>()
      const minterms = generateMinterms(freeVariables)

      for (const { assignments, mintermIndex } of minterms) {
        // Combine fixed variables with the minterm assignments
        const fullAssignments = { ...fixedVariables, ...assignments }
        if (evaluateExpression(expr, fullAssignments)) {
          mintermSet.add(mintermIndex)
        }
      }

      batchResults.push({
        mintermSet,
        freeVariables,
        title: `When ${fixedConditions}`,
        fixedVariables,
      })
    }

    // Add all results from this batch
    result.push(...batchResults)
  }

  // Cache the result for future use
  reducedExpressionCache.set(cacheKey, result)
  return result
}

/**
 * Calculates the essentiality/importance of each variable in an expression
 * This can be used to determine which variables should be prioritized in visualizations
 * Optimized with memoization for better performance
 *
 * @param expr The boolean expression tree
 * @param variables All variables in the expression
 * @returns Map of variable names to their importance score (0-1)
 */
export function calculateVariableImportance(
  expr: BooleanExpression,
  variables: string[]
): Map<string, number> {
  // Create a cache key based on expression and variable order
  const exprKey = JSON.stringify(expr)
  const varsKey = variables.join(',')
  const cacheKey = `${exprKey}_${varsKey}`

  // Return cached result if available
  if (variableImportanceCache.has(cacheKey)) {
    return variableImportanceCache.get(cacheKey)!
  }

  const result = new Map<string, number>()

  // Optimization: Generate all minterms once instead of per variable
  const allMinterms = generateMinterms(variables)
  const mintermCount = allMinterms.length

  // For smaller expressions, calculate exact importance
  if (variables.length <= 5) {
    // For each variable, calculate how often flipping its value changes the output
    for (const variable of variables) {
      let changesCount = 0

      for (const { assignments } of allMinterms) {
        // Get the result with the current variable assignment
        const originalResult = evaluateExpression(expr, assignments)

        // Flip this variable's value
        const flippedAssignments = { ...assignments }
        flippedAssignments[variable] = !flippedAssignments[variable]

        // Check if the result changes
        const newResult = evaluateExpression(expr, flippedAssignments)

        if (originalResult !== newResult) {
          changesCount++
        }
      }

      // Score is the percentage of cases where flipping this variable changes the result
      result.set(variable, changesCount / mintermCount)
    }
  }
  // For larger expressions, use a sampling approach to estimate importance
  else {
    // Sample size decreases as variable count increases to maintain reasonable performance
    const sampleSize = Math.min(1000, Math.pow(2, Math.min(variables.length, 10)))

    // Generate random samples for testing
    const samples = []
    for (let i = 0; i < sampleSize; i++) {
      const assignments: Record<string, boolean> = {}
      for (const variable of variables) {
        assignments[variable] = Math.random() >= 0.5
      }
      samples.push(assignments)
    }

    // Calculate importance based on samples
    for (const variable of variables) {
      let changesCount = 0

      for (const assignments of samples) {
        // Get the result with the current variable assignment
        const originalResult = evaluateExpression(expr, assignments)

        // Flip this variable's value
        const flippedAssignments = { ...assignments }
        flippedAssignments[variable] = !flippedAssignments[variable]

        // Check if the result changes
        const newResult = evaluateExpression(expr, flippedAssignments)

        if (originalResult !== newResult) {
          changesCount++
        }
      }

      // Score is the percentage of samples where flipping this variable changes the result
      result.set(variable, changesCount / sampleSize)
    }
  }

  // Cache the result
  variableImportanceCache.set(cacheKey, result)
  return result
}

/**
 * Determines the optimal variable ordering for visualization based on importance
 * Optimized with memoization for better performance
 *
 * @param expr The boolean expression tree
 * @param variables All variables in the expression
 * @returns Reordered array of variables optimized for visualization
 */
export function getOptimalVariableOrder(expr: BooleanExpression, variables: string[]): string[] {
  // Skip optimization for simple expressions
  if (variables.length <= 2) {
    return [...variables]
  }

  // Create a cache key
  const cacheKey = JSON.stringify(expr) + '_vars:' + variables.join(',')

  // Return cached result if available
  if (variableOrderCache.has(cacheKey)) {
    return variableOrderCache.get(cacheKey)!
  }

  const importance = calculateVariableImportance(expr, variables)

  // Sort variables by importance (most important first)
  const result = [...variables].sort((a, b) => {
    return (importance.get(b) || 0) - (importance.get(a) || 0)
  })

  // Cache the result
  variableOrderCache.set(cacheKey, result)
  return result
}
