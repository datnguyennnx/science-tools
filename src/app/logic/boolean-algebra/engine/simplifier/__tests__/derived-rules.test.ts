import { getDerivedRules } from '../rules/derived-rules'
import { parseExpression } from '../../parser/parser'
import { simplify } from '../simplifier'
import { describe, test, expect } from 'vitest'
import { formatToBoolean } from '../../parser/formatter'

describe('Derived Operation Rules', () => {
  const derivedRules = getDerivedRules()

  describe('XOR Rules', () => {
    test('XOR Identity: A XOR 0 = A', () => {
      const expr = parseExpression('A ^ 0')
      const result = simplify(expr, derivedRules)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('XOR Identity')

      // The final result should be just A
      expect(result.finalExpression.type).toBe('VARIABLE')
      expect(result.finalExpression.value).toBe('A')
    })

    test('XOR with True: A XOR 1 = NOT A', () => {
      const expr = parseExpression('A ^ 1')
      const result = simplify(expr, derivedRules)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('XOR with True')

      // The final result should be NOT A
      expect(result.finalExpression.type).toBe('NOT')
      expect(result.finalExpression.left?.type).toBe('VARIABLE')
      expect(result.finalExpression.left?.value).toBe('A')
    })

    test('XOR Self-Cancellation: A XOR A = 0', () => {
      const expr = parseExpression('A ^ A')
      const result = simplify(expr, derivedRules)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('XOR Self-Cancellation')

      // The final result should be 0 (false)
      expect(result.finalExpression.type).toBe('CONSTANT')
      expect(result.finalExpression.value).toBe(false)
    })
  })

  describe('NAND Rules', () => {
    test('NAND with False: A NAND 0 = 1', () => {
      const expr = parseExpression('A @ 0')
      const result = simplify(expr, derivedRules)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('NAND with False')

      // The final result should be 1 (true)
      expect(result.finalExpression.type).toBe('CONSTANT')
      expect(result.finalExpression.value).toBe(true)
    })

    test('NAND with True: A NAND 1 = NOT A', () => {
      const expr = parseExpression('A @ 1')
      const result = simplify(expr, derivedRules)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('NAND with True')

      // The final result should be NOT A
      expect(result.finalExpression.type).toBe('NOT')
      expect(result.finalExpression.left?.type).toBe('VARIABLE')
      expect(result.finalExpression.left?.value).toBe('A')
    })

    test('NAND Self-Negation: A NAND A = NOT A', () => {
      const expr = parseExpression('A @ A')
      const result = simplify(expr, derivedRules)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('NAND Self-Negation')

      // The final result should be NOT A
      expect(result.finalExpression.type).toBe('NOT')
      expect(result.finalExpression.left?.type).toBe('VARIABLE')
      expect(result.finalExpression.left?.value).toBe('A')
    })

    test('Double NAND: NOT(A NAND B) = A AND B', () => {
      const expr = parseExpression('!(A @ B)')
      const result = simplify(expr, derivedRules)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('Double NAND')

      // The final result should be A AND B
      expect(result.finalExpression.type).toBe('AND')
      expect(result.finalExpression.left?.type).toBe('VARIABLE')
      expect(result.finalExpression.left?.value).toBe('A')
      expect(result.finalExpression.right?.type).toBe('VARIABLE')
      expect(result.finalExpression.right?.value).toBe('B')
    })
  })

  describe('NOR Rules', () => {
    test('NOR with False: A NOR 0 = NOT A', () => {
      const expr = parseExpression('A # 0')
      const result = simplify(expr, derivedRules)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('NOR with False')

      // The final result should be NOT A
      expect(result.finalExpression.type).toBe('NOT')
      expect(result.finalExpression.left?.type).toBe('VARIABLE')
      expect(result.finalExpression.left?.value).toBe('A')
    })

    test('NOR with True: A NOR 1 = 0', () => {
      const expr = parseExpression('A # 1')
      const result = simplify(expr, derivedRules)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('NOR with True')

      // The final result should be 0 (false)
      expect(result.finalExpression.type).toBe('CONSTANT')
      expect(result.finalExpression.value).toBe(false)
    })

    test('NOR Self-Negation: A NOR A = NOT A', () => {
      const expr = parseExpression('A # A')
      const result = simplify(expr, derivedRules)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('NOR Self-Negation')

      // The final result should be NOT A
      expect(result.finalExpression.type).toBe('NOT')
      expect(result.finalExpression.left?.type).toBe('VARIABLE')
      expect(result.finalExpression.left?.value).toBe('A')
    })

    test('Double NOR: NOT(A NOR B) = A OR B', () => {
      const expr = parseExpression('!(A # B)')
      const result = simplify(expr, derivedRules)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('Double NOR')

      // The final result should be A OR B
      expect(result.finalExpression.type).toBe('OR')
      expect(result.finalExpression.left?.type).toBe('VARIABLE')
      expect(result.finalExpression.left?.value).toBe('A')
      expect(result.finalExpression.right?.type).toBe('VARIABLE')
      expect(result.finalExpression.right?.value).toBe('B')
    })
  })

  describe('Complex Expressions', () => {
    test('Mix of derived operations', () => {
      // Use an expression that will definitely be simplified
      const complexExprString = '(A ^ B) @ (C # D)'
      const expr = parseExpression(complexExprString)
      const result = simplify(expr, derivedRules)

      // We should have at least one simplification step
      expect(result.steps.length).toBeGreaterThan(0)

      // The final expression should be different from the original
      const originalFormatted = formatToBoolean(expr)
      const finalFormatted = formatToBoolean(result.finalExpression)
      expect(finalFormatted).not.toEqual(originalFormatted)
    })
  })
})
