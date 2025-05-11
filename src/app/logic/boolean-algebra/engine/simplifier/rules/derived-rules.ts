/**
 * Derived Operation Rules Module
 *
 * This module contains rules for derived Boolean operations such as XOR, XNOR, NAND, and NOR.
 * It includes rules for simplifying thes operations based on identities, constants,
 * and their relationships with fundamental AND, OR, NOT operations.
 */

import { BooleanExpression, NotNode, NandNode, AndNode } from '../../ast'
import { SimplificationRule } from '../../ast/rule-types'
import { expressionsEqual } from '../../utils'

// Generic helper to create a recursive canApply function for a specific internal check
function createRecursiveCanApply(
  internalChecker: (expr: BooleanExpression) => boolean
): (expr: BooleanExpression | undefined) => boolean {
  return (expr: BooleanExpression | undefined): boolean => {
    if (!expr) return false
    if (internalChecker(expr)) {
      return true
    }
    if (expr.left && createRecursiveCanApply(internalChecker)(expr.left)) return true
    if (expr.right && createRecursiveCanApply(internalChecker)(expr.right)) return true
    return false
  }
}

// Helper function to create a recursive apply function for simple rules
function createRecursiveRuleApply(
  ruleLogic: (expr: BooleanExpression) => BooleanExpression, // The original apply logic for the current node
  canApplyLogic: (expr: BooleanExpression) => boolean // The original canApply logic for the current node
): (originalExpr: BooleanExpression) => BooleanExpression {
  const recursiveApplyFunc = (exprInput: BooleanExpression): BooleanExpression => {
    let childrenChanged = false
    let processedLeft = exprInput.left
    if (exprInput.left) {
      const resultLeft = recursiveApplyFunc(exprInput.left)
      if (resultLeft !== exprInput.left) {
        processedLeft = resultLeft
        childrenChanged = true
      }
    }

    let processedRight = exprInput.right
    if (exprInput.right && ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'].includes(exprInput.type)) {
      const resultRight = recursiveApplyFunc(exprInput.right)
      if (resultRight !== exprInput.right) {
        processedRight = resultRight
        childrenChanged = true
      }
    }

    let nodeAfterChildProcessing = exprInput
    if (childrenChanged) {
      if (exprInput.type === 'NOT') {
        nodeAfterChildProcessing = { type: 'NOT', left: processedLeft } as NotNode
      } else if (['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'].includes(exprInput.type)) {
        if (processedLeft && processedRight) {
          nodeAfterChildProcessing = {
            type: exprInput.type,
            left: processedLeft,
            right: processedRight,
          } as BooleanExpression
        } else {
          nodeAfterChildProcessing = exprInput
        }
      }
    }

    if (canApplyLogic(nodeAfterChildProcessing)) {
      const resultFromRuleLogic = ruleLogic(nodeAfterChildProcessing)
      return resultFromRuleLogic
    }

    return nodeAfterChildProcessing
  }
  return recursiveApplyFunc
}

/**
 * Get rules for simplifying XOR operations
 */
export function getXORRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'XOR Identity',
        description: 'A ^ 0 = A (or 0 ^ A = A)',
        formula: 'A \\oplus 0 = A',
      },
      canApply: canApplyXorIdentityForRule,
      apply: createRecursiveRuleApply(applyXorIdentity, canApplyXorIdentityInternal),
    },
    {
      info: {
        name: 'XOR with True',
        description: 'A ^ 1 = !A (or 1 ^ A = !A)',
        formula: 'A \\oplus 1 = \\lnot A',
      },
      canApply: canApplyXorWithTrueForRule,
      apply: createRecursiveRuleApply(applyXorWithTrue, canApplyXorWithTrueInternal),
    },
    {
      info: {
        name: 'XOR Self-Cancellation',
        description: 'A ^ A = 0',
        formula: 'A \\oplus A = 0',
      },
      canApply: canApplyXorSelfCancellationForRule,
      apply: createRecursiveRuleApply(
        applyXorSelfCancellation,
        canApplyXorSelfCancellationInternal
      ),
    },
    {
      info: {
        name: 'XOR with Complement',
        description: 'A ^ !A = 1 (or !A ^ A = 1)',
        formula: 'A \\oplus \\lnot A = 1',
      },
      canApply: canApplyXorWithComplementForRule,
      apply: createRecursiveRuleApply(applyXorWithComplement, canApplyXorWithComplementInternal),
    },
  ]
}

