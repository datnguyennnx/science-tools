/**
 * AST-based Distributive Laws
 */

import { BooleanExpression } from '../../ast'
import { SimplificationRule } from '../../ast/rule-types'
import { expressionsEqual } from '../../utils'

// Optimized recursive apply function for X + XY = X (OR Absorption)
function applyAbsorptionXplusXYRecursive(expr: BooleanExpression): BooleanExpression {
  let processedLeft = expr.left
  if (expr.left) {
    processedLeft = applyAbsorptionXplusXYRecursive(expr.left)
  }

  let processedRight = expr.right
  if (expr.right) {
    processedRight = applyAbsorptionXplusXYRecursive(expr.right)
  }

  const childrenChanged = processedLeft !== expr.left || processedRight !== expr.right
  let currentExprToEvaluate = expr

  if (childrenChanged) {
    // Replace spread with type-safe reconstruction
    switch (expr.type) {
      case 'AND':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'AND', left: processedLeft, right: processedRight }
        break
      case 'OR':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'OR', left: processedLeft, right: processedRight }
        break
      case 'XOR':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'XOR', left: processedLeft, right: processedRight }
        break
      case 'NAND':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'NAND', left: processedLeft, right: processedRight }
        break
      case 'NOR':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'NOR', left: processedLeft, right: processedRight }
        break
      case 'NOT':
        if (processedLeft) currentExprToEvaluate = { type: 'NOT', left: processedLeft }
        break
      // For VARIABLE and CONSTANT, this code path shouldn't be hit
    }
  }

  // Absorption logic for X + XY = X, applied to currentExprToEvaluate
  if (
    currentExprToEvaluate.type === 'OR' &&
    currentExprToEvaluate.left &&
    currentExprToEvaluate.right
  ) {
    const X_candidate = currentExprToEvaluate.left
    const XY_candidate = currentExprToEvaluate.right
    // Case 1: X + (X*Y) or X + (Y*X)
    if (XY_candidate.type === 'AND' && XY_candidate.left && XY_candidate.right) {
      if (
        expressionsEqual(X_candidate, XY_candidate.left) ||
        expressionsEqual(X_candidate, XY_candidate.right)
      ) {
        return X_candidate // Return X (which is already processedLeft from currentExprToEvaluate)
      }
    }
    // Case 2: (X*Y) + X or (Y*X) + X --- ensure XY_candidate is the AND term
    const X_candidate_alt = currentExprToEvaluate.right // X is on the right
    const XY_candidate_alt = currentExprToEvaluate.left // Potential X*Y is on the left
    if (XY_candidate_alt.type === 'AND' && XY_candidate_alt.left && XY_candidate_alt.right) {
      if (
        expressionsEqual(X_candidate_alt, XY_candidate_alt.left) ||
        expressionsEqual(X_candidate_alt, XY_candidate_alt.right)
      ) {
        return X_candidate_alt // Return X (which is already processedRight from currentExprToEvaluate)
      }
    }
  }
  return currentExprToEvaluate
}

