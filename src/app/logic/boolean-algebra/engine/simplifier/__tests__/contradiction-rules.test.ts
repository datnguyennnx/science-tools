import { describe, expect, test } from 'vitest'
import { getContradictionRules } from '../rules/contradiction-rules'
import { BooleanExpression } from '../../ast/types'
import { expressionsEqual } from '../../utils'
import { parseExpression } from '../../parser'

describe('Recursive Contradiction and Tautology Rules', () => {
  const rules = getContradictionRules()
  const deepContradictionRule = rules.find(
    rule => rule.info.name === 'Deep Contradiction Detection'
  )
  const tautologyRule = rules.find(rule => rule.info.name === 'Tautology Recognition')
  const redundancyAndRule = rules.find(
    rule => rule.info.name === 'Redundancy (AND terms with complement)'
  )
  const redundancyOrRule = rules.find(
    rule => rule.info.name === 'Redundancy (OR terms with complement)'
  )

  expect(deepContradictionRule).toBeDefined()
  expect(tautologyRule).toBeDefined()
  expect(redundancyAndRule).toBeDefined()
  expect(redundancyOrRule).toBeDefined()

  const applyRule = (
    rule: typeof deepContradictionRule,
    expr: BooleanExpression
  ): BooleanExpression => {
    if (rule && rule.canApply(expr)) {
      return rule.apply(expr)
    }
    return expr
  }

  // --- Contradiction Tests (A & !A = 0) ---
  describe('Deep Contradiction Detection (A & !A = 0)', () => {
    // 1. Functional Correctness Tests
    describe('1. Functional Correctness Tests', () => {
      test('Simple contradiction: A & !A = 0', () => {
        const expr = parseExpression('A & !A')!
        const expected = parseExpression('0')!
        expect(expressionsEqual(applyRule(deepContradictionRule, expr), expected)).toBe(true)
      })
      test('Simple contradiction reversed: !A & A = 0', () => {
        const expr = parseExpression('!A & A')!
        const expected = parseExpression('0')!
        expect(expressionsEqual(applyRule(deepContradictionRule, expr), expected)).toBe(true)
      })
      test('Complex inner expression: (B+C) & !(B+C) = 0', () => {
        const expr = parseExpression('(B+C) & !(B+C)')!
        const expected = parseExpression('0')!
        expect(expressionsEqual(applyRule(deepContradictionRule, expr), expected)).toBe(true)
      })
      test('Recursive: X & (A & !A) results in X & 0', () => {
        const expr = parseExpression('X & (A & !A)')!
        const expected = parseExpression('X & 0')!
        expect(expressionsEqual(applyRule(deepContradictionRule, expr), expected)).toBe(true)
      })
      test('Recursive: (A & !A) & X results in 0 & X', () => {
        const expr = parseExpression('(A & !A) & X')!
        const expected = parseExpression('0 & X')!
        expect(expressionsEqual(applyRule(deepContradictionRule, expr), expected)).toBe(true)
      })
      test('Recursive within OR: Y + (A & !A) results in Y + 0', () => {
        const expr = parseExpression('Y + (A & !A)')!
        const expected = parseExpression('Y+0')!
        expect(expressionsEqual(applyRule(deepContradictionRule, expr), expected)).toBe(true)
      })
      test('Recursive deeper: X & (Y + (A & !A)) results in X & (Y+0)', () => {
        const expr = parseExpression('X & (Y + (A & !A))')!
        const expected = parseExpression('X & (Y+0)')!
        expect(expressionsEqual(applyRule(deepContradictionRule, expr), expected)).toBe(true)
      })
    })

    // 2. Happy-Path Tests
    describe('2. Happy-Path Tests', () => {
      test('Rule metadata is correct', () => {
        expect(deepContradictionRule!.info.name).toBe('Deep Contradiction Detection')
        expect(deepContradictionRule!.info.description).toBeDefined()
        expect(deepContradictionRule!.info.formula).toBe('A \\land \\lnot A = 0')
      })
      test('Flat structure with contradiction: A & B & !A = 0', () => {
        const expr = parseExpression('A & B & !A')!
        const expected = parseExpression('0')!
        expect(expressionsEqual(applyRule(deepContradictionRule, expr), expected)).toBe(true)
      })
    })

    // 3. Negative-Path Tests
    describe('3. Negative-Path Tests', () => {
      test('No contradiction: A & B', () => {
        const expr = parseExpression('A & B')!
        expect(applyRule(deepContradictionRule, expr)).toBe(expr)
      })
      test('No contradiction: A & !C', () => {
        const expr = parseExpression('A & !C')!
        expect(applyRule(deepContradictionRule, expr)).toBe(expr)
      })
      test('Not an AND expression: A + !A (this is for tautology rule)', () => {
        const expr = parseExpression('A + !A')!
        expect(applyRule(deepContradictionRule, expr)).toBe(expr)
      })
    })

    // 4. Equivalence-Partitioning Tests
    describe('4. Equivalence-Partitioning Tests', () => {
      test('Partition: Contradiction present vs. not present', () => {
        const exprWithContradiction = parseExpression('(X & !X) & Y')!
        const expectedContradiction = parseExpression('0 & Y')!
        const exprWithoutContradiction = parseExpression('(A & B) & C')!

        expect(
          expressionsEqual(
            applyRule(deepContradictionRule, exprWithContradiction),
            expectedContradiction
          )
        ).toBe(true)
        expect(applyRule(deepContradictionRule, exprWithoutContradiction)).toBe(
          exprWithoutContradiction
        )
      })
    })

    // 5. Boundary-Value Tests
    describe('5. Boundary-Value Tests', () => {
      test('Single variable: A (no change)', () => {
        const expr = parseExpression('A')!
        expect(applyRule(deepContradictionRule, expr)).toBe(expr)
      })
      test('Single constant: 0 (no change by this specific rule, though canApply might be true due to recursion check)', () => {
        const expr = parseExpression('0')!
        expect(applyRule(deepContradictionRule, expr)).toBe(expr)
      })
      test('Deeply nested contradiction: (Z + (Y & (X & !X))) should simplify inner part', () => {
        const expr = parseExpression('(Z + (Y & (X & !X)))')!
        const expected = parseExpression('(Z + (Y & 0))')!
        expect(expressionsEqual(applyRule(deepContradictionRule, expr), expected)).toBe(true)
      })
    })

    // 6. Error-Handling Tests
    describe('6. Error-Handling Tests', () => {
      test('Handles already simplified constant 0', () => {
        const expr = parseExpression('0')!
        expect(applyRule(deepContradictionRule, expr)).toBe(expr)
        expect(() => applyRule(deepContradictionRule, expr)).not.toThrow()
      })
    })

    // 7. Immutability Tests
    describe('7. Immutability Tests', () => {
      test('apply function does not mutate the original input expression', () => {
        const expr = parseExpression('A & (B & !B)')!
        const originalJson = JSON.stringify(expr)
        const result = applyRule(deepContradictionRule, expr)
        expect(JSON.stringify(expr)).toBe(originalJson)
        // If changed, result should be a new instance
        if (!expressionsEqual(result, expr)) {
          expect(result).not.toBe(expr)
        }
      })
    })

    // 8. State-Transition Tests
    describe('8. State-Transition Tests', () => {
      test('Transforms A & (!A & B) to 0', () => {
        const expr = parseExpression('A & (!A & B)')!
        const expected = parseExpression('0')!
        expect(expressionsEqual(applyRule(deepContradictionRule, expr), expected)).toBe(true)
      })

      test('Transforms X & (A & !A) to X & 0', () => {
        const expr = parseExpression('X & (A & !A)')!
        const expected = parseExpression('X & 0')!
        expect(expressionsEqual(applyRule(deepContradictionRule, expr), expected)).toBe(true)
      })
    })
  })

  // --- Tautology Tests (A + !A = 1) ---
  describe('Tautology Recognition (A + !A = 1)', () => {
    // 1. Functional Correctness Tests
    describe('1. Functional Correctness Tests', () => {
      test('Simple tautology: A + !A = 1', () => {
        const expr = parseExpression('A + !A')!
        const expected = parseExpression('1')!
        expect(expressionsEqual(applyRule(tautologyRule, expr), expected)).toBe(true)
      })
      test('Simple tautology reversed: !A + A = 1', () => {
        const expr = parseExpression('!A + A')!
        const expected = parseExpression('1')!
        expect(expressionsEqual(applyRule(tautologyRule, expr), expected)).toBe(true)
      })
      test('Complex inner expression: (B&C) + !(B&C) = 1', () => {
        const expr = parseExpression('(B&C) + !(B&C)')!
        const expected = parseExpression('1')!
        expect(expressionsEqual(applyRule(tautologyRule, expr), expected)).toBe(true)
      })
      test('Recursive: X + (A + !A) results in X + 1', () => {
        const expr = parseExpression('X + (A + !A)')!
        const expected = parseExpression('X + 1')!
        expect(expressionsEqual(applyRule(tautologyRule, expr), expected)).toBe(true)
      })
      test('Recursive: (A + !A) + X results in 1 + X', () => {
        const expr = parseExpression('(A + !A) + X')!
        const expected = parseExpression('1 + X')!
        expect(expressionsEqual(applyRule(tautologyRule, expr), expected)).toBe(true)
      })
      test('Recursive within AND: Y & (A + !A) results in Y & 1', () => {
        const expr = parseExpression('Y & (A + !A)')!
        const expected = parseExpression('Y & 1')!
        expect(expressionsEqual(applyRule(tautologyRule, expr), expected)).toBe(true)
      })
    })

    // 2. Happy-Path Tests
    describe('2. Happy-Path Tests', () => {
      test('Rule metadata is correct', () => {
        expect(tautologyRule!.info.name).toBe('Tautology Recognition')
        expect(tautologyRule!.info.description).toBeDefined()
        expect(tautologyRule!.info.formula).toBe('A \\lor \\lnot A = 1')
      })
    })

    // 3. Negative-Path Tests
    describe('3. Negative-Path Tests', () => {
      test('No tautology: A + B', () => {
        const expr = parseExpression('A + B')!
        expect(applyRule(tautologyRule, expr)).toBe(expr)
      })
      test('No tautology: A + !C', () => {
        const expr = parseExpression('A + !C')!
        expect(applyRule(tautologyRule, expr)).toBe(expr)
      })
      test('Not an OR expression: A & !A (this is for contradiction rule)', () => {
        const expr = parseExpression('A & !A')!
        expect(applyRule(tautologyRule, expr)).toBe(expr)
      })
    })

    // 4. Equivalence-Partitioning Tests
    describe('4. Equivalence-Partitioning Tests', () => {
      test('Partition: Tautology present vs. not present', () => {
        const exprWithTautology = parseExpression('(X + !X) + Y')!
        const exprWithoutTautology = parseExpression('(X + Z) + Y')!
        const expectedTautology = parseExpression('(1) + Y')!
        expect(
          expressionsEqual(applyRule(tautologyRule, exprWithTautology), expectedTautology)
        ).toBe(true)
        expect(applyRule(tautologyRule, exprWithoutTautology)).toBe(exprWithoutTautology)
      })
    })

    // 5. Boundary-Value Tests
    describe('5. Boundary-Value Tests', () => {
      test('Single variable: B (no change)', () => {
        const expr = parseExpression('B')!
        expect(applyRule(tautologyRule, expr)).toBe(expr)
      })
      test('Single constant: 1 (no change by this specific rule)', () => {
        const expr = parseExpression('1')!
        expect(applyRule(tautologyRule, expr)).toBe(expr)
      })
      test('Deeply nested tautology: (C & (D + (E + !E))) should simplify inner part', () => {
        const expr = parseExpression('(C & (D + (E + !E)))')!
        const expected = parseExpression('(C & (D + 1))')!
        expect(expressionsEqual(applyRule(tautologyRule, expr), expected)).toBe(true)
      })
    })

    // 6. Error-Handling Tests
    describe('6. Error-Handling Tests', () => {
      test('Handles already simplified constant 1', () => {
        const expr = parseExpression('1')!
        expect(applyRule(tautologyRule, expr)).toBe(expr)
        expect(() => applyRule(tautologyRule, expr)).not.toThrow()
      })
    })

    // 7. Immutability Tests
    describe('7. Immutability Tests', () => {
      test('apply function does not mutate the original input expression', () => {
        const expr = parseExpression('X + (Y + !Y)')!
        const originalJson = JSON.stringify(expr) // Using JSON.stringify for a deep structural snapshot
        const result = applyRule(tautologyRule, expr)
        expect(JSON.stringify(expr)).toBe(originalJson) // Check if original structure is unchanged
        // If changed, result should be a new instance
        if (!expressionsEqual(result, expr)) {
          expect(result).not.toBe(expr)
        }
      })
    })

    // 8. State-Transition Tests
    describe('8. State-Transition Tests', () => {
      test('Transforms X + (A + !A) to X + 1', () => {
        const before = parseExpression('X + (A + !A)')!
        const after = parseExpression('X+1')!
        expect(expressionsEqual(applyRule(tautologyRule, before), after)).toBe(true)
      })
    })
  })

  // --- Redundancy Rule Tests ---
  describe('Redundancy Rules', () => {
    describe('Redundancy (AND terms with complement): (X*Y) + (X*!Y) = X', () => {
      const rule = redundancyAndRule!
      test('Basic case: (A*B) + (A*!B) = A', () => {
        const expr = parseExpression('(A*B)+(A*!B)')!
        const expected = parseExpression('A')!
        expect(rule.canApply(expr)).toBe(true)
        expect(expressionsEqual(rule.apply(expr), expected)).toBe(true)
      })
      test('Commuted X: (B*A) + (!B*A) = A', () => {
        const expr = parseExpression('(B*A)+(!B*A)')!
        const expected = parseExpression('A')!
        expect(rule.canApply(expr)).toBe(true)
        expect(expressionsEqual(rule.apply(expr), expected)).toBe(true)
      })
      test('No change: (A*B) + (C*!D)', () => {
        const expr = parseExpression('(A*B)+(C*!D)')!
        expect(rule.canApply(expr)).toBe(false)
      })
    })

    describe('Redundancy (OR terms with complement): (X+Y) * (X+!Y) = X', () => {
      const rule = redundancyOrRule!
      test('Basic case: (A+B) * (A+!B) = A', () => {
        const expr = parseExpression('(A+B)*(A+!B)')!
        const expected = parseExpression('A')!
        expect(rule.canApply(expr)).toBe(true)
        expect(expressionsEqual(rule.apply(expr), expected)).toBe(true)
      })
      test('Commuted X: (B+A) * (!B+A) = A', () => {
        const expr = parseExpression('(B+A)*(!B+A)')!
        const expected = parseExpression('A')!
        expect(rule.canApply(expr)).toBe(true)
        expect(expressionsEqual(rule.apply(expr), expected)).toBe(true)
      })
    })
  })
})