/**
 * Get rules for simplifying NAND operations
 */
export function getNANDRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'NAND with False',
        description: 'A @ 0 = 1 (or 0 @ A = 1)',
        formula: 'A \\uparrow 0 = 1',
      },
      canApply: canApplyNandWithFalseForRule,
      apply: createRecursiveRuleApply(applyNandWithFalse, canApplyNandWithFalseInternal),
    },
    {
      info: {
        name: 'NAND with True',
        description: 'A @ 1 = !A (or 1 @ A = !A)',
        formula: 'A \\uparrow 1 = \\lnot A',
      },
      canApply: canApplyNandWithTrueForRule,
      apply: createRecursiveRuleApply(applyNandWithTrue, canApplyNandWithTrueInternal),
    },
    {
      info: {
        name: 'NAND Self-Negation',
        description: 'A @ A = !A',
        formula: 'A \\uparrow A = \\lnot A',
      },
      canApply: canApplyNandSelfNegationForRule,
      apply: createRecursiveRuleApply(applyNandSelfNegation, canApplyNandSelfNegationInternal),
    },
    {
      info: {
        name: 'Double NAND',
        description: '!(A @ B) = A & B',
        formula: '\\lnot(A \\uparrow B) = A \\land B',
      },
      canApply: canApplyDoubleNand,
      apply: createRecursiveRuleApply(applyDoubleNand, canApplyDoubleNand),
    },
  ]
}

/**
 * Get rules for simplifying NOR operations
 */
export function getNORRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'NOR with False',
        description: 'A # 0 = !A (or 0 # A = !A)',
        formula: 'A \\downarrow 0 = \\lnot A',
      },
      canApply: canApplyNorWithFalseForRule,
      apply: createRecursiveRuleApply(applyNorWithFalse, canApplyNorWithFalseInternal),
    },
    {
      info: {
        name: 'NOR with True',
        description: 'A # 1 = 0 (or 1 # A = 0)',
        formula: 'A \\downarrow 1 = 0',
      },
      canApply: canApplyNorWithTrueForRule,
      apply: createRecursiveRuleApply(applyNorWithTrue, canApplyNorWithTrueInternal),
    },
    {
      info: {
        name: 'NOR Self-Negation',
        description: 'A NOR A = !A (Self-Negation for NOR)',
        formula: 'A \\downarrow A = \\lnot A',
      },
      canApply: canApplyNorSelfNegationForRule,
      apply: createRecursiveRuleApply(applyNorSelfNegation, canApplyNorSelfNegationInternal),
    },
    {
      info: {
        name: 'Double NOR',
        description: '!(A # B) = A + B',
        formula: '\\lnot(A \\downarrow B) = A \\lor B',
      },
      canApply: canApplyDoubleNor,
      apply: createRecursiveRuleApply(applyDoubleNor, canApplyDoubleNor),
    },
  ]
}

/**
 * Get rules for simplifying XNOR operations
 */
export function getXNORRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'XNOR Identity',
        description: 'A <=> 1 = A (or 1 <=> A = A)',
        formula: 'A \\leftrightarrow 1 = A',
      },
      canApply: canApplyXnorIdentityForRule,
      apply: createRecursiveRuleApply(applyXnorIdentity, canApplyXnorIdentityInternal),
    },
    {
      info: {
        name: 'XNOR with False',
        description: 'A <=> 0 = !A (or 0 <=> A = !A)',
        formula: 'A \\leftrightarrow 0 = \\lnot A',
      },
      canApply: canApplyXnorWithFalseForRule,
      apply: createRecursiveRuleApply(applyXnorWithFalse, canApplyXnorWithFalseInternal),
    },
    {
      info: {
        name: 'XNOR Self-Equivalence',
        description: 'A <=> A = 1',
        formula: 'A \\leftrightarrow A = 1',
      },
      canApply: canApplyXnorSelfEquivalenceForRule,
      apply: createRecursiveRuleApply(
        applyXnorSelfEquivalence,
        canApplyXnorSelfEquivalenceInternal
      ),
    },
    {
      info: {
        name: 'XNOR with Complement',
        description: 'A <=> !A = 0 (or !A <=> A = 0)',
        formula: 'A \\leftrightarrow \\lnot A = 0',
      },
      canApply: canApplyXnorWithComplementForRule,
      apply: createRecursiveRuleApply(applyXnorWithComplement, canApplyXnorWithComplementInternal),
    },
  ]
}

