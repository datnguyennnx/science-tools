/**
 * Simplification Module
 *
 * This module exports functional utilities for Boolean expression simplification.
 */

// Export the functional simplification utilities
export {
  simplify,
  simplifyExpression,
  getDefaultRules,
  type SimplifierConfig,
  defaultConfig,
} from './simplifier'

// Re-export all rule categories
export * from './rules'
