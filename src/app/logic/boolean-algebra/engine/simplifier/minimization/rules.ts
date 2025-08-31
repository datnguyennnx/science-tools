/**
 * Minimization Rules for the Simplification Pipeline
 *
 * This module contains rules that integrate minimization techniques
 * into the main simplification pipeline.
 */

import { BooleanExpression } from '../../ast/types'
import { SimplificationRule } from '../../ast/rules'
import { extractVariables } from '../../core/boolean-utils'
import { getTermCombinationRules } from './terms'
import { minimizeWithKMap } from './kmap'
import { minimizeWithQuineMcCluskey } from './qmc'

/**
 * Get minimization rules for the simplification pipeline
 */
export function getMinimizationRules(): SimplificationRule[] {
  return [
    ...getTermCombinationRules(),
    {
      info: {
        name: 'Karnaugh Map Minimization',
        description: 'Minimize using Karnaugh map for 3-4 variables',
        formula: 'K-map \\ minimization',
      },
      canApply: (expr: BooleanExpression): boolean => {
        const variables = Array.from(extractVariables(expr))
        return variables.length >= 3 && variables.length <= 4 && expr.type === 'OR'
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        return minimizeWithKMap(expr)
      },
    },
    {
      info: {
        name: 'Quine-McCluskey Minimization',
        description: 'Minimize using Quine-McCluskey algorithm for 5+ variables',
        formula: 'QM \\ minimization',
      },
      canApply: (expr: BooleanExpression): boolean => {
        const variables = Array.from(extractVariables(expr))
        return variables.length >= 5
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        return minimizeWithQuineMcCluskey(expr)
      },
    },
  ]
}

/**
 * Get basic minimization rules (term combination only)
 */
export function getBasicMinimizationRules(): SimplificationRule[] {
  return getTermCombinationRules()
}

/**
 * Get advanced minimization rules (K-maps and QM)
 */
export function getAdvancedMinimizationRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'Karnaugh Map Minimization',
        description: 'Minimize using Karnaugh map for 3-4 variables',
        formula: 'K-map \\ minimization',
      },
      canApply: (expr: BooleanExpression): boolean => {
        const variables = Array.from(extractVariables(expr))
        return variables.length >= 3 && variables.length <= 4 && expr.type === 'OR'
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        return minimizeWithKMap(expr)
      },
    },
    {
      info: {
        name: 'Quine-McCluskey Minimization',
        description: 'Minimize using Quine-McCluskey algorithm for 5+ variables',
        formula: 'QM \\ minimization',
      },
      canApply: (expr: BooleanExpression): boolean => {
        const variables = Array.from(extractVariables(expr))
        return variables.length >= 5
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        return minimizeWithQuineMcCluskey(expr)
      },
    },
  ]
}
