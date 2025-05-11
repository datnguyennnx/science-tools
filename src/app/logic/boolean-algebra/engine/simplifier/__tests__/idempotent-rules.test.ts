import { describe, expect, test } from 'vitest'
import { getIdempotentRules } from '../rules/idempotent-rules'
import { BooleanExpression } from '../../ast/types'
import { expressionsEqual } from '../../utils'
import { parseExpression } from '../../parser'

describe('Idempotent Law Simplification Rules', () => {
  const rules = getIdempotentRules()
  const andIdempotenceRule = rules.find(rule => rule.info.name === 'AND Idempotence')!
  const orIdempotenceRule = rules.find(rule => rule.info.name === 'OR Idempotence')!

  expect(andIdempotenceRule).toBeDefined()
  expect(orIdempotenceRule).toBeDefined()

  // Helper function to test a single rule application
  const testRuleApplication = (
    rule: (typeof rules)[0],
    inputExprStr: string,
    expectedOutputStr: string | null, // null if rule applies but results in original structure (e.g. recursive step)
    shouldChange: boolean // whether the rule is expected to alter the expression structure
  ) => {
    const expr = parseExpression(inputExprStr)!
    const originalJson = JSON.stringify(expr)
    const canApply = rule.canApply(expr)
    const result = rule.apply(expr)

    expect(JSON.stringify(expr), 'Input expression should not be mutated.').toBe(originalJson)

    if (shouldChange) {
      expect(
        canApply,
        `Rule ${rule.info.name} should be able to apply and change ${inputExprStr}`
      ).toBe(true)
      const expectedExpr = parseExpression(expectedOutputStr!)!
      expect(
        expressionsEqual(result, expectedExpr),
        `Expected ${inputExprStr} -> ${expectedOutputStr}`
      ).toBe(true)
      expect(result, 'Result should be a new instance if expression changed.').not.toBe(expr)
    } else {
      // If no change is expected, the result should be structurally equal to the input.
      // It should also be the same instance if the rule determined no change was necessary.
      expect(expressionsEqual(result, expr), `Expected ${inputExprStr} to remain unchanged.`).toBe(
        true
      )
      if (canApply) {
        // If it could apply but didn't change, it should be the same instance
        expect(
          result,
          `Rule ${rule.info.name} applied but did not change ${inputExprStr}, should be same instance.`
        ).toBe(expr)
      } else {
        // If it couldn't apply, it must be the same instance
        expect(
          result,
          `Rule ${rule.info.name} could not apply to ${inputExprStr}, should be same instance.`
        ).toBe(expr)
      }
      // If an expectedOutputStr is provided (even if same as input), verify it
      if (expectedOutputStr) {
        const expectedExpr = parseExpression(expectedOutputStr)!
        expect(expressionsEqual(result, expectedExpr)).toBe(true)
      }
    }
  }

  // --- AND Idempotence Tests ---
  describe('AND Idempotence (A & A = A)', () => {
    const rule = andIdempotenceRule
    test('Simplifies A & A to A', () => testRuleApplication(rule, 'A & A', 'A', true))
    test('Simplifies (B+C) & (B+C) to (B+C)', () =>
      testRuleApplication(rule, '(B+C) & (B+C)', '(B+C)', true))
    test('Constants: 1 & 1 = 1', () => testRuleApplication(rule, '1 & 1', '1', true))
    test('Constants: 0 & 0 = 0', () => testRuleApplication(rule, '0 & 0', '0', true))

    // Negative cases - rule canApply is true for any AND node, but apply shouldn't change these.
    test('No change for A & B', () => testRuleApplication(rule, 'A & B', 'A & B', false))
    test('No change for A & !A', () => testRuleApplication(rule, 'A & !A', 'A & !A', false))
    // Recursive cases - should not change if top-level isn't idempotent
    test('Recursive: A & (B & B) simplifies to A & B (handled by simplifier, rule itself changes B&B to B)', () => {
      // Test the rule directly: A & (B & B)
      // The idempotent rule, when applied to A & (B&B), will first process (B&B) -> B.
      // Then it forms A & B. This is a new node.
      const expr = parseExpression('A & (B & B)')!
      const originalJson = JSON.stringify(expr)
      const result = rule.apply(expr)
      expect(JSON.stringify(expr)).toBe(originalJson)
      expect(expressionsEqual(result, parseExpression('A & B')!)).toBe(true)
      expect(result).not.toBe(expr) // New instance due to recursive change
    })
    test('No change for non-AND like A + A', () => {
      // canApply for AND Idempotence is specific to AND nodes in its current simple form in rules
      // If applyIdempotenceRecursive is used (which is what getRules returns), canApply is broader.
      // Let's assume andIdempotenceRule.canApply is specific for these tests.
      const specificAndRule = {
        ...rule,
        canApply: (e: BooleanExpression) => e.type === 'AND' && expressionsEqual(e.left!, e.right!),
      }
      testRuleApplication(specificAndRule, 'A+A', 'A+A', false)
    })
  })

  // --- OR Idempotence Tests ---
  describe('OR Idempotence (A + A = A)', () => {
    const rule = orIdempotenceRule
    test('Simplifies A + A to A', () => testRuleApplication(rule, 'A + A', 'A', true))
    test('Simplifies (!D*E) + (!D*E) to (!D*E)', () =>
      testRuleApplication(rule, '(!D*E) + (!D*E)', '(!D*E)', true))
    test('Constants: 1 + 1 = 1', () => testRuleApplication(rule, '1 + 1', '1', true))
    test('Constants: 0 + 0 = 0', () => testRuleApplication(rule, '0 + 0', '0', true))

    // Negative cases - rule canApply is true for any OR node, but apply shouldn't change these.
    test('No change for A + B', () => testRuleApplication(rule, 'A + B', 'A + B', false))
    test('No change for A + !A', () => testRuleApplication(rule, 'A + !A', 'A + !A', false))
    test('Recursive: A + (B + B) simplifies to A + B', () => {
      const expr = parseExpression('A + (B + B)')!
      const originalJson = JSON.stringify(expr)
      const result = rule.apply(expr)
      expect(JSON.stringify(expr)).toBe(originalJson)
      expect(expressionsEqual(result, parseExpression('A + B')!)).toBe(true)
      expect(result).not.toBe(expr) // New instance due to recursive change
    })
    test('No change for non-OR like A & A', () => {
      const specificOrRule = {
        ...rule,
        canApply: (e: BooleanExpression) => e.type === 'OR' && expressionsEqual(e.left!, e.right!),
      }
      testRuleApplication(specificOrRule, 'A&A', 'A&A', false)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('AND Idempotence canApply and apply handle incomplete children (no change)', () => {
      // @ts-expect-error Intentionally creating an invalid BooleanExpression for testing incomplete AND node
      const incompleteAnd1: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        // right is implicitly missing, making this not a valid AndNode or BooleanExpression
      }
      // canApply for the recursive version would be true if expr.type is AND/OR
      // For a direct rule, it would be false if right is missing.
      // The rule from getIdempotentRules is recursive, so canApply(AND/OR) is true.
      expect(andIdempotenceRule.canApply(incompleteAnd1)).toBe(true)
      const result = andIdempotenceRule.apply(incompleteAnd1)
      expect(result).toBe(incompleteAnd1) // Should return as is if malformed for idempotence check
    })
  })

  describe('General Rule Properties', () => {
    test('All rule metadata is correct', () => {
      rules.forEach(rule => {
        expect(rule.info.name).toBeDefined()
        expect(rule.info.description).toBeDefined()
        expect(rule.info.formula).toBeDefined()
        expect(typeof rule.canApply).toBe('function')
        expect(typeof rule.apply).toBe('function')
      })
    })
  })
})
