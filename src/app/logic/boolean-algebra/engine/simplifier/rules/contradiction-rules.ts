/**
 * Contradiction Rules Module
 *
 * This module contains rules for detecting and simplifying contradictions
 * in Boolean expressions, such as (A ∧ ¬A) = 0.
 */

import { BooleanExpression } from '../../ast'
import { SimplificationRule } from '../../ast/rule-types'
import { deepClone, expressionsEqual } from '../../utils'

/**
 * Get rules for detecting and simplifying contradictions
 */
export function getContradictionRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'Deep Contradiction Detection',
        description: 'Identify and simplify contradictions at any level',
        formula: 'A ∧ ¬A = 0',
      },
      canApply: (expr: BooleanExpression): boolean => {
        // Check if this expression or any subexpression has a contradiction
        const hasContradiction = (e: BooleanExpression | undefined): boolean => {
          if (!e) return false

          // Check for direct contradiction: A ∧ ¬A or ¬A ∧ A
          if (e.type === 'AND') {
            if (e.left?.type === 'NOT' && e.left.left && expressionsEqual(e.left.left, e.right)) {
              return true
            }
            if (e.right?.type === 'NOT' && e.right.left && expressionsEqual(e.right.left, e.left)) {
              return true
            }
          }

          // Check children recursively
          return Boolean(
            (e.left && hasContradiction(e.left)) || (e.right && hasContradiction(e.right))
          )
        }

        return hasContradiction(expr)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const simplifyContradictions = (e: BooleanExpression): BooleanExpression => {
          if (!e) return e

          // First process children
          if (e.left) e.left = simplifyContradictions(e.left)
          if (e.right) e.right = simplifyContradictions(e.right)

          // Check for contradictions: A ∧ ¬A
          if (e.type === 'AND') {
            // Check for A ∧ ¬A
            if (e.left?.type === 'NOT' && e.left.left && expressionsEqual(e.left.left, e.right)) {
              return { type: 'CONSTANT', value: false }
            }
            // Check for ¬A ∧ A
            if (e.right?.type === 'NOT' && e.right.left && expressionsEqual(e.right.left, e.left)) {
              return { type: 'CONSTANT', value: false }
            }
          }

          return e
        }

        return simplifyContradictions(deepClone(expr))
      },
    },
    {
      info: {
        name: 'Tautology Recognition',
        description: 'Recognize expressions that are always true, e.g., (A ∨ ¬A) = 1',
        formula: 'A ∨ ¬A = 1',
      },
      canApply: (expr: BooleanExpression): boolean => {
        // Check if this expression or any subexpression has a tautology
        const hasTautology = (e: BooleanExpression | undefined): boolean => {
          if (!e) return false

          // Check for direct tautology: A ∨ ¬A or ¬A ∨ A
          if (e.type === 'OR') {
            if (e.left && e.right) {
              // Ensure both children exist
              if (e.left.type === 'NOT' && e.left.left && expressionsEqual(e.left.left, e.right)) {
                return true
              }
              if (
                e.right.type === 'NOT' &&
                e.right.left &&
                expressionsEqual(e.right.left, e.left)
              ) {
                return true
              }
            }
          }

          // Check children recursively
          // For NOT nodes, check its operand. For AND/OR, check both children.
          if (e.type === 'NOT') {
            return hasTautology(e.left)
          } else if (
            e.type === 'AND' ||
            e.type === 'OR' ||
            e.type === 'XOR' ||
            e.type === 'NAND' ||
            e.type === 'NOR'
          ) {
            return hasTautology(e.left) || hasTautology(e.right)
          }
          // Variables and Constants cannot contain tautologies themselves
          return false
        }
        return hasTautology(expr)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const simplifyTautologies = (e: BooleanExpression): BooleanExpression => {
          if (!e) return e // Should not happen with a valid AST node

          // First process children recursively
          // This ensures that deeper tautologies are simplified before checking the current node
          if (e.type === 'NOT') {
            if (e.left) e.left = simplifyTautologies(e.left)
          } else if (
            e.type === 'AND' ||
            e.type === 'OR' ||
            e.type === 'XOR' ||
            e.type === 'NAND' ||
            e.type === 'NOR'
          ) {
            if (e.left) e.left = simplifyTautologies(e.left)
            if (e.right) e.right = simplifyTautologies(e.right)
          }

          // Check for tautologies: A ∨ ¬A or ¬A ∨ A at the current node
          if (e.type === 'OR') {
            if (e.left && e.right) {
              // Ensure both children exist
              // Check for A ∨ ¬A
              if (
                e.right.type === 'NOT' &&
                e.right.left &&
                expressionsEqual(e.left, e.right.left)
              ) {
                return { type: 'CONSTANT', value: true }
              }
              // Check for ¬A ∨ A
              if (e.left.type === 'NOT' && e.left.left && expressionsEqual(e.right, e.left.left)) {
                return { type: 'CONSTANT', value: true }
              }
            }
          }
          return e
        }
        // It's important to clone the expression if we are modifying it in place
        // or if simplifyTautologies might return parts of the original unchanged.
        // Since simplifyTautologies reconstructs nodes or returns original children,
        // cloning at the start ensures the original AST passed to the rule is not mutated directly by this rule's apply function.
        return simplifyTautologies(deepClone(expr))
      },
    },
  ]
}