/**
 * Get all derived operation rules including expansions
 */
export function getDerivedRules(): SimplificationRule[] {
  return [
    ...getXORRules(),
    ...getNANDRules(),
    ...getNORRules(),
    ...getXNORRules(),
    ...getExpansionRules(), // Add expansion rules here
  ]
}

// --- XOR Rule Helpers ---
const applyXorIdentity = (expr: BooleanExpression): BooleanExpression => {
  return expr.left! // A ^ 0 = A (if 0 is right) or 0 ^ A = A (if 0 is left)
}
const canApplyXorIdentityInternal = (expr: BooleanExpression): boolean => {
  return (
    expr.type === 'XOR' &&
    ((expr.left?.type === 'VARIABLE' &&
      expr.right?.type === 'CONSTANT' &&
      expr.right.value === false) ||
      (expr.right?.type === 'VARIABLE' &&
        expr.left?.type === 'CONSTANT' &&
        expr.left.value === false))
  )
}
const canApplyXorIdentityForRule = createRecursiveCanApply(canApplyXorIdentityInternal)

const applyXorWithTrue = (expr: BooleanExpression): BooleanExpression => {
  const termToNegate = expr.left?.type === 'CONSTANT' ? expr.right! : expr.left!
  return { type: 'NOT', left: termToNegate } as NotNode // A ^ 1 = !A
}
const canApplyXorWithTrueInternal = (expr: BooleanExpression): boolean => {
  return (
    expr.type === 'XOR' &&
    ((expr.left?.type === 'VARIABLE' &&
      expr.right?.type === 'CONSTANT' &&
      expr.right.value === true) ||
      (expr.right?.type === 'VARIABLE' &&
        expr.left?.type === 'CONSTANT' &&
        expr.left.value === true))
  )
}
const canApplyXorWithTrueForRule = createRecursiveCanApply(canApplyXorWithTrueInternal)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const applyXorSelfCancellation = (_expr: BooleanExpression): BooleanExpression => ({
  type: 'CONSTANT',
  value: false,
})
const canApplyXorSelfCancellationInternal = (expr: BooleanExpression): boolean => {
  return (
    expr.type === 'XOR' &&
    expr.left !== undefined &&
    expr.right !== undefined &&
    expressionsEqual(expr.left, expr.right)
  )
}
const canApplyXorSelfCancellationForRule = createRecursiveCanApply(
  canApplyXorSelfCancellationInternal
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const applyXorWithComplement = (_expr: BooleanExpression): BooleanExpression => ({
  type: 'CONSTANT',
  value: true,
})
const canApplyXorWithComplementInternal = (expr: BooleanExpression): boolean => {
  if (expr.type !== 'XOR' || !expr.left || !expr.right) return false
  return (
    (expr.left.type === 'NOT' && expr.left.left && expressionsEqual(expr.left.left, expr.right)) ||
    (expr.right.type === 'NOT' && expr.right.left && expressionsEqual(expr.right.left, expr.left))
  )
}
const canApplyXorWithComplementForRule = createRecursiveCanApply(canApplyXorWithComplementInternal)

// --- NAND Rule Helpers ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const applyNandWithFalse = (_expr: BooleanExpression): BooleanExpression => ({
  type: 'CONSTANT',
  value: true,
})
const canApplyNandWithFalseInternal = (expr: BooleanExpression): boolean => {
  return (
    expr.type === 'NAND' &&
    ((expr.left?.type !== 'CONSTANT' &&
      expr.right?.type === 'CONSTANT' &&
      expr.right.value === false) ||
      (expr.right?.type !== 'CONSTANT' &&
        expr.left?.type === 'CONSTANT' &&
        expr.left.value === false))
  )
}
const canApplyNandWithFalseForRule = createRecursiveCanApply(canApplyNandWithFalseInternal)

