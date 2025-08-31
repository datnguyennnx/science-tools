/**
 * Expression Transformers
 *
 * Collection of expression transformation utilities for boolean algebra.
 * These transformers handle key algebraic expansions and simplifications.
 */

export {
  expandXnor,
  expandXnorRecursive,
  containsXnor,
  countXnorOperations,
} from './xnor-expansion'

export {
  eliminateDoubleNegation,
  eliminateDoubleNegationRecursive,
  containsDoubleNegation,
  countDoubleNegations,
  hasNestedNegations,
  simplifyNestedNegations,
} from './double-negation'

export {
  expandNor,
  expandNorRecursive,
  containsNor,
  countNorOperations,
  shouldExpandNor,
} from './nor-expansion'

// Re-export types for convenience
export type { ExpressionTransformer } from '../core/boolean-types'
