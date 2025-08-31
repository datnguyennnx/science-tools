/**
 * Boolean Expression Minimization Engine
 *
 * Main entry point for Boolean expression minimization. This module provides
 * a clean API for minimizing Boolean expressions using various techniques
 * including term combination, Karnaugh maps, and Quine-McCluskey algorithm.
 */

// Core functionality
export {
  minimizeExpression,
  minimizeWithStrategy,
  quickMinimize,
  getIntermediateForm,
  getMinimalForm,
  getBothForms,
  type MinimizationResult,
} from './minimizer'

// Configuration and types
export {
  MinimizationStrategy,
  type MinimizationConfig,
  DEFAULT_MINIMIZATION_CONFIG,
  FinalResultFormat,
  Strategy,
  type Config,
} from './config'

// Analysis functions
export { analyzeExpression, getExpressionStats } from './analyzer'

// Rules for pipeline integration
export {
  getMinimizationRules,
  getBasicMinimizationRules,
  getAdvancedMinimizationRules,
} from './rules'

// Pipeline creation
export {
  createComprehensiveMinimizationPipeline,
  createSimpleMinimizationPipeline,
  createTermCombinationPipeline,
  createSmallExpressionPipeline,
  createLargeExpressionPipeline,
} from './pipeline'

// Transformer factories
export {
  createTermCombinationMinimization,
  createKMapMinimization,
  createQuineMcCluskeyMinimization,
  createIdentityTransformer,
  createBasicRulesTransformer,
  createCombinedTransformer,
} from './transformers'

// Functional utilities
export {
  type ExpressionTransformer,
  type ExpressionPredicate,
  composeTransformers,
  conditionalTransform,
  safeTransform,
  fixedPointTransform,
  andPredicates,
  isExpressionType,
  hasVariableCount,
  createPipeline,
  identity,
  type ExpressionPipeline,
} from './utils'

// Core algorithms
export { minimizeWithKMap } from './kmap'
export { minimizeWithQuineMcCluskey } from './qmc'
export { applyTermCombinations, getTermCombinationRules } from './terms'
export { applyBasicRules, canApplyBasicRules } from './basic'
export { applyFinalSimplification, getFinalSimplificationRules } from './final'
