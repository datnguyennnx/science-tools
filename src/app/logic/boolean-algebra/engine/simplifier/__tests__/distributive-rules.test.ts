import { describe, expect, test } from 'vitest'
import { getDistributiveRules } from '../rules/distributive-rules'
// import { BooleanExpression } from '../../ast/types' // Commented out as it seems unused now
import { expressionsEqual } from '../../utils'
import { parseExpression } from '../../parser'

describe('Distributive, Absorption, and Factorization Rules', () => {
  const rules = getDistributiveRules()
  const distributeAndOverOrLeftRule = rules.find(
    r => r.info.name === 'Distribute AND over OR (Left)'
  )!
  const distributeAndOverOrRightRule = rules.find(
    r => r.info.name === 'Distribute AND over OR (Right)'
  )!
  const distributeOrOverAndLeftRule = rules.find(
    r => r.info.name === 'Distribute OR over AND (Left)'
  )!
  const distributeOrOverAndRightRule = rules.find(
    r => r.info.name === 'Distribute OR over AND (Right)'
  )!
  const factorizeCommonLeftRule = rules.find(
    r => r.info.name === 'Factorize AND from OR (Common Left)'
  )!
  const factorizeCommonRightRule = rules.find(
    r => r.info.name === 'Factorize AND from OR (Common Right)'
  )!
  const factorizeCommonMixed1Rule = rules.find(
    r => r.info.name === 'Factorize AND from OR (Common Mixed 1)'
  )!
  const factorizeCommonMixed2Rule = rules.find(
    r => r.info.name === 'Factorize AND from OR (Common Mixed 2)'
  )!
  const factorizeOrCommonLeftRule = rules.find(
    r => r.info.name === 'Factorize OR from AND (Common Left in ORs)'
  )!
  const factorizeOrCommonRightRule = rules.find(
    r => r.info.name === 'Factorize OR from AND (Common Right in ORs)'
  )!
  const factorizeOrCommonMixed1Rule = rules.find(
    r => r.info.name === 'Factorize OR from AND (Common Mixed 1: X+Y and Z+X)'
  )!
  const factorizeOrCommonMixed2Rule = rules.find(
    r => r.info.name === 'Factorize OR from AND (Common Mixed 2: Y+X and X+Z)'
  )!
  const absorptionXplusXYRule = rules.find(
    r => r.info.name === 'Absorption Law (X + XY = X) (Recursive)'
  )!
  const absorptionXmultXplusYRule = rules.find(
    r => r.info.name === 'Absorption Law (X * (X+Y) = X) (Recursive)'
  )!

  // Helper function to test a single rule application
  const testRuleApplication = (
    rule: (typeof rules)[0],
    inputExprStr: string,
    expectedOutputStr: string | null,
    shouldChange: boolean,
    ruleCanApply?: boolean // Optional: if specified, asserts canApply directly
  ) => {
    const expr = parseExpression(inputExprStr)!
    const originalJson = JSON.stringify(expr)
    const actualCanApply = rule.canApply(expr)

    if (ruleCanApply !== undefined) {
      expect(
        actualCanApply,
        `Rule ${rule.info.name} canApply mismatch for ${inputExprStr}. Expected: ${ruleCanApply}, Got: ${actualCanApply}`
      ).toBe(ruleCanApply)
    }

    const result = rule.apply(expr)

    expect(JSON.stringify(expr), 'Input expression should not be mutated.').toBe(originalJson)

    if (shouldChange) {
      expect(
        actualCanApply,
        `Rule ${rule.info.name} should be able to apply and change ${inputExprStr}`
      ).toBe(true) // If it should change, it must be able to apply

      const expectedExpr = parseExpression(expectedOutputStr!)!
      expect(
        expressionsEqual(result, expectedExpr),
        `Expected ${inputExprStr} -> ${expectedOutputStr}, but got ${JSON.stringify(result)}`
      ).toBe(true)
      expect(
        result,
        `Result should be a new instance if expression changed: ${inputExprStr} -> ${expectedOutputStr}`
      ).not.toBe(expr)
    } else {
      // If no change is expected, the result should be structurally equal to the input.
      expect(
        expressionsEqual(result, expr),
        `Expected ${inputExprStr} to remain structurally unchanged.`
      ).toBe(true)

      // If the rule was expected *not* to apply (based on explicit ruleCanApply = false),
      // or if it *could* apply but wasn't *expected to change* the structure,
      // then the result should be the same instance.
      if (ruleCanApply === false || (actualCanApply && !shouldChange)) {
        expect(
          result,
          `Rule ${rule.info.name} for ${inputExprStr}: instance check failed. CanApply: ${actualCanApply}, ExpectedChange: ${shouldChange}`
        ).toBe(expr)
      } else if (!actualCanApply && !shouldChange) {
        // If it couldn't apply and no change expected, must be same instance
        expect(
          result,
          `Rule ${rule.info.name} could not apply to ${inputExprStr} and no change expected, should be same instance.`
        ).toBe(expr)
      }
      // If an expectedOutputStr is provided (even if same as input), verify it
      if (expectedOutputStr) {
        const expectedExpr = parseExpression(expectedOutputStr)!
        expect(expressionsEqual(result, expectedExpr)).toBe(true)
      }
    }
  }

  describe('Distribute AND over OR (Left): X * (Y + Z) => (X * Y) + (X * Z)', () => {
    test('should apply to X*(Y+Z)', () => {
      testRuleApplication(distributeAndOverOrLeftRule, 'X*(Y+Z)', '(X*Y)+(X*Z)', true)
    })
    test('should not apply to X+(Y*Z)', () => {
      testRuleApplication(distributeAndOverOrLeftRule, 'X+(Y*Z)', 'X+(Y*Z)', false) // Pattern doesn't match
    })
    test('should apply to A*((B+C)+D)', () => {
      testRuleApplication(distributeAndOverOrLeftRule, 'A*((B+C)+D)', '(A*(B+C))+(A*D)', true)
    })
    test('should not apply to (A*B)+(C*D)', () => {
      testRuleApplication(distributeAndOverOrLeftRule, '(A*B)+(C*D)', '(A*B)+(C*D)', false) // No distribution
    })
  })

  describe('Distribute AND over OR (Right): (X + Y) * Z => (X * Z) + (Y * Z)', () => {
    test('should apply to (X+Y)*Z', () => {
      testRuleApplication(distributeAndOverOrRightRule, '(X+Y)*Z', '(X*Z)+(Y*Z)', true)
    })
    test('should not apply to (X*Y)+Z', () => {
      testRuleApplication(distributeAndOverOrRightRule, '(X*Y)+Z', '(X*Y)+Z', false)
    })
    test('should apply to ((A+B)+C)*D', () => {
      testRuleApplication(distributeAndOverOrRightRule, '((A+B)+C)*D', '((A+B)*D)+(C*D)', true)
    })
  })

  describe('Distribute OR over AND (Left): X + (Y * Z) => (X + Y) * (X + Z)', () => {
    test('should apply to X+(Y*Z)', () => {
      testRuleApplication(distributeOrOverAndLeftRule, 'X+(Y*Z)', '(X+Y)*(X+Z)', true)
    })
    test('should not apply to X*(Y+Z)', () => {
      testRuleApplication(distributeOrOverAndLeftRule, 'X*(Y+Z)', 'X*(Y+Z)', false)
    })
    test('should apply to A+(B*(C*D))', () => {
      testRuleApplication(distributeOrOverAndLeftRule, 'A+(B*(C*D))', '(A+B)*(A+(C*D))', true)
    })
  })

  describe('Distribute OR over AND (Right): (X * Y) + Z => (X + Z) * (Y + Z)', () => {
    test('should apply to (X*Y)+Z', () => {
      testRuleApplication(distributeOrOverAndRightRule, '(X*Y)+Z', '(X+Z)*(Y+Z)', true)
    })
    test('should not apply to (X+Y)*Z', () => {
      testRuleApplication(distributeOrOverAndRightRule, '(X+Y)*Z', '(X+Y)*Z', false)
    })
    test('should apply to ((A*B)*C)+D', () => {
      testRuleApplication(distributeOrOverAndRightRule, '((A*B)*C)+D', '((A*B)+D)*(C+D)', true)
    })
  })

  describe('Factorize AND from OR (Common Left): XY + XZ => X(Y+Z)', () => {
    test('should apply to (A*B)+(A*C)', () => {
      testRuleApplication(factorizeCommonLeftRule, '(A*B)+(A*C)', 'A*(B+C)', true)
    })
    test('should not apply to (A*B)+(D*C)', () => {
      testRuleApplication(factorizeCommonLeftRule, '(A*B)+(D*C)', '(A*B)+(D*C)', false)
    })
    test('should apply to A*B+A*C (no explicit parens)', () => {
      testRuleApplication(factorizeCommonLeftRule, 'A*B+A*C', 'A*(B+C)', true) // No explicit parens
    })
    test('should apply to (X*Y)+(X*Z)', () => {
      testRuleApplication(factorizeCommonLeftRule, '(X*Y)+(X*Z)', 'X*(Y+Z)', true)
    })
    test('should not apply to (A*B)+(C*D)', () => {
      testRuleApplication(factorizeCommonLeftRule, '(A*B)+(C*D)', '(A*B)+(C*D)', false)
    })
  })

  describe('Factorize AND from OR (Common Right): YX + ZX => (Y+Z)X', () => {
    test('should apply to (B*A)+(C*A)', () => {
      testRuleApplication(factorizeCommonRightRule, '(B*A)+(C*A)', '(B+C)*A', true)
    })
    test('should not apply to (B*A)+(C*D)', () => {
      testRuleApplication(factorizeCommonRightRule, '(B*A)+(C*D)', '(B*A)+(C*D)', false)
    })
  })

  describe('Factorize AND from OR (Common Mixed 1): XY + ZX => X(Y+Z) [if X common]', () => {
    test('should apply to (A*B)+(C*A) to A*(B+C)', () => {
      // This rule expects (X*Y) + (Z*X) => X*(Y+Z)
      testRuleApplication(factorizeCommonMixed1Rule, '(A*B)+(C*A)', 'A*(B+C)', true)
    })
    test('should not apply to (A*B)+(A*C) (should be Common Left)', () => {
      testRuleApplication(factorizeCommonMixed1Rule, '(A*B)+(A*C)', '(A*B)+(A*C)', false) // Should be Common Left
    })
  })

  describe('Factorize AND from OR (Common Mixed 2): YX + XZ => (Y+Z)X [if X common]', () => {
    test('should apply to (B*A)+(A*C) to (B+C)*A', () => {
      // This rule expects (Y*X) + (X*Z) => (Y+Z)*X
      testRuleApplication(factorizeCommonMixed2Rule, '(B*A)+(A*C)', '(B+C)*A', true)
    })
    test('should not apply to (A*B)+(C*A) (should be Common Mixed 1)', () => {
      testRuleApplication(factorizeCommonMixed2Rule, '(A*B)+(C*A)', '(A*B)+(C*A)', false) // Should be Common Mixed 1
    })
  })

  describe('Factorize OR from AND (Common Left in ORs): (X+Y)(X+Z) => X+YZ', () => {
    test('should apply to (A+B)*(A+C)', () => {
      testRuleApplication(factorizeOrCommonLeftRule, '(A+B)*(A+C)', 'A+(B*C)', true)
    })
    test('should not apply to (A+B)*(D+C)', () => {
      testRuleApplication(factorizeOrCommonLeftRule, '(A+B)*(D+C)', '(A+B)*(D+C)', false)
    })
  })

  describe('Factorize OR from AND (Common Right in ORs): (Y+X)(Z+X) => YZ+X', () => {
    test('should apply to (B+A)*(C+A)', () => {
      testRuleApplication(factorizeOrCommonRightRule, '(B+A)*(C+A)', '(B*C)+A', true)
    })
    test('should not apply to (B+A)*(C+D)', () => {
      testRuleApplication(factorizeOrCommonRightRule, '(B+A)*(C+D)', '(B+A)*(C+D)', false)
    })
  })

  describe('Factorize OR from AND (Common Mixed 1: X+Y and Z+X): (X+Y)*(Z+X) => X+(Y*Z)', () => {
    test('should apply to (A+B)*(C+A)', () => {
      testRuleApplication(factorizeOrCommonMixed1Rule, '(A+B)*(C+A)', 'A+(B*C)', true)
    })
  })

  describe('Factorize OR from AND (Common Mixed 2: Y+X and X+Z): (Y+X)*(X+Z) => (Y*Z)+X', () => {
    test('should apply to (B+A)*(A+C)', () => {
      testRuleApplication(factorizeOrCommonMixed2Rule, '(B+A)*(A+C)', '(B*C)+A', true)
    })
  })

  describe('Absorption Law (X + XY = X) (Recursive)', () => {
    test('should apply to A+(A*B)', () => {
      testRuleApplication(absorptionXplusXYRule, 'A+(A*B)', 'A', true)
    })
    test('should apply to A+(B*A) (commuted)', () => {
      testRuleApplication(absorptionXplusXYRule, 'A+(B*A)', 'A', true) // Commuted
    })
    test('should not apply to A+(B*C)', () => {
      testRuleApplication(absorptionXplusXYRule, 'A+(B*C)', 'A+(B*C)', false)
    })
    test('should apply to X+(X*Y)', () => {
      testRuleApplication(absorptionXplusXYRule, 'X+(X*Y)', 'X', true)
    })
    test('should apply to (A+B)+((A+B)*C) (complex X)', () => {
      testRuleApplication(absorptionXplusXYRule, '(A+B)+((A+B)*C)', '(A+B)', true) // Complex X
    })
    // Recursive cases
    test('should apply recursively to Z*(A+(A*B))', () => {
      testRuleApplication(absorptionXplusXYRule, 'Z*(A+(A*B))', 'Z*A', true)
    })
    test('should apply recursively to Z+(A+(A*B))', () => {
      testRuleApplication(absorptionXplusXYRule, 'Z+(A+(A*B))', 'Z+A', true)
    })
  })

  describe('Absorption Law (X * (X+Y) = X) (Recursive)', () => {
    test('should apply to A*(A+B)', () => {
      testRuleApplication(absorptionXmultXplusYRule, 'A*(A+B)', 'A', true)
    })
    test('should apply to A*(B+A) (commuted)', () => {
      testRuleApplication(absorptionXmultXplusYRule, 'A*(B+A)', 'A', true) // Commuted
    })
    test('should not apply to A*(B+C)', () => {
      testRuleApplication(absorptionXmultXplusYRule, 'A*(B+C)', 'A*(B+C)', false)
    })
    test('should apply to X*(X+Y)', () => {
      testRuleApplication(absorptionXmultXplusYRule, 'X*(X+Y)', 'X', true)
    })
    test('should apply to (A*B)*((A*B)+C) (complex X)', () => {
      testRuleApplication(absorptionXmultXplusYRule, '(A*B)*((A*B)+C)', '(A*B)', true) // Complex X
    })
    // Recursive cases
    test('should apply recursively to Z+(A*(A+B))', () => {
      testRuleApplication(absorptionXmultXplusYRule, 'Z+(A*(A+B))', 'Z+A', true)
    })
    test('should apply recursively to Z*(A*(A+B))', () => {
      testRuleApplication(absorptionXmultXplusYRule, 'Z*(A*(A+B))', 'Z*A', true)
    })
  })

  describe('General Rule Properties', () => {
    test('All rule metadata is correct', () => {
      rules.forEach(rule => {
        expect(rule.info.name).toBeDefined()
        expect(rule.info.description).toBeDefined()
        expect(rule.info.formula).toBeDefined()
        expect(typeof rule.canApply).toBe('function')
        expect(typeof rule.apply).toBe('function')
      })
    })
  })
})
