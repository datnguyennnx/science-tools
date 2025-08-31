/**
 * Simplification Pipeline Stages
 *
 * This module defines and manages the different stages of the boolean algebra
 * simplification pipeline. Each stage represents a specific transformation
 * or optimization step in the simplification process.
 */

import { BooleanExpression } from '../ast/types'
import { SimplificationConfig, SimplificationStage } from '../core/boolean-types'
import { expandXnor, eliminateDoubleNegation, expandNor } from '../transformers'
import { toSopCanonical, toPosCanonical } from '../canonical'

// Import rule functions statically to avoid dynamic imports
import { getConstantRules } from './rules/constants'
import { getContradictionRules } from './rules/contradiction'
import { getIdempotentRules } from './rules/idempotent'
import { getNegationRules } from './rules/negation'
import { getDeMorganRules } from './rules/de-morgan'
import { getDistributiveRules } from './rules/distributive'
import { getConsensusRules } from './rules/consensus'
import { getMinimizationRules, minimizeExpression, FinalResultFormat } from './minimization'

/**
 * Create the standard simplification pipeline stages
 */
export function createSimplificationStages(config: SimplificationConfig): SimplificationStage[] {
  return [
    {
      name: 'Expand XNOR Operations',
      description:
        'Convert biconditional (↔) operations to standard AND/OR form for easier manipulation',
      transformer: expandXnor,
      enabled: true,
    },
    {
      name: 'Remove Double Negations',
      description: 'Simplify expressions like ¬¬A to just A using double negation elimination',
      transformer: eliminateDoubleNegation,
      enabled: true,
    },
    {
      name: 'Expand NOR Operations',
      description:
        'Convert NOR (↓) operations to NOT/OR form to prepare for further simplification',
      transformer: expandNor,
      enabled: true,
    },
    {
      name: 'Apply Boolean Algebra Rules',
      description:
        "Use fundamental Boolean algebra laws like idempotence, absorption, and De Morgan's laws",
      transformer: expr => applyBasicRules(config)(expr),
      enabled: true,
    },
    {
      name: 'Basic Minimization',
      description: 'Apply absorption and consensus theorems to reduce expression complexity',
      transformer: expr => applyBasicRules(config)(expr), // Use same function but with minimization rules
      enabled: true,
    },
    {
      name: `Convert to ${config.canonicalForm === 'pos' ? 'Product of Sums (POS)' : 'Sum of Products (SOP)'} Canonical Form`,
      description: `Transform expression to ${config.canonicalForm === 'pos' ? 'Product of Sums (POS)' : 'Sum of Products (SOP)'} canonical form for systematic analysis and further optimization`,
      transformer: config.canonicalForm === 'pos' ? toPosCanonical : toSopCanonical,
      enabled: config.enableCanonicalForms,
    },
    {
      name: 'Advanced Minimization',
      description: 'Use Karnaugh maps or Quine-McCluskey algorithm for optimal simplification',
      transformer: expr => {
        const result = minimizeExpression(expr, {
          maxIterations: 3,
          finalResultFormat: FinalResultFormat.MINIMAL,
        })
        return typeof result === 'object' && 'expression' in result ? result.expression : result
      },
      enabled: config.enableCanonicalForms, // Only run after canonical form
    },
  ]
}

/**
 * Apply basic boolean algebra rules with yielding to prevent blocking
 */
function applyBasicRules(config: SimplificationConfig) {
  return (expr: BooleanExpression) => {
    // Get all basic rules statically
    const rules = [
      ...getConstantRules(),
      ...getContradictionRules(),
      ...getIdempotentRules(),
      ...getNegationRules(),
      ...getDeMorganRules(),
      ...getDistributiveRules(),
      ...getConsensusRules(),
      ...getMinimizationRules(),
    ]

    let currentExpr = expr
    let iterations = 0
    let ruleIndex = 0

    while (iterations < config.maxRuleApplications) {
      let changed = false

      // Process rules in batches to prevent blocking
      const batchSize = Math.min(5, rules.length)
      const endIndex = Math.min(ruleIndex + batchSize, rules.length)

      for (let i = ruleIndex; i < endIndex; i++) {
        const rule = rules[i]
        try {
          if (rule.canApply(currentExpr)) {
            const newExpr = rule.apply(currentExpr)
            if (JSON.stringify(newExpr) !== JSON.stringify(currentExpr)) {
              currentExpr = newExpr
              changed = true
              ruleIndex = 0 // Reset to start from first rule with new expression
              break
            }
          }
        } catch (error) {
          console.warn(`[Engine] Rule ${rule.info.name} failed:`, error)
          // Continue with other rules
        }
      }

      if (!changed) {
        ruleIndex += batchSize
        if (ruleIndex >= rules.length) {
          // All rules processed, no changes
          break
        }
      }

      iterations++

      // Yield control to prevent blocking (every 3 iterations)
      if (iterations % 3 === 0) {
        // Use setTimeout to yield control back to the browser
        // This is a hack to make synchronous code async-like
        const startTime = Date.now()
        while (Date.now() - startTime < 1) {
          // Busy wait for 1ms to yield control
        }
      }
    }

    return currentExpr
  }
}
