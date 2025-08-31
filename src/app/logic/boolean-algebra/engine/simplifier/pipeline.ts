/**
 * Simplification Pipeline Execution
 *
 * This module handles the execution of the boolean algebra simplification pipeline.
 * It manages the flow of expressions through different stages and handles errors gracefully.
 */

import { BooleanExpression, SimplificationStep } from '../ast/types'
import {
  SimplificationConfig,
  SimplificationPipeline,
  SimplificationStage,
} from '../core/boolean-types'
import { expressionsEqual } from '../core/boolean-utils'
import { expressionToBooleanString } from '../parser/parser'

/**
 * Execute a single simplification stage with error handling and yielding
 */
export async function executeStage(
  expr: BooleanExpression,
  stage: SimplificationStage,
  steps: SimplificationStep[]
): Promise<BooleanExpression> {
  if (!stage.enabled) return expr

  try {
    const beforeExpr = expr
    const afterExpr = await stage.transformer(expr)

    // Only add step if expression actually changed
    if (!expressionsEqual(beforeExpr, afterExpr)) {
      try {
        steps.push({
          ruleName: stage.name,
          ruleFormula: stage.description,
          ruleDescription: stage.description,
          expressionBefore: expressionToBooleanString(beforeExpr),
          expressionAfter: expressionToBooleanString(afterExpr),
          expressionTreeBefore: beforeExpr,
          expressionTreeAfter: afterExpr,
          phase: 'simplification',
        })
      } catch (stepError) {
        console.warn(`[Engine] Failed to create step for ${stage.name}:`, stepError)
        // Continue without adding the step
      }
    }

    // Yield control after each stage to prevent blocking
    const yieldStart = Date.now()
    while (Date.now() - yieldStart < 2) {
      // Busy wait for 2ms to yield control to browser
    }

    return afterExpr
  } catch (error) {
    console.warn(`[Engine] Stage ${stage.name} failed:`, error)
    return expr // Return original expression on error
  }
}

/**
 * Execute the complete simplification pipeline with error handling
 */
export async function executePipeline(
  expr: BooleanExpression,
  pipeline: SimplificationPipeline
): Promise<{ expression: BooleanExpression; steps: SimplificationStep[] }> {
  const steps: SimplificationStep[] = []
  let currentExpr = expr

  for (let i = 0; i < pipeline.stages.length; i++) {
    const stage = pipeline.stages[i]
    try {
      currentExpr = await executeStage(currentExpr, stage, steps)
    } catch (error) {
      console.warn(`[Engine] Pipeline stage ${i} (${stage.name}) failed:`, error)
      // Continue with next stage using current expression
    }
  }

  return { expression: currentExpr, steps }
}

/**
 * Create a simplification pipeline from configuration
 */
export function createPipeline(
  name: string,
  description: string,
  stages: SimplificationStage[],
  config: SimplificationConfig
): SimplificationPipeline {
  return {
    name,
    description,
    stages,
    config,
  }
}
