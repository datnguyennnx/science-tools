/**
 * Core Types for Boolean Algebra Engine
 *
 * Defines fundamental types and interfaces used throughout the engine.
 * This module provides the foundation for type-safe boolean algebra operations.
 */

import { BooleanExpression } from '../ast/types'

/**
 * Simplification configuration options
 */
export interface SimplificationConfig {
  /** Maximum iterations for simplification */
  maxIterations: number
  /** Maximum rule applications per rule type */
  maxRuleApplications: number
  /** Whether to apply canonical form transformations */
  enableCanonicalForms: boolean
  /** Whether to verify equivalence after simplification */
  enableVerification: boolean
  /** Target canonical form ('sop', 'pos', or 'auto') */
  canonicalForm: 'sop' | 'pos' | 'auto'
}

/**
 * Default configuration for simplification
 */
export const DEFAULT_SIMPLIFICATION_CONFIG: SimplificationConfig = {
  maxIterations: 50,
  maxRuleApplications: 20,
  enableCanonicalForms: true,
  enableVerification: false,
  canonicalForm: 'auto',
}

/**
 * Result of a verification operation
 */
export interface VerificationResult {
  /** Whether expressions are equivalent */
  isEquivalent: boolean
  /** Verification method used */
  method: 'truth-table' | 'algebraic'
  /** Additional details about verification */
  details?: string
  /** Truth table if method is 'truth-table' */
  truthTable?: TruthTable
}

/**
 * Truth table representation
 */
export interface TruthTable {
  /** Variable names in order */
  variables: string[]
  /** Truth table rows */
  rows: Array<{
    /** Variable assignments */
    assignment: Record<string, boolean>
    /** Result for first expression */
    result1: boolean
    /** Result for second expression */
    result2: boolean
    /** Whether results match */
    equivalent: boolean
  }>
}

/**
 * Canonical form types
 */
export type CanonicalForm = 'sop' | 'pos'

/**
 * Expression complexity metrics
 */
export interface ComplexityMetrics {
  /** Total number of nodes in AST */
  nodeCount: number
  /** Maximum depth of AST */
  depth: number
  /** Number of variables used */
  variableCount: number
  /** Estimated computational complexity */
  complexity: number
}

/**
 * Functional interface for expression transformers
 */
export type ExpressionTransformer = (expr: BooleanExpression) => BooleanExpression

/**
 * Functional interface for expression predicates
 */
export type ExpressionPredicate = (expr: BooleanExpression) => boolean

/**
 * Rule application result
 */
export interface RuleApplicationResult {
  /** Whether the rule was applied */
  applied: boolean
  /** Transformed expression */
  expression: BooleanExpression
  /** Rule that was applied */
  ruleName?: string
  /** Description of the transformation */
  description?: string
}

/**
 * Pipeline stage in the simplification process
 */
export interface SimplificationStage {
  /** Stage name */
  name: string
  /** Stage description */
  description: string
  /** Transformer function for this stage */
  transformer: ExpressionTransformer
  /** Whether this stage should be applied */
  enabled: boolean
}

/**
 * Complete simplification pipeline
 */
export interface SimplificationPipeline {
  /** Pipeline name */
  name: string
  /** Pipeline description */
  description: string
  /** Ordered list of stages */
  stages: SimplificationStage[]
  /** Configuration for the pipeline */
  config: SimplificationConfig
}
