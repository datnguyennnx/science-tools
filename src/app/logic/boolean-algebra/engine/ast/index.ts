/**
 * Types Module
 *
 * This module exports all types used in the boolean algebra engine.
 */

// Export all types from the core types module
export type {
  ExpressionNodeType,
  BooleanExpression,
  SimplificationStep,
  SimplificationResult,
  VariableNode,
  ConstantNode,
  NotNode,
  AndNode,
  OrNode,
  XorNode,
  NandNode,
  NorNode,
  XnorNode,
  LatexSimplificationStep,
  ExtendedLatexResults,
} from './types'

// Export all rule-related types with renamed RuleInfo to avoid conflict
export type { SimplificationRule } from './rule-types'
export type { RuleInfo as RuleDefinition } from './rule-types'
