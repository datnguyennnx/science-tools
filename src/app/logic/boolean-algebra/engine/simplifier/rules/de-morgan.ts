/**
 * De Morgan's Laws Implementation
 *
 * Implements the fundamental De Morgan's laws for boolean algebra:
 * - ¬(A ∧ B) ≡ ¬A ∨ ¬B  (NOT of AND equals OR of NOTs)
 * - ¬(A ∨ B) ≡ ¬A ∧ ¬B  (NOT of OR equals AND of NOTs)
 *
 * These laws allow pushing negations inward through conjunctions and disjunctions.
 */

import { BooleanExpression, AndNode, OrNode, XorNode, NandNode, NorNode } from '../../ast/types'
import { SimplificationRule } from '../../ast/rules'

/**
 * Recursively apply De Morgan's laws throughout an expression tree
 *
 * Uses bottom-up traversal to transform negated conjunctions/disjunctions
 * according to De Morgan's laws while preserving expression structure.
 */
function applyDeMorganRecursively(expr: BooleanExpression): BooleanExpression {
  // Handle NOT operations - apply De Morgan's laws
  if (expr.type === 'NOT' && expr.left) {
    const operand = expr.left

    // Recursively process operand first (important for nested structures)
    const processedOperand = applyDeMorganRecursively(operand)

    // Apply De Morgan's Law: ¬(A ∧ B) ≡ ¬A ∨ ¬B
    if (processedOperand.type === 'AND' && processedOperand.left && processedOperand.right) {
      return {
        type: 'OR',
        left: { type: 'NOT', left: processedOperand.left },
        right: { type: 'NOT', left: processedOperand.right },
      }
    }

    // Apply De Morgan's Law: ¬(A ∨ B) ≡ ¬A ∧ ¬B
    if (processedOperand.type === 'OR' && processedOperand.left && processedOperand.right) {
      return {
        type: 'AND',
        left: { type: 'NOT', left: processedOperand.left },
        right: { type: 'NOT', left: processedOperand.right },
      }
    }

    // Apply De Morgan's Law for NAND: ¬(A NAND B) ≡ ¬A NAND ¬B
    if (processedOperand.type === 'NAND' && processedOperand.left && processedOperand.right) {
      return {
        type: 'NAND',
        left: { type: 'NOT', left: processedOperand.left },
        right: { type: 'NOT', left: processedOperand.right },
      }
    }

    // Apply De Morgan's Law for NOR: ¬(A NOR B) ≡ ¬A NOR ¬B
    if (processedOperand.type === 'NOR' && processedOperand.left && processedOperand.right) {
      return {
        type: 'NOR',
        left: { type: 'NOT', left: processedOperand.left },
        right: { type: 'NOT', left: processedOperand.right },
      }
    }

    // If operand changed during processing, create new NOT node
    if (processedOperand !== operand) {
      return { type: 'NOT', left: processedOperand }
    }

    // No transformation needed
    return expr
  }

  // Handle non-NOT nodes - recurse on children
  if (expr.left || expr.right) {
    let childrenChanged = false
    let newLeft = expr.left
    let newRight = expr.right

    // Process left child
    if (expr.left) {
      const processedLeft = applyDeMorganRecursively(expr.left)
      if (processedLeft !== expr.left) {
        newLeft = processedLeft
        childrenChanged = true
      }
    }

    // Process right child
    if (expr.right) {
      const processedRight = applyDeMorganRecursively(expr.right)
      if (processedRight !== expr.right) {
        newRight = processedRight
        childrenChanged = true
      }
    }

    // Reconstruct node if children changed
    if (childrenChanged) {
      switch (expr.type) {
        case 'AND':
          if (newLeft && newRight) {
            return { type: 'AND', left: newLeft, right: newRight } as AndNode
          }
          break
        case 'OR':
          if (newLeft && newRight) {
            return { type: 'OR', left: newLeft, right: newRight } as OrNode
          }
          break
        case 'XOR':
          if (newLeft && newRight) {
            return { type: 'XOR', left: newLeft, right: newRight } as XorNode
          }
          break
        case 'NAND':
          if (newLeft && newRight) {
            return { type: 'NAND', left: newLeft, right: newRight } as NandNode
          }
          break
        case 'NOR':
          if (newLeft && newRight) {
            return { type: 'NOR', left: newLeft, right: newRight } as NorNode
          }
          break
      }
      // Fallback for unsupported types or invalid states
      return expr
    }
  }

  // Base case: leaf nodes or nodes without children
  return expr
}

/**
 * Get De Morgan's law simplification rules
 *
 * Returns rules for applying De Morgan's fundamental laws:
 * - ¬(A ∧ B) ≡ ¬A ∨ ¬B
 * - ¬(A ∨ B) ≡ ¬A ∧ ¬B
 * - ¬(A NAND B) ≡ ¬A NAND ¬B
 * - ¬(A NOR B) ≡ ¬A NOR ¬B
 */
export function getDeMorganRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: "De Morgan's Law (AND)",
        description: "De Morgan's Law: ¬(A ∧ B) ≡ ¬A ∨ ¬B",
        formula: '\\lnot(A \\land B) \\equiv \\lnot A \\lor \\lnot B',
        ruleType: 'negation',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NOT' && expr.left?.type === 'AND'
      },
      apply: applyDeMorganRecursively,
    },
    {
      info: {
        name: "De Morgan's Law (OR) - NOR Expansion",
        description:
          "De Morgan's Law: ¬(A ∨ B) ≡ ¬A ∧ ¬B. This transforms NOR operations ¬(A ∨ B) into AND of negations ¬A ∧ ¬B.",
        formula: '\\lnot(A \\lor B) \\equiv \\lnot A \\land \\lnot B',
        ruleType: 'negation',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NOT' && expr.left?.type === 'OR'
      },
      apply: applyDeMorganRecursively,
    },
    {
      info: {
        name: "De Morgan's Law (NAND)",
        description: "De Morgan's Law: ¬(A NAND B) ≡ ¬A NAND ¬B",
        formula: '\\lnot(A \\uparrow B) \\equiv \\lnot A \\uparrow \\lnot B',
        ruleType: 'negation',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NOT' && expr.left?.type === 'NAND'
      },
      apply: applyDeMorganRecursively,
    },
    {
      info: {
        name: "De Morgan's Law (NOR)",
        description: "De Morgan's Law: ¬(A NOR B) ≡ ¬A NOR ¬B",
        formula: '\\lnot(A \\downarrow B) \\equiv \\lnot A \\downarrow \\lnot B',
        ruleType: 'negation',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NOT' && expr.left?.type === 'NOR'
      },
      apply: applyDeMorganRecursively,
    },
  ]
}
