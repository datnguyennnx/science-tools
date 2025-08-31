/**
 * Configuration and Types for Boolean Expression Minimization
 *
 * This module contains all configuration types, enums, and default settings
 * for the minimization system.
 */

/**
 * Minimization strategy based on expression characteristics
 */
export enum MinimizationStrategy {
  TERM_COMBINATION = 'term_combination',
  KARNAUGH_MAP = 'karnaugh_map',
  QUINE_MCCLUSKEY = 'quine_mccluskey',
  COMPREHENSIVE = 'comprehensive',
}

/**
 * Final result format options
 */
export enum FinalResultFormat {
  INTERMEDIATE = 'intermediate', // Result after minimization but before final simplification
  MINIMAL = 'minimal', // Fully simplified minimal form
  BOTH = 'both', // Return both intermediate and minimal forms
}

/**
 * Configuration for minimization process
 */
export interface MinimizationConfig {
  strategy: MinimizationStrategy
  maxIterations: number
  enableKMap: boolean
  enableQuineMcCluskey: boolean
  finalResultFormat: FinalResultFormat
}

/**
 * Default minimization configuration
 */
export const DEFAULT_MINIMIZATION_CONFIG: MinimizationConfig = {
  strategy: MinimizationStrategy.COMPREHENSIVE,
  maxIterations: 5,
  enableKMap: true,
  enableQuineMcCluskey: true,
  finalResultFormat: FinalResultFormat.MINIMAL,
}

// Re-export for convenience
export { MinimizationStrategy as Strategy }
export type { MinimizationConfig as Config }
