import { describe, expect, test } from 'vitest'
import { getNegationRules } from '../rules/negation-rules'
import { BooleanExpression } from '../../ast/types'
import { expressionsEqual } from '../../utils'

describe('Negation Simplification Rules', () => {
  const rules = getNegationRules()
  const chainNegationRule = rules[0] // Assuming getNegationRules returns an array with one rule

  // Helper to create expressions with multiple negations
  const createMultipleNegations = (
    count: number,
    innerExpr?: BooleanExpression
  ): BooleanExpression => {
    let expr: BooleanExpression = innerExpr || {
      type: 'VARIABLE',
      value: 'A',
    }

    // Wrap the expression in 'count' negation layers
    for (let i = 0; i < count; i++) {
      expr = {
        type: 'NOT',
        left: expr,
      }
    }

    return expr
  }

  const varA: BooleanExpression = { type: 'VARIABLE', value: 'A' }
  const notA: BooleanExpression = { type: 'NOT', left: varA }

  // Helper function to test a single rule application
  const testNegationRuleApplication = (
    inputExpr: BooleanExpression,
    expectedOutputExpr: BooleanExpression,
    shouldChange: boolean,
    ruleCanApply: boolean = shouldChange // Most of the time, if it changes, it can apply
  ) => {
    const originalJson = JSON.stringify(inputExpr)

    expect(
      chainNegationRule!.canApply(inputExpr),
      `canApply mismatch for input: ${JSON.stringify(inputExpr)}`
    ).toBe(ruleCanApply)

    const result = chainNegationRule!.apply(inputExpr)

    expect(JSON.stringify(inputExpr), 'Input expression should not be mutated.').toBe(originalJson)

    if (shouldChange) {
      expect(
        expressionsEqual(result, expectedOutputExpr),
        `Expected ${JSON.stringify(inputExpr)} -> ${JSON.stringify(
          expectedOutputExpr
        )}, got ${JSON.stringify(result)}`
      ).toBe(true)
      // If a change occurred and it's not structurally identical to input (it shouldn't be if shouldChange is true)
      if (!expressionsEqual(result, inputExpr)) {
        expect(result, 'Result should be a new instance if expression changed.').not.toBe(inputExpr)
      } else {
        // This case might happen if the rule "applies" but results in the same structure.
        // For negation, this is less common unless it's an odd chain becoming a shorter odd chain
        // or an even chain becoming a shorter even chain but still structurally different from !!A -> A.
        // However, if it's !!A -> A, it *is* a change. If it's !!!A -> !A, it *is* a change.
        // The `shouldChange` flag should accurately capture this.
        // If shouldChange is true, we expect a new instance OR a structurally different object.
        // If the result is structurally equal to expectedOutputExpr AND inputExpr,
        // it means expectedOutputExpr was same as inputExpr, which contradicts `shouldChange = true`.
        // So, this path implies result is structurally different from input, thus must be a new instance.
        expect(result, 'Result should be a new instance if shouldChange is true.').not.toBe(
          inputExpr
        )
      }
    } else {
      // No change expected
      expect(
        expressionsEqual(result, inputExpr),
        `Expected ${JSON.stringify(inputExpr)} to remain unchanged.`
      ).toBe(true)
      // If no change is expected, the result should be the same instance.
      expect(result, 'Result should be the same instance if no change was expected.').toBe(
        inputExpr
      )
      // Also ensure it matches the expected output (which should be same as input)
      expect(expressionsEqual(result, expectedOutputExpr)).toBe(true)
    }
  }

  // 1. Functional Correctness Tests
  describe('Functional Correctness', () => {
    test('chain negation rule is defined', () => {
      expect(chainNegationRule).toBeDefined()
      expect(chainNegationRule!.info.name).toBe('Double Negation Elimination (Recursive)')
      expect(chainNegationRule!.canApply).toBeInstanceOf(Function)
      expect(chainNegationRule!.apply).toBeInstanceOf(Function)
    })

    test('canApply detects multiple negations properly', () => {
      // Double negation - should be detected
      const doubleNegation = createMultipleNegations(2)
      expect(chainNegationRule!.canApply(doubleNegation)).toBe(true)

      // Triple negation - should be detected
      const tripleNegation = createMultipleNegations(3)
      expect(chainNegationRule!.canApply(tripleNegation)).toBe(true)

      // Single negation - should NOT be detected by this rule if it only looks for !!A
      // The rule is recursive, so it looks for NOT(NOT(...)). A single NOT will not match.
      const singleNegation = createMultipleNegations(1)
      expect(chainNegationRule!.canApply(singleNegation)).toBe(false)

      // No negation - should not be detected
      const noNegation: BooleanExpression = { type: 'VARIABLE', value: 'A' }
      expect(chainNegationRule!.canApply(noNegation)).toBe(false)
    })

    test('simplifies double negation correctly', () => {
      const doubleNegation = createMultipleNegations(2)
      testNegationRuleApplication(doubleNegation, varA, true)
    })

    test('simplifies triple negation to single negation', () => {
      const tripleNegation = createMultipleNegations(3)
      testNegationRuleApplication(tripleNegation, notA, true)
    })

    test('simplifies quadruple negation correctly', () => {
      const quadrupleNegation = createMultipleNegations(4)
      testNegationRuleApplication(quadrupleNegation, varA, true)
    })
  })

  // 2. Happy-Path Tests
  describe('Happy Path', () => {
    test('detects and simplifies negations in complex expressions', () => {
      const complexExprInput: BooleanExpression = {
        type: 'AND',
        left: createMultipleNegations(2, { type: 'VARIABLE', value: 'X' }),
        right: { type: 'VARIABLE', value: 'B' },
      }
      const complexExprExpected: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'X' },
        right: { type: 'VARIABLE', value: 'B' },
      }
      testNegationRuleApplication(complexExprInput, complexExprExpected, true)
    })

    test('simplifies multiple chained negations', () => {
      const multiChainInput: BooleanExpression = {
        type: 'OR',
        left: createMultipleNegations(4), // Becomes A
        right: createMultipleNegations(3), // Becomes !A
      }
      const multiChainExpected: BooleanExpression = {
        type: 'OR',
        left: varA,
        right: notA,
      }
      testNegationRuleApplication(multiChainInput, multiChainExpected, true)
    })
  })

  // 3. Negative-Path Tests
  describe('Negative Path', () => {
    test('ignores expressions without chained negations if not nested', () => {
      const singleNegation: BooleanExpression = {
        type: 'NOT',
        left: { type: 'VARIABLE', value: 'A' },
      }
      testNegationRuleApplication(singleNegation, singleNegation, false, false)

      const andExpr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'B' },
      }
      testNegationRuleApplication(andExpr, andExpr, false, false)
    })

    test('handles non-negation operators correctly (no !!A pattern)', () => {
      const nonChainedExpr: BooleanExpression = {
        type: 'AND',
        left: { type: 'NOT', left: { type: 'VARIABLE', value: 'A' } },
        right: { type: 'NOT', left: { type: 'VARIABLE', value: 'B' } },
      }
      // Rule canApply is recursive, so it *can* apply to sub-expressions if they had !!.
      // However, for THIS top-level expression, the chainNegationRule specifically
      // looks for NOT(NOT(...)) or NOT(OPERATOR(...)) where OPERATOR might contain NOT(NOT(...)).
      // For '(!A & !B)', canApply at root level should be false as it's not NOT(anything).
      // The rule itself is `applyRecursiveNegation`, which applies `applyDoubleNegation` where `expr.type === 'NOT' && expr.left.type === 'NOT'`.
      // Let's assume the canApply for the top-level rule is smart enough.
      // Given the rule logic, canApply should be false at the root of `!A & !B`
      testNegationRuleApplication(nonChainedExpr, nonChainedExpr, false, false)
    })
  })

  // 4. Equivalence-Partitioning Tests
  describe('Equivalence Partitioning', () => {
    test('different negation chain lengths', () => {
      const noNegation: BooleanExpression = { type: 'VARIABLE', value: 'A' }
      const singleNegation = createMultipleNegations(1)
      const doubleNegation = createMultipleNegations(2)
      const tripleNegation = createMultipleNegations(3)
      const quadrupleNegation = createMultipleNegations(4)
      const quintupleNegation = createMultipleNegations(5)

      testNegationRuleApplication(noNegation, noNegation, false, false)
      testNegationRuleApplication(singleNegation, singleNegation, false, false)
      testNegationRuleApplication(doubleNegation, varA, true, true)
      testNegationRuleApplication(tripleNegation, notA, true, true)
      testNegationRuleApplication(quadrupleNegation, varA, true, true)
      testNegationRuleApplication(quintupleNegation, notA, true, true)
    })

    test('negations with different inner expression types', () => {
      const innerVarA = varA
      const innerAnd: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'X' },
        right: { type: 'VARIABLE', value: 'Y' },
      }
      const innerConst: BooleanExpression = { type: 'CONSTANT', value: true }

      testNegationRuleApplication(createMultipleNegations(2, innerVarA), innerVarA, true)
      testNegationRuleApplication(createMultipleNegations(2, innerAnd), innerAnd, true)
      testNegationRuleApplication(createMultipleNegations(2, innerConst), innerConst, true)
    })
  })

  // 5. Boundary-Value Tests
  describe('Boundary Values', () => {
    test('handles long chains of negations', () => {
      const longChainEven = createMultipleNegations(10) // -> A
      const longChainOdd = createMultipleNegations(11) // -> !A

      testNegationRuleApplication(longChainEven, varA, true)
      testNegationRuleApplication(longChainOdd, notA, true)
    })

    test('handles negations with deeply nested expressions', () => {
      const deepNestedInner: BooleanExpression = {
        type: 'AND',
        left: {
          type: 'OR',
          left: { type: 'VARIABLE', value: 'X' },
          right: { type: 'VARIABLE', value: 'Y' },
        },
        right: { type: 'NOT', left: { type: 'VARIABLE', value: 'C' } },
      }
      const doubleNegDeepInput = createMultipleNegations(2, deepNestedInner)
      const tripleNegDeepInput = createMultipleNegations(3, deepNestedInner)
      const tripleNegDeepExpected: BooleanExpression = {
        type: 'NOT',
        left: deepNestedInner,
      }

      testNegationRuleApplication(doubleNegDeepInput, deepNestedInner, true)
      testNegationRuleApplication(tripleNegDeepInput, tripleNegDeepExpected, true)
    })
  })

  // 6. Error-Handling Tests
  // For negation, "error handling" usually means graceful handling of incomplete structures
  // if the rule is applied to them. The rule should ideally not throw and either
  // return the input as-is or simplify what it can.
  describe('Error Handling (Graceful handling of incomplete structures)', () => {
    test('canApply and apply handle incomplete NOT expressions gracefully', () => {
      // This structure is NOT(NOT(incomplete_operand)).
      // The rule specifically looks for NOT(NOT(...))
      const incompleteChainOuterNot: BooleanExpression = {
        type: 'NOT',
        left: {
          // This is the inner NOT
          type: 'NOT',
          // @ts-expect-error Intentionally malformed for testing: inner operand is undefined
          left: undefined,
        },
      }

      // canApply should now be true because expression.left.left check was removed from rule
      expect(chainNegationRule!.canApply(incompleteChainOuterNot)).toBe(true)

      // apply should simplify !!(undefined_operand) to undefined_operand
      const originalJson = JSON.stringify(incompleteChainOuterNot)
      const result = chainNegationRule!.apply(incompleteChainOuterNot)
      expect(JSON.stringify(incompleteChainOuterNot)).toBe(originalJson) // Immutability

      // The result should be the innermost operand, which is undefined in this case.
      expect(result).toBeUndefined() // Changed from expect(result).toBe(incompleteChainOuterNot.left.left)
      expect(result).not.toBe(incompleteChainOuterNot) // undefined is not the original object instance

      // Test case from before: NOT(NOT(VARIABLE)) where inner NOT is considered "incomplete" for other rules.
      // For this rule, it's a valid !!X pattern.
      const incompleteNotVar: BooleanExpression = {
        type: 'NOT',
        left: { type: 'VARIABLE', value: 'dummy' },
      }
      const incompleteChainVar: BooleanExpression = { type: 'NOT', left: incompleteNotVar }
      const expectedVar: BooleanExpression = { type: 'VARIABLE', value: 'dummy' }

      testNegationRuleApplication(incompleteChainVar, expectedVar, true, true)
    })

    test('apply on single NOT returns input unchanged and same instance', () => {
      const singleNot: BooleanExpression = { type: 'NOT', left: { type: 'VARIABLE', value: 'A' } }
      testNegationRuleApplication(singleNot, singleNot, false, false)
    })

    test('apply on variable returns input unchanged and same instance', () => {
      const variable: BooleanExpression = { type: 'VARIABLE', value: 'A' }
      testNegationRuleApplication(variable, variable, false, false)
    })

    test('apply on AND expression (no negations) returns input unchanged and same instance', () => {
      const andExpr: BooleanExpression = {
        type: 'AND',
        left: varA,
        right: { type: 'VARIABLE', value: 'B' },
      }
      testNegationRuleApplication(andExpr, andExpr, false, false)
    })
  })

  // 7. Dependency-Failure Tests
  describe('Dependency Behavior', () => {
    test('uses structured clone for deep copying', () => {
      const doubleNeg = createMultipleNegations(2)
      const originalDoubleNeg = JSON.parse(JSON.stringify(doubleNeg))
      const result = chainNegationRule!.apply(doubleNeg)
      expect(doubleNeg).toEqual(originalDoubleNeg)
      expect(result).toEqual(varA)
    })
  })

  // 8. State-Transition Tests
  describe('Transformation States', () => {
    test('transforms between negation states correctly', () => {
      let expr: BooleanExpression = { type: 'VARIABLE', value: 'A' }
      expr = { type: 'NOT', left: expr }
      expect(chainNegationRule!.canApply(expr)).toBe(false)

      expr = { type: 'NOT', left: expr }
      expect(chainNegationRule!.canApply(expr)).toBe(true)
      let result = chainNegationRule!.apply(expr)
      expect(result).toEqual(varA)

      expr = { type: 'NOT', left: result }
      expect(chainNegationRule!.canApply(expr)).toBe(false)

      expr = { type: 'NOT', left: expr }
      expect(chainNegationRule!.canApply(expr)).toBe(true)
      result = chainNegationRule!.apply(expr)
      expect(result).toEqual(varA)
    })
  })
})
