/**
 * Derived Operations Rules - Combined Module
 *
 * Combines all derived operation rules (XOR, NAND, NOR, XNOR) into a unified interface.
 */

import { SimplificationRule } from '../../../ast/rules'
import { getXorRules } from './xor'
import { getNandRules } from './nand'
import { getNorRules } from './nor'
import { getXnorRules } from './xnor'

/**
 * Configuration for derived operation rule types
 */
export type DerivedRuleType = 'all' | 'xorOnly' | 'nandOnly' | 'norOnly' | 'xnorOnly'

/**
 * Get derived operation simplification rules based on the specified type
 */
export function getDerivedRules(type: DerivedRuleType = 'all'): SimplificationRule[] {
  const allRules: SimplificationRule[] = []

  switch (type) {
    case 'all':
      allRules.push(...getXorRules(), ...getNandRules(), ...getNorRules(), ...getXnorRules())
      break

    case 'xorOnly':
      allRules.push(...getXorRules())
      break

    case 'nandOnly':
      allRules.push(...getNandRules())
      break

    case 'norOnly':
      allRules.push(...getNorRules())
      break

    case 'xnorOnly':
      allRules.push(...getXnorRules())
      break
  }

  return allRules
}

/**
 * Get all derived rules (default behavior)
 */
export function getDerivedRulesAll(): SimplificationRule[] {
  return getDerivedRules('all')
}

// Re-export individual rule getters for advanced usage
export { getXorRules } from './xor'
export { getNandRules } from './nand'
export { getNorRules } from './nor'
export { getXnorRules } from './xnor'
