/**
 * Basic Boolean Algebra Rules for Expression Minimization
 *
 * This module contains functions for applying basic Boolean algebra rules
 * such as idempotent laws, contradiction laws, and constant rules.
 */

import { BooleanExpression } from '../../ast/types'
import { getIdempotentRules } from '../rules/idempotent'
import { getContradictionRules } from '../rules/contradiction'
import { getConstantRules } from '../rules/constants'

/**
 * Apply basic boolean algebra rules (idempotent, contradiction, etc.)
 */
export const applyBasicRules = (expr: BooleanExpression): BooleanExpression => {
  const rules = [...getIdempotentRules(), ...getContradictionRules(), ...getConstantRules()]

  let currentExpr = expr
  let iterations = 0
  const maxIterations = 10

  while (iterations < maxIterations) {
    let changed = false

    for (const rule of rules) {
      try {
        if (rule.canApply(currentExpr)) {
          const newExpr = rule.apply(currentExpr)
          if (JSON.stringify(newExpr) !== JSON.stringify(currentExpr)) {
            currentExpr = newExpr
            changed = true
            break
          }
        }
      } catch (error) {
        console.warn(`[BasicRules] Rule ${rule.info.name} failed:`, error)
      }
    }

    if (!changed) break
    iterations++
  }

  return currentExpr
}

/**
 * Check if basic rules can be applied to an expression
 */
export const canApplyBasicRules = (expr: BooleanExpression): boolean => {
  const rules = [...getIdempotentRules(), ...getContradictionRules(), ...getConstantRules()]
  return rules.some(rule => {
    try {
      return rule.canApply(expr)
    } catch {
      return false
    }
  })
}
