/**
 * Simplification Rules Types
 *
 * Defines the structure and types for boolean algebra simplification rules.
 */

import { BooleanExpression, SimplificationStep } from './types'

/**
 * Metadata and documentation for a simplification rule
 */
export interface RuleInfo {
  name: string // Unique identifier for the rule
  description: string // Human-readable explanation of what the rule does
  formula: string // LaTeX mathematical formula representing the rule
  ruleType?: string // Classification category (e.g., 'distribution', 'absorption', 'identity')
}

/**
 * Boolean algebra simplification rule interface
 * Defines the contract for all simplification rules in the system
 */
export interface SimplificationRule {
  info: RuleInfo // Rule metadata and documentation
  canApply: (expr: BooleanExpression) => boolean // Predicate to check if rule applies
  apply: (expr: BooleanExpression) => BooleanExpression // Rule transformation function
}

/**
 * Context object passed through the simplification process
 * Tracks state and statistics during multi-step simplification
 */
export interface SimplificationContext {
  steps: SimplificationStep[] // History of applied simplification steps
  ruleApplicationCounts: Map<string, number> // Count of each rule's applications
  totalApplications: number // Total number of rule applications across all rules
  maxIterationsReached: boolean // Flag indicating if simplification hit iteration limit
}
