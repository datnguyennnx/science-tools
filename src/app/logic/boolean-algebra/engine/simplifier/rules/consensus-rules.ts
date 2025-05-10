/**
 * Consensus Theorem Rules Module
 *
 * This module contains rules for the Consensus Theorem and its variations
 * in Boolean algebra.
 */

import { BooleanExpression } from '../../ast'
import { SimplificationRule } from '../../ast/rule-types'
import { deepClone } from '../../utils'
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
        // Look for patterns of OR expressions with three terms
        if (expr.type !== 'OR') return false

        // First, we need to collect all the AND terms in the OR expression
        const terms: BooleanExpression[] = collectORTerms(expr)

        // Check for consensus pattern only if we have at least 3 terms
        if (terms.length < 3) return false

        // Check each triplet of terms for the consensus pattern
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
        // Make a deep copy we can modify
        const result = deepClone(expr)
        const terms = collectORTerms(result)

        // Identify and remove the redundant term
        for (let i = 0; i < terms.length - 2; i++) {
          for (let j = i + 1; j < terms.length - 1; j++) {
            for (let k = j + 1; k < terms.length; k++) {
              const [a, b, c] = findConsensusTerms(terms[i], terms[j], terms[k])
              if (a && b && c) {
                // Remove the consensus term (B * C) from the expression
                return buildExpressionWithoutTerm(terms, c)
              }
            }
          }
        }

        // If we couldn't apply the rule (shouldn't happen if canApply was true)
        return result
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
        // Look for patterns of AND expressions with three terms
        if (expr.type !== 'AND') return false

        // First, we need to collect all the OR terms in the AND expression
        const terms: BooleanExpression[] = collectANDTerms(expr)

        // Check for consensus pattern only if we have at least 3 terms
        if (terms.length < 3) return false

        // Check each triplet of terms for the consensus pattern
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
        // Make a deep copy we can modify
        const result = deepClone(expr)
        const terms = collectANDTerms(result)

        // Identify and remove the redundant term
        for (let i = 0; i < terms.length - 2; i++) {
          for (let j = i + 1; j < terms.length - 1; j++) {
            for (let k = j + 1; k < terms.length; k++) {
              const [a, b, c] = findDualConsensusTerms(terms[i], terms[j], terms[k])
              if (a && b && c) {
                // Remove the consensus term (B + C) from the expression
                return buildExpressionWithoutANDTerm(terms, c)
              }
            }
          }
        }

        // If we couldn't apply the rule (shouldn't happen if canApply was true)
        return result
      },
    },
  ]
}

/**
 * Collect all terms in an OR expression into an array
 */
