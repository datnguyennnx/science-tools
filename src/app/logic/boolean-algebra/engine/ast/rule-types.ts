/**
 * Rule Types Module
 *
 * This file defines the types used for defining simplification rules.
 */

import { BooleanExpression, SimplificationStep } from './types'

/**
 * Information about a simplification rule
 */
export interface RuleInfo {
  name: string
  description: string
  formula: string // LaTeX representation of the rule
  ruleType?: string // Added for classifying rule types e.g. 'distribution', 'factorization'
}

/**
 * Interface for a simplification rule
 */
export interface SimplificationRule {
  info: RuleInfo
  canApply: (expr: BooleanExpression) => boolean
  apply: (expr: BooleanExpression) => BooleanExpression
}

/**
 * Context for the simplification process, passed through rule applications.
 */
export interface SimplificationContext {
  steps: SimplificationStep[]
  ruleApplicationCounts: Map<string, number>
  totalApplications: number
  maxIterationsReached: boolean
}