const applyNandWithTrue = (expr: BooleanExpression): BooleanExpression => {
  const termToNegate = expr.left?.type === 'CONSTANT' ? expr.right! : expr.left!
  return { type: 'NOT', left: termToNegate } as NotNode // A @ 1 = !A
}
const canApplyNandWithTrueInternal = (expr: BooleanExpression): boolean => {
  return (
    expr.type === 'NAND' &&
    ((expr.left?.type !== 'CONSTANT' &&
      expr.right?.type === 'CONSTANT' &&
      expr.right.value === true) ||
      (expr.right?.type !== 'CONSTANT' &&
        expr.left?.type === 'CONSTANT' &&
        expr.left.value === true))
  )
}
const canApplyNandWithTrueForRule = createRecursiveCanApply(canApplyNandWithTrueInternal)

const applyNandSelfNegation = (expr: BooleanExpression): BooleanExpression => {
  return { type: 'NOT', left: expr.left } as NotNode // A @ A = !A
}
const canApplyNandSelfNegationInternal = (expr: BooleanExpression): boolean => {
  return (
    expr.type === 'NAND' &&
    expr.left !== undefined &&
    expr.right !== undefined &&
    expressionsEqual(expr.left, expr.right)
  )
}
const canApplyNandSelfNegationForRule = createRecursiveCanApply(canApplyNandSelfNegationInternal)

const applyDoubleNand = (expr: BooleanExpression): BooleanExpression => {
  const nandNode = expr.left as NandNode
  return { type: 'AND', left: nandNode.left, right: nandNode.right } as AndNode
}
const canApplyDoubleNand = (expr: BooleanExpression): boolean => {
  return expr.type === 'NOT' && expr.left?.type === 'NAND'
}

// --- NOR Rule Helpers ---
const applyNorWithFalse = (expr: BooleanExpression): BooleanExpression => {
  const termToNegate = expr.left?.type === 'CONSTANT' ? expr.right! : expr.left!
  return { type: 'NOT', left: termToNegate } as NotNode // A # 0 = !A
}
const canApplyNorWithFalseInternal = (expr: BooleanExpression): boolean => {
  return (
    expr.type === 'NOR' &&
    ((expr.left?.type !== 'CONSTANT' &&
      expr.right?.type === 'CONSTANT' &&
      expr.right.value === false) ||
      (expr.right?.type !== 'CONSTANT' &&
        expr.left?.type === 'CONSTANT' &&
        expr.left.value === false))
  )
}
const canApplyNorWithFalseForRule = createRecursiveCanApply(canApplyNorWithFalseInternal)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const applyNorWithTrue = (_expr: BooleanExpression): BooleanExpression => ({
  type: 'CONSTANT',
  value: false,
})
const canApplyNorWithTrueInternal = (expr: BooleanExpression): boolean => {
  return (
    expr.type === 'NOR' &&
    ((expr.left?.type !== 'CONSTANT' &&
      expr.right?.type === 'CONSTANT' &&
      expr.right.value === true) ||
      (expr.right?.type !== 'CONSTANT' &&
        expr.left?.type === 'CONSTANT' &&
        expr.left.value === true))
  )
}
const canApplyNorWithTrueForRule = createRecursiveCanApply(canApplyNorWithTrueInternal)

// Internal check for the exact pattern X # X at the current node
const canApplyNorSelfNegationInternal = (expr: BooleanExpression): boolean => {
  return (
    expr.type === 'NOR' &&
    expr.left !== undefined &&
    expr.right !== undefined &&
    expressionsEqual(expr.left, expr.right)
  )
}

