/**
 * Term Combination Rules for Boolean Expression Minimization
 *
 * This module provides rules for combining terms in canonical form to reduce
 * the number of terms and literals in Boolean expressions.
 *
 * Key techniques:
 * - Combining terms that differ by one literal (absorption/consensus)
 * - Factor extraction and grouping
 * - Common factor elimination
 */

import { BooleanExpression } from '../../ast/types'
import { SimplificationRule } from '../../ast/rules'
import { expressionsEqual } from '../../utils/comparison'

/**
 * Functional interface for term combination strategies
 */
export interface TermCombiner {
  canCombine: (terms: BooleanExpression[]) => boolean
  combine: (terms: BooleanExpression[]) => BooleanExpression
  description: string
}

/**
 * Extract all OR terms from an expression
 */
export const extractORTerms = (expr: BooleanExpression): BooleanExpression[] => {
  if (expr.type !== 'OR') return [expr]

  const terms: BooleanExpression[] = []
  const collect = (e: BooleanExpression) => {
    if (e.type === 'OR') {
      if (e.left) collect(e.left)
      if (e.right) collect(e.right)
    } else {
      terms.push(e)
    }
  }
  collect(expr)
  return terms
}

/**
 * Extract all AND factors from a term
 */
export const extractANDFactors = (expr: BooleanExpression): BooleanExpression[] => {
  if (expr.type !== 'AND') return [expr]

  const factors: BooleanExpression[] = []
  const collect = (e: BooleanExpression) => {
    if (e.type === 'AND') {
      if (e.left) collect(e.left)
      if (e.right) collect(e.right)
    } else {
      factors.push(e)
    }
  }
  collect(expr)
  return factors
}

/**
 * Check if two expressions are complements (A and ¬A)
 */
export const areComplements = (a: BooleanExpression, b: BooleanExpression): boolean => {
  if (a.type === 'NOT' && a.left && expressionsEqual(a.left, b)) return true
  if (b.type === 'NOT' && b.left && expressionsEqual(b.left, a)) return true
  return false
}

/**
 * Combine two terms that differ by one complement pair
 * Example: (A∧B∧C) ∨ (A∧B∧¬C) = (A∧B)
 */
export const combineComplementTerms: TermCombiner = {
  canCombine: (terms: BooleanExpression[]) => {
    if (terms.length !== 2) return false

    const [term1, term2] = terms
    if (term1.type !== 'AND' || term2.type !== 'AND') return false

    const factors1 = extractANDFactors(term1)
    const factors2 = extractANDFactors(term2)

    if (factors1.length !== factors2.length) return false

    // Count differences
    let complementPairs = 0
    const commonFactors: BooleanExpression[] = []

    for (const f1 of factors1) {
      let found = false
      for (let i = 0; i < factors2.length; i++) {
        const f2 = factors2[i]
        if (expressionsEqual(f1, f2)) {
          commonFactors.push(f1)
          factors2.splice(i, 1)
          found = true
          break
        } else if (areComplements(f1, f2)) {
          complementPairs++
          factors2.splice(i, 1)
          found = true
          break
        }
      }
      if (!found) return false
    }

    // Should have exactly one complement pair and all other factors common
    return complementPairs === 1 && factors2.length === 0
  },

  combine: (terms: BooleanExpression[]) => {
    const [term1, term2] = terms
    const factors1 = extractANDFactors(term1)
    const factors2 = extractANDFactors(term2)

    // Find common factors (excluding the complement pair)
    const commonFactors: BooleanExpression[] = []

    for (const f1 of factors1) {
      for (let i = 0; i < factors2.length; i++) {
        const f2 = factors2[i]
        if (expressionsEqual(f1, f2)) {
          commonFactors.push(f1)
          factors2.splice(i, 1)
          break
        }
      }
    }

    // Build combined expression
    if (commonFactors.length === 0) {
      return { type: 'CONSTANT', value: true } // A + ¬A = 1
    } else if (commonFactors.length === 1) {
      return commonFactors[0]
    } else {
      return commonFactors.reduce((acc, factor) => ({
        type: 'AND',
        left: acc,
        right: factor,
      }))
    }
  },

  description: 'Combine terms differing by one complement pair',
}

