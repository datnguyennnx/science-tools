import { describe, expect, test } from 'vitest'
import { getBasicRules } from '../rules/basic-rules'
import { BooleanExpression } from '../../ast/types'

describe('Basic Simplification Rules', () => {
  const rules = getBasicRules()

  // Helper function to create a double negation expression
  const createDoubleNegation = (): BooleanExpression => ({
    type: 'NOT',
    left: {
      type: 'NOT',
      left: {
        type: 'VARIABLE',
        value: 'A',
      },
    },
  })

  // Helper function to create a negated AND expression for De Morgan testing
  const createNegatedAnd = (): BooleanExpression => ({
    type: 'NOT',
    left: {
      type: 'AND',
      left: { type: 'VARIABLE', value: 'A' },
      right: { type: 'VARIABLE', value: 'B' },
    },
  })

  // Helper function to create a negated OR expression for De Morgan testing
  const createNegatedOr = (): BooleanExpression => ({
    type: 'NOT',
    left: {
      type: 'OR',
      left: { type: 'VARIABLE', value: 'A' },
      right: { type: 'VARIABLE', value: 'B' },
    },
  })

  // 1. Functional Correctness Tests
  describe('Functional Correctness', () => {
    test('double negation rule simplifies correctly', () => {
      const doubleNegationRule = rules.find(rule => rule.info.name === 'Double Negation')
      expect(doubleNegationRule).toBeDefined()

      const expr = createDoubleNegation()
      const canApply = doubleNegationRule!.canApply(expr)
      expect(canApply).toBe(true)

      const result = doubleNegationRule!.apply(expr)
      expect(result).toEqual({ type: 'VARIABLE', value: 'A' })
    })

    test("De Morgan's Law (AND) transforms correctly", () => {
      const deMorganAndRule = rules.find(rule => rule.info.name === "De Morgan's Law (AND)")
      expect(deMorganAndRule).toBeDefined()

      const expr = createNegatedAnd()
      const canApply = deMorganAndRule!.canApply(expr)
      expect(canApply).toBe(true)

      const result = deMorganAndRule!.apply(expr)
      expect(result.type).toBe('OR')
      expect(result.left?.type).toBe('NOT')
      expect(result.right?.type).toBe('NOT')
      expect(result.left?.left?.value).toBe('A')
      expect(result.right?.left?.value).toBe('B')
    })

    test("De Morgan's Law (OR) transforms correctly", () => {
      const deMorganOrRule = rules.find(rule => rule.info.name === "De Morgan's Law (OR)")
      expect(deMorganOrRule).toBeDefined()

      const expr = createNegatedOr()
      const canApply = deMorganOrRule!.canApply(expr)
      expect(canApply).toBe(true)

      const result = deMorganOrRule!.apply(expr)
      expect(result.type).toBe('AND')
      expect(result.left?.type).toBe('NOT')
      expect(result.right?.type).toBe('NOT')
      expect(result.left?.left?.value).toBe('A')
      expect(result.right?.left?.value).toBe('B')
    })
  })

  // 2. Happy-Path Tests
  describe('Happy Path', () => {
    test('all rules have correct metadata', () => {
      for (const rule of rules) {
        expect(rule.info.name).toBeTruthy()
        expect(rule.info.description).toBeTruthy()
        expect(rule.info.formula).toBeTruthy()
        expect(rule.canApply).toBeInstanceOf(Function)
        expect(rule.apply).toBeInstanceOf(Function)
      }
    })
  })

  // 3. Negative-Path Tests
  describe('Negative Path', () => {
    test('double negation rule rejects incompatible expressions', () => {
      const doubleNegationRule = rules.find(rule => rule.info.name === 'Double Negation')

      // Test with a single negation
      const singleNegation: BooleanExpression = {
        type: 'NOT',
        left: { type: 'VARIABLE', value: 'A' },
      }
      expect(doubleNegationRule!.canApply(singleNegation)).toBe(false)

      // Test with an AND expression
      const andExpr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'B' },
      }
      expect(doubleNegationRule!.canApply(andExpr)).toBe(false)
    })

    test('De Morgan rules reject non-negated expressions', () => {
      const deMorganAndRule = rules.find(rule => rule.info.name === "De Morgan's Law (AND)")
      const deMorganOrRule = rules.find(rule => rule.info.name === "De Morgan's Law (OR)")

      // Test with a plain AND expression (not negated)
      const andExpr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'B' },
      }
      expect(deMorganAndRule!.canApply(andExpr)).toBe(false)
      expect(deMorganOrRule!.canApply(andExpr)).toBe(false)

      // Test with a plain OR expression (not negated)
      const orExpr: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'B' },
      }
      expect(deMorganAndRule!.canApply(orExpr)).toBe(false)
      expect(deMorganOrRule!.canApply(orExpr)).toBe(false)
    })
  })

  // 4. Equivalence-Partitioning Tests
  describe('Equivalence Partitioning', () => {
    test('rules properly identify their applicable expressions', () => {
      const doubleNegationRule = rules.find(rule => rule.info.name === 'Double Negation')
      const deMorganAndRule = rules.find(rule => rule.info.name === "De Morgan's Law (AND)")
      const deMorganOrRule = rules.find(rule => rule.info.name === "De Morgan's Law (OR)")

      // Double Negation rule should only apply to double negations
      expect(doubleNegationRule!.canApply(createDoubleNegation())).toBe(true)
      expect(doubleNegationRule!.canApply(createNegatedAnd())).toBe(false)
      expect(doubleNegationRule!.canApply(createNegatedOr())).toBe(false)

      // De Morgan AND rule should only apply to negated ANDs
      expect(deMorganAndRule!.canApply(createDoubleNegation())).toBe(false)
      expect(deMorganAndRule!.canApply(createNegatedAnd())).toBe(true)
      expect(deMorganAndRule!.canApply(createNegatedOr())).toBe(false)

      // De Morgan OR rule should only apply to negated ORs
      expect(deMorganOrRule!.canApply(createDoubleNegation())).toBe(false)
      expect(deMorganOrRule!.canApply(createNegatedAnd())).toBe(false)
      expect(deMorganOrRule!.canApply(createNegatedOr())).toBe(true)
    })
  })

  // 5. Boundary-Value Tests
  describe('Boundary Values', () => {
    test('handles multi-level nested expressions', () => {
      const deMorganAndRule = rules.find(rule => rule.info.name === "De Morgan's Law (AND)")

      // Create a more complex negated AND expression
      const complexExpr: BooleanExpression = {
        type: 'NOT',
        left: {
          type: 'AND',
          left: {
            type: 'OR',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: { type: 'VARIABLE', value: 'C' },
        },
      }

      expect(deMorganAndRule!.canApply(complexExpr)).toBe(true)

      const result = deMorganAndRule!.apply(complexExpr)
      expect(result.type).toBe('OR')
      expect(result.left?.type).toBe('NOT')
      expect(result.right?.type).toBe('NOT')
      expect(result.left?.left?.type).toBe('OR')
      expect(result.right?.left?.value).toBe('C')
    })

    test('double negation with complex inner expression', () => {
      const doubleNegationRule = rules.find(rule => rule.info.name === 'Double Negation')

      // Create a double negation with a complex inner expression
      const complexDoubleNegation: BooleanExpression = {
        type: 'NOT',
        left: {
          type: 'NOT',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
        },
      }

      expect(doubleNegationRule!.canApply(complexDoubleNegation)).toBe(true)

      const result = doubleNegationRule!.apply(complexDoubleNegation)
      expect(result.type).toBe('AND')
      expect(result.left?.value).toBe('A')
      expect(result.right?.value).toBe('B')
    })
  })

  // 6. Error-Handling Tests
  describe('Error Handling', () => {
    test('handles undefined or incomplete expressions', () => {
      const doubleNegationRule = rules.find(rule => rule.info.name === 'Double Negation')

      // Test with a NOT node with undefined left
      const incompleteExpr: BooleanExpression = {
        type: 'NOT',
        // left is undefined
      }

      expect(doubleNegationRule!.canApply(incompleteExpr)).toBe(false)

      // The following would throw if not handled properly
      expect(() => doubleNegationRule!.canApply(incompleteExpr)).not.toThrow()
    })

    test('De Morgan rules handle missing operands', () => {
      const deMorganAndRule = rules.find(rule => rule.info.name === "De Morgan's Law (AND)")

      // Create a negated AND with a missing right operand
      const incompleteExpr: BooleanExpression = {
        type: 'NOT',
        left: {
          type: 'AND',
          left: { type: 'VARIABLE', value: 'A' },
          // right is undefined
        },
      }

      // This should not throw, even with incomplete expressions
      expect(() => deMorganAndRule!.canApply(incompleteExpr)).not.toThrow()

      // The rule should still recognize it's a negated AND
      expect(deMorganAndRule!.canApply(incompleteExpr)).toBe(true)
    })
  })
})