// Main canApply for the rule: checks if the X # X pattern exists anywhere in the expression
const canApplyNorSelfNegationForRule = (expr: BooleanExpression | undefined): boolean => {
  if (!expr) return false
  if (canApplyNorSelfNegationInternal(expr)) {
    return true
  }
  if (expr.left && canApplyNorSelfNegationForRule(expr.left)) return true
  if (expr.right && canApplyNorSelfNegationForRule(expr.right)) return true
  return false
}

const applyNorSelfNegation = (expr: BooleanExpression): BooleanExpression => {
  return { type: 'NOT', left: expr.left } as NotNode // A # A = !A
}

const applyDoubleNor = (expr: BooleanExpression): BooleanExpression => {
  const norExpr = expr.left! // NOR node
  return { type: 'OR', left: norExpr.left!, right: norExpr.right! }
}
const canApplyDoubleNor = (expr: BooleanExpression): boolean => {
  return Boolean(
    expr.type === 'NOT' && expr.left?.type === 'NOR' && expr.left.left && expr.left.right
  )
}

// --- XNOR Rule Helpers ---
const applyXnorIdentity = (expr: BooleanExpression): BooleanExpression => {
  return expr.left?.type === 'CONSTANT' ? expr.right! : expr.left! // A <=> 1 = A
}
const canApplyXnorIdentityInternal = (expr: BooleanExpression): boolean => {
  return (
    expr.type === 'XNOR' &&
    ((expr.left?.type !== 'CONSTANT' &&
      expr.right?.type === 'CONSTANT' &&
      expr.right.value === true) ||
      (expr.right?.type !== 'CONSTANT' &&
        expr.left?.type === 'CONSTANT' &&
        expr.left.value === true))
  )
}
const canApplyXnorIdentityForRule = createRecursiveCanApply(canApplyXnorIdentityInternal)

