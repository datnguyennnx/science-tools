/**
 * Contradiction Rules Module
 *
 * This module contains rules for detecting and simplifying contradictions
 * in Boolean expressions, such as (A ∧ ¬A) = 0.
 */

import { BooleanExpression } from '../../ast/types'
import { SimplificationRule } from '../../ast/rules'
import { expressionsEqual } from '../../utils/comparison'
import { expressionToBooleanString } from '../../parser'

/**
 * Get rules for detecting and simplifying contradictions
 */
export function getContradictionRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'Deep Contradiction Detection',
        description:
          'Identify and simplify contradictions like A ∧ ¬A = 0 at any level, including within nested ANDs like (X ∧ A) ∧ ¬A = 0',
        formula: 'A \\land \\lnot A = 0',
      },
      canApply: (expr: BooleanExpression): boolean => {
        const checkForPotentialContradiction = (e: BooleanExpression | undefined): boolean => {
          if (!e) return false
          if (e.type === 'AND' && e.left && e.right) {
            if (e.left.type === 'NOT' && e.left.left && expressionsEqual(e.left.left, e.right)) {
              return true
            }
            if (e.right.type === 'NOT' && e.right.left && expressionsEqual(e.right.left, e.left)) {
              return true
            }
          }
          if (e.type === 'AND') {
            const terms = collectAndOperands(e, [])
            const termStrings = new Set<string>()
            const notTermStrings = new Set<string>()
            for (const term of terms) {
              const termAsStr = expressionToBooleanString(term)
              if (term.type === 'NOT' && term.left) {
                const targetOfNot = expressionToBooleanString(term.left)
                notTermStrings.add(targetOfNot)
              } else {
                termStrings.add(termAsStr)
              }
            }
            for (const str of termStrings) {
              if (notTermStrings.has(str)) {
                return true
              }
            }
          }
          const leftCanApply = e.left ? checkForPotentialContradiction(e.left) : false
          if (leftCanApply) {
            return true
          }
          const rightCanApply = e.right ? checkForPotentialContradiction(e.right) : false
          if (rightCanApply) {
            return true
          }
          return false
        }
        return checkForPotentialContradiction(expr)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const simplifyContradictionsRecursive = (
          currentRecursiveExpr: BooleanExpression
        ): BooleanExpression => {
          let workingExpr = currentRecursiveExpr // Start with the original reference

          let processedLeft = workingExpr.left
          if (workingExpr.left) {
            processedLeft = simplifyContradictionsRecursive(workingExpr.left)
          }

          let processedRight = workingExpr.right
          if (workingExpr.right) {
            processedRight = simplifyContradictionsRecursive(workingExpr.right)
          }

          // If children changed, create a new node instance for workingExpr
          if (processedLeft !== workingExpr.left || processedRight !== workingExpr.right) {
            // Clone with proper type handling
            const newExpr = { ...workingExpr }
            newExpr.left = processedLeft
            newExpr.right = processedRight
            workingExpr = newExpr as BooleanExpression
          }

          // Now, workingExpr is either the original node (if children unchanged)
          // or a new node with (potentially) changed children.
          // Check current node workingExpr for contradiction

          if (workingExpr.type === 'AND' && workingExpr.left && workingExpr.right) {
            const leftTerm = workingExpr.left
            const rightTerm = workingExpr.right
            if (
              leftTerm.type === 'NOT' &&
              leftTerm.left &&
              expressionsEqual(leftTerm.left, rightTerm)
            ) {
              return { type: 'CONSTANT', value: false }
            }
            if (
              rightTerm.type === 'NOT' &&
              rightTerm.left &&
              expressionsEqual(rightTerm.left, leftTerm)
            ) {
              return { type: 'CONSTANT', value: false }
            }
          }

          if (workingExpr.type === 'AND') {
            const terms = collectAndOperands(workingExpr, [])
            const termStrings = new Set<string>()
            const notTermTargets = new Set<string>()
            for (const term of terms) {
              const termStr = expressionToBooleanString(term)
              if (term.type === 'NOT' && term.left) {
                const targetStr = expressionToBooleanString(term.left)
                if (termStrings.has(targetStr)) {
                  return { type: 'CONSTANT', value: false }
                }
                notTermTargets.add(targetStr)
              } else {
                if (notTermTargets.has(termStr)) {
                  return { type: 'CONSTANT', value: false }
                }
                termStrings.add(termStr)
              }
            }
          }
          return workingExpr
        }
        return simplifyContradictionsRecursive(expr)
      },
    },
    {
      info: {
        name: 'Tautology Recognition',
        description: 'A + !A => 1 (applied recursively to OR branches)',
        formula: 'A \\lor \\lnot A = 1',
      },
      canApply: (expr: BooleanExpression): boolean => {
        const checkForPotentialTautology = (e: BooleanExpression | undefined): boolean => {
          if (!e) return false
          if (e.type === 'OR') {
            const terms = collectOrOperands(e, [])
            const termStrings = new Set<string>()
            const notTermTargets = new Set<string>()
            for (const term of terms) {
              const termStr = expressionToBooleanString(term)
              if (term.type === 'NOT' && term.left) {
                const targetStr = expressionToBooleanString(term.left)
                if (termStrings.has(targetStr)) return true
                notTermTargets.add(targetStr)
              } else {
                if (notTermTargets.has(termStr)) return true
                termStrings.add(termStr)
              }
            }
          }
          if (e.type === 'NOT') {
            return checkForPotentialTautology(e.left)
          } else if (e.left && e.right) {
            if (checkForPotentialTautology(e.left)) return true
            if (checkForPotentialTautology(e.right)) return true
          }
          return false
        }
        return checkForPotentialTautology(expr)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const simplifyTautologiesRecursive = (
          currentRecursiveExpr: BooleanExpression
        ): BooleanExpression => {
          let workingExpr = currentRecursiveExpr

          let processedLeft = workingExpr.left
          if (workingExpr.left) {
            processedLeft = simplifyTautologiesRecursive(workingExpr.left)
          }
          let processedRight = workingExpr.right
          if (workingExpr.right) {
            processedRight = simplifyTautologiesRecursive(workingExpr.right)
          }

          if (processedLeft !== workingExpr.left || processedRight !== workingExpr.right) {
            // Clone with proper type handling
            const newExpr = { ...workingExpr }
            newExpr.left = processedLeft
            newExpr.right = processedRight
            workingExpr = newExpr as BooleanExpression
          }

          if (workingExpr.type === 'OR') {
            const terms = collectOrOperands(workingExpr, [])
            const termStrings = new Set<string>()
            const notTermTargets = new Set<string>()
            for (const term of terms) {
              const termStr = expressionToBooleanString(term)
              if (term.type === 'NOT' && term.left) {
                const targetStr = expressionToBooleanString(term.left)
                if (termStrings.has(targetStr)) {
                  return { type: 'CONSTANT', value: true }
                }
                notTermTargets.add(targetStr)
              } else {
                if (notTermTargets.has(termStr)) {
                  return { type: 'CONSTANT', value: true }
                }
                termStrings.add(termStr)
              }
            }
          }
          return workingExpr
        }
        return simplifyTautologiesRecursive(expr)
      },
    },
    {
      info: {
        name: 'Redundancy (AND terms with complement)',
        description: '(X · Y) + (X · ¬Y) = X',
        formula: '(X \\land Y) \\lor (X \\land \\lnot Y) = X',
        ruleType: 'redundancy',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR' || !expr.left || !expr.right) return false
        if (expr.left.type !== 'AND' || !expr.left.left || !expr.left.right) return false
        if (expr.right.type !== 'AND' || !expr.right.left || !expr.right.right) return false

        const term1_left = expr.left.left!
        const term1_right = expr.left.right!
        const term2_left = expr.right.left!
        const term2_right = expr.right.right!

        const areComplements = (
          subTermA: BooleanExpression,
          subTermB: BooleanExpression
        ): boolean => {
          if (subTermA.type === 'NOT' && subTermA.left && expressionsEqual(subTermA.left, subTermB))
            return true
          if (subTermB.type === 'NOT' && subTermB.left && expressionsEqual(subTermB.left, subTermA))
            return true
          return false
        }

        if (expressionsEqual(term1_left, term2_left) && areComplements(term1_right, term2_right))
          return true
        if (expressionsEqual(term1_left, term2_right) && areComplements(term1_right, term2_left))
          return true
        if (expressionsEqual(term1_right, term2_left) && areComplements(term1_left, term2_right))
          return true
        if (expressionsEqual(term1_right, term2_right) && areComplements(term1_left, term2_left))
          return true

        return false
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const term1_left = expr.left!.left!
        const term1_right = expr.left!.right!
        const term2_left = expr.right!.left!
        const term2_right = expr.right!.right!

        const areComplements = (
          subTermA: BooleanExpression,
          subTermB: BooleanExpression
        ): boolean => {
          if (subTermA.type === 'NOT' && subTermA.left && expressionsEqual(subTermA.left, subTermB))
            return true
          if (subTermB.type === 'NOT' && subTermB.left && expressionsEqual(subTermB.left, subTermA))
            return true
          return false
        }
        // Returning a new object (deepClone of the relevant part) is correct here as the structure changes significantly.
        if (expressionsEqual(term1_left, term2_left) && areComplements(term1_right, term2_right))
          return { ...term1_left } // Shallow clone X if it's an object
        if (expressionsEqual(term1_left, term2_right) && areComplements(term1_right, term2_left))
          return { ...term1_left }
        if (expressionsEqual(term1_right, term2_left) && areComplements(term1_left, term2_right))
          return { ...term1_right }
        if (expressionsEqual(term1_right, term2_right) && areComplements(term1_left, term2_left))
          return { ...term1_right }

        return expr // Fallback, should ideally not be reached if canApply is robust
      },
    },
    {
      info: {
        name: 'Redundancy (OR terms with complement)',
        description: '(X + Y) · (X + ¬Y) = X',
        formula: '(X \\lor Y) \\land (X \\lor \\lnot Y) = X',
        ruleType: 'redundancy',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'AND' || !expr.left || !expr.right) return false
        if (expr.left.type !== 'OR' || !expr.left.left || !expr.left.right) return false
        if (expr.right.type !== 'OR' || !expr.right.left || !expr.right.right) return false

        const term1_left = expr.left.left!
        const term1_right = expr.left.right!
        const term2_left = expr.right.left!
        const term2_right = expr.right.right!

        const areComplements = (
          subTermA: BooleanExpression,
          subTermB: BooleanExpression
        ): boolean => {
          if (subTermA.type === 'NOT' && subTermA.left && expressionsEqual(subTermA.left, subTermB))
            return true
          if (subTermB.type === 'NOT' && subTermB.left && expressionsEqual(subTermB.left, subTermA))
            return true
          return false
        }

        if (expressionsEqual(term1_left, term2_left) && areComplements(term1_right, term2_right))
          return true
        if (expressionsEqual(term1_left, term2_right) && areComplements(term1_right, term2_left))
          return true
        if (expressionsEqual(term1_right, term2_left) && areComplements(term1_left, term2_right))
          return true
        if (expressionsEqual(term1_right, term2_right) && areComplements(term1_left, term2_left))
          return true

        return false
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const term1_left = expr.left!.left!
        const term1_right = expr.left!.right!
        const term2_left = expr.right!.left!
        const term2_right = expr.right!.right!

        const areComplements = (
          subTermA: BooleanExpression,
          subTermB: BooleanExpression
        ): boolean => {
          if (subTermA.type === 'NOT' && subTermA.left && expressionsEqual(subTermA.left, subTermB))
            return true
          if (subTermB.type === 'NOT' && subTermB.left && expressionsEqual(subTermB.left, subTermA))
            return true
          return false
        }

        if (expressionsEqual(term1_left, term2_left) && areComplements(term1_right, term2_right))
          return { ...term1_left }
        if (expressionsEqual(term1_left, term2_right) && areComplements(term1_right, term2_left))
          return { ...term1_left }
        if (expressionsEqual(term1_right, term2_left) && areComplements(term1_left, term2_right))
          return { ...term1_right }
        if (expressionsEqual(term1_right, term2_right) && areComplements(term1_left, term2_left))
          return { ...term1_right }

        return expr
      },
    },
  ]
}

function collectAndOperands(
  expr: BooleanExpression,
  terms: BooleanExpression[]
): BooleanExpression[] {
  if (expr.type === 'AND') {
    if (expr.left) collectAndOperands(expr.left, terms)
    if (expr.right) collectAndOperands(expr.right, terms)
  } else {
    terms.push(expr)
  }
  return terms
}

function collectOrOperands(
  expr: BooleanExpression,
  terms: BooleanExpression[]
): BooleanExpression[] {
  if (expr.type === 'OR') {
    if (expr.left) collectOrOperands(expr.left, terms)
    if (expr.right) collectOrOperands(expr.right, terms)
  } else {
    terms.push(expr)
  }
  return terms
}
