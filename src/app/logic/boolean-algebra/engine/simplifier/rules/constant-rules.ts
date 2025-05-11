/**
 * Constant Rules Module (Recursive)
 *
 * This module contains a master rule for recursively simplifying Boolean expressions
 * with constants (true and false values) throughout the expression tree.
 */

import { BooleanExpression, AndNode, OrNode, XorNode, NandNode, NorNode, NotNode } from '../../ast'
import { SimplificationRule } from '../../ast/rule-types'

// Define individual constant simplification patterns
// Each pattern takes an expression and returns a modified one if the pattern applies, otherwise the original.
const constantPatterns: Array<(expr: BooleanExpression) => BooleanExpression | null> = [
  // Pattern: X ∧ true = X
  expr => {
    if (expr.type === 'AND') {
      if (expr.left?.type === 'CONSTANT' && expr.left.value === true && expr.right)
        return expr.right // X
      if (expr.right?.type === 'CONSTANT' && expr.right.value === true && expr.left)
        return expr.left // X
    }
    return null
  },
  // Pattern: X ∧ false = false
  expr => {
    if (expr.type === 'AND') {
      if (
        (expr.left?.type === 'CONSTANT' && expr.left.value === false) ||
        (expr.right?.type === 'CONSTANT' && expr.right.value === false)
      ) {
        return { type: 'CONSTANT', value: false } // false
      }
    }
    return null
  },
  // Pattern: X ∨ true = true
  expr => {
    if (expr.type === 'OR') {
      if (
        (expr.left?.type === 'CONSTANT' && expr.left.value === true) ||
        (expr.right?.type === 'CONSTANT' && expr.right.value === true)
      ) {
        return { type: 'CONSTANT', value: true } // true
      }
    }
    return null
  },
  // Pattern: X ∨ false = X
  expr => {
    if (expr.type === 'OR') {
      if (expr.left?.type === 'CONSTANT' && expr.left.value === false && expr.right)
        return expr.right // X
      if (expr.right?.type === 'CONSTANT' && expr.right.value === false && expr.left)
        return expr.left // X
    }
    return null
  },
  // Pattern: !true = false
  expr => {
    if (expr.type === 'NOT' && expr.left?.type === 'CONSTANT' && expr.left.value === true) {
      return { type: 'CONSTANT', value: false } // false
    }
    return null
  },
  // Pattern: !false = true
  expr => {
    if (expr.type === 'NOT' && expr.left?.type === 'CONSTANT' && expr.left.value === false) {
      return { type: 'CONSTANT', value: true } // true
    }
    return null
  },
]

function applyConstantPatternsRecursive(expr: BooleanExpression): BooleanExpression {
  // 1. Recurse on children (if they exist)
  let newLeft: BooleanExpression | undefined = undefined
  let newRight: BooleanExpression | undefined = undefined
  let childrenHaveChanged = false

  // Check if 'left' property exists and is not undefined before recursing
  if ('left' in expr && expr.left) {
    const processedPotentialLeft = applyConstantPatternsRecursive(expr.left)
    if (processedPotentialLeft !== expr.left) {
      newLeft = processedPotentialLeft
      childrenHaveChanged = true
    } else {
      newLeft = expr.left // No change, use original
    }
  } else if ('left' in expr) {
    newLeft = expr.left // Property exists but is undefined (e.g. NOT node before operand assigned)
  }

  // Check if 'right' property exists and is not undefined
  if ('right' in expr && expr.right) {
    const processedPotentialRight = applyConstantPatternsRecursive(expr.right)
    if (processedPotentialRight !== expr.right) {
      newRight = processedPotentialRight
      childrenHaveChanged = true
    } else {
      newRight = expr.right // No change, use original
    }
  } else if ('right' in expr) {
    newRight = expr.right // Property exists but is undefined
  }

  // 2. Create current expression to work on: original or new if children changed
  let currentWorkingExpr = expr
  if (childrenHaveChanged) {
    // Type-safe reconstruction
    switch (expr.type) {
      case 'AND':
        if (newLeft && newRight)
          currentWorkingExpr = { type: 'AND', left: newLeft, right: newRight } as AndNode
        break
      case 'OR':
        if (newLeft && newRight)
          currentWorkingExpr = { type: 'OR', left: newLeft, right: newRight } as OrNode
        break
      case 'XOR':
        if (newLeft && newRight)
          currentWorkingExpr = { type: 'XOR', left: newLeft, right: newRight } as XorNode
        break
      case 'NAND':
        if (newLeft && newRight)
          currentWorkingExpr = { type: 'NAND', left: newLeft, right: newRight } as NandNode
        break
      case 'NOR':
        if (newLeft && newRight)
          currentWorkingExpr = { type: 'NOR', left: newLeft, right: newRight } as NorNode
        break
      case 'NOT':
        // For NOT node, only 'left' child is relevant.
        // 'newRight' would be undefined if expr was a NOT node initially.
        if (newLeft) currentWorkingExpr = { type: 'NOT', left: newLeft } as NotNode
        break
      // For VariableNode and ConstantNode, childrenHaveChanged should be false if based on .left/.right,
      // because they don't have .left/.right in the first place for the recursive calls to change them.
      // If childrenHaveChanged is true for them, it implies an issue in how newLeft/newRight was derived,
      // or the original 'expr' was not a leaf node.
      // Defaulting to original 'expr' if reconstruction is not applicable or fails.
      default:
        // This case should ideally not be hit if childrenHaveChanged is true
        // for leaf nodes, as it means an inconsistency.
        // If expr is a leaf node and childrenHaveChanged is false, currentWorkingExpr remains expr.
        break // currentWorkingExpr remains 'expr'
    }
  }

  // Apply patterns at the current node (currentWorkingExpr) until no more changes
  // currentWorkingExpr here is either the original expr (if children unchanged)
  // or a new node with (potentially) changed children.
  let nodeChangedByPatternAtThisLevel = true
  while (nodeChangedByPatternAtThisLevel) {
    nodeChangedByPatternAtThisLevel = false
    const exprBeforeThisPatternIteration = currentWorkingExpr
    for (const pattern of constantPatterns) {
      const result = pattern(currentWorkingExpr)
      if (result) {
        // Pattern applied and returned a new expression
        // Check if the result is actually different from the input to the pattern function
        // This is important because some patterns might return expr.right/expr.left which could be identical
        // if no deeper changes happened. expressionsEqual could be used here if needed for complex returns.
        // For constant patterns, the result is usually a new CONSTANT node or a direct child reference.
        // If result is strictly !== currentWorkingExpr, it means a change happened.
        if (result !== currentWorkingExpr) {
          currentWorkingExpr = result
          nodeChangedByPatternAtThisLevel = true
          break // Restart pattern matching on the modified currentWorkingExpr
        }
      }
    }
    // If no pattern in the loop changed currentWorkingExpr, then it's stable at this level.
    if (currentWorkingExpr === exprBeforeThisPatternIteration) {
      nodeChangedByPatternAtThisLevel = false
    }
  }
  // Return the final state of currentWorkingExpr. This will be:
  // - The original `expr` if no changes occurred in children or by patterns.
  // - A new object if children changed OR a pattern modified the node.
  return currentWorkingExpr
}

/**
 * Get the master rule for recursive constant simplification
 */
export function getConstantRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'Recursive Constant Simplification',
        description: 'Recursively simplifies constants (0, 1) in the expression tree.',
        formula: 'e.g., (A ∧ 1) ∨ 0 = A',
      },
      canApply: (): boolean => {
        return true // Let apply handle the details.
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        return applyConstantPatternsRecursive(expr)
      },
    },
  ]
}
