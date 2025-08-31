/**
 * Simplifier Module
 *
 * Provides the complete boolean algebra simplifier with enhanced capabilities:
 * - Complete algebraic simplification
 * - XNOR expansion and double negation elimination
 * - Truth table and algebraic verification
 * - Canonical form conversion
 */

// Main simplifier exports
export { simplifyCompletely, simplifyExpression } from './core'

// Import for aliases
import { simplifyCompletely, simplifyExpression } from './core'

// Backward compatibility aliases
export const simplify = simplifyCompletely
export const simplifyExprString = simplifyExpression

// Re-export pipeline and stage functions
export { createSimplificationStages } from './stages'
export { executePipeline, executeStage, createPipeline } from './pipeline'
export { verifySimplification } from './verification'

// Re-export rule functions for advanced usage
export {
  getDeMorganRules,
  getIdempotentRules,
  getConstantRules,
  getContradictionRules,
  getConsensusRules,
  getDistributiveRules,
  getNegationRules,
} from './rules'

// Re-export types
export type { SimplificationConfig } from '../core/boolean-types'
