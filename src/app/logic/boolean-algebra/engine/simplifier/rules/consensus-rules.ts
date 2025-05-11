/**
 * Consensus Theorem Rules Module
 *
 * This module contains rules for the Consensus Theorem and its variations
 * in Boolean algebra.
 */

import { BooleanExpression } from '../../ast'
import { SimplificationRule } from '../../ast/rule-types'
import { expressionsEqual } from '../../utils'

/**
 * Get rules for the Consensus Theorem and its variations
 */
export function getConsensusRules(): SimplificationRule[] {
  return [
    // Consensus Theorem for OR: (A * B) + (A * !C) + (B * C) = (A * B) + (A * !C)
    {
      info: {
        name: 'Consensus Theorem OR',
        description: '(A * B) + (A * !C) + (B * C) = (A * B) + (A * !C)',
        formula:
          '(A \\land B) \\lor (A \\land \\lnot C) \\lor (B \\land C) = (A \\land B) \\lor (A \\land \\lnot C)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR') return false
        const terms: BooleanExpression[] = collectORTerms(expr)
        if (terms.length < 3) return false
        for (let i = 0; i < terms.length - 2; i++) {
          for (let j = i + 1; j < terms.length - 1; j++) {
            for (let k = j + 1; k < terms.length; k++) {
              if (isConsensusPattern(terms[i], terms[j], terms[k])) {
                return true
              }
            }
          }
        }
        return false
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const terms = collectORTerms(expr)

        for (let i = 0; i < terms.length - 2; i++) {
          for (let j = i + 1; j < terms.length - 1; j++) {
            for (let k = j + 1; k < terms.length; k++) {
              const [ab_expr, ac_not_expr, bc_expr_to_remove] = findConsensusTermsAndRedundant(
                terms[i],
                terms[j],
                terms[k]
              )
              if (ab_expr && ac_not_expr && bc_expr_to_remove) {
                const originalTerms = collectORTerms(expr)
                return buildExpressionWithoutTerm(originalTerms, bc_expr_to_remove)
              }
            }
          }
        }
        return expr
      },
    },

    // Consensus Theorem for AND: (A + B) * (A + !C) * (B + C) = (A + B) * (A + !C)
    {
      info: {
        name: 'Consensus Theorem AND',
        description: '(A + B) * (A + !C) * (B + C) = (A + B) * (A + !C)',
        formula:
          '(A \\lor B) \\land (A \\lor \\lnot C) \\land (B \\lor C) = (A \\lor B) \\land (A \\lor \\lnot C)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'AND') return false
        const terms: BooleanExpression[] = collectANDTerms(expr)
        if (terms.length < 3) return false
        for (let i = 0; i < terms.length - 2; i++) {
          for (let j = i + 1; j < terms.length - 1; j++) {
            for (let k = j + 1; k < terms.length; k++) {
              if (isDualConsensusPattern(terms[i], terms[j], terms[k])) {
                return true
              }
            }
          }
        }
        return false
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const terms = collectANDTerms(expr)
        for (let i = 0; i < terms.length - 2; i++) {
          for (let j = i + 1; j < terms.length - 1; j++) {
            for (let k = j + 1; k < terms.length; k++) {
              const [ab_expr, ac_not_expr, bc_expr_to_remove] = findDualConsensusTermsAndRedundant(
                terms[i],
                terms[j],
                terms[k]
              )
              if (ab_expr && ac_not_expr && bc_expr_to_remove) {
                const originalTerms = collectANDTerms(expr)
                return buildExpressionWithoutANDTerm(originalTerms, bc_expr_to_remove)
              }
            }
          }
        }
        return expr
      },
    },
  ]
}

/**
 * Collect all terms in an OR expression into an array
 */