// Optimized recursive apply function for X * (X+Y) = X (AND Absorption)
function applyAbsorptionXmultXplusYRecursive(expr: BooleanExpression): BooleanExpression {
  let processedLeft = expr.left
  if (expr.left) {
    processedLeft = applyAbsorptionXmultXplusYRecursive(expr.left)
  }

  let processedRight = expr.right
  if (expr.right) {
    processedRight = applyAbsorptionXmultXplusYRecursive(expr.right)
  }

  const childrenChanged = processedLeft !== expr.left || processedRight !== expr.right
  let currentExprToEvaluate = expr

  if (childrenChanged) {
    // Replace spread with type-safe reconstruction
    switch (expr.type) {
      case 'AND':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'AND', left: processedLeft, right: processedRight }
        break
      case 'OR':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'OR', left: processedLeft, right: processedRight }
        break
      case 'XOR':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'XOR', left: processedLeft, right: processedRight }
        break
      case 'NAND':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'NAND', left: processedLeft, right: processedRight }
        break
      case 'NOR':
        if (processedLeft && processedRight)
          currentExprToEvaluate = { type: 'NOR', left: processedLeft, right: processedRight }
        break
      case 'NOT':
        if (processedLeft) currentExprToEvaluate = { type: 'NOT', left: processedLeft }
        break
      // For VARIABLE and CONSTANT, this code path shouldn't be hit
    }
  }

  // Absorption logic for X * (X+Y) = X, applied to currentExprToEvaluate
  if (
    currentExprToEvaluate.type === 'AND' &&
    currentExprToEvaluate.left &&
    currentExprToEvaluate.right
  ) {
    const X_candidate = currentExprToEvaluate.left
    const XplusY_candidate = currentExprToEvaluate.right
    // Case 1: X * (X+Y) or X * (Y+X)
    if (XplusY_candidate.type === 'OR' && XplusY_candidate.left && XplusY_candidate.right) {
      if (
        expressionsEqual(X_candidate, XplusY_candidate.left) ||
        expressionsEqual(X_candidate, XplusY_candidate.right)
      ) {
        return X_candidate // Return X
      }
    }
    // Case 2: (X+Y) * X or (Y+X) * X
    const X_candidate_alt = currentExprToEvaluate.right
    const XplusY_candidate_alt = currentExprToEvaluate.left
    if (
      XplusY_candidate_alt.type === 'OR' &&
      XplusY_candidate_alt.left &&
      XplusY_candidate_alt.right
    ) {
      if (
        expressionsEqual(X_candidate_alt, XplusY_candidate_alt.left) ||
        expressionsEqual(X_candidate_alt, XplusY_candidate_alt.right)
      ) {
        return X_candidate_alt // Return X
      }
    }
  }
  return currentExprToEvaluate
}

export type DistributiveRuleType = 'all' | 'distributeOnly' | 'factorizeOnly' | 'absorptionOnly'

