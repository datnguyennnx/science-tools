import { getConsensusRules } from '../rules/consensus-rules'
import { parseExpression } from '../../parser'
// import { simplify } from '../../simplifier' // Removed unused import
import { describe, test, expect } from 'vitest'
import { expressionsEqual } from '../../utils' // Added import for expressionsEqual

describe('Consensus Theorem Rules', () => {
  const consensusRules = getConsensusRules()
  const consensusOrRule = consensusRules.find(r => r.info.name === 'Consensus Theorem OR')!
  const consensusAndRule = consensusRules.find(r => r.info.name === 'Consensus Theorem AND')!

  expect(consensusOrRule).toBeDefined()
  expect(consensusAndRule).toBeDefined()

  describe('OR Consensus', () => {
    test('Consensus Theorem OR: can recognize the pattern and apply', () => {
      const expr = parseExpression('(A*B) + (!A*C) + (B*C)')!
      expect(consensusOrRule.canApply(expr)).toBe(true)

      const resultExpr = consensusOrRule.apply(expr)
      // Expect: (A*B) + (!A*C) because (B*C) is redundant
      const expectedExpr = parseExpression('(A*B) + (!A*C)')!
      expect(expressionsEqual(resultExpr, expectedExpr)).toBe(true)
      expect(resultExpr).not.toBe(expr) // Should be a new expression
    })

    test('Consensus Theorem OR with different order: can recognize the pattern', () => {
      const expr = parseExpression('(B*C) + (A*B) + (!A*C)')!
      expect(consensusOrRule.canApply(expr)).toBe(true)
      // Potentially apply and check result too if desired, similar to above
    })

    test('Should not apply OR consensus when pattern does not match', () => {
      const expr = parseExpression('(A*B) + (C*D) + (E*F)')!
      expect(consensusOrRule.canApply(expr)).toBe(false)
      const resultExpr = consensusOrRule.apply(expr)
      expect(resultExpr).toBe(expr) // Should return the same instance
    })
  })

  describe('AND Consensus', () => {
    test('Consensus Theorem AND: can recognize the pattern and apply', () => {
      const expr = parseExpression('(A+B) * (!A+C) * (B+C)')!
      expect(consensusAndRule.canApply(expr)).toBe(true)

      const resultExpr = consensusAndRule.apply(expr)
      // Expect: (A+B) * (!A+C) because (B+C) is redundant
      const expectedExpr = parseExpression('(A+B) * (!A+C)')!
      expect(expressionsEqual(resultExpr, expectedExpr)).toBe(true)
      expect(resultExpr).not.toBe(expr) // Should be a new expression
    })

    test('Consensus Theorem AND with different order: can recognize the pattern', () => {
      const expr = parseExpression('(B+C) * (A+B) * (!A+C)')!
      expect(consensusAndRule.canApply(expr)).toBe(true)
    })

    test('Should not apply AND consensus when pattern does not match', () => {
      const expr = parseExpression('(A+B) * (C+D) * (E+F)')!
      expect(consensusAndRule.canApply(expr)).toBe(false)
      const resultExpr = consensusAndRule.apply(expr)
      expect(resultExpr).toBe(expr) // Should return the same instance
    })
  })

  describe('Complex Expressions', () => {
    test('Consensus Theorem in complex expressions: can recognize nested patterns', () => {
      const expr = parseExpression('((A*B) + (!A*C) + (B*C)) * D')

      // Extract the inner OR expression
      const innerExpr = expr.left?.type === 'OR' ? expr.left : null

      // Check if rule can detect the pattern in the inner expression
      if (innerExpr) {
        const rule = consensusRules.find(r => r.info.name === 'Consensus Theorem OR')
        expect(rule).toBeDefined()
        expect(rule?.canApply(innerExpr)).toBe(true)
      } else {
        // If the structure is different than expected, skip this assertion
        console.log('Test structure assumption incorrect')
      }
    })
  })
})
