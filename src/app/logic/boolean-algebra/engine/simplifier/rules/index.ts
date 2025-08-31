/**
 * Barrel file for all simplification rule modules.
 * This file re-exports all individual rule-fetching functions for easy import
 * into the main simplifier logic.
 */

import { getConstantRules } from './constants'
import { getContradictionRules } from './contradiction'
import { getDeMorganRules } from './de-morgan'
import { getDerivedRules } from './derived'
import { getDistributiveRules } from './distributive'
import { getIdempotentRules } from './idempotent'
import { getNegationRules } from './negation'
import { getConsensusRules } from './consensus'

export {
  getConstantRules,
  getContradictionRules,
  getDeMorganRules,
  getDerivedRules,
  getDistributiveRules,
  getIdempotentRules,
  getNegationRules,
  getConsensusRules,
}
