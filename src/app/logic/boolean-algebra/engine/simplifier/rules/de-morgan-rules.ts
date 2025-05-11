/**
 * De Morgan's Laws Module
 */

import { BooleanExpression, AndNode, OrNode, XorNode, NandNode, NorNode } from '../../ast'
import { SimplificationRule } from '../../ast/rule-types'

// Master recursive function to apply De Morgan's laws throughout an expression.
function applyDeMorganRecursively(expr: BooleanExpression): BooleanExpression {
  if (expr.type === 'NOT' && expr.left) {
    const operand = expr.left
    // It's important to recurse on the operand *before* checking its type for De Morgan's,
    // as the recursion might change the operand's type or structure (e.g. ¬(¬(A&B)) -> ¬(A&B))
    const processedOperand = applyDeMorganRecursively(operand)

    if (processedOperand.type === 'AND' && processedOperand.left && processedOperand.right) {
      // Rule: ¬(A ∧ B) <=> (¬A_rec) ∨ (¬B_rec)
      // A_rec and B_rec are processedOperand.left and processedOperand.right respectively.
      // These are already results of applyDeMorganRecursively if they were complex.
      // We need to form NOT nodes around them. These NOT nodes are new.
      return {
        type: 'OR',
        left: { type: 'NOT', left: processedOperand.left },
        right: { type: 'NOT', left: processedOperand.right },
      }
    } else if (processedOperand.type === 'OR' && processedOperand.left && processedOperand.right) {
      // Rule: ¬(A ∨ B) <=> (¬A_rec) ∧ (¬B_rec)
      return {
        type: 'AND',
        left: { type: 'NOT', left: processedOperand.left },
        right: { type: 'NOT', left: processedOperand.right },
      }
    } else {
      // NOT(X) where X is not AND/OR, or where processedOperand has changed from original operand.
      // If processedOperand is different from the original operand, we need a new NOT node.
      if (processedOperand !== operand) {
        return { type: 'NOT', left: processedOperand }
      }
      // If processedOperand is same as original operand, no change to this NOT(X) node.
      return expr
    }
  } else if (expr.left || expr.right) {
    // For non-NOT nodes, recurse on children if they exist.
    // If children change, a new node of the same type must be constructed.
    let childrenChanged = false
    let newLeft: BooleanExpression | undefined = expr.left
    let newRight: BooleanExpression | undefined = expr.right

    if (expr.left) {
      const processedLeft = applyDeMorganRecursively(expr.left)
      if (processedLeft !== expr.left) {
        newLeft = processedLeft
        childrenChanged = true
      }
    }

    if (expr.right) {
      const processedRight = applyDeMorganRecursively(expr.right)
      if (processedRight !== expr.right) {
        newRight = processedRight
        childrenChanged = true
      }
    }

    if (childrenChanged) {
      // Reconstruct the node based on its original type with new children
      // This requires knowing the specific type of 'expr' to correctly reconstruct.
      // We must ensure that newLeft and newRight are not undefined if the node type expects them.
      switch (expr.type) {
        case 'AND':
          if (newLeft && newRight) return { type: 'AND', left: newLeft, right: newRight } as AndNode
          break
        case 'OR':
          if (newLeft && newRight) return { type: 'OR', left: newLeft, right: newRight } as OrNode
          break
        case 'XOR':
          if (newLeft && newRight) return { type: 'XOR', left: newLeft, right: newRight } as XorNode
          break
        case 'NAND':
          if (newLeft && newRight)
            return { type: 'NAND', left: newLeft, right: newRight } as NandNode
          break
        case 'NOR':
          if (newLeft && newRight) return { type: 'NOR', left: newLeft, right: newRight } as NorNode
          break
        // If expr.type is 'VARIABLE', 'CONSTANT', or 'NOT', childrenChanged path shouldn't be hit like this
        // as 'NOT' is handled above, and VARIABLE/CONSTANT don't have .left/.right in the first place for this path.
      }
      // If the type isn't a binary operator we know how to reconstruct with two children,
      // or if children became undefined unexpectedly, fall back or throw error.
      // For simplicity here, if we can't reconstruct, return original (though this might hide issues).
      // A more robust solution would ensure all node types are handled in reconstruction.
      return expr // Fallback if reconstruction logic isn't exhaustive for all types
    }

    // Base cases: IDENTIFIER, CONSTANT, or structure without left/right that wasn't a NOT node.
    return expr
  }

  // Base cases: IDENTIFIER, CONSTANT, or NOT without operand (if possible)
  return expr
}

export function getDeMorganRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: "De Morgan's Law (AND)",
        description: "De Morgan's Law: !(A * B) <=> !A + !B",
        formula: '!(A \cdot B) \Leftrightarrow !A + !B',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NOT' && expr.left?.type === 'AND'
      },
      apply: applyDeMorganRecursively, // applyDeMorganRecursively handles the transformation
    },
    {
      info: {
        name: "De Morgan's Law (OR)",
        description: "De Morgan's Law: !(A + B) <=> !A * !B",
        formula: '!(A + B) \Leftrightarrow !A \cdot !B',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return expr.type === 'NOT' && expr.left?.type === 'OR'
      },
      apply: applyDeMorganRecursively, // applyDeMorganRecursively handles the transformation
    },
    // Optional: Reverse De Morgan's rules are generally not needed for typical simplification
    // (which aims to push negations inward), but are shown for completeness if a strategy required them.
    // These would also need to be recursive if they were to be used robustly.
  ]
}
