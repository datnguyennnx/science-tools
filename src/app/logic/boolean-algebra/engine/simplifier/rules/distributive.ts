/**
 * Distributive Laws - Main Module
 *
 * Combines all distributive law implementations into a unified interface.
 * This module provides a clean API for accessing all distributive and absorption rules.
 */

import { SimplificationRule } from '../../ast/rules'
import { getOrAbsorptionRules } from './logic/absorption-or'
import { getAndAbsorptionRules } from './logic/absorption-and'
import { getDistributiveCoreRules } from './logic/core'

/**
 * Configuration for distributive rule types
 */
export type DistributiveRuleType = 'all' | 'distributeOnly' | 'factorizeOnly' | 'absorptionOnly'

/**
 * Get distributive simplification rules based on the specified type
 */
export function getDistributiveRules(type: DistributiveRuleType = 'all'): SimplificationRule[] {
  const allRules: SimplificationRule[] = []

  switch (type) {
    case 'all':
      allRules.push(
        ...getDistributiveCoreRules(),
        ...getOrAbsorptionRules(),
        ...getAndAbsorptionRules()
      )
      break

    case 'distributeOnly':
      allRules.push(...getDistributiveCoreRules())
      break

    case 'absorptionOnly':
      allRules.push(...getOrAbsorptionRules(), ...getAndAbsorptionRules())
      break

    case 'factorizeOnly':
      // Factorization rules are part of core distributive rules
      const coreRules = getDistributiveCoreRules()
      allRules.push(...coreRules.filter(rule => rule.info.name.includes('Factorization')))
      break
  }

  return allRules
}

/**
 * Get all distributive rules (default behavior)
 */
export function getDistributiveRulesAll(): SimplificationRule[] {
  return getDistributiveRules('all')
}