function collectORTerms(expr: BooleanExpression): BooleanExpression[] {
  const terms: BooleanExpression[] = []

  // Helper function to recursively collect OR terms
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

  // Helper function to recursively collect AND terms
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
  // All terms must be AND expressions
  if (term1.type !== 'AND' || term2.type !== 'AND' || term3.type !== 'AND') return false

  // Look for the pattern in all permutations
  const permutations = [
    [term1, term2, term3],
    [term1, term3, term2],
    [term2, term1, term3],
    [term2, term3, term1],
    [term3, term1, term2],
    [term3, term2, term1],
  ]

  for (const [a, b, c] of permutations) {
    // Try to match (A * B) + (A * !C) + (B * C) pattern
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
  // All terms must be OR expressions
  if (term1.type !== 'OR' || term2.type !== 'OR' || term3.type !== 'OR') return false

  // Look for the pattern in all permutations
  const permutations = [
    [term1, term2, term3],
    [term1, term3, term2],
    [term2, term1, term3],
    [term2, term3, term1],
    [term3, term1, term2],
    [term3, term2, term1],
  ]

  for (const [a, b, c] of permutations) {
    // Try to match (A + B) * (A + !C) * (B + C) pattern
    if (isDualConsensusTriple(a, b, c)) return true
  }

  return false
}

/**
 * Check if three AND terms form the specific consensus pattern
 */
function isConsensusTriple(
  ab: BooleanExpression,
  ac: BooleanExpression,
  bc: BooleanExpression
): boolean {
  // Extract the operands from each AND term
  const abLeft = ab.left
  const abRight = ab.right
  const acLeft = ac.left
  const acRight = ac.right
  const bcLeft = bc.left
  const bcRight = bc.right

  if (!abLeft || !abRight || !acLeft || !acRight || !bcLeft || !bcRight) return false

  // Look for the A term in the first two expressions
  if (expressionsEqual(abLeft, acLeft)) {
    // abLeft is A, abRight is B, acRight is !C
    if (acRight.type !== 'NOT' || !acRight.left) return false

    // Check if bcLeft = B and bcRight = C
    if (
      (expressionsEqual(abRight, bcLeft) && expressionsEqual(acRight.left, bcRight)) ||
      (expressionsEqual(abRight, bcRight) && expressionsEqual(acRight.left, bcLeft))
    ) {
      return true
    }
  }

  // Check the other possibility where A is in the right side
  if (expressionsEqual(abRight, acRight)) {
    // abRight is A, abLeft is B, acLeft is !C
    if (acLeft.type !== 'NOT' || !acLeft.left) return false

    // Check if bcLeft = B and bcRight = C
    if (
      (expressionsEqual(abLeft, bcLeft) && expressionsEqual(acLeft.left, bcRight)) ||
      (expressionsEqual(abLeft, bcRight) && expressionsEqual(acLeft.left, bcLeft))
    ) {
      return true
    }
  }

  // Also check mixed cases
  if (expressionsEqual(abLeft, acRight)) {
    // abLeft is A, abRight is B, acLeft is !C
    if (acLeft.type !== 'NOT' || !acLeft.left) return false

    // Check if bcLeft = B and bcRight = C
    if (
      (expressionsEqual(abRight, bcLeft) && expressionsEqual(acLeft.left, bcRight)) ||
      (expressionsEqual(abRight, bcRight) && expressionsEqual(acLeft.left, bcLeft))
    ) {
      return true
    }
  }

  if (expressionsEqual(abRight, acLeft)) {
    // abRight is A, abLeft is B, acRight is !C
    if (acRight.type !== 'NOT' || !acRight.left) return false

    // Check if bcLeft = B and bcRight = C
    if (
      (expressionsEqual(abLeft, bcLeft) && expressionsEqual(acRight.left, bcRight)) ||
      (expressionsEqual(abLeft, bcRight) && expressionsEqual(acRight.left, bcLeft))
    ) {
      return true
    }
  }

  return false
}

/**
 * Check if three OR terms form the specific dual consensus pattern
 */
function isDualConsensusTriple(
  ab: BooleanExpression,
  ac: BooleanExpression,
  bc: BooleanExpression
): boolean {
  // Extract the operands from each OR term
  const abLeft = ab.left
  const abRight = ab.right
  const acLeft = ac.left
  const acRight = ac.right
  const bcLeft = bc.left
  const bcRight = bc.right

  if (!abLeft || !abRight || !acLeft || !acRight || !bcLeft || !bcRight) return false

  // Look for the A term in the first two expressions
  if (expressionsEqual(abLeft, acLeft)) {
    // abLeft is A, abRight is B, acRight is !C
    if (acRight.type !== 'NOT' || !acRight.left) return false

    // Check if bcLeft = B and bcRight = C
    if (
      (expressionsEqual(abRight, bcLeft) && expressionsEqual(acRight.left, bcRight)) ||
      (expressionsEqual(abRight, bcRight) && expressionsEqual(acRight.left, bcLeft))
    ) {
      return true
    }
  }

  // Check all the other possible combinations (similar to isConsensusTriple)
  if (expressionsEqual(abRight, acRight)) {
    if (acLeft.type !== 'NOT' || !acLeft.left) return false
    if (
      (expressionsEqual(abLeft, bcLeft) && expressionsEqual(acLeft.left, bcRight)) ||
      (expressionsEqual(abLeft, bcRight) && expressionsEqual(acLeft.left, bcLeft))
    ) {
      return true
    }
  }

  if (expressionsEqual(abLeft, acRight)) {
    if (acLeft.type !== 'NOT' || !acLeft.left) return false
    if (
      (expressionsEqual(abRight, bcLeft) && expressionsEqual(acLeft.left, bcRight)) ||
      (expressionsEqual(abRight, bcRight) && expressionsEqual(acLeft.left, bcLeft))
    ) {
      return true
    }
  }

  if (expressionsEqual(abRight, acLeft)) {
    if (acRight.type !== 'NOT' || !acRight.left) return false
    if (
      (expressionsEqual(abLeft, bcLeft) && expressionsEqual(acRight.left, bcRight)) ||
      (expressionsEqual(abLeft, bcRight) && expressionsEqual(acRight.left, bcLeft))
    ) {
      return true
    }
  }

  return false
}

/**
 * Find which terms correspond to (A * B), (A * !C), and (B * C) in the consensus pattern
 */
function findConsensusTerms(
  term1: BooleanExpression,
  term2: BooleanExpression,
  term3: BooleanExpression
): [BooleanExpression?, BooleanExpression?, BooleanExpression?] {
  // Try all permutations to find the correct mapping
  const permutations = [
    [term1, term2, term3],
    [term1, term3, term2],
    [term2, term1, term3],
    [term2, term3, term1],
    [term3, term1, term2],
    [term3, term2, term1],
  ]

  for (const [ab, ac, bc] of permutations) {
    if (isConsensusTriple(ab, ac, bc)) {
      return [ab, ac, bc]
    }
  }

  return [undefined, undefined, undefined]
}

/**
 * Find which terms correspond to (A + B), (A + !C), and (B + C) in the dual consensus pattern
 */
function findDualConsensusTerms(
  term1: BooleanExpression,
  term2: BooleanExpression,
  term3: BooleanExpression
): [BooleanExpression?, BooleanExpression?, BooleanExpression?] {
  // Try all permutations to find the correct mapping
  const permutations = [
    [term1, term2, term3],
    [term1, term3, term2],
    [term2, term1, term3],
    [term2, term3, term1],
    [term3, term1, term2],
    [term3, term2, term1],
  ]

  for (const [ab, ac, bc] of permutations) {
    if (isDualConsensusTriple(ab, ac, bc)) {
      return [ab, ac, bc]
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
  // Filter out the term to exclude
  const filteredTerms = terms.filter(term => !expressionsEqual(term, termToExclude))

  // Build a balanced OR tree from the terms
  return buildBalancedORTree(filteredTerms)
}

/**
 * Build an AND expression from terms, excluding one specific term
 */
function buildExpressionWithoutANDTerm(
  terms: BooleanExpression[],
  termToExclude: BooleanExpression
): BooleanExpression {
  // Filter out the term to exclude
  const filteredTerms = terms.filter(term => !expressionsEqual(term, termToExclude))

  // Build a balanced AND tree from the terms
  return buildBalancedANDTree(filteredTerms)
}

/**
 * Build a balanced binary tree of OR operations from an array of terms
 */
function buildBalancedORTree(terms: BooleanExpression[]): BooleanExpression {
  if (terms.length === 0) {
    throw new Error('Cannot build OR tree from zero terms')
  }

  if (terms.length === 1) {
    return terms[0]
  }

  // Recursively build a balanced tree
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
    throw new Error('Cannot build AND tree from zero terms')
  }

  if (terms.length === 1) {
    return terms[0]
  }

  // Recursively build a balanced tree
  const mid = Math.floor(terms.length / 2)
  const left = buildBalancedANDTree(terms.slice(0, mid))
  const right = buildBalancedANDTree(terms.slice(mid))

  return {
    type: 'AND',
    left,
    right,
  }
}
