import { describe, it, expect } from 'vitest'
import { parseExpression } from '../../parser'
import { evaluateExpression } from '../evaluate'
import {
  createXOR,
  createNAND,
  createNOR,
  xor,
  nand,
  nor,
  xnor,
  implies,
  iff,
} from '../derived-ops'

describe('Derived Boolean Operations', () => {
  // Helper function to test truth table
  const testTruthTable = (
    operation: (a: string, b: string) => string,
    truthTable: [boolean, boolean, boolean][]
  ) => {
    for (const [inputA, inputB, expected] of truthTable) {
      // Instead of using negated variables, always use A and B directly
      const expr = operation('A', 'B')
      const parsedExpr = parseExpression(expr)

      // Create variable values map
      const variableValues = {
        A: inputA,
        B: inputB,
      }

      // Evaluate the expression with these values
      const result = evaluateExpression(parsedExpr, variableValues)
      expect(result).toBe(expected)
    }
  }

  describe('XOR Operation', () => {
    it('should be true when exactly one input is true', () => {
      const xorTruthTable: [boolean, boolean, boolean][] = [
        [false, false, false],
        [true, false, true],
        [false, true, true],
        [true, true, false],
      ]

      testTruthTable(createXOR, xorTruthTable)
    })

    it('should handle complex expressions in XOR', () => {
      const expr = createXOR('(A + B)', '(C * D)')
      const parsedExpr = parseExpression(expr)

      // Test a few cases
      expect(evaluateExpression(parsedExpr, { A: true, B: false, C: true, D: true })).toBe(false)
      expect(evaluateExpression(parsedExpr, { A: true, B: false, C: false, D: true })).toBe(true)
      expect(evaluateExpression(parsedExpr, { A: false, B: false, C: true, D: false })).toBe(false)
    })
  })

  describe('NAND Operation', () => {
    it('should be false only when both inputs are true', () => {
      const nandTruthTable: [boolean, boolean, boolean][] = [
        [false, false, true],
        [true, false, true],
        [false, true, true],
        [true, true, false],
      ]

      testTruthTable(createNAND, nandTruthTable)
    })

    it('should handle complex expressions in NAND', () => {
      const expr = createNAND('(A + B)', '(C * D)')
      const parsedExpr = parseExpression(expr)

      // Test a few cases
      expect(evaluateExpression(parsedExpr, { A: true, B: false, C: true, D: true })).toBe(false)
      expect(evaluateExpression(parsedExpr, { A: true, B: false, C: false, D: true })).toBe(true)
      expect(evaluateExpression(parsedExpr, { A: false, B: false, C: true, D: false })).toBe(true)
    })
  })

  describe('NOR Operation', () => {
    it('should be true only when both inputs are false', () => {
      const norTruthTable: [boolean, boolean, boolean][] = [
        [false, false, true],
        [true, false, false],
        [false, true, false],
        [true, true, false],
      ]

      testTruthTable(createNOR, norTruthTable)
    })

    it('should handle complex expressions in NOR', () => {
      const expr = createNOR('(A + B)', '(C * D)')
      const parsedExpr = parseExpression(expr)

      // Test a few cases
      expect(evaluateExpression(parsedExpr, { A: false, B: false, C: false, D: false })).toBe(true)
      expect(evaluateExpression(parsedExpr, { A: true, B: false, C: false, D: false })).toBe(false)
      expect(evaluateExpression(parsedExpr, { A: false, B: false, C: true, D: true })).toBe(false)
    })
  })

  describe('Combining Derived Operations', () => {
    it('should correctly combine multiple derived operations', () => {
      // (A XOR B) NAND (C NOR D)
      const expr = createNAND(createXOR('A', 'B'), createNOR('C', 'D'))
      const parsedExpr = parseExpression(expr)

      // A=true, B=false, C=false, D=false: (true XOR false) NAND (false NOR false) = true NAND true = false
      expect(evaluateExpression(parsedExpr, { A: true, B: false, C: false, D: false })).toBe(false)

      // A=true, B=true, C=false, D=false: (true XOR true) NAND (false NOR false) = false NAND true = true
      expect(evaluateExpression(parsedExpr, { A: true, B: true, C: false, D: false })).toBe(true)

      // A=false, B=false, C=true, D=false: (false XOR false) NAND (true NOR false) = false NAND false = true
      expect(evaluateExpression(parsedExpr, { A: false, B: false, C: true, D: false })).toBe(true)
    })
  })
})

describe('Negative-Path and Error-Handling Tests', () => {
  it('should throw or produce invalid expressions for empty input', () => {
    expect(() => createXOR('', '')).not.toThrow() // Should still return a string, but not valid logic
    expect(() => createNAND('', '')).not.toThrow()
    expect(() => createNOR('', '')).not.toThrow()
  })

  it('should handle single variable and constant inputs gracefully', () => {
    expect(createXOR('A', '1')).toMatch(/\+/)
    expect(createNAND('A', '0')).toMatch(/!/)
    expect(createNOR('1', '0')).toMatch(/!/)
  })

  it('should handle malformed expressions (unbalanced parens)', () => {
    expect(() => createXOR('A)', '(B')).not.toThrow()
    expect(() => createNAND('A)', '(B')).not.toThrow()
    expect(() => createNOR('A)', '(B')).not.toThrow()
  })

  it('should handle non-string inputs by coercion or error', () => {
    expect(() => createXOR(1, 2)).not.toThrow()
    expect(() => createNAND(true, false)).not.toThrow()
  })
})

describe('Boundary-Value Tests', () => {
  it('should work with minimal valid expressions', () => {
    expect(createXOR('A', 'B')).toBe('((A) + (B)) * !((A) * (B))')
    expect(createNAND('A', 'B')).toBe('!((A) * (B))')
    expect(createNOR('A', 'B')).toBe('!((A) + (B))')
  })

  it('should work with already parenthesized expressions', () => {
    expect(createXOR('(A)', '(B)')).toBe('((A) + (B)) * !((A) * (B))')
  })

  it('should work with negated variables', () => {
    expect(createXOR('!A', '!B')).toMatch(/\+/)
    expect(createNAND('!A', '!B')).toMatch(/!/)
    expect(createNOR('!A', '!B')).toMatch(/!/)
  })
})

describe('Alias Functions', () => {
  it('should produce the same output as the main functions', () => {
    expect(xor('A', 'B')).toBe(createXOR('A', 'B'))
    expect(nand('A', 'B')).toBe(createNAND('A', 'B'))
    expect(nor('A', 'B')).toBe(createNOR('A', 'B'))
  })

  it('xnor, implies, iff should return valid boolean expressions', () => {
    expect(xnor('A', 'B')).toMatch(/!/)
    expect(implies('A', 'B')).toMatch(/\+/)
    expect(iff('A', 'B')).toMatch(/!/)
  })
})
