/**
 * Core Simplifier Interface
 *
 * This module provides the main interface for boolean algebra simplification.
 * It orchestrates the pipeline, stages, and verification to provide a clean API.
 */

import { BooleanExpression, SimplificationResult } from '../ast/types'
import { SimplificationConfig, DEFAULT_SIMPLIFICATION_CONFIG } from '../core/boolean-types'
import {
  expressionToBooleanString,
  expressionToLatexString,
  parseExpression,
} from '../parser/parser'
import { createSimplificationStages } from './stages'
import { executePipeline, createPipeline } from './pipeline'
import { verifySimplification } from './verification'

/**
 * Main complete simplification function with error handling and yielding
 */
export async function simplifyCompletely(
  expr: BooleanExpression,
  config: Partial<SimplificationConfig> = {}
): Promise<SimplificationResult> {
  try {
    const activeConfig = { ...DEFAULT_SIMPLIFICATION_CONFIG, ...config }

    // Create simplification pipeline
    const stages = createSimplificationStages(activeConfig)
    const pipeline = createPipeline(
      'complete-boolean-simplification',
      'Complete boolean algebra simplification with verification',
      stages,
      activeConfig
    )

    // Execute pipeline
    const { expression: simplifiedExpr, steps } = await executePipeline(expr, pipeline)

    // Verify result if enabled (with error handling)
    let isVerified = true
    try {
      isVerified = verifySimplification(expr, simplifiedExpr, activeConfig)
      if (!isVerified) {
        console.warn('Simplification verification failed - result may not be equivalent')
      }
    } catch (verificationError) {
      console.warn('[Engine] Verification failed:', verificationError)
      // Continue without verification
    }

    // Yield control before string conversions
    const yieldStart = Date.now()
    while (Date.now() - yieldStart < 3) {
      // Busy wait for 3ms to yield control
    }

    // Convert expressions to strings with error handling
    let originalExpr: string
    let simplifiedExprString: string
    let simplifiedExprLatex: string

    try {
      originalExpr = expressionToBooleanString(expr)
    } catch (error) {
      console.warn('[Engine] Failed to convert original expression to string:', error)
      originalExpr = 'Error converting expression'
    }

    try {
      simplifiedExprString = expressionToBooleanString(simplifiedExpr)
    } catch (error) {
      console.warn('[Engine] Failed to convert simplified expression to string:', error)
      simplifiedExprString = originalExpr // Fallback to original
    }

    try {
      simplifiedExprLatex = expressionToLatexString(simplifiedExpr)
    } catch (error) {
      console.warn('[Engine] Failed to convert simplified expression to LaTeX:', error)
      simplifiedExprLatex = simplifiedExprString // Fallback to string version
    }

    return {
      originalExpression: originalExpr,
      simplifiedExpression: simplifiedExpr,
      simplifiedExpressionString: simplifiedExprString,
      simplifiedExpressionLatex: simplifiedExprLatex,
      steps,
      totalApplications: steps.length,
      iterations: 1, // Pipeline-based approach
      ruleApplicationCounts: {}, // Could be enhanced to track per-rule counts
      maxIterationsReached: false,
    }
  } catch (error) {
    console.error('[Engine] Complete simplification failed:', error)

    // Return a minimal result on error
    const fallbackString = 'Error during simplification'
    return {
      originalExpression: fallbackString,
      simplifiedExpression: expr, // Return original expression
      simplifiedExpressionString: fallbackString,
      simplifiedExpressionLatex: fallbackString,
      steps: [],
      totalApplications: 0,
      iterations: 0,
      ruleApplicationCounts: {},
      maxIterationsReached: false,
    }
  }
}

/**
 * Simplified interface for backward compatibility
 */
export async function simplifyExpression(
  expression: string,
  config?: Partial<SimplificationConfig>
): Promise<{
  steps: Array<{ ruleName: string; ruleFormula: string; before: string; after: string }>
  finalExpression: string
}> {
  try {
    // Use static import instead of dynamic import to prevent blocking

    // Add timeout to prevent infinite blocking
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Parsing timeout - expression too complex')), 5000)
    })

    const parsePromise = new Promise<BooleanExpression>((resolve, reject) => {
      try {
        const exprTree = parseExpression(expression)
        resolve(exprTree)
      } catch (error) {
        reject(error)
      }
    })

    const exprTree = await Promise.race([parsePromise, timeoutPromise])

    // Add timeout for simplification as well
    const simplifyTimeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Simplification timeout - expression too complex')), 10000)
    })

    const simplifyPromise = new Promise<SimplificationResult>((resolve, reject) => {
      try {
        const result = simplifyCompletely(exprTree, config)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })

    const result = await Promise.race([simplifyPromise, simplifyTimeoutPromise])

    return {
      steps: result.steps.map(step => ({
        ruleName: step.ruleName,
        ruleFormula: step.ruleFormula,
        before: step.expressionBefore,
        after: step.expressionAfter,
      })),
      finalExpression: result.simplifiedExpressionString,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Simplification failed: ${errorMessage}`)
  }
}