function collectORTerms(expr: BooleanExpression): BooleanExpression[] {
  const terms: BooleanExpression[] = []
  function collect(e: BooleanExpression) {
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
 * Collect all terms in an AND expression into an array
 */
function collectANDTerms(expr: BooleanExpression): BooleanExpression[] {
  const terms: BooleanExpression[] = []
  function collect(e: BooleanExpression) {
    if (e.type === 'AND') {
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
 * Check if three terms form a consensus pattern: (A * B) + (A * !C) + (B * C)
 */
function isConsensusPattern(
  term1: BooleanExpression,
  term2: BooleanExpression,
  term3: BooleanExpression
): boolean {
  if (term1.type !== 'AND' || term2.type !== 'AND' || term3.type !== 'AND') return false
  const permutations = [
    [term1, term2, term3],
    [term1, term3, term2],
    [term2, term1, term3],
    [term2, term3, term1],
    [term3, term1, term2],
    [term3, term2, term1],
  ]
  for (const [a, b, c] of permutations) {
    if (isConsensusTriple(a, b, c)) return true
  }
  return false
}

/**
 * Check if three terms form a dual consensus pattern: (A + B) * (A + !C) * (B + C)
 */
function isDualConsensusPattern(
  term1: BooleanExpression,
  term2: BooleanExpression,
  term3: BooleanExpression
): boolean {
  if (term1.type !== 'OR' || term2.type !== 'OR' || term3.type !== 'OR') return false
  const permutations = [
    [term1, term2, term3],
    [term1, term3, term2],
    [term2, term1, term3],
    [term2, term3, term1],
    [term3, term1, term2],
    [term3, term2, term1],
  ]
  for (const [a, b, c] of permutations) {
    if (isDualConsensusTriple(a, b, c)) return true
  }
  return false
}

/**
 * Check if three AND terms form the specific consensus pattern XY, X'Z, YZ (term3 is YZ)
 */
function isConsensusTriple(
  term_XY: BooleanExpression, // Potential XY
  term_XprimeZ: BooleanExpression, // Potential X'Z
  term_YZ: BooleanExpression // Potential YZ (redundant)
): boolean {
  if (
    term_XY.type !== 'AND' ||
    !term_XY.left ||
    !term_XY.right ||
    term_XprimeZ.type !== 'AND' ||
    !term_XprimeZ.left ||
    !term_XprimeZ.right ||
    term_YZ.type !== 'AND' ||
    !term_YZ.left ||
    !term_YZ.right
  ) {
    return false
  }

  const ops_XY = [term_XY.left, term_XY.right]
  const ops_XprimeZ = [term_XprimeZ.left, term_XprimeZ.right]
  const ops_YZ = [term_YZ.left, term_YZ.right]

  for (let i = 0; i < 2; i++) {
    // Iterate for X from ops_XY
    const X_cand = ops_XY[i]
    const Y_cand = ops_XY[1 - i]

    for (let j = 0; j < 2; j++) {
      // Iterate for X' from ops_XprimeZ
      const X_prime_cand = ops_XprimeZ[j]
      const Z_cand = ops_XprimeZ[1 - j]

      if (isComplement(X_cand, X_prime_cand)) {
        // Check if term_YZ is Y_cand * Z_cand (or Z_cand * Y_cand)
        if (
          (expressionsEqual(ops_YZ[0], Y_cand) && expressionsEqual(ops_YZ[1], Z_cand)) ||
          (expressionsEqual(ops_YZ[0], Z_cand) && expressionsEqual(ops_YZ[1], Y_cand))
        ) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Check if three OR terms form the specific dual consensus pattern (X+Y), (X'+Z), (Y+Z) (term3 is Y+Z)
 */
function isDualConsensusTriple(
  term_XplusY: BooleanExpression, // Potential X+Y
  term_XprimePlusZ: BooleanExpression, // Potential X'+Z
  term_YplusZ: BooleanExpression // Potential Y+Z (redundant)
): boolean {
  if (
    term_XplusY.type !== 'OR' ||
    !term_XplusY.left ||
    !term_XplusY.right ||
    term_XprimePlusZ.type !== 'OR' ||
    !term_XprimePlusZ.left ||
    !term_XprimePlusZ.right ||
    term_YplusZ.type !== 'OR' ||
    !term_YplusZ.left ||
    !term_YplusZ.right
  ) {
    return false
  }

  const ops_XplusY = [term_XplusY.left, term_XplusY.right]
  const ops_XprimePlusZ = [term_XprimePlusZ.left, term_XprimePlusZ.right]
  const ops_YplusZ = [term_YplusZ.left, term_YplusZ.right]

  for (let i = 0; i < 2; i++) {
    // Iterate for X from ops_XplusY
    const X_cand = ops_XplusY[i]
    const Y_cand = ops_XplusY[1 - i]

    for (let j = 0; j < 2; j++) {
      // Iterate for X' from ops_XprimePlusZ
      const X_prime_cand = ops_XprimePlusZ[j]
      const Z_cand = ops_XprimePlusZ[1 - j]

      if (isComplement(X_cand, X_prime_cand)) {
        // Check if term_YplusZ is Y_cand + Z_cand (or Z_cand + Y_cand)
        if (
          (expressionsEqual(ops_YplusZ[0], Y_cand) && expressionsEqual(ops_YplusZ[1], Z_cand)) ||
          (expressionsEqual(ops_YplusZ[0], Z_cand) && expressionsEqual(ops_YplusZ[1], Y_cand))
        ) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Helper function to check if two expressions are complements of each other.
 * e.g., A and !A
 */
function isComplement(expr1: BooleanExpression, expr2: BooleanExpression): boolean {
  if (expr1.type === 'NOT' && expr1.left && expressionsEqual(expr1.left, expr2)) {
    return true
  }
  if (expr2.type === 'NOT' && expr2.left && expressionsEqual(expr2.left, expr1)) {
    return true
  }
  return false
}

/**
 * Modified findConsensusTerms to findConsensusTermsAndRedundant: returns the term to be removed as the third element
 */
function findConsensusTermsAndRedundant(
  term1: BooleanExpression,
  term2: BooleanExpression,
  term3: BooleanExpression
): [BooleanExpression?, BooleanExpression?, BooleanExpression?] {
  const permutations = [
    [term1, term2, term3],
    [term1, term3, term2],
    [term2, term1, term3],
    [term2, term3, term1],
    [term3, term1, term2],
    [term3, term2, term1],
  ]
  for (const [tA, tB, tC] of permutations) {
    if (
      tA.type === 'AND' &&
      tB.type === 'AND' &&
      tC.type === 'AND' &&
      isConsensusTriple(tA, tB, tC)
    ) {
      return [tA, tB, tC]
    }
  }
  return [undefined, undefined, undefined]
}

function findDualConsensusTermsAndRedundant(
  term1: BooleanExpression,
  term2: BooleanExpression,
  term3: BooleanExpression
): [BooleanExpression?, BooleanExpression?, BooleanExpression?] {
  const permutations = [
    [term1, term2, term3],
    [term1, term3, term2],
    [term2, term1, term3],
    [term2, term3, term1],
    [term3, term1, term2],
    [term3, term2, term1],
  ]
  for (const [tA, tB, tC] of permutations) {
    if (
      tA.type === 'OR' &&
      tB.type === 'OR' &&
      tC.type === 'OR' &&
      isDualConsensusTriple(tA, tB, tC)
    ) {
      return [tA, tB, tC]
    }
  }
  return [undefined, undefined, undefined]
}

/**
 * Build an OR expression from terms, excluding one specific term
 */
function buildExpressionWithoutTerm(
  terms: BooleanExpression[],
  termToExclude: BooleanExpression
): BooleanExpression {
  const filteredTerms = terms.filter(term => !expressionsEqual(term, termToExclude))
  if (filteredTerms.length === 0) {
    return { type: 'CONSTANT', value: false }
  }
  return buildBalancedORTree(filteredTerms)
}

/**
 * Build an AND expression from terms, excluding one specific term
 */
function buildExpressionWithoutANDTerm(
  terms: BooleanExpression[],
  termToExclude: BooleanExpression
): BooleanExpression {
  const filteredTerms = terms.filter(term => !expressionsEqual(term, termToExclude))
  if (filteredTerms.length === 0) {
    return { type: 'CONSTANT', value: true }
  }
  return buildBalancedANDTree(filteredTerms)
}

/**
 * Build a balanced binary tree of OR operations from an array of terms
 */
function buildBalancedORTree(terms: BooleanExpression[]): BooleanExpression {
  if (terms.length === 0) {
    throw new Error(
      'Cannot build OR tree from zero terms, this should have been caught and returned as CONSTANT false.'
    )
  }
  if (terms.length === 1) {
    return terms[0]
  }
  const mid = Math.floor(terms.length / 2)
  const left = buildBalancedORTree(terms.slice(0, mid))
  const right = buildBalancedORTree(terms.slice(mid))
  return {
    type: 'OR',
    left,
    right,
  }
}

/**
 * Build a balanced binary tree of AND operations from an array of terms
 */
function buildBalancedANDTree(terms: BooleanExpression[]): BooleanExpression {
  if (terms.length === 0) {
    throw new Error(
      'Cannot build AND tree from zero terms, this should have been caught and returned as CONSTANT true.'
    )
  }
  if (terms.length === 1) {
    return terms[0]
  }
  const mid = Math.floor(terms.length / 2)
  const left = buildBalancedANDTree(terms.slice(0, mid))
  const right = buildBalancedANDTree(terms.slice(mid))
  return {
    type: 'AND',
    left,
    right,
  }
}