const applyXnorWithFalse = (expr: BooleanExpression): BooleanExpression => {
  const termToNegate = expr.left?.type === 'CONSTANT' ? expr.right! : expr.left!
  return { type: 'NOT', left: termToNegate } as NotNode // A <=> 0 = !A
}
const canApplyXnorWithFalseInternal = (expr: BooleanExpression): boolean => {
  return (
    expr.type === 'XNOR' &&
    ((expr.left?.type !== 'CONSTANT' &&
      expr.right?.type === 'CONSTANT' &&
      expr.right.value === false) ||
      (expr.right?.type !== 'CONSTANT' &&
        expr.left?.type === 'CONSTANT' &&
        expr.left.value === false))
  )
}
const canApplyXnorWithFalseForRule = createRecursiveCanApply(canApplyXnorWithFalseInternal)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const applyXnorSelfEquivalence = (_expr: BooleanExpression): BooleanExpression => ({
  type: 'CONSTANT',
  value: true,
})
const canApplyXnorSelfEquivalenceInternal = (expr: BooleanExpression): boolean => {
  return (
    expr.type === 'XNOR' &&
    expr.left !== undefined &&
    expr.right !== undefined &&
    expressionsEqual(expr.left, expr.right)
  )
}
const canApplyXnorSelfEquivalenceForRule = createRecursiveCanApply(
  canApplyXnorSelfEquivalenceInternal
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const applyXnorWithComplement = (_expr: BooleanExpression): BooleanExpression => ({
  type: 'CONSTANT',
  value: false,
})
const canApplyXnorWithComplementInternal = (expr: BooleanExpression): boolean => {
  if (expr.type !== 'XNOR' || !expr.left || !expr.right) return false
  return (
    (expr.left.type === 'NOT' && expr.left.left && expressionsEqual(expr.left.left, expr.right)) ||
    (expr.right.type === 'NOT' && expr.right.left && expressionsEqual(expr.right.left, expr.left))
  )
}
const canApplyXnorWithComplementForRule = createRecursiveCanApply(
  canApplyXnorWithComplementInternal
)

// --- Expansion Rule Helpers ---

// NAND Expansion: A @ B => !(A & B)
const applyNandExpansionLogic = (expr: BooleanExpression): BooleanExpression => {
  if (expr.type === 'NAND' && expr.left && expr.right) {
    const result: BooleanExpression = {
      type: 'NOT',
      left: { type: 'AND', left: expr.left, right: expr.right },
    } as NotNode
    return result
  }
  return expr
}
const canApplyNandExpansionLogic = (expr: BooleanExpression): boolean => {
  return expr.type === 'NAND' && expr.left !== undefined && expr.right !== undefined
}

// NOR Expansion: A # B => !(A + B)
const applyNorExpansionLogic = (expr: BooleanExpression): BooleanExpression => {
  if (expr.type === 'NOR' && expr.left && expr.right) {
    return {
      type: 'NOT',
      left: { type: 'OR', left: expr.left, right: expr.right },
    } as NotNode
  }
  return expr
}
const canApplyNorExpansionLogic = (expr: BooleanExpression): boolean => {
  return expr.type === 'NOR' && expr.left !== undefined && expr.right !== undefined
}

// XOR Expansion: A ^ B => (A & !B) + (!A & B)
const applyXorExpansionLogic = (expr: BooleanExpression): BooleanExpression => {
  if (expr.type === 'XOR' && expr.left && expr.right) {
    return {
      type: 'OR',
      left: {
        type: 'AND',
        left: expr.left,
        right: { type: 'NOT', left: expr.right } as NotNode,
      },
      right: {
        type: 'AND',
        left: { type: 'NOT', left: expr.left } as NotNode,
        right: expr.right,
      },
    }
  }
  return expr
}
const canApplyXorExpansionLogic = (expr: BooleanExpression): boolean => {
  return expr.type === 'XOR' && expr.left !== undefined && expr.right !== undefined
}

// XNOR Expansion: A <=> B => (A & B) + (!A & !B)
const applyXnorExpansionLogic = (expr: BooleanExpression): BooleanExpression => {
  if (expr.type === 'XNOR' && expr.left && expr.right) {
    return {
      type: 'OR',
      left: {
        type: 'AND',
        left: expr.left,
        right: expr.right,
      },
      right: {
        type: 'AND',
        left: { type: 'NOT', left: expr.left } as NotNode,
        right: { type: 'NOT', left: expr.right } as NotNode,
      },
    }
  }
  return expr
}
const canApplyXnorExpansionLogic = (expr: BooleanExpression): boolean => {
  return expr.type === 'XNOR' && expr.left !== undefined && expr.right !== undefined
}

// --- Expansion Rules ---
export function getExpansionRules(): SimplificationRule[] {
  return [
    {
      info: {
        name: 'NAND Expansion',
        description: 'A @ B => !(A & B)',
        formula: 'A \\uparrow B \\Leftrightarrow \\lnot(A \\land B)',
      },
      canApply: canApplyNandExpansionLogic,
      apply: createRecursiveRuleApply(applyNandExpansionLogic, canApplyNandExpansionLogic),
    },
    {
      info: {
        name: 'NOR Expansion',
        description: 'A # B => !(A + B)',
        formula: 'A \\downarrow B \\Leftrightarrow \\lnot(A \\lor B)',
      },
      canApply: canApplyNorExpansionLogic,
      apply: createRecursiveRuleApply(applyNorExpansionLogic, canApplyNorExpansionLogic),
    },
    {
      info: {
        name: 'XOR Expansion',
        description: 'A ^ B => (A & !B) + (!A & B)',
        formula: 'A \\oplus B \\Leftrightarrow (A \\land \\lnot B) \\lor (\\lnot A \\land B)',
      },
      canApply: canApplyXorExpansionLogic,
      apply: createRecursiveRuleApply(applyXorExpansionLogic, canApplyXorExpansionLogic),
    },
    {
      info: {
        name: 'XNOR Expansion',
        description: 'A <=> B => (A & B) + (!A & !B)',
        formula:
          'A \\leftrightarrow B \\Leftrightarrow (A \\land B) \\lor (\\lnot A \\land \\lnot B)',
      },
      canApply: canApplyXnorExpansionLogic,
      apply: createRecursiveRuleApply(applyXnorExpansionLogic, canApplyXnorExpansionLogic),
    },
  ]
}
