/**
 * Barrel file for all simplification rule modules.
 * This file re-exports all individual rule-fetching functions for easy import
 * into the main simplifier logic.
 */

import { getConstantRules } from './constant-rules'
import { getContradictionRules } from './contradiction-rules'
import { getDeMorganRules } from './de-morgan-rules'
import { getDerivedRules } from './derived-rules'
import { getDistributiveRules } from './distributive-rules'
import { getIdempotentRules } from './idempotent-rules'
import { getNegationRules } from './negation-rules'
import { getConsensusRules } from './consensus-rules'

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