/**
 * Combine multiple terms with common factors
 * Example: (A∧B∧C) ∨ (A∧B∧D) = A∧B∧(C∨D)
 */
export const factorCommonTerms: TermCombiner = {
  canCombine: (terms: BooleanExpression[]) => {
    if (terms.length < 2) return false

    // All terms must be AND expressions
    if (!terms.every(term => term.type === 'AND')) return false

    const factorsArrays = terms.map(extractANDFactors)

    // Find common factors across all terms
    const firstFactors = factorsArrays[0]
    const commonFactors: BooleanExpression[] = []

    for (const factor of firstFactors) {
      if (factorsArrays.every(factors => factors.some(f => expressionsEqual(f, factor)))) {
        commonFactors.push(factor)
      }
    }

    // Must have at least one common factor
    return commonFactors.length > 0
  },

  combine: (terms: BooleanExpression[]) => {
    const factorsArrays = terms.map(extractANDFactors)

    // Find common factors
    const firstFactors = factorsArrays[0]
    const commonFactors: BooleanExpression[] = []

    for (const factor of firstFactors) {
      if (factorsArrays.every(factors => factors.some(f => expressionsEqual(f, factor)))) {
        commonFactors.push(factor)
      }
    }

    // Extract unique factors for each term (excluding common ones)
    const uniqueFactors: BooleanExpression[][] = factorsArrays.map(factors =>
      factors.filter(f => !commonFactors.some(cf => expressionsEqual(cf, f)))
    )

    // Build the factored expression
    const commonPart =
      commonFactors.length === 1
        ? commonFactors[0]
        : commonFactors.reduce((acc, factor) => ({ type: 'AND', left: acc, right: factor }))

    const factoredPart = uniqueFactors.map(factors =>
      factors.length === 1
        ? factors[0]
        : factors.reduce((acc, factor) => ({ type: 'AND', left: acc, right: factor }))
    )

    const orPart =
      factoredPart.length === 1
        ? factoredPart[0]
        : factoredPart.reduce((acc, factor) => ({ type: 'OR', left: acc, right: factor }))

    if (commonFactors.length === 0) {
      return orPart
    }

    return {
      type: 'AND',
      left: commonPart,
      right: orPart,
    }
  },

  description: 'Factor out common terms from multiple expressions',
}

/**
 * Apply all term combination rules to an OR expression
 */
export const applyTermCombinations = (expr: BooleanExpression): BooleanExpression => {
  if (expr.type !== 'OR') return expr

  const terms = extractORTerms(expr)
  if (terms.length < 2) return expr

  const combiners = [combineComplementTerms, factorCommonTerms]

  for (const combiner of combiners) {
    // Try combining pairs
    for (let i = 0; i < terms.length - 1; i++) {
      for (let j = i + 1; j < terms.length; j++) {
        if (combiner.canCombine([terms[i], terms[j]])) {
          const combined = combiner.combine([terms[i], terms[j]])
          const remainingTerms = terms.filter((_, idx) => idx !== i && idx !== j)
          const newTerms = [combined, ...remainingTerms]

          const newExpr =
            newTerms.length === 1
              ? newTerms[0]
              : newTerms.reduce((acc, term) => ({ type: 'OR', left: acc, right: term }))

          // Recursively apply combinations to the result
          return applyTermCombinations(newExpr)
        }
      }
    }
  }

  return expr
}

/**
 * Get term combination rules for the simplification system
 */
export function getTermCombinationRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'Term Combination - Complement Absorption',
        description: 'Combine terms that differ by one complement pair (A∧B∧C)∨(A∧B∧¬C) = (A∧B)',
        formula: '(A \\land B \\land C) \\lor (A \\land B \\land \\lnot C) = (A \\land B)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR') return false
        const terms = extractORTerms(expr)
        return combineComplementTerms.canCombine(terms)
      },
      apply: applyTermCombinations,
    },
    {
      info: {
        name: 'Term Combination - Common Factor',
        description: 'Factor out common terms from multiple expressions',
        formula:
          '(A \\land B \\land C) \\lor (A \\land B \\land D) = A \\land B \\land (C \\lor D)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR') return false
        const terms = extractORTerms(expr)
        return factorCommonTerms.canCombine(terms)
      },
      apply: applyTermCombinations,
    },
  ]
}
