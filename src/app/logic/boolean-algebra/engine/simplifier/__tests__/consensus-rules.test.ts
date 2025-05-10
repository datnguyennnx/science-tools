import { getConsensusRules } from '../rules/consensus-rules'
import { getDerivedRules } from '../rules/derived-rules'
import { parseExpression } from '../../parser/parser'
import { simplify } from '../simplifier'
import { describe, test, expect } from 'vitest'

describe('Consensus Theorem Rules', () => {
  const consensusRules = getConsensusRules()

  describe('OR Consensus', () => {
    test('Consensus Theorem OR: (A*B) + (A*!C) + (B*C) = (A*B) + (A*!C)', () => {
      // (A*B) + (A*!C) + (B*C) should simplify to (A*B) + (A*!C) due to consensus
      const expr = parseExpression('(A*B) + (A*!C) + (B*C)')
      const result = simplify(expr, consensusRules)

      // Should have applied the consensus rule
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('Consensus Theorem OR')

      // The final expression should have B*C removed
      const resultStr = JSON.stringify(result.finalExpression)
      const containsBC = resultStr.includes(
        '"type":"AND","left":{"type":"VARIABLE","value":"B"},"right":{"type":"VARIABLE","value":"C"}'
      )
      expect(containsBC).toBe(false)
    })

    test('Consensus Theorem OR with different order: (B*C) + (A*B) + (A*!C) = (A*B) + (A*!C)', () => {
      // Same test but with a different term order
      const expr = parseExpression('(B*C) + (A*B) + (A*!C)')
      const result = simplify(expr, consensusRules)

      // Should have applied the consensus rule
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('Consensus Theorem OR')

      // The final expression should have B*C removed
      const resultStr = JSON.stringify(result.finalExpression)
      const containsBC = resultStr.includes(
        '"type":"AND","left":{"type":"VARIABLE","value":"B"},"right":{"type":"VARIABLE","value":"C"}'
      )
      expect(containsBC).toBe(false)
    })

    test('Should not apply consensus when pattern does not match', () => {
      // These terms don't form a consensus triple
      const expr = parseExpression('(A*B) + (C*D) + (E*F)')
      const result = simplify(expr, consensusRules)

      // Should not have applied any consensus rules
      expect(result.steps.length).toBe(0)
    })
  })

  describe('AND Consensus', () => {
    test('Consensus Theorem AND: (A+B) * (A+!C) * (B+C) = (A+B) * (A+!C)', () => {
      // (A+B) * (A+!C) * (B+C) should simplify to (A+B) * (A+!C) due to consensus
      const expr = parseExpression('(A+B) * (A+!C) * (B+C)')
      const result = simplify(expr, consensusRules)

      // Should have applied the consensus rule
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('Consensus Theorem AND')

      // The final expression should have B+C removed
      const resultStr = JSON.stringify(result.finalExpression)
      const containsBC = resultStr.includes(
        '"type":"OR","left":{"type":"VARIABLE","value":"B"},"right":{"type":"VARIABLE","value":"C"}'
      )
      expect(containsBC).toBe(false)
    })

    test('Consensus Theorem AND with different order: (B+C) * (A+B) * (A+!C) = (A+B) * (A+!C)', () => {
      // Same test but with a different term order
      const expr = parseExpression('(B+C) * (A+B) * (A+!C)')
      const result = simplify(expr, consensusRules)

      // Should have applied the consensus rule
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].ruleName).toBe('Consensus Theorem AND')

      // The final expression should have B+C removed
      const resultStr = JSON.stringify(result.finalExpression)
      const containsBC = resultStr.includes(
        '"type":"OR","left":{"type":"VARIABLE","value":"B"},"right":{"type":"VARIABLE","value":"C"}'
      )
      expect(containsBC).toBe(false)
    })

    test('Should not apply consensus when pattern does not match', () => {
      // These terms don't form a consensus triple
      const expr = parseExpression('(A+B) * (C+D) * (E+F)')
      const result = simplify(expr, consensusRules)

      // Should not have applied any consensus rules
      expect(result.steps.length).toBe(0)
    })
  })

  describe('Complex Expressions', () => {
    test('Consensus Theorem in complex expressions', () => {
      // A more complex expression containing a consensus pattern
      const expr = parseExpression('(A*B) + (A*!C) + (B*C) + D')

      // Use both consensus rules and derived rules
      const rules = [...consensusRules, ...getDerivedRules()]
      const result = simplify(expr, rules)

      // Should have applied the consensus rule
      expect(result.steps.length).toBeGreaterThan(0)

      // The expression should be simplified by removing B*C
      const resultStr = JSON.stringify(result.finalExpression)
      const containsBC = resultStr.includes(
        '"type":"AND","left":{"type":"VARIABLE","value":"B"},"right":{"type":"VARIABLE","value":"C"}'
      )
      const containsAB = resultStr.includes(
        '"type":"AND","left":{"type":"VARIABLE","value":"A"},"right":{"type":"VARIABLE","value":"B"}'
      )
      const containsANotC =
        resultStr.includes(
          '"type":"AND","left":{"type":"VARIABLE","value":"A"},"right":{"type":"NOT"'
        ) && resultStr.includes('"value":"C"')

      // Only A*B and A*!C should remain, B*C should be gone
      expect(containsAB).toBe(true)
      expect(containsANotC).toBe(true)
      expect(containsBC).toBe(false) // B*C should have been removed

      // This is a complex check because the exact structure may vary, so we're verifying
      // that the output doesn't have the eliminated term but has the other terms
    })
  })
})
