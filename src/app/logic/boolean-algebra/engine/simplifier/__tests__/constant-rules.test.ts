import { describe, expect, test } from 'vitest'
import { getConstantRules } from '../rules/constant-rules'
import { BooleanExpression } from '../../ast/types'
import { expressionsEqual } from '../../utils'
import { parseExpression, expressionToBooleanString } from '../../parser' // Corrected import for expressionToBooleanString

describe('Recursive Constant Simplification Rules', () => {
  const rules = getConstantRules()
  expect(rules.length).toBe(1)
  const recursiveConstantRule = rules[0]
  expect(recursiveConstantRule.info.name).toBe('Recursive Constant Simplification')

  const applyRule = (expr: BooleanExpression): BooleanExpression => {
    // Note: The rule itself should handle returning the original expr if no changes are made.
    // The canApply check here is mostly for clarity in tests, the rule's apply should be robust.
    if (recursiveConstantRule.canApply(expr)) {
      return recursiveConstantRule.apply(expr)
    }
    return expr
  }

  // 1. Functional Correctness Tests
  describe('1. Functional Correctness Tests', () => {
    test('A & true = A', () => {
      const expr = parseExpression('A & 1')!
      const expected = parseExpression('A')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })
    test('true & A = A', () => {
      const expr = parseExpression('1 & A')!
      const expected = parseExpression('A')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })
    test('A & false = false', () => {
      const expr = parseExpression('A & 0')!
      const expected = parseExpression('0')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })
    test('false & A = false', () => {
      const expr = parseExpression('0 & A')!
      const expected = parseExpression('0')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })
    test('A + true = true', () => {
      const expr = parseExpression('A + 1')!
      const expected = parseExpression('1')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })
    test('true + A = true', () => {
      const expr = parseExpression('1 + A')!
      const expected = parseExpression('1')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })
    test('A + false = A', () => {
      const expr = parseExpression('A + 0')!
      const expected = parseExpression('A')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })
    test('false + A = A', () => {
      const expr = parseExpression('0 + A')!
      const expected = parseExpression('A')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })
    test('!true = false', () => {
      const expr = parseExpression('!1')!
      const expected = parseExpression('0')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })
    test('!false = true', () => {
      const expr = parseExpression('!0')!
      const expected = parseExpression('1')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })

    test('Recursive: (A & true) & (B + false) = A & B', () => {
      const expr = parseExpression('(A & 1) & (B + 0)')!
      const expected = parseExpression('A & B')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })

    test('Recursive: !(true & A) + (false + B) = !A + B', () => {
      const expr = parseExpression('!(1 & A) + (0 + B)')!
      const expected = parseExpression('!A + B')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })

    test('Recursive: (X & (Y + false)) & !true = false', () => {
      const expr = parseExpression('(X & (Y + 0)) & !1')!
      const expected = parseExpression('0')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })
  })

  // 2. Happy-Path Tests
  describe('2. Happy-Path Tests', () => {
    test('Rule metadata is correct', () => {
      expect(recursiveConstantRule.info.name).toBe('Recursive Constant Simplification')
      expect(recursiveConstantRule.info.description).toBeDefined()
      expect(recursiveConstantRule.info.formula).toBeDefined()
      expect(typeof recursiveConstantRule.canApply).toBe('function')
      expect(typeof recursiveConstantRule.apply).toBe('function')
    })

    test('Simplifies expression with multiple nested constants: ((A+0)*1) + (B*0 + !(1*0)) = A + 1 = 1', () => {
      const expr = parseExpression('((A+0)*1) + (B*0 + !(1*0))')!
      const expected = parseExpression('1')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })
  })

  // 3. Negative-Path Tests
  describe('3. Negative-Path Tests', () => {
    test('Expression with no constants remains unchanged: A & B', () => {
      const expr = parseExpression('A & B')!
      const result = applyRule(expr)
      // If no change, the rule should return the same object instance.
      expect(result).toBe(expr)
      expect(expressionsEqual(result, expr)).toBe(true)
    })

    test('Expression already fully simplified with constants: (A & false) = false', () => {
      const expr = parseExpression('A & 0')!
      const simplifiedOnce = applyRule(expr) // this is '0'
      const simplifiedTwice = applyRule(simplifiedOnce) // applying to '0' again

      // simplifiedOnce should be a new object { type: 'CONSTANT', value: false }
      expect(simplifiedOnce.type).toBe('CONSTANT')
      expect(simplifiedOnce.value).toBe(false)

      // Applying the rule to an already simplified constant should return the same constant object.
      expect(simplifiedTwice).toBe(simplifiedOnce)
      expect(expressionsEqual(simplifiedTwice, simplifiedOnce)).toBe(true)
    })
  })

  // 4. Equivalence-Partitioning Tests
  describe('4. Equivalence-Partitioning Tests', () => {
    test('Partition: Expressions with constants vs. no constants', () => {
      const exprWithConstants = parseExpression('A + (B & 1)')!
      const exprWithoutConstants = parseExpression('C + (D & E)')!
      const expectedWithConstants = parseExpression('A+B')!

      expect(expressionsEqual(applyRule(exprWithConstants), expectedWithConstants)).toBe(true)
      // For expression without constants, expect the same object instance back
      expect(applyRule(exprWithoutConstants)).toBe(exprWithoutConstants)
    })

    test('Partition: Expressions simplifying to a variable vs. a constant', () => {
      const exprToVar = parseExpression('X & 1')!
      const exprToConst = parseExpression('X & 0')!
      const expectedVar = parseExpression('X')!
      const expectedConst = parseExpression('0')!

      expect(expressionsEqual(applyRule(exprToVar), expectedVar)).toBe(true)
      expect(expressionsEqual(applyRule(exprToConst), expectedConst)).toBe(true)
    })
  })

  // 5. Boundary-Value Tests
  describe('5. Boundary-Value Tests', () => {
    test('Single variable: A (no change)', () => {
      const expr = parseExpression('A')!
      expect(applyRule(expr)).toBe(expr) // Should return same instance
    })
    test('Single constant: 1 (no change)', () => {
      const expr = parseExpression('1')!
      expect(applyRule(expr)).toBe(expr) // Should return same instance
    })
    test('Deeply nested constants: (((A & 1) + 0) & !(0)) + 0 = A + 0 = A', () => {
      const expr = parseExpression('(((A & 1) + 0) & !0) + 0')!
      const expected = parseExpression('A')!
      expect(expressionsEqual(applyRule(expr), expected)).toBe(true)
    })
  })

  // 6. Error-Handling Tests
  describe('6. Error-Handling Tests', () => {
    test('apply gracefully handles already simplified constant: 0', () => {
      const expr: BooleanExpression = { type: 'CONSTANT', value: false }
      const result = applyRule(expr)
      expect(result).toBe(expr) // Should return same instance
      expect(() => applyRule(expr)).not.toThrow()
    })

    test('apply gracefully handles already simplified constant: 1', () => {
      const expr: BooleanExpression = { type: 'CONSTANT', value: true }
      const result = applyRule(expr)
      expect(result).toBe(expr) // Should return same instance
      expect(() => applyRule(expr)).not.toThrow()
    })
  })

  // 7. Dependency-Failure Tests (Immutability of input)
  describe('7. Immutability Tests', () => {
    test('apply function does not mutate the original input expression object', () => {
      const expr = parseExpression('(A & 1) + (B & 0)')!
      const originalExprString = expressionToBooleanString(expr) // Capture state before

      const result = applyRule(expr)

      // Check if the original expression string remains the same
      expect(expressionToBooleanString(expr)).toBe(originalExprString)

      // If a change was made, the result should be a new object instance
      if (originalExprString !== expressionToBooleanString(result)) {
        expect(result).not.toBe(expr)
      } else {
        // If no change was made by the rule, it might return the same instance or an equivalent new one.
        // The constant rule is designed to return the same instance if no logical change.
        expect(result).toBe(expr)
      }
    })

    test('Input expression is not mutated when rule applies', () => {
      const expr = parseExpression('A & 1')!
      const originalJson = JSON.stringify(expr)
      const result = applyRule(expr)
      expect(JSON.stringify(expr)).toBe(originalJson) // Original expr unchanged
      expect(result.type).toBe('VARIABLE') // Result is simplified
    })

    test('Input expression is not mutated when rule does not apply', () => {
      const expr = parseExpression('A & B')!
      const originalJson = JSON.stringify(expr)
      const result = applyRule(expr)
      expect(JSON.stringify(expr)).toBe(originalJson) // Original expr unchanged
      expect(result).toBe(expr) // Result is the same instance
    })
  })

  // 8. State-Transition Tests (Conceptual: before/after recursive transformation)
  describe('8. State-Transition Tests', () => {
    test('Transforms (A & (B + 0)) to (A & B)', () => {
      const before = parseExpression('(A & (B + 0))')!
      const after = parseExpression('(A & B)')!
      expect(expressionsEqual(applyRule(before), after)).toBe(true)
    })
    test('Transforms ((!1 + C) & D) to (0 + C) & D = C & D', () => {
      const before = parseExpression('(!1 + C) & D')!
      const after = parseExpression('C & D')!
      expect(expressionsEqual(applyRule(before), after)).toBe(true)
    })
  })
})
