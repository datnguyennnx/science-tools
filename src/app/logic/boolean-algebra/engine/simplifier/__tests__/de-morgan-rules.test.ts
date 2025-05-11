import { describe, expect, test } from 'vitest'
import { getDeMorganRules } from '../rules/de-morgan-rules'
import { BooleanExpression, NotNode } from '../../ast/types'
import { expressionsEqual } from '../../utils' // Added for structural comparison

describe("De Morgan's Law Simplification Rules", () => {
  const rules = getDeMorganRules()
  const deMorganAndRule = rules.find(rule => rule.info.name === "De Morgan's Law (AND)")
  const deMorganOrRule = rules.find(rule => rule.info.name === "De Morgan's Law (OR)")

  expect(deMorganAndRule).toBeDefined()
  expect(deMorganOrRule).toBeDefined()

  // Helper to create a negated AND expression: !(A & B)
  const createNegatedAnd = (
    A: BooleanExpression = { type: 'VARIABLE', value: 'A' },
    B: BooleanExpression = { type: 'VARIABLE', value: 'B' }
  ): BooleanExpression => ({
    type: 'NOT',
    left: {
      type: 'AND',
      left: A,
      right: B,
    },
  })

  // Helper to create a negated OR expression: !(A + B)
  const createNegatedOr = (
    A: BooleanExpression = { type: 'VARIABLE', value: 'A' },
    B: BooleanExpression = { type: 'VARIABLE', value: 'B' }
  ): BooleanExpression => ({
    type: 'NOT',
    left: {
      type: 'OR',
      left: A,
      right: B,
    },
  })

  // 1. Functional Correctness Tests
  describe('1. Functional Correctness Tests', () => {
    test("De Morgan's Law (AND) transforms !(A & B) to !A + !B correctly", () => {
      const expr = createNegatedAnd()
      expect(deMorganAndRule!.canApply(expr)).toBe(true)
      const result = deMorganAndRule!.apply(expr)
      const expected: BooleanExpression = {
        type: 'OR',
        left: { type: 'NOT', left: { type: 'VARIABLE', value: 'A' } },
        right: { type: 'NOT', left: { type: 'VARIABLE', value: 'B' } },
      }
      expect(expressionsEqual(result, expected)).toBe(true)
    })

    test("De Morgan's Law (OR) transforms !(A + B) to !A & !B correctly", () => {
      const expr = createNegatedOr()
      expect(deMorganOrRule!.canApply(expr)).toBe(true)
      const result = deMorganOrRule!.apply(expr)
      const expected: BooleanExpression = {
        type: 'AND',
        left: { type: 'NOT', left: { type: 'VARIABLE', value: 'A' } },
        right: { type: 'NOT', left: { type: 'VARIABLE', value: 'B' } },
      }
      expect(expressionsEqual(result, expected)).toBe(true)
    })

    test('Handles more complex operands for !( (A&C) & (B+D) )', () => {
      const AC: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'C' },
      }
      const BD: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'B' },
        right: { type: 'VARIABLE', value: 'D' },
      }
      const expr = createNegatedAnd(AC, BD)
      expect(deMorganAndRule!.canApply(expr)).toBe(true)
      const result = deMorganAndRule!.apply(expr)
      const expected: BooleanExpression = {
        type: 'OR',
        left: { type: 'NOT', left: AC },
        right: { type: 'NOT', left: BD },
      }
      expect(expressionsEqual(result, expected)).toBe(true)
    })
  })

  // 2. Happy-Path Tests
  describe('2. Happy-Path Tests', () => {
    test('Rule metadata is correct', () => {
      rules.forEach(rule => {
        expect(rule.info.name).toBeDefined()
        expect(rule.info.description).toBeDefined()
        expect(rule.info.formula).toBeDefined()
        expect(typeof rule.canApply).toBe('function')
        expect(typeof rule.apply).toBe('function')
      })
    })
  })

  // 3. Negative-Path Tests
  describe('3. Negative-Path Tests', () => {
    test('De Morgan (AND) rule rejects non-NOT expressions', () => {
      const expr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'B' },
      }
      expect(deMorganAndRule!.canApply(expr)).toBe(false)
    })

    test('De Morgan (AND) rule rejects NOT expressions with non-AND child', () => {
      const expr: BooleanExpression = {
        type: 'NOT',
        left: {
          type: 'OR',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        },
      }
      expect(deMorganAndRule!.canApply(expr)).toBe(false)
    })

    test('De Morgan (OR) rule rejects non-NOT expressions', () => {
      const expr: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'B' },
      }
      expect(deMorganOrRule!.canApply(expr)).toBe(false)
    })

    test('De Morgan (OR) rule rejects NOT expressions with non-OR child', () => {
      const expr: BooleanExpression = {
        type: 'NOT',
        left: {
          type: 'AND',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        },
      }
      expect(deMorganOrRule!.canApply(expr)).toBe(false)
    })
  })

  // 4. Equivalence-Partitioning Tests
  describe('4. Equivalence-Partitioning Tests', () => {
    test('Rule applies only to its specific structure (negated AND for DeMorganAND, negated OR for DeMorganOR)', () => {
      expect(deMorganAndRule!.canApply(createNegatedAnd())).toBe(true)
      expect(deMorganAndRule!.canApply(createNegatedOr())).toBe(false)
      expect(deMorganOrRule!.canApply(createNegatedOr())).toBe(true)
      expect(deMorganOrRule!.canApply(createNegatedAnd())).toBe(false)
    })
  })

  // 5. Boundary-Value Tests
  describe('5. Boundary-Value Tests', () => {
    test('Handles expressions with constants as operands', () => {
      const exprAnd = createNegatedAnd(
        { type: 'CONSTANT', value: true },
        { type: 'CONSTANT', value: false }
      )
      expect(deMorganAndRule!.canApply(exprAnd)).toBe(true)
      const resultAnd = deMorganAndRule!.apply(exprAnd)
      const expectedAnd: BooleanExpression = {
        type: 'OR',
        left: { type: 'NOT', left: { type: 'CONSTANT', value: true } },
        right: { type: 'NOT', left: { type: 'CONSTANT', value: false } },
      }
      expect(expressionsEqual(resultAnd, expectedAnd)).toBe(true)

      const exprOr = createNegatedOr(
        { type: 'VARIABLE', value: 'A' },
        { type: 'CONSTANT', value: true }
      )
      expect(deMorganOrRule!.canApply(exprOr)).toBe(true)
      const resultOr = deMorganOrRule!.apply(exprOr)
      const expectedOr: BooleanExpression = {
        type: 'AND',
        left: { type: 'NOT', left: { type: 'VARIABLE', value: 'A' } },
        right: { type: 'NOT', left: { type: 'CONSTANT', value: true } },
      }
      expect(expressionsEqual(resultOr, expectedOr)).toBe(true)
    })

    test('Handles nested negated expressions (De Morgan applies top-down recursively)', () => {
      const innerA: BooleanExpression = {
        type: 'NOT',
        left: { type: 'NOT', left: { type: 'VARIABLE', value: 'A' } },
      }
      const innerB: BooleanExpression = { type: 'NOT', left: { type: 'VARIABLE', value: 'B' } }
      const expr = createNegatedAnd(innerA, innerB)

      expect(deMorganAndRule!.canApply(expr)).toBe(true)
      const result = deMorganAndRule!.apply(expr)
      // Expected: !innerA + !innerB = !(!(!!A)) + !(!B)
      // The rule applyDeMorganRecursively will handle the outer NOT and the operands innerA, innerB.
      // The operands innerA and innerB themselves are NOT touched by THIS specific application of DeMorgan at the top level.
      // The recursive nature means they would be processed if applyDeMorganRecursively was called on them.
      // So, !( (!!A) & (!B) ) becomes !(!!A) + !(!B)
      const expected: BooleanExpression = {
        type: 'OR',
        left: { type: 'NOT', left: innerA }, // left: NOT (NOT (NOT A))
        right: { type: 'NOT', left: innerB }, // right: NOT (NOT B)
      }
      expect(expressionsEqual(result, expected)).toBe(true)
    })
  })

  // 6. Error-Handling Tests
  describe('6. Error-Handling Tests', () => {
    test('canApply handles undefined/incomplete children gracefully', () => {
      const incompleteAnd1: BooleanExpression = {
        type: 'NOT',
        left: { type: 'VARIABLE', value: 'dummy' },
      } as NotNode

      const incompleteAnd2: BooleanExpression = {
        type: 'NOT',
        left: {
          type: 'AND',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        },
      }

      expect(deMorganAndRule!.canApply(incompleteAnd1)).toBe(false)
      expect(deMorganAndRule!.canApply(incompleteAnd2)).toBe(true)

      const incompleteOr1: BooleanExpression = {
        type: 'NOT',
        left: { type: 'VARIABLE', value: 'dummy' },
      } as NotNode

      const incompleteOr2: BooleanExpression = {
        type: 'NOT',
        left: {
          type: 'OR',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        },
      }

      expect(deMorganOrRule!.canApply(incompleteOr1)).toBe(false)
      expect(deMorganOrRule!.canApply(incompleteOr2)).toBe(true)
    })
  })

  // 7. Immutability Tests
  describe('7. Immutability Tests', () => {
    test('apply function does not mutate the original expression', () => {
      const exprAnd = createNegatedAnd()
      const originalJsonAnd = JSON.stringify(exprAnd)
      const resultAnd = deMorganAndRule!.apply(exprAnd)
      expect(JSON.stringify(exprAnd)).toBe(originalJsonAnd)
      // If the rule applied, result must be a new object
      if (deMorganAndRule!.canApply(exprAnd)) {
        expect(resultAnd).not.toBe(exprAnd)
      }

      const exprOr = createNegatedOr()
      const originalJsonOr = JSON.stringify(exprOr)
      const resultOr = deMorganOrRule!.apply(exprOr)
      expect(JSON.stringify(exprOr)).toBe(originalJsonOr)
      if (deMorganOrRule!.canApply(exprOr)) {
        expect(resultOr).not.toBe(exprOr)
      }
    })
  })

  // 8. State-Transition Tests (Conceptual: before/after transformation)
  describe('8. State-Transition Tests', () => {
    test('Transforms from !(A&B) to !A+!B as expected', () => {
      const varX: BooleanExpression = { type: 'VARIABLE', value: 'X' }
      const varY: BooleanExpression = { type: 'VARIABLE', value: 'Y' }
      const before = createNegatedAnd(varX, varY)
      const after: BooleanExpression = {
        type: 'OR',
        left: { type: 'NOT', left: varX },
        right: { type: 'NOT', left: varY },
      }
      expect(expressionsEqual(deMorganAndRule!.apply(before), after)).toBe(true)
    })

    test('Transforms from !(A+B) to !A&!B as expected', () => {
      const varP: BooleanExpression = { type: 'VARIABLE', value: 'P' }
      const varQ: BooleanExpression = { type: 'VARIABLE', value: 'Q' }
      const before = createNegatedOr(varP, varQ)
      const after: BooleanExpression = {
        type: 'AND',
        left: { type: 'NOT', left: varP },
        right: { type: 'NOT', left: varQ },
      }
      expect(expressionsEqual(deMorganOrRule!.apply(before), after)).toBe(true)
    })
  })
})
