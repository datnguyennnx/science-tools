import { describe, it, expect } from 'vitest'
import { evaluateExpression, generateTruthTable } from '../evaluate'
import { parseExpression } from '../../parser'

// === Functional Correctness Tests ===
describe('evaluateExpression - Functional Correctness', () => {
  it('evaluates constants correctly', () => {
    expect(evaluateExpression({ type: 'CONSTANT', value: true }, {})).toBe(true)
    expect(evaluateExpression({ type: 'CONSTANT', value: false }, {})).toBe(false)
  })

  it('evaluates variables correctly', () => {
    expect(evaluateExpression({ type: 'VARIABLE', value: 'A' }, { A: true })).toBe(true)
    expect(evaluateExpression({ type: 'VARIABLE', value: 'A' }, { A: false })).toBe(false)
    expect(evaluateExpression({ type: 'VARIABLE', value: 'A' }, {})).toBe(false)
  })

  it('evaluates NOT, AND, OR expressions', () => {
    const notA = parseExpression('!A')
    expect(evaluateExpression(notA, { A: true })).toBe(false)
    expect(evaluateExpression(notA, { A: false })).toBe(true)

    const andExpr = parseExpression('A*B')
    expect(evaluateExpression(andExpr, { A: true, B: true })).toBe(true)
    expect(evaluateExpression(andExpr, { A: true, B: false })).toBe(false)

    const orExpr = parseExpression('A+B')
    expect(evaluateExpression(orExpr, { A: false, B: false })).toBe(false)
    expect(evaluateExpression(orExpr, { A: true, B: false })).toBe(true)
  })
})

describe('generateTruthTable - Functional Correctness', () => {
  it('generates correct truth table for single variable', () => {
    const expr = parseExpression('A')
    const table = generateTruthTable(expr, ['A'])
    expect(table).toEqual([
      { variables: { A: false }, result: false },
      { variables: { A: true }, result: true },
    ])
  })

  it('generates correct truth table for AND', () => {
    const expr = parseExpression('A*B')
    const table = generateTruthTable(expr, ['A', 'B'])
    expect(table).toEqual([
      { variables: { A: false, B: false }, result: false },
      { variables: { A: false, B: true }, result: false },
      { variables: { A: true, B: false }, result: false },
      { variables: { A: true, B: true }, result: true },
    ])
  })
})

// === Happy-Path Tests ===
describe('evaluateExpression - Happy Path', () => {
  it('evaluates complex nested expressions', () => {
    const expr = parseExpression('!(A+B)*C+!D')
    expect(evaluateExpression(expr, { A: false, B: false, C: true, D: false })).toBe(true)
  })
})

describe('generateTruthTable - Happy Path', () => {
  it('works with no variables (constant expression)', () => {
    const expr = parseExpression('1')
    const table = generateTruthTable(expr, [])
    expect(table).toEqual([{ variables: {}, result: true }])
  })
})

// === Negative-Path and Error-Handling Tests ===
describe('evaluateExpression - Negative/Error Path', () => {
  it('throws for unknown expression type', () => {
    // @ts-expect-error Testing unknown type
    expect(() => evaluateExpression({ type: 'UNKNOWN' }, {})).toThrow('Unknown expression type')
  })

  it('throws for missing operands in AND/OR/NOT', () => {
    expect(() => evaluateExpression({ type: 'AND' }, {})).toThrow()
    expect(() =>
      evaluateExpression({ type: 'OR', left: { type: 'VARIABLE', value: 'A' } }, {})
    ).toThrow()
    expect(() => evaluateExpression({ type: 'NOT' }, {})).toThrow()
  })
})

describe('generateTruthTable - Negative/Error Path', () => {
  it('handles empty variable list', () => {
    const expr = parseExpression('A')
    // Should still return one row with empty variable assignment
    const table = generateTruthTable(expr, [])
    expect(table).toEqual([{ variables: {}, result: false }])
  })

  it('handles empty expression (throws in parseExpression)', () => {
    expect(() => parseExpression('')).toThrow()
  })
})

// === Equivalence-Partitioning Tests ===
describe('evaluateExpression - Equivalence Partitioning', () => {
  it('returns false for missing variable assignment', () => {
    const expr = parseExpression('A')
    expect(evaluateExpression(expr, {})).toBe(false)
  })

  it('returns correct result for all partitions of AND', () => {
    const expr = parseExpression('A*B')
    expect(evaluateExpression(expr, { A: false, B: false })).toBe(false)
    expect(evaluateExpression(expr, { A: true, B: false })).toBe(false)
    expect(evaluateExpression(expr, { A: false, B: true })).toBe(false)
    expect(evaluateExpression(expr, { A: true, B: true })).toBe(true)
  })
})

describe('generateTruthTable - Equivalence Partitioning', () => {
  it('returns all possible combinations for 3 variables', () => {
    const expr = parseExpression('A+B+C')
    const table = generateTruthTable(expr, ['A', 'B', 'C'])
    expect(table.length).toBe(8)
    // Spot check a few rows
    expect(table[0].variables).toEqual({ A: false, B: false, C: false })
    expect(table[7].variables).toEqual({ A: true, B: true, C: true })
  })
})

// === Boundary-Value Tests ===
describe('evaluateExpression - Boundary Values', () => {
  it('handles single variable', () => {
    const expr = parseExpression('A')
    expect(evaluateExpression(expr, { A: true })).toBe(true)
    expect(evaluateExpression(expr, { A: false })).toBe(false)
  })

  it('handles deeply nested expressions', () => {
    let exprStr = 'A'
    for (let i = 0; i < 10; i++) {
      exprStr = `(${exprStr})`
    }
    const expr = parseExpression(exprStr)
    expect(evaluateExpression(expr, { A: true })).toBe(true)
  })
})

describe('generateTruthTable - Boundary Values', () => {
  it('handles max reasonable variables (5)', () => {
    const expr = parseExpression('A*B*C*D*E')
    const table = generateTruthTable(expr, ['A', 'B', 'C', 'D', 'E'])
    expect(table.length).toBe(32)
    // All false except last row
    expect(table[31].result).toBe(true)
    expect(table.slice(0, 31).every(row => row.result === false)).toBe(true)
  })
})
