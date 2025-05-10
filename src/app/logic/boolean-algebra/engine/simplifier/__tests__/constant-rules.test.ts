import { describe, expect, test } from 'vitest'
import { getConstantRules } from '../rules/constant-rules'
import { BooleanExpression } from '../../ast/types'

describe('Constant Simplification Rules', () => {
  const rules = getConstantRules()

  // 1. Functional Correctness Tests
  describe('Functional Correctness', () => {
    test('AND with True rule simplifies correctly', () => {
      const andWithTrueRule = rules.find(rule => rule.info.name === 'AND with True')
      expect(andWithTrueRule).toBeDefined()

      // A ∧ true = A
      const expr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'CONSTANT', value: true },
      }

      expect(andWithTrueRule!.canApply(expr)).toBe(true)
      const result = andWithTrueRule!.apply(expr)
      expect(result).toEqual({ type: 'VARIABLE', value: 'A' })

      // true ∧ A = A
      const expr2: BooleanExpression = {
        type: 'AND',
        left: { type: 'CONSTANT', value: true },
        right: { type: 'VARIABLE', value: 'A' },
      }

      expect(andWithTrueRule!.canApply(expr2)).toBe(true)
      const result2 = andWithTrueRule!.apply(expr2)
      expect(result2).toEqual({ type: 'VARIABLE', value: 'A' })
    })

    test('AND with False rule simplifies correctly', () => {
      const andWithFalseRule = rules.find(rule => rule.info.name === 'AND with False')
      expect(andWithFalseRule).toBeDefined()

      // A ∧ false = false
      const expr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'CONSTANT', value: false },
      }

      expect(andWithFalseRule!.canApply(expr)).toBe(true)
      const result = andWithFalseRule!.apply(expr)
      expect(result).toEqual({ type: 'CONSTANT', value: false })

      // false ∧ A = false
      const expr2: BooleanExpression = {
        type: 'AND',
        left: { type: 'CONSTANT', value: false },
        right: { type: 'VARIABLE', value: 'A' },
      }

      expect(andWithFalseRule!.canApply(expr2)).toBe(true)
      const result2 = andWithFalseRule!.apply(expr2)
      expect(result2).toEqual({ type: 'CONSTANT', value: false })
    })

    test('OR with True rule simplifies correctly', () => {
      const orWithTrueRule = rules.find(rule => rule.info.name === 'OR with True')
      expect(orWithTrueRule).toBeDefined()

      // A ∨ true = true
      const expr: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'CONSTANT', value: true },
      }

      expect(orWithTrueRule!.canApply(expr)).toBe(true)
      const result = orWithTrueRule!.apply(expr)
      expect(result).toEqual({ type: 'CONSTANT', value: true })

      // true ∨ A = true
      const expr2: BooleanExpression = {
        type: 'OR',
        left: { type: 'CONSTANT', value: true },
        right: { type: 'VARIABLE', value: 'A' },
      }

      expect(orWithTrueRule!.canApply(expr2)).toBe(true)
      const result2 = orWithTrueRule!.apply(expr2)
      expect(result2).toEqual({ type: 'CONSTANT', value: true })
    })

    test('OR with False rule simplifies correctly', () => {
      const orWithFalseRule = rules.find(rule => rule.info.name === 'OR with False')
      expect(orWithFalseRule).toBeDefined()

      // A ∨ false = A
      const expr: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'CONSTANT', value: false },
      }

      expect(orWithFalseRule!.canApply(expr)).toBe(true)
      const result = orWithFalseRule!.apply(expr)
      expect(result).toEqual({ type: 'VARIABLE', value: 'A' })

      // false ∨ A = A
      const expr2: BooleanExpression = {
        type: 'OR',
        left: { type: 'CONSTANT', value: false },
        right: { type: 'VARIABLE', value: 'A' },
      }

      expect(orWithFalseRule!.canApply(expr2)).toBe(true)
      const result2 = orWithFalseRule!.apply(expr2)
      expect(result2).toEqual({ type: 'VARIABLE', value: 'A' })
    })

    test('NOT True rule simplifies correctly', () => {
      const notTrueRule = rules.find(rule => rule.info.name === 'NOT True')
      expect(notTrueRule).toBeDefined()

      // ¬true = false
      const expr: BooleanExpression = {
        type: 'NOT',
        left: { type: 'CONSTANT', value: true },
      }

      expect(notTrueRule!.canApply(expr)).toBe(true)
      const result = notTrueRule!.apply(expr)
      expect(result).toEqual({ type: 'CONSTANT', value: false })
    })

    test('NOT False rule simplifies correctly', () => {
      const notFalseRule = rules.find(rule => rule.info.name === 'NOT False')
      expect(notFalseRule).toBeDefined()

      // ¬false = true
      const expr: BooleanExpression = {
        type: 'NOT',
        left: { type: 'CONSTANT', value: false },
      }

      expect(notFalseRule!.canApply(expr)).toBe(true)
      const result = notFalseRule!.apply(expr)
      expect(result).toEqual({ type: 'CONSTANT', value: true })
    })
  })

  // 2. Happy-Path Tests
  describe('Happy Path', () => {
    test('all rules are properly defined', () => {
      const ruleNames = [
        'AND with True',
        'AND with False',
        'OR with True',
        'OR with False',
        'NOT True',
        'NOT False',
      ]

      const foundRuleNames = rules.map(rule => rule.info.name)

      for (const name of ruleNames) {
        expect(foundRuleNames).toContain(name)
      }
    })
  })

  // 3. Negative-Path Tests
  describe('Negative Path', () => {
    test('constant rules reject non-matching operations', () => {
      const andWithTrueRule = rules.find(rule => rule.info.name === 'AND with True')
      const orWithTrueRule = rules.find(rule => rule.info.name === 'OR with True')

      // Test AND rule with OR operation
      const orExpr: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'CONSTANT', value: true },
      }
      expect(andWithTrueRule!.canApply(orExpr)).toBe(false)

      // Test OR rule with AND operation
      const andExpr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'CONSTANT', value: true },
      }
      expect(orWithTrueRule!.canApply(andExpr)).toBe(false)
    })

    test('constant rules reject operations without constants', () => {
      const andWithTrueRule = rules.find(rule => rule.info.name === 'AND with True')

      // AND with two variables (no constants)
      const noConstantExpr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'B' },
      }
      expect(andWithTrueRule!.canApply(noConstantExpr)).toBe(false)
    })

    test('NOT rules reject non-constant operands', () => {
      const notTrueRule = rules.find(rule => rule.info.name === 'NOT True')

      // NOT with a variable instead of a constant
      const notVarExpr: BooleanExpression = {
        type: 'NOT',
        left: { type: 'VARIABLE', value: 'A' },
      }
      expect(notTrueRule!.canApply(notVarExpr)).toBe(false)
    })
  })

  // 4. Equivalence-Partitioning Tests
  describe('Equivalence Partitioning', () => {
    test('operations with correct constants but wrong operation type', () => {
      const andWithTrueRule = rules.find(rule => rule.info.name === 'AND with True')
      const andWithFalseRule = rules.find(rule => rule.info.name === 'AND with False')

      // OR with true (not AND with true)
      const orWithTrueExpr: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'CONSTANT', value: true },
      }
      expect(andWithTrueRule!.canApply(orWithTrueExpr)).toBe(false)

      // OR with false (not AND with false)
      const orWithFalseExpr: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'CONSTANT', value: false },
      }
      expect(andWithFalseRule!.canApply(orWithFalseExpr)).toBe(false)
    })

    test('operations with wrong constants', () => {
      const andWithTrueRule = rules.find(rule => rule.info.name === 'AND with True')
      const andWithFalseRule = rules.find(rule => rule.info.name === 'AND with False')

      // AND with false (not AND with true)
      const andWithFalseExpr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'CONSTANT', value: false },
      }
      expect(andWithTrueRule!.canApply(andWithFalseExpr)).toBe(false)

      // AND with true (not AND with false)
      const andWithTrueExpr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'CONSTANT', value: true },
      }
      expect(andWithFalseRule!.canApply(andWithTrueExpr)).toBe(false)
    })
  })

  // 5. Boundary-Value Tests
  describe('Boundary Values', () => {
    test('handles operations with complex subexpressions', () => {
      const andWithTrueRule = rules.find(rule => rule.info.name === 'AND with True')

      // Complex subexpression AND true
      const complexExpr: BooleanExpression = {
        type: 'AND',
        left: {
          type: 'OR',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        },
        right: { type: 'CONSTANT', value: true },
      }

      expect(andWithTrueRule!.canApply(complexExpr)).toBe(true)
      const result = andWithTrueRule!.apply(complexExpr)

      // Result should be the complex subexpression
      expect(result).toEqual({
        type: 'OR',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'B' },
      })
    })

    test('handles deeply nested operations with constants', () => {
      const notFalseRule = rules.find(rule => rule.info.name === 'NOT False')

      // Create a deeply nested NOT false expression
      const nestedExpr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: {
          type: 'OR',
          left: { type: 'VARIABLE', value: 'B' },
          right: {
            type: 'NOT',
            left: { type: 'CONSTANT', value: false },
          },
        },
      }

      // Individual parts should be simplifiable
      const notFalseSubExpr = nestedExpr.right!.right!
      expect(notFalseRule!.canApply(notFalseSubExpr)).toBe(true)
      const result = notFalseRule!.apply(notFalseSubExpr)
      expect(result).toEqual({ type: 'CONSTANT', value: true })
    })
  })

  // 6. Error-Handling Tests
  describe('Error Handling', () => {
    test('handles operations with undefined operands', () => {
      const andWithTrueRule = rules.find(rule => rule.info.name === 'AND with True')

      // Create an AND with undefined right operand
      const invalidExpr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        // right is undefined
      }

      // This should safely return false without throwing
      expect(() => andWithTrueRule!.canApply(invalidExpr)).not.toThrow()
      expect(andWithTrueRule!.canApply(invalidExpr)).toBe(false)
    })

    test('handles NOT with undefined operand', () => {
      const notTrueRule = rules.find(rule => rule.info.name === 'NOT True')

      // Create a NOT with undefined operand
      const invalidExpr: BooleanExpression = {
        type: 'NOT',
        // left is undefined
      }

      // This should safely return false without throwing
      expect(() => notTrueRule!.canApply(invalidExpr)).not.toThrow()
      expect(notTrueRule!.canApply(invalidExpr)).toBe(false)
    })
  })
})
