/**
 * Expression Verifiers
 *
 * Collection of verification methods for confirming expression equivalence.
 * Provides both truth table and algebraic verification approaches.
 */

export {
  generateTruthTable,
  generateComparisonTruthTable,
  verifyByTruthTable,
  isTruthTableVerificationFeasible,
  getTruthTableComplexity,
} from './truth-table'

export { verifyByCanonicalForms, verifyByDerivation, verifyAlgebraically } from './algebraic'

// Re-export types for convenience
export type { VerificationResult, TruthTable } from '../core/boolean-types'
