/**
 * Boolean Algebra Engine Core Module
 *
 * This module exports the core functionality of the boolean algebra engine.
 */

// Export all types from the types module
export * from './types'

// Export parsing and formatting functionality from the parser
export {
  // Core parsing functions
  parseExpression, // Main entry point for parsing expressions
  parse, // Low-level parse function
  parseBoolean, // Parse with detailed result object

  // String conversion functions
  expressionToBooleanString, // Convert expression tree to boolean string
  expressionToLatexString, // Convert expression tree to LaTeX string
  toBooleanString, // Alternative name for backward compatibility
  toLatexString, // Alternative name for backward compatibility

  // Formatting function
  formatBooleanExpression, // Format expression with specified output format

  // Utility function
  getValidExpressionExamples, // Get examples of valid expressions
} from './parsing/parser'

// Export utility functions
export { validateBooleanExpression } from './utils'
