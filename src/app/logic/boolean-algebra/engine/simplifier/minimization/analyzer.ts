/**
 * Expression Analyzer for Boolean Expression Minimization
 *
 * This module contains logic for analyzing Boolean expressions to determine
 * the most appropriate minimization strategy based on expression characteristics.
 */

import { BooleanExpression } from '../../ast/types'
import { extractVariables } from '../../core/boolean-utils'
import { MinimizationStrategy } from './config'

/**
 * Analyze expression to determine best minimization strategy
 */
export const analyzeExpression = (expr: BooleanExpression): MinimizationStrategy => {
  const variables = Array.from(extractVariables(expr))
  const numVars = variables.length

  // Use K-map for 3-4 variables
  if (numVars >= 3 && numVars <= 4) {
    return MinimizationStrategy.KARNAUGH_MAP
  }

  // Use Quine-McCluskey for 5+ variables
  if (numVars >= 5) {
    return MinimizationStrategy.QUINE_MCCLUSKEY
  }

  // Use term combination for smaller expressions
  return MinimizationStrategy.TERM_COMBINATION
}

/**
 * Get expression statistics for analysis
 */
export const getExpressionStats = (expr: BooleanExpression) => {
  const variables = Array.from(extractVariables(expr))
  const numVars = variables.length

  return {
    variables,
    variableCount: numVars,
    isComplex: numVars >= 3,
    isVeryComplex: numVars >= 5,
    recommendedStrategy: analyzeExpression(expr),
  }
}
