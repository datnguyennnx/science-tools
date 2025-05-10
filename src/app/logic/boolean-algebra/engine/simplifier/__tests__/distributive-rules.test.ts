import { describe, expect, test } from 'vitest'
import { getDistributiveRules } from '../rules/distributive-rules'
import { BooleanExpression } from '../../ast/types'
import { deepClone } from '../../utils' // For immutability checks
import { parseExpression } from '../../parser' // To easily create test expressions

describe('Distributive Simplification Rules', () => {
  const rules = getDistributiveRules()
  const distributeAndOverOrLeftRule = rules.find(
    rule => rule.info.name === 'Distribute AND over OR (Left)'
  )
  const distributeAndOverOrRightRule = rules.find(
    rule => rule.info.name === 'Distribute AND over OR (Right)'
  )

  expect(distributeAndOverOrLeftRule).toBeDefined()
  expect(distributeAndOverOrRightRule).toBeDefined()

  // Helper to create a basic X * (Y + Z) expression
  const createLeftDistributiveExpr = (
    X: BooleanExpression = { type: 'VARIABLE', value: 'X' },
    Y: BooleanExpression = { type: 'VARIABLE', value: 'Y' },
    Z: BooleanExpression = { type: 'VARIABLE', value: 'Z' }
  ): BooleanExpression => ({
    type: 'AND',
    left: X,
    right: {
      type: 'OR',
      left: Y,
      right: Z,
    },
  })

  // Helper to create a basic (X + Y) * Z expression
  const createRightDistributiveExpr = (
    X: BooleanExpression = { type: 'VARIABLE', value: 'X' },
    Y: BooleanExpression = { type: 'VARIABLE', value: 'Y' },
    Z: BooleanExpression = { type: 'VARIABLE', value: 'Z' }
  ): BooleanExpression => ({
    type: 'AND',
    left: {
      type: 'OR',
      left: X,
      right: Y,
    },
    right: Z,
  })

  describe('Distribute AND over OR (Left): X * (Y + Z) => (X * Y) + (X * Z)', () => {
    test('Functional Correctness', () => {
      const expr = createLeftDistributiveExpr()
      expect(distributeAndOverOrLeftRule!.canApply(expr)).toBe(true)

      const result = distributeAndOverOrLeftRule!.apply(expr)
      expect(result).toEqual({
        type: 'OR',
        left: {
          type: 'AND',
          left: { type: 'VARIABLE', value: 'X' },
          right: { type: 'VARIABLE', value: 'Y' },
        },
        right: {
          type: 'AND',
          left: { type: 'VARIABLE', value: 'X' },
          right: { type: 'VARIABLE', value: 'Z' },
        },
      })
    })

    test('Negative Path: Incorrect top-level operator', () => {
      const expr: BooleanExpression = {
        type: 'OR', // Should be AND
        left: { type: 'VARIABLE', value: 'X' },
        right: {
          type: 'OR',
          left: { type: 'VARIABLE', value: 'Y' },
          right: { type: 'VARIABLE', value: 'Z' },
        },
      }
      expect(distributeAndOverOrLeftRule!.canApply(expr)).toBe(false)
    })

    test('Negative Path: Right child is not OR', () => {
      const expr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'X' },
        right: {
          type: 'AND', // Should be OR
          left: { type: 'VARIABLE', value: 'Y' },
          right: { type: 'VARIABLE', value: 'Z' },
        },
      }
      expect(distributeAndOverOrLeftRule!.canApply(expr)).toBe(false)
    })

    test('Negative Path: Missing operands', () => {
      const expr1: BooleanExpression = { type: 'AND', left: { type: 'VARIABLE', value: 'X' } } // Missing right
      expect(distributeAndOverOrLeftRule!.canApply(expr1)).toBe(false)

      const expr2: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'X' },
        right: { type: 'OR', left: { type: 'VARIABLE', value: 'Y' } }, // Missing Z
      }
      expect(distributeAndOverOrLeftRule!.canApply(expr2)).toBe(false)
    })

    test('Complex Sub-expressions', () => {
      const X_complex = parseExpression('(A+B)')!
      const Y_complex = parseExpression('(C*D)')!
      const Z_simple: BooleanExpression = { type: 'VARIABLE', value: 'E' }

      const expr = createLeftDistributiveExpr(X_complex, Y_complex, Z_simple)
      expect(distributeAndOverOrLeftRule!.canApply(expr)).toBe(true)

      const result = distributeAndOverOrLeftRule!.apply(expr)
      expect(result).toEqual({
        type: 'OR',
        left: { type: 'AND', left: X_complex, right: Y_complex },
        right: { type: 'AND', left: deepClone(X_complex), right: Z_simple },
      })
    })

    test('Immutability: Original expression is not modified', () => {
      const expr = createLeftDistributiveExpr()
      const originalExpr = deepClone(expr)
      distributeAndOverOrLeftRule!.apply(expr)
      expect(expr).toEqual(originalExpr)
    })
  })

  describe('Distribute AND over OR (Right): (X + Y) * Z => (X * Z) + (Y * Z)', () => {
    test('Functional Correctness', () => {
      const expr = createRightDistributiveExpr()
      expect(distributeAndOverOrRightRule!.canApply(expr)).toBe(true)

      const result = distributeAndOverOrRightRule!.apply(expr)
      expect(result).toEqual({
        type: 'OR',
        left: {
          type: 'AND',
          left: { type: 'VARIABLE', value: 'X' },
          right: { type: 'VARIABLE', value: 'Z' },
        },
        right: {
          type: 'AND',
          left: { type: 'VARIABLE', value: 'Y' },
          right: { type: 'VARIABLE', value: 'Z' },
        },
      })
    })

    test('Negative Path: Incorrect top-level operator', () => {
      const expr: BooleanExpression = {
        type: 'OR', // Should be AND
        left: {
          type: 'OR',
          left: { type: 'VARIABLE', value: 'X' },
          right: { type: 'VARIABLE', value: 'Y' },
        },
        right: { type: 'VARIABLE', value: 'Z' },
      }
      expect(distributeAndOverOrRightRule!.canApply(expr)).toBe(false)
    })

    test('Negative Path: Left child is not OR', () => {
      const expr: BooleanExpression = {
        type: 'AND',
        left: {
          type: 'AND', // Should be OR
          left: { type: 'VARIABLE', value: 'X' },
          right: { type: 'VARIABLE', value: 'Y' },
        },
        right: { type: 'VARIABLE', value: 'Z' },
      }
      expect(distributeAndOverOrRightRule!.canApply(expr)).toBe(false)
    })

    test('Negative Path: Missing operands', () => {
      const expr1: BooleanExpression = { type: 'AND', right: { type: 'VARIABLE', value: 'Z' } } // Missing left
      expect(distributeAndOverOrRightRule!.canApply(expr1)).toBe(false)

      const expr2: BooleanExpression = {
        type: 'AND',
        left: { type: 'OR', left: { type: 'VARIABLE', value: 'X' } }, // Missing Y
        right: { type: 'VARIABLE', value: 'Z' },
      }
      expect(distributeAndOverOrRightRule!.canApply(expr2)).toBe(false)
    })

    test('Complex Sub-expressions', () => {
      const X_simple: BooleanExpression = { type: 'VARIABLE', value: 'A' }
      const Y_complex = parseExpression('(B*C)')!
      const Z_complex = parseExpression('(D+E)')!

      const expr = createRightDistributiveExpr(X_simple, Y_complex, Z_complex)
      expect(distributeAndOverOrRightRule!.canApply(expr)).toBe(true)

      const result = distributeAndOverOrRightRule!.apply(expr)
      expect(result).toEqual({
        type: 'OR',
        left: { type: 'AND', left: X_simple, right: Z_complex },
        right: { type: 'AND', left: Y_complex, right: deepClone(Z_complex) },
      })
    })

    test('Immutability: Original expression is not modified', () => {
      const expr = createRightDistributiveExpr()
      const originalExpr = deepClone(expr)
      distributeAndOverOrRightRule!.apply(expr)
      expect(expr).toEqual(originalExpr)
    })
  })

  // TODO: Add tests for factorization rules (e.g., XY + XZ => X(Y+Z)) if/when implemented
  // TODO: Add tests for distribution of OR over AND rules (e.g., X + YZ => (X+Y)(X+Z)) if/when implemented
})
