import { describe, expect, test } from 'vitest'
import { getContradictionRules } from '../rules/contradiction-rules'
import { BooleanExpression } from '../../ast/types'

describe('Contradiction Simplification Rules', () => {
  const rules = getContradictionRules()

  // Find the contradiction and tautology rules
  const contradictionRule = rules.find(rule => rule.info.name.includes('Contradiction'))
  const tautologyRule = rules.find(rule => rule.info.name.includes('Tautology'))

  // Helper to create a contradiction expression (A ∧ ¬A)
  const createContradiction = (): BooleanExpression => ({
    type: 'AND',
    left: { type: 'VARIABLE', value: 'A' },
    right: {
      type: 'NOT',
      left: { type: 'VARIABLE', value: 'A' },
    },
  })

  // Helper to create a tautology expression (A ∨ ¬A)
  const createTautology = (): BooleanExpression => ({
    type: 'OR',
    left: { type: 'VARIABLE', value: 'A' },
    right: {
      type: 'NOT',
      left: { type: 'VARIABLE', value: 'A' },
    },
  })

  // 1. Functional Correctness Tests
  describe('Functional Correctness', () => {
    test('rules are properly defined', () => {
      expect(contradictionRule).toBeDefined()
      expect(tautologyRule).toBeDefined()

      expect(contradictionRule!.info.name).toContain('Contradiction')
      expect(tautologyRule!.info.name).toContain('Tautology')
    })

    test('detects and simplifies contradiction correctly', () => {
      const expr = createContradiction()

      expect(contradictionRule!.canApply(expr)).toBe(true)

      const result = contradictionRule!.apply(expr)
      expect(result).toEqual({ type: 'CONSTANT', value: false })
    })

    test('detects and simplifies tautology correctly', () => {
      const expr = createTautology()

      expect(tautologyRule!.canApply(expr)).toBe(true)

      const result = tautologyRule!.apply(expr)
      expect(result).toEqual({ type: 'CONSTANT', value: true })
    })

    test('handles reversed operand order', () => {
      // Reversed contradiction (¬A ∧ A)
      const reversedContradiction: BooleanExpression = {
        type: 'AND',
        left: {
          type: 'NOT',
          left: { type: 'VARIABLE', value: 'A' },
        },
        right: { type: 'VARIABLE', value: 'A' },
      }

      expect(contradictionRule!.canApply(reversedContradiction)).toBe(true)

      const result = contradictionRule!.apply(reversedContradiction)
      expect(result).toEqual({ type: 'CONSTANT', value: false })

      // Reversed tautology (¬A ∨ A)
      const reversedTautology: BooleanExpression = {
        type: 'OR',
        left: {
          type: 'NOT',
          left: { type: 'VARIABLE', value: 'A' },
        },
        right: { type: 'VARIABLE', value: 'A' },
      }

      expect(tautologyRule!.canApply(reversedTautology)).toBe(true)

      const result2 = tautologyRule!.apply(reversedTautology)
      expect(result2).toEqual({ type: 'CONSTANT', value: true })
    })
  })

  // 2. Happy-Path Tests
  describe('Happy Path', () => {
    test('detects nested contradictions', () => {
      // Expression with a contradiction as a subexpression: B ∨ (A ∧ ¬A)
      const nestedExpr: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'B' },
        right: createContradiction(),
      }

      // The deep contradiction rule should detect this
      expect(contradictionRule!.canApply(nestedExpr)).toBe(true)

      // The result should simplify the contradiction and leave B
      const result = contradictionRule!.apply(nestedExpr)

      // Since the contradiction simplifies to false, B ∨ false = B
      expect(result).toEqual({
        type: 'OR',
        left: { type: 'VARIABLE', value: 'B' },
        right: { type: 'CONSTANT', value: false },
      })
    })

    test('detects contradictions with complex expressions', () => {
      // Complex contradiction: (A ∨ B) ∧ ¬(A ∨ B)
      const complexExpr: BooleanExpression = {
        type: 'AND',
        left: {
          type: 'OR',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        },
        right: {
          type: 'NOT',
          left: {
            type: 'OR',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
        },
      }

      expect(contradictionRule!.canApply(complexExpr)).toBe(true)

      const result = contradictionRule!.apply(complexExpr)
      expect(result).toEqual({ type: 'CONSTANT', value: false })
    })
  })

  // 3. Negative-Path Tests
  describe('Negative Path', () => {
    test('ignores non-contradictions', () => {
      // A ∧ B (no contradiction)
      const nonContradiction: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'B' },
      }

      expect(contradictionRule!.canApply(nonContradiction)).toBe(false)

      // A ∧ ¬B (different variables, no contradiction)
      const differentVars: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: {
          type: 'NOT',
          left: { type: 'VARIABLE', value: 'B' },
        },
      }

      expect(contradictionRule!.canApply(differentVars)).toBe(false)
    })

    test('ignores non-tautologies', () => {
      // A ∨ B (no tautology)
      const nonTautology: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'B' },
      }

      expect(tautologyRule!.canApply(nonTautology)).toBe(false)

      // A ∨ ¬B (different variables, no tautology)
      const differentVars: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'A' },
        right: {
          type: 'NOT',
          left: { type: 'VARIABLE', value: 'B' },
        },
      }

      expect(tautologyRule!.canApply(differentVars)).toBe(false)
    })
  })

  // 4. Equivalence-Partitioning Tests
  describe('Equivalence Partitioning', () => {
    test('different operation types', () => {
      // AND expression (potential contradiction)
      const andExpr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'B' },
      }

      // OR expression (potential tautology)
      const orExpr: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'A' },
        right: { type: 'VARIABLE', value: 'B' },
      }

      // NOT expression (neither contradiction nor tautology)
      const notExpr: BooleanExpression = {
        type: 'NOT',
        left: { type: 'VARIABLE', value: 'A' },
      }

      // Only contradictions and tautologies should pass
      expect(contradictionRule!.canApply(createContradiction())).toBe(true)
      expect(tautologyRule!.canApply(createTautology())).toBe(true)

      // Other expressions should be ignored
      expect(contradictionRule!.canApply(andExpr)).toBe(false)
      expect(contradictionRule!.canApply(orExpr)).toBe(false)
      expect(contradictionRule!.canApply(notExpr)).toBe(false)
      expect(tautologyRule!.canApply(andExpr)).toBe(false)
      expect(tautologyRule!.canApply(orExpr)).toBe(false)
      expect(tautologyRule!.canApply(notExpr)).toBe(false)
    })

    test('variable pattern matching', () => {
      // Contradiction with same variable (A ∧ ¬A)
      const sameVar = createContradiction()

      // Contradiction-like with different variables (A ∧ ¬B)
      const differentVars: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: {
          type: 'NOT',
          left: { type: 'VARIABLE', value: 'B' },
        },
      }

      // Only the same-variable case is a contradiction
      expect(contradictionRule!.canApply(sameVar)).toBe(true)
      expect(contradictionRule!.canApply(differentVars)).toBe(false)
    })
  })

  // 5. Boundary-Value Tests
  describe('Boundary Values', () => {
    test('deeply nested contradictions', () => {
      // Create a deeply nested expression with a contradiction at the bottom
      const deeplyNested: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'X' },
        right: {
          type: 'AND',
          left: { type: 'VARIABLE', value: 'Y' },
          right: {
            type: 'OR',
            left: { type: 'VARIABLE', value: 'Z' },
            right: createContradiction(),
          },
        },
      }

      // The deep contradiction detector should find this
      expect(contradictionRule!.canApply(deeplyNested)).toBe(true)

      // After applying, the contradiction should be replaced with false
      const result = contradictionRule!.apply(deeplyNested)

      // Check that the structure is preserved but contradiction is replaced
      expect(result.type).toBe('OR')
      expect(result.left).toEqual({ type: 'VARIABLE', value: 'X' })
      expect(result.right?.type).toBe('AND')
      expect(result.right?.right?.type).toBe('OR')
      expect(result.right?.right?.right).toEqual({ type: 'CONSTANT', value: false })
    })

    test('multiple contradictions in one expression', () => {
      // Expression with multiple contradictions: (A ∧ ¬A) ∨ (B ∧ ¬B)
      const multipleContradictions: BooleanExpression = {
        type: 'OR',
        left: createContradiction(),
        right: {
          type: 'AND',
          left: { type: 'VARIABLE', value: 'B' },
          right: {
            type: 'NOT',
            left: { type: 'VARIABLE', value: 'B' },
          },
        },
      }

      expect(contradictionRule!.canApply(multipleContradictions)).toBe(true)

      // Should simplify the first contradiction it finds
      const result = contradictionRule!.apply(multipleContradictions)

      // First contradiction should be simplified to false
      expect(result.left).toEqual({ type: 'CONSTANT', value: false })

      // Second contradiction remains to be simplified in a future pass
      expect(result.right?.type).toBe('CONSTANT')
      expect(result.right?.value).toBe(false)
    })
  })

  // 6. Error-Handling Tests
  describe('Error Handling', () => {
    test('handles incomplete expressions', () => {
      // Create an AND with a missing right operand
      const incompleteExpr: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        // right is undefined
      }

      // Should not throw
      expect(() => contradictionRule!.canApply(incompleteExpr)).not.toThrow()

      // Create an OR with a missing left operand
      const incompleteExpr2: BooleanExpression = {
        type: 'OR',
        // left is undefined
        right: {
          type: 'NOT',
          left: { type: 'VARIABLE', value: 'A' },
        },
      }

      // Should not throw
      expect(() => tautologyRule!.canApply(incompleteExpr2)).not.toThrow()
    })

    test('handles expressions with missing NOT children', () => {
      // Create an AND with a NOT missing its child
      const missingNotChild: BooleanExpression = {
        type: 'AND',
        left: { type: 'VARIABLE', value: 'A' },
        right: {
          type: 'NOT',
          // left is undefined
        },
      }

      // Should not throw and should not identify as a contradiction
      expect(() => contradictionRule!.canApply(missingNotChild)).not.toThrow()
      expect(contradictionRule!.canApply(missingNotChild)).toBe(false)
    })
  })

  // 7. Dependency-Failure Tests
  describe('Dependency Behavior', () => {
    test('preserves original expression during transformation', () => {
      // Create a contradiction
      const contradiction = createContradiction()

      // Make a copy for comparison
      const originalContradiction = JSON.parse(JSON.stringify(contradiction))

      // Apply the rule
      contradictionRule!.apply(contradiction)

      // Original expression should be unchanged (deep clone used)
      expect(contradiction).toEqual(originalContradiction)
    })

    test('correctly uses expressionsEqual for comparison', () => {
      // Create two structurally equivalent but different object references
      const expr1: BooleanExpression = { type: 'VARIABLE', value: 'A' }
      const expr2: BooleanExpression = { type: 'VARIABLE', value: 'A' }

      // Create a contradiction using these different references
      const contradiction: BooleanExpression = {
        type: 'AND',
        left: expr1,
        right: {
          type: 'NOT',
          left: expr2,
        },
      }

      // Should still detect as a contradiction despite different references
      expect(contradictionRule!.canApply(contradiction)).toBe(true)
    })
  })

  // 8. State-Transition Tests
  describe('State Transitions', () => {
    test('transforms expressions correctly through simplification', () => {
      // Start with a nested expression containing a contradiction
      const expr: BooleanExpression = {
        type: 'OR',
        left: { type: 'VARIABLE', value: 'B' },
        right: createContradiction(),
      }

      // Apply the rule (simplifies the contradiction)
      const intermediate = contradictionRule!.apply(expr)

      // Verify intermediate state (B ∨ false)
      expect(intermediate.type).toBe('OR')
      expect(intermediate.left).toEqual({ type: 'VARIABLE', value: 'B' })
      expect(intermediate.right).toEqual({ type: 'CONSTANT', value: false })

      // In a real simplifier, this would then trigger OR with false rule
      // transforming to just B
    })

    test('tautology and contradiction logic correctness', () => {
      // Create a complex expression combining tautology and contradiction
      const complexExpr: BooleanExpression = {
        type: 'AND',
        left: createTautology(), // A ∨ ¬A (true)
        right: createContradiction(), // A ∧ ¬A (false)
      }

      // Should detect the contradiction (since we're finding contradictions at any level)
      expect(contradictionRule!.canApply(complexExpr)).toBe(true)

      // Apply the rule to simplify the contradiction
      const result = contradictionRule!.apply(complexExpr)

      // The contradiction should be replaced with false
      expect(result.right).toEqual({ type: 'CONSTANT', value: false })

      // After this transformation, the tautology rule wouldn't apply yet to this specific structure
      // since we'd need another rule to handle AND with true/false first
      // UPDATE: With a recursive tautology rule, canApply WILL find the tautology in the left branch.
      expect(tautologyRule!.canApply(result)).toBe(true)
    })
  })
})
