/**
 * Rule Types Module
 *
 * This file defines the types used for defining simplification rules.
 */

import { BooleanExpression } from './types'

/**
 * Information about a simplification rule
 */
export interface RuleInfo {
  name: string
  description: string
  formula: string
}

/**
 * Interface for a simplification rule
 */
export interface SimplificationRule {
  info: RuleInfo
  canApply: (expr: BooleanExpression) => boolean
  apply: (expr: BooleanExpression) => BooleanExpression
}