export function getDistributiveRules(type: DistributiveRuleType = 'all'): SimplificationRule[] {
  const distributionRules: SimplificationRule[] = [
    {
      info: {
        name: 'Distribute AND over OR (Left)',
        description: 'X * (Y + Z) => (X * Y) + (X * Z)',
        formula: 'X \\land (Y \\lor Z) = (X \\land Y) \\lor (X \\land Z)',
        ruleType: 'distribution',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return Boolean(
          expr.type === 'AND' &&
            expr.left &&
            expr.right &&
            expr.right.type === 'OR' &&
            expr.right.left &&
            expr.right.right
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Guard based on canApply logic
        if (
          !(
            expr.type === 'AND' &&
            expr.left &&
            expr.right &&
            expr.right.type === 'OR' &&
            expr.right.left &&
            expr.right.right
          )
        ) {
          return expr
        }

        const X_node = expr.left!
        const Y_node = expr.right!.left!
        const Z_node = expr.right!.right!

        // Construct new nodes, reusing references to X_node, Y_node, Z_node
        const XY_expr: BooleanExpression = { type: 'AND', left: X_node, right: Y_node }
        // For XZ_expr, if X_node is a complex subtree, it's reused by reference, not cloned.
        const XZ_expr: BooleanExpression = { type: 'AND', left: X_node, right: Z_node }
        return { type: 'OR', left: XY_expr, right: XZ_expr }
      },
    },
    {
      info: {
        name: 'Distribute AND over OR (Right)',
        description: '(X + Y) * Z => (X * Z) + (Y * Z)',
        formula: '(X \\lor Y) \\land Z = (X \\land Z) \\lor (Y \\land Z)',
        ruleType: 'distribution',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return Boolean(
          expr.type === 'AND' &&
            expr.right &&
            expr.left &&
            expr.left.type === 'OR' &&
            expr.left.left &&
            expr.left.right
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Guard based on canApply logic
        if (
          !(
            expr.type === 'AND' &&
            expr.right &&
            expr.left &&
            expr.left.type === 'OR' &&
            expr.left.left &&
            expr.left.right
          )
        ) {
          return expr
        }
        const X_node = expr.left!.left!
        const Y_node = expr.left!.right!
        const Z_node = expr.right!

        const XZ_expr: BooleanExpression = { type: 'AND', left: X_node, right: Z_node }
        const YZ_expr: BooleanExpression = { type: 'AND', left: Y_node, right: Z_node }
        return { type: 'OR', left: XZ_expr, right: YZ_expr }
      },
    },
    {
      info: {
        name: 'Distribute OR over AND (Left)',
        description: 'X + (Y * Z) => (X + Y) * (X + Z)',
        formula: 'X \\lor (Y \\land Z) = (X \\lor Y) \\land (X \\lor Z)',
        ruleType: 'distribution',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return Boolean(
          expr.type === 'OR' &&
            expr.left &&
            expr.right &&
            expr.right.type === 'AND' &&
            expr.right.left &&
            expr.right.right
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // GUARD START
        if (
          !(
            expr.type === 'OR' &&
            expr.left &&
            expr.right &&
            expr.right.type === 'AND' &&
            expr.right.left &&
            expr.right.right
          )
        ) {
          return expr
        }
        // GUARD END
        const X_node = expr.left!
        const Y_node = expr.right!.left!
        const Z_node = expr.right!.right!

        const XplusY_expr: BooleanExpression = { type: 'OR', left: X_node, right: Y_node }
        const XplusZ_expr: BooleanExpression = { type: 'OR', left: X_node, right: Z_node }
        return { type: 'AND', left: XplusY_expr, right: XplusZ_expr }
      },
    },
    {
      info: {
        name: 'Distribute OR over AND (Right)',
        description: '(X * Y) + Z => (X + Z) * (Y + Z)',
        formula: '(X \\land Y) \\lor Z = (X \\lor Z) \\land (Y \\lor Z)',
        ruleType: 'distribution',
      },
      canApply: (expr: BooleanExpression): boolean => {
        return Boolean(
          expr.type === 'OR' &&
            expr.right &&
            expr.left &&
            expr.left.type === 'AND' &&
            expr.left.left &&
            expr.left.right
        )
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Guard based on canApply logic
        if (
          !(
            expr.type === 'OR' &&
            expr.right &&
            expr.left &&
            expr.left.type === 'AND' &&
            expr.left.left &&
            expr.left.right
          )
        ) {
          return expr
        }
        const X_node = expr.left!.left!
        const Y_node = expr.left!.right!
        const Z_node = expr.right!

        const XplusZ_expr: BooleanExpression = { type: 'OR', left: X_node, right: Z_node }
        const YplusZ_expr: BooleanExpression = { type: 'OR', left: Y_node, right: Z_node }
        return { type: 'AND', left: XplusZ_expr, right: YplusZ_expr }
      },
    },
  ]

  const factorizationRules: SimplificationRule[] = [
    {
      info: {
        name: 'Factorize AND from OR (Common Left)',
        description: 'Factorize AND from OR (Common Left): (X*Y) + (X*Z) => X*(Y+Z)',
        formula: '(X \\cdot Y) + (X \\cdot Z) \\Leftrightarrow X \\cdot (Y+Z)',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR') return false
        if (expr.left?.type !== 'AND' || expr.right?.type !== 'AND') return false
        // Check for common left term X: (X*Y) + (X*Z)
        return expressionsEqual(expr.left.left!, expr.right.left!)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Guard clause: if the pattern for factorization isn't met (as per canApply logic), return original expression.
        if (
          !(
            expr.type === 'OR' &&
            expr.left?.type === 'AND' &&
            expr.right?.type === 'AND' &&
            expr.left.left && // Ensure sub-operands exist for the expressionsEqual check
            expr.right.left &&
            expressionsEqual(expr.left.left, expr.right.left)
          )
        ) {
          return expr
        }

        const X_node = expr.left!.left!
        const Y_node = expr.left!.right!
        const Z_node = expr.right!.right!
        return {
          type: 'AND',
          left: X_node,
          right: { type: 'OR', left: Y_node, right: Z_node },
        }
      },
    },
    // ... other factorization rules also need similar review of X,Y,Z assignments from expr ...
    // For brevity, I will assume they will be corrected similarly if this pattern of using direct references is adopted.
    // The key is to map the pattern (e.g. (Y*X) + (Z*X)) to the AST structure (expr.left.left etc.) correctly.
    {
      info: {
        name: 'Factorize AND from OR (Common Right)',
        description: '(Y * X) + (Z * X) => (Y + Z) * X',
        formula: '(Y \\land X) \\lor (Z \\land X) = (Y \\lor Z) \\land X',
        ruleType: 'factorization',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR') return false
        const leftOr = expr.left
        const rightOr = expr.right
        if (!leftOr || leftOr.type !== 'AND' || !rightOr || rightOr.type !== 'AND') return false
        if (!leftOr.left || !leftOr.right || !rightOr.left || !rightOr.right) return false
        return expressionsEqual(leftOr.right, rightOr.right)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Guard based on canApply logic
        if (
          !(
            expr.type === 'OR' &&
            expr.left &&
            expr.left.type === 'AND' &&
            expr.left.left && // Ensure sub-operands exist
            expr.left.right &&
            expr.right &&
            expr.right.type === 'AND' &&
            expr.right.left && // Ensure sub-operands exist
            expr.right.right &&
            expressionsEqual(expr.left.right, expr.right.right) // Match canApply
          )
        ) {
          return expr
        }

        // (Y*X) + (Z*X). Common term X is leftOr.right and rightOr.right.
        const Y_node = expr.left!.left!
        const X_node = expr.left!.right! // Also expr.right!.right!
        const Z_node = expr.right!.left!
        return {
          type: 'AND',
          left: { type: 'OR', left: Y_node, right: Z_node },
          right: X_node,
        }
      },
    },
    {
      info: {
        name: 'Factorize AND from OR (Common Mixed 1)',
        description: '(X*Y) + (Z*X) => X*(Y+Z)',
        formula: '(X \\land Y) \\lor (Z \\land X) = X \\land (Y \\lor Z)',
        ruleType: 'factorization',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR') return false
        const leftOr = expr.left
        const rightOr = expr.right
        if (!leftOr || leftOr.type !== 'AND' || !rightOr || rightOr.type !== 'AND') return false
        if (!leftOr.left || !leftOr.right || !rightOr.left || !rightOr.right) return false
        return expressionsEqual(leftOr.left, rightOr.right) // X is leftOr.left and rightOr.right
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Guard based on canApply logic
        if (
          !(
            expr.type === 'OR' &&
            expr.left &&
            expr.left.type === 'AND' &&
            expr.left.left &&
            expr.left.right &&
            expr.right &&
            expr.right.type === 'AND' &&
            expr.right.left &&
            expr.right.right &&
            expressionsEqual(expr.left.left, expr.right.right)
          )
        ) {
          return expr
        }

        // (X*Y) + (Z*X). X = leftOr.left = rightOr.right.
        const X_node = expr.left!.left!
        const Y_node = expr.left!.right!
        const Z_node = expr.right!.left!
        return {
          type: 'AND',
          left: X_node,
          right: { type: 'OR', left: Y_node, right: Z_node },
        }
      },
    },
    {
      info: {
        name: 'Factorize AND from OR (Common Mixed 2)',
        description: '(Y*X) + (X*Z) => (Y+Z)*X',
        formula: '(Y \\land X) \\lor (X \\land Z) = (Y \\lor Z) \\land X',
        ruleType: 'factorization',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'OR') return false
        const leftOr = expr.left
        const rightOr = expr.right
        if (!leftOr || leftOr.type !== 'AND' || !rightOr || rightOr.type !== 'AND') return false
        if (!leftOr.left || !leftOr.right || !rightOr.left || !rightOr.right) return false
        return expressionsEqual(leftOr.right, rightOr.left) // X is leftOr.right and rightOr.left
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Guard based on canApply logic
        if (
          !(
            expr.type === 'OR' &&
            expr.left &&
            expr.left.type === 'AND' &&
            expr.left.left &&
            expr.left.right &&
            expr.right &&
            expr.right.type === 'AND' &&
            expr.right.left &&
            expr.right.right &&
            expressionsEqual(expr.left.right, expr.right.left)
          )
        ) {
          return expr
        }

        // (Y*X) + (X*Z). X = leftOr.right = rightOr.left.
        const Y_node = expr.left!.left!
        const X_node = expr.left!.right!
        const Z_node = expr.right!.right!
        return {
          type: 'AND',
          left: { type: 'OR', left: Y_node, right: Z_node },
          right: X_node,
        }
      },
    },
    {
      info: {
        name: 'Factorize OR from AND (Common Left in ORs)',
        description: '(X + Y) * (X + Z) => X + (Y * Z)',
        formula: '(X \\lor Y) \\land (X \\lor Z) = X \\lor (Y \\land Z)',
        ruleType: 'factorization',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'AND') return false
        const leftAnd = expr.left
        const rightAnd = expr.right
        if (!leftAnd || leftAnd.type !== 'OR' || !rightAnd || rightAnd.type !== 'OR') return false
        if (!leftAnd.left || !leftAnd.right || !rightAnd.left || !rightAnd.right) return false
        return expressionsEqual(leftAnd.left, rightAnd.left)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Guard based on canApply logic
        if (
          !(
            expr.type === 'AND' &&
            expr.left &&
            expr.left.type === 'OR' &&
            expr.left.left &&
            expr.left.right &&
            expr.right &&
            expr.right.type === 'OR' &&
            expr.right.left &&
            expr.right.right &&
            expressionsEqual(expr.left.left, expr.right.left)
          )
        ) {
          return expr
        }

        // (X+Y) * (X+Z). X = leftAnd.left = rightAnd.left
        const X_node = expr.left!.left!
        const Y_node = expr.left!.right!
        const Z_node = expr.right!.right!
        return { type: 'OR', left: X_node, right: { type: 'AND', left: Y_node, right: Z_node } }
      },
    },
    {
      info: {
        name: 'Factorize OR from AND (Common Right in ORs)',
        description: '(Y + X) * (Z + X) => (Y * Z) + X',
        formula: '(Y \\lor X) \\land (Z \\lor X) = (Y \\land Z) \\lor X',
        ruleType: 'factorization',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'AND') return false
        const leftAnd = expr.left
        const rightAnd = expr.right
        if (!leftAnd || leftAnd.type !== 'OR' || !rightAnd || rightAnd.type !== 'OR') return false
        if (!leftAnd.left || !leftAnd.right || !rightAnd.left || !rightAnd.right) return false
        return expressionsEqual(leftAnd.right, rightAnd.right)
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Guard based on canApply logic
        if (
          !(
            expr.type === 'AND' &&
            expr.left &&
            expr.left.type === 'OR' &&
            expr.left.left &&
            expr.left.right &&
            expr.right &&
            expr.right.type === 'OR' &&
            expr.right.left &&
            expr.right.right &&
            expressionsEqual(expr.left.right, expr.right.right)
          )
        ) {
          return expr
        }

        // (Y+X) * (Z+X). X = leftAnd.right = rightAnd.right
        const Y_node = expr.left!.left!
        const X_node = expr.left!.right!
        const Z_node = expr.right!.left!
        return { type: 'OR', left: X_node, right: { type: 'AND', left: Y_node, right: Z_node } }
        // Original: return { type: 'OR', left: X, right: termYZ_mult } or { type: 'OR', left: termYZ_mult, right: X }
        // To match X+(Y*Z) for consistency.
      },
    },
    {
      info: {
        name: 'Factorize OR from AND (Common Mixed 1: X+Y and Z+X)',
        description: '(X + Y) * (Z + X) => X + (Y * Z)',
        formula: '(X \\lor Y) \\land (Z \\lor X) = X \\lor (Y \\land Z)',
        ruleType: 'factorization',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'AND') return false
        const leftAnd = expr.left
        const rightAnd = expr.right
        if (!leftAnd || leftAnd.type !== 'OR' || !rightAnd || rightAnd.type !== 'OR') return false
        if (!leftAnd.left || !leftAnd.right || !rightAnd.left || !rightAnd.right) return false
        return expressionsEqual(leftAnd.left, rightAnd.right) // X is leftAnd.left and rightAnd.right
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Guard based on canApply logic
        if (
          !(
            expr.type === 'AND' &&
            expr.left &&
            expr.left.type === 'OR' &&
            expr.left.left &&
            expr.left.right &&
            expr.right &&
            expr.right.type === 'OR' &&
            expr.right.left &&
            expr.right.right &&
            expressionsEqual(expr.left.left, expr.right.right)
          )
        ) {
          return expr
        }

        // (X+Y) * (Z+X). X = leftAnd.left = rightAnd.right
        const X_node = expr.left!.left!
        const Y_node = expr.left!.right!
        const Z_node = expr.right!.left!
        return { type: 'OR', left: X_node, right: { type: 'AND', left: Y_node, right: Z_node } }
      },
    },
    {
      info: {
        name: 'Factorize OR from AND (Common Mixed 2: Y+X and X+Z)',
        description: '(Y + X) * (X + Z) => (Y * Z) + X',
        formula: '(Y \\lor X) \\land (X \\lor Z) = (Y \\land Z) \\lor X',
        ruleType: 'factorization',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type !== 'AND') return false
        const leftAnd = expr.left
        const rightAnd = expr.right
        if (!leftAnd || leftAnd.type !== 'OR' || !rightAnd || rightAnd.type !== 'OR') return false
        if (!leftAnd.left || !leftAnd.right || !rightAnd.left || !rightAnd.right) return false
        return expressionsEqual(leftAnd.right, rightAnd.left) // X is leftAnd.right and rightAnd.left
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Guard based on canApply logic
        if (
          !(
            expr.type === 'AND' &&
            expr.left &&
            expr.left.type === 'OR' &&
            expr.left.left &&
            expr.left.right &&
            expr.right &&
            expr.right.type === 'OR' &&
            expr.right.left &&
            expr.right.right &&
            expressionsEqual(expr.left.right, expr.right.left)
          )
        ) {
          return expr
        }

        // (Y+X) * (X+Z). X = leftAnd.right = rightAnd.left
        const Y_node = expr.left!.left!
        const X_node = expr.left!.right!
        const Z_node = expr.right!.right!
        return { type: 'OR', left: X_node, right: { type: 'AND', left: Y_node, right: Z_node } }
      },
    },
  ]

  const absorptionRules: SimplificationRule[] = [
    {
      info: {
        name: 'Absorption Law (X + XY = X) (Recursive)',
        description: 'X + (X * Y) => X or X + (Y * X) => X (applied recursively)',
        formula: 'X \\lor (X \\land Y) = X',
        ruleType: 'absorption',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type === 'OR') return true
        if (expr.left || expr.right) return true
        return false
      },
      apply: applyAbsorptionXplusXYRecursive,
    },
    {
      info: {
        name: 'Absorption Law (X * (X+Y) = X) (Recursive)',
        description: 'X * (X + Y) => X or X * (Y + X) => X (applied recursively)',
        formula: 'X \\land (X \\lor Y) = X',
        ruleType: 'absorption',
      },
      canApply: (expr: BooleanExpression): boolean => {
        if (expr.type === 'AND') return true
        if (expr.left || expr.right) return true
        return false
      },
      apply: applyAbsorptionXmultXplusYRecursive,
    },
  ]

  // Determine which rules to return based on the 'type' parameter
  if (type === 'distributeOnly') {
    return distributionRules
  }
  if (type === 'factorizeOnly') {
    return factorizationRules
  }
  if (type === 'absorptionOnly') {
    return absorptionRules
  }
  // Default: 'all' will combine them
  // Make sure not to duplicate if a rule type covers multiple categories implicitly
  // For now, a simple concatenation, assuming distinct rule sets per category if filtered.
  return [...distributionRules, ...factorizationRules, ...absorptionRules]
}
