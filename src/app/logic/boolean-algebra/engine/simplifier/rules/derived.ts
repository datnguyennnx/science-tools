/**
 * Derived Operations Rules - Main Module
 *
 * Combines all derived operation rule implementations into a unified interface.
 * This module provides a clean API for accessing all XOR, NAND, NOR, and XNOR rules.
 */

import { SimplificationRule } from '../../ast/rules'
import { getDerivedRules, getDerivedRulesAll, type DerivedRuleType } from './transforms'

// Re-export everything from the transforms module
export { getDerivedRules, getDerivedRulesAll, type DerivedRuleType }

// Backward compatibility - default export
export function getDerivedRulesDefault(): SimplificationRule[] {
  return getDerivedRulesAll()
}
