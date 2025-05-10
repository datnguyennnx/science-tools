/**
 * Derived Operations Rules Module
 *
 * This module contains rules for simplifying XOR, NAND, and NOR operations.
 */

import { BooleanExpression } from '../../ast'
import { SimplificationRule } from '../../ast/rule-types'
import { deepClone, expressionsEqual } from '../../utils'

/**
 * Get rules for simplifying XOR operations
 */
export function getXORRules(): SimplificationRule[] {
  return [
    // XOR Identity: A XOR 0 = A
    {
      info: {
        name: 'XOR Identity',
        description: 'A XOR 0 = A',
        formula: 'A \\oplus 0 = A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'XOR') return false

        return Boolean(
          (expr.left?.type === 'CONSTANT' && expr.left.value === false) ||
            (expr.right?.type === 'CONSTANT' && expr.right.value === false)
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        if (expr.left?.type === 'CONSTANT' && expr.left.value === false) {
          return deepClone(expr.right!)
        }
        return deepClone(expr.left!)
      },
    },

    // XOR with 1: A XOR 1 = NOT A
    {
      info: {
        name: 'XOR with True',
        description: 'A XOR 1 = NOT A',
        formula: 'A \\oplus 1 = \\lnot A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'XOR') return false

        return Boolean(
          (expr.left?.type === 'CONSTANT' && expr.left.value === true) ||
            (expr.right?.type === 'CONSTANT' && expr.right.value === true)
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        if (expr.left?.type === 'CONSTANT' && expr.left.value === true) {
          return { type: 'NOT', left: deepClone(expr.right!) }
        }
        return { type: 'NOT', left: deepClone(expr.left!) }
      },
    },

    // XOR with Self: A XOR A = 0
    {
      info: {
        name: 'XOR Self-Cancellation',
        description: 'A XOR A = 0',
        formula: 'A \\oplus A = 0',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'XOR') return false

        return Boolean(expr.left && expr.right && expressionsEqual(expr.left, expr.right))
      },
      apply: (): BooleanExpression => {
        return { type: 'CONSTANT', value: false }
      },
    },

    // XOR Associativity: (A XOR B) XOR C = A XOR (B XOR C)
    // We don't modify the expression here, just recognize the pattern
    {
      info: {
        name: 'XOR Associativity',
        description: '(A XOR B) XOR C = A XOR (B XOR C)',
        formula: '(A \\oplus B) \\oplus C = A \\oplus (B \\oplus C)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return Boolean(
          expr.type === 'XOR' &&
            expr.left?.type === 'XOR' &&
            expr.left.left &&
            expr.left.right &&
            expr.right
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // We don't modify the structure, but return the equivalent form
        // This is mostly for documentation purposes in the simplification steps
        return deepClone(expr)
      },
    },

    // XOR Commutativity: A XOR B = B XOR A
    // We don't modify the expression here, just recognize the pattern
    {
      info: {
        name: 'XOR Commutativity',
        description: 'A XOR B = B XOR A',
        formula: 'A \\oplus B = B \\oplus A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return Boolean(expr.type === 'XOR' && expr.left && expr.right)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // We don't modify the structure, but return the equivalent form
        // This is mostly for documentation purposes in the simplification steps
        return deepClone(expr)
      },
    },

    // Add a rule to simplify (A ^ A) to 0
    {
      info: {
        name: 'XOR Self-Cancellation Complex',
        description: 'A XOR A = 0',
        formula: 'A \\oplus A = 0',
      },
      canApply: (expr: BooleanExpression): boolean => {
        // Check if it's an XOR operation
        if (expr.type !== 'XOR') return false

        // Check if both operands are the same
        return JSON.stringify(expr.left) === JSON.stringify(expr.right)
      },
      apply: (): BooleanExpression => {
        // A XOR A = 0
        return { type: 'CONSTANT', value: false }
      },
    },

    // Add XOR Expansion Rule
    {
      info: {
        name: 'XOR Expansion',
        description: 'A XOR B = (A * !B) + (!A * B)',
        formula: 'A \\\\oplus B = (A \\\\land \\\\lnot B) \\\\lor (\\\\lnot A \\\\land B)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'XOR' && expr.left !== undefined && expr.right !== undefined
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const A_clone = deepClone(expr.left!)
        const B_clone = deepClone(expr.right!)

        const not_A_clone: BooleanExpression = { type: 'NOT', left: deepClone(expr.left!) }
        const not_B_clone: BooleanExpression = { type: 'NOT', left: deepClone(expr.right!) }

        const term1: BooleanExpression = { type: 'AND', left: A_clone, right: not_B_clone }
        const term2: BooleanExpression = { type: 'AND', left: not_A_clone, right: B_clone }

        const finalExpr: BooleanExpression = { type: 'OR', left: term1, right: term2 }
        return finalExpr
      },
    },
  ]
}

/**
 * Get rules for simplifying NAND operations
 */
export function getNANDRules(): SimplificationRule[] {
  return [
    // NAND with 0: A NAND 0 = 1
    {
      info: {
        name: 'NAND with False',
        description: 'A NAND 0 = 1',
        formula: 'A \\uparrow 0 = 1',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NAND') return false

        return Boolean(
          (expr.left?.type === 'CONSTANT' && expr.left.value === false) ||
            (expr.right?.type === 'CONSTANT' && expr.right.value === false)
        )
      },
      apply: (): BooleanExpression => {
        return { type: 'CONSTANT', value: true }
      },
    },

    // NAND with 1: A NAND 1 = NOT A
    {
      info: {
        name: 'NAND with True',
        description: 'A NAND 1 = NOT A',
        formula: 'A \\uparrow 1 = \\lnot A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NAND') return false

        return Boolean(
          (expr.left?.type === 'CONSTANT' && expr.left.value === true) ||
            (expr.right?.type === 'CONSTANT' && expr.right.value === true)
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        if (expr.left?.type === 'CONSTANT' && expr.left.value === true) {
          return { type: 'NOT', left: deepClone(expr.right!) }
        }
        return { type: 'NOT', left: deepClone(expr.left!) }
      },
    },

    // NAND with Self: A NAND A = NOT A
    {
      info: {
        name: 'NAND Self-Negation',
        description: 'A NAND A = NOT A',
        formula: 'A \\uparrow A = \\lnot A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NAND') return false

        return Boolean(expr.left && expr.right && expressionsEqual(expr.left, expr.right))
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        return { type: 'NOT', left: deepClone(expr.left!) }
      },
    },

    // Double NAND: NOT(A NAND B) = A AND B
    {
      info: {
        name: 'Double NAND',
        description: 'NOT(A NAND B) = A AND B',
        formula: '\\lnot(A \\uparrow B) = A \\land B',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return Boolean(
          expr.type === 'NOT' && expr.left?.type === 'NAND' && expr.left.left && expr.left.right
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const nandExpr = expr.left!
        return {
          type: 'AND',
          left: deepClone(nandExpr.left!),
          right: deepClone(nandExpr.right!),
        }
      },
    },

    // Add a rule to simplify (A @ A) to !A
    {
      info: {
        name: 'NAND Self-Negation Complex',
        description: 'A NAND A = NOT A',
        formula: 'A \\uparrow A = \\lnot A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        // Check if it's a NAND operation
        if (expr.type !== 'NAND') return false

        // Check if both operands are the same
        return JSON.stringify(expr.left) === JSON.stringify(expr.right)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // A NAND A = !A
        return { type: 'NOT', left: expr.left }
      },
    },

    // Add NAND Expansion Rule
    {
      info: {
        name: 'NAND Expansion',
        description: 'A NAND B = !(A * B)',
        formula: 'A \\\\uparrow B = \\\\lnot (A \\\\land B)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NAND' && expr.left !== undefined && expr.right !== undefined
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const andNode: BooleanExpression = {
          type: 'AND',
          left: deepClone(expr.left!),
          right: deepClone(expr.right!),
        }
        const finalExpr: BooleanExpression = { type: 'NOT', left: andNode }
        return finalExpr
      },
    },

    // Rule to handle nested XOR and NOR operations within NAND
    {
      info: {
        name: 'NAND with Complex Operands',
        description: 'Simplify NAND operations with complex operands',
        formula: '(A \\oplus A) \\uparrow (B \\downarrow B) = 0 \\uparrow !B = 1',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NAND') return false

        // Check if left operand is an XOR of identical expressions
        const hasXORSelfCancellation =
          expr.left?.type === 'XOR' &&
          JSON.stringify(expr.left.left) === JSON.stringify(expr.left.right)

        // Check if right operand is a NOR of identical expressions
        const hasNORSelfNegation =
          expr.right?.type === 'NOR' &&
          JSON.stringify(expr.right.left) === JSON.stringify(expr.right.right)

        return Boolean(hasXORSelfCancellation || hasNORSelfNegation)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // If left is XOR Self-Cancellation (becomes false)
        if (
          expr.left?.type === 'XOR' &&
          JSON.stringify(expr.left.left) === JSON.stringify(expr.left.right)
        ) {
          // false NAND anything = true
          return { type: 'CONSTANT', value: true }
        }

        // If right is NOR Self-Negation (becomes NOT B)
        if (
          expr.right?.type === 'NOR' &&
          JSON.stringify(expr.right.left) === JSON.stringify(expr.right.right)
        ) {
          // A NAND NOT B
          return {
            type: 'NAND',
            left: deepClone(expr.left!),
            right: { type: 'NOT', left: deepClone(expr.right.left!) },
          }
        }

        return expr
      },
    },
  ]
}

/**
 * Get rules for simplifying NOR operations
 */
export function getNORRules(): SimplificationRule[] {
  return [
    // NOR with 0: A NOR 0 = NOT A
    {
      info: {
        name: 'NOR with False',
        description: 'A NOR 0 = NOT A',
        formula: 'A \\downarrow 0 = \\lnot A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NOR') return false

        return Boolean(
          (expr.left?.type === 'CONSTANT' && expr.left.value === false) ||
            (expr.right?.type === 'CONSTANT' && expr.right.value === false)
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        if (expr.left?.type === 'CONSTANT' && expr.left.value === false) {
          return { type: 'NOT', left: deepClone(expr.right!) }
        }
        return { type: 'NOT', left: deepClone(expr.left!) }
      },
    },

    // NOR with 1: A NOR 1 = 0
    {
      info: {
        name: 'NOR with True',
        description: 'A NOR 1 = 0',
        formula: 'A \\downarrow 1 = 0',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NOR') return false

        return Boolean(
          (expr.left?.type === 'CONSTANT' && expr.left.value === true) ||
            (expr.right?.type === 'CONSTANT' && expr.right.value === true)
        )
      },
      apply: (): BooleanExpression => {
        return { type: 'CONSTANT', value: false }
      },
    },

    // NOR with Self: A NOR A = NOT A
    {
      info: {
        name: 'NOR Self-Negation',
        description: 'A NOR A = NOT A',
        formula: 'A \\downarrow A = \\lnot A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'NOR') return false

        return Boolean(expr.left && expr.right && expressionsEqual(expr.left, expr.right))
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        return { type: 'NOT', left: deepClone(expr.left!) }
      },
    },

    // Double NOR: NOT(A NOR B) = A OR B
    {
      info: {
        name: 'Double NOR',
        description: 'NOT(A NOR B) = A OR B',
        formula: '\\lnot(A \\downarrow B) = A \\lor B',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return Boolean(
          expr.type === 'NOT' && expr.left?.type === 'NOR' && expr.left.left && expr.left.right
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const norExpr = expr.left!
        return {
          type: 'OR',
          left: deepClone(norExpr.left!),
          right: deepClone(norExpr.right!),
        }
      },
    },

    // Add a rule to simplify (A # A) to !A
    {
      info: {
        name: 'NOR Self-Negation Complex',
        description: 'A NOR A = NOT A',
        formula: 'A \\downarrow A = \\lnot A',
      },
      canApply: (expr: BooleanExpression): boolean => {
        // Check if it's a NOR operation
        if (expr.type !== 'NOR') return false

        // Check if both operands are the same
        return JSON.stringify(expr.left) === JSON.stringify(expr.right)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // A NOR A = !A
        return { type: 'NOT', left: expr.left }
      },
    },

    // Add NOR Expansion Rule
    {
      info: {
        name: 'NOR Expansion',
        description: 'A NOR B = !(A + B)',
        formula: 'A \\\\downarrow B = \\\\lnot (A \\\\lor B)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NOR' && expr.left !== undefined && expr.right !== undefined
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        const orNode: BooleanExpression = {
          type: 'OR',
          left: deepClone(expr.left!),
          right: deepClone(expr.right!),
        }
        const finalExpr: BooleanExpression = { type: 'NOT', left: orNode }
        return finalExpr
      },
    },
  ]
}

/**
 * Get all derived operation rules
 */
export function getDerivedRules(): SimplificationRule[] {
  return [...getXORRules(), ...getNANDRules(), ...getNORRules()]
}
