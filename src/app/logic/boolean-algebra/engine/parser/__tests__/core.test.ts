import { describe, test, expect } from 'vitest'
import { parseExpression } from '..'
import { removeOuterParentheses } from '../utils/parser-logic'
import type { BooleanExpression } from '../../ast/types'

describe('Boolean Algebra Parser - Core Tests', () => {
  // ============================================================================
  // HAPPY PATH TESTS
  // ============================================================================
  describe('Happy Path Tests', () => {
    describe('parseExpression - Happy Path', () => {
      test('handles expressions with multiple variables', () => {
        const result = parseExpression('A+B+C')
        const expected: BooleanExpression = {
          type: 'OR',
          left: {
            type: 'OR',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: { type: 'VARIABLE', value: 'C' },
        }
        expect(result).toEqual(expected)
      })

      test('handles expressions with mixed operators', () => {
        const result = parseExpression('A*B+C*D')
        const expected: BooleanExpression = {
          type: 'OR',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'C' },
            right: { type: 'VARIABLE', value: 'D' },
          },
        }
        expect(result).toEqual(expected)
      })

      test('handles nested NOT expressions', () => {
        const result = parseExpression('!!A')
        const expected: BooleanExpression = {
          type: 'NOT',
          left: {
            type: 'NOT',
            left: { type: 'VARIABLE', value: 'A' },
          },
        }
        expect(result).toEqual(expected)
      })

      test('handles deeply nested expressions', () => {
        const result = parseExpression('(A+(B*C))+((D*E)+F)')
        // Expect a complex tree structure with proper nesting
        expect(result.type).toBe('OR')
        expect(result.left).toBeDefined()
        expect(result.right).toBeDefined()
      })

      test('handles expressions with constants', () => {
        const result = parseExpression('A*1+0')
        const expected: BooleanExpression = {
          type: 'OR',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'CONSTANT', value: true },
          },
          right: { type: 'CONSTANT', value: false },
        }
        expect(result).toEqual(expected)
      })

      test('handles expressions with multiple parentheses layers', () => {
        const result = parseExpression('((A*B)+(C*D))')
        // Expect a correctly nested OR expression (as + is the top-level operator)
        expect(result.type).toBe('OR')
      })
    })

    describe('removeOuterParentheses - Happy Path', () => {
      test('handles expressions with multiple layers of balanced parentheses', () => {
        expect(removeOuterParentheses('((((A))))')).toBe('A')
      })

      test('keeps parentheses in complex expressions', () => {
        expect(removeOuterParentheses('(A+B)*(C+D)')).toBe('(A+B)*(C+D)')
        expect(removeOuterParentheses('((A+B))*(C+D)')).toBe('((A+B))*(C+D)')
      })

      test('removes only redundant outer parentheses', () => {
        expect(removeOuterParentheses('((A*B)+(C*D))')).toBe('(A*B)+(C*D)')
      })
    })
  })

  // ============================================================================
  // CORRECTNESS TESTS
  // ============================================================================
  describe('Correctness Tests', () => {
    describe('removeOuterParentheses', () => {
      test('removes single layer of unnecessary parentheses', () => {
        expect(removeOuterParentheses('(A)')).toBe('A')
      })

      test('removes multiple layers of unnecessary parentheses', () => {
        expect(removeOuterParentheses('(((A)))')).toBe('A')
      })

      test('does not remove necessary parentheses in compound expressions', () => {
        expect(removeOuterParentheses('(A+B)*(C+D)')).toBe('(A+B)*(C+D)')
      })

      test('handles strings without parentheses correctly', () => {
        expect(removeOuterParentheses('A+B')).toBe('A+B')
      })

      test('preserves empty parentheses', () => {
        expect(removeOuterParentheses('()')).toBe('()')
      })
    })

    describe('parseExpression', () => {
      test('parses a single variable correctly', () => {
        const result = parseExpression('A')
        expect(result).toEqual({ type: 'VARIABLE', value: 'A' })
      })

      test('parses constants correctly', () => {
        expect(parseExpression('0')).toEqual({ type: 'CONSTANT', value: false })
        expect(parseExpression('1')).toEqual({ type: 'CONSTANT', value: true })
      })

      test('parses NOT expressions correctly', () => {
        const result = parseExpression('!A')
        expect(result).toEqual({
          type: 'NOT',
          left: { type: 'VARIABLE', value: 'A' },
        })
      })

      test('parses AND expressions correctly', () => {
        const result = parseExpression('A*B')
        expect(result).toEqual({
          type: 'AND',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        })
      })

      test('parses OR expressions correctly', () => {
        const result = parseExpression('A+B')
        expect(result).toEqual({
          type: 'OR',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        })
      })

      test('respects operator precedence', () => {
        // AND has higher precedence than OR
        const result = parseExpression('A+B*C')
        expect(result).toEqual({
          type: 'OR',
          left: { type: 'VARIABLE', value: 'A' },
          right: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'B' },
            right: { type: 'VARIABLE', value: 'C' },
          },
        })
      })

      test('handles parentheses for precedence override', () => {
        const result = parseExpression('(A+B)*C')
        expect(result).toEqual({
          type: 'AND',
          left: {
            type: 'OR',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: { type: 'VARIABLE', value: 'C' },
        })
      })

      test('handles complex nested expressions', () => {
        const result = parseExpression('!(A+B)*C+!D')
        const expected: BooleanExpression = {
          type: 'OR',
          left: {
            type: 'AND',
            left: {
              type: 'NOT',
              left: {
                type: 'OR',
                left: { type: 'VARIABLE', value: 'A' },
                right: { type: 'VARIABLE', value: 'B' },
              },
            },
            right: { type: 'VARIABLE', value: 'C' },
          },
          right: {
            type: 'NOT',
            left: { type: 'VARIABLE', value: 'D' },
          },
        }
        expect(result).toEqual(expected)
      })
    })
  })

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================
  describe('Error Handling Tests', () => {
    describe('parseExpression - Error Handling', () => {
      test('provides helpful error message for empty expression', () => {
        try {
          parseExpression('')
          expect.fail('Expected error was not thrown')
        } catch (error: unknown) {
          if (error instanceof Error) {
            expect(error.message).toContain('Empty expression')
          } else {
            expect.fail('Error is not an instance of Error')
          }
        }
      })

      test('provides helpful error message for unbalanced parentheses', () => {
        try {
          parseExpression('(A+B')
          expect.fail('Expected error was not thrown')
        } catch (error: unknown) {
          if (error instanceof Error) {
            expect(error.message).toMatch(/unbalanced|mismatched/i)
            expect(error.message).toContain('(A+B')
          } else {
            expect.fail('Error is not an instance of Error')
          }
        }
      })

      test('provides helpful error message for invalid OR operation', () => {
        try {
          parseExpression('A+')
          expect.fail('Expected error was not thrown')
        } catch (error: unknown) {
          if (error instanceof Error) {
            expect(error.message).toMatch(/OR|missing|invalid/i)
          } else {
            expect.fail('Error is not an instance of Error')
          }
        }
      })

      test('provides helpful error message for invalid AND operation', () => {
        try {
          parseExpression('A*')
          expect.fail('Expected error was not thrown')
        } catch (error: unknown) {
          if (error instanceof Error) {
            expect(error.message).toMatch(/AND|missing|invalid/i)
          } else {
            expect.fail('Error is not an instance of Error')
          }
        }
      })

      test('provides helpful error message for invalid NOT operation', () => {
        try {
          parseExpression('!')
          expect.fail('Expected error was not thrown')
        } catch (error: unknown) {
          if (error instanceof Error) {
            expect(error.message).toMatch(/negation|operand|empty/i)
          } else {
            expect.fail('Error is not an instance of Error')
          }
        }
      })

      test('provides context for nested expression errors', () => {
        try {
          parseExpression('A+(B*)+C')
          expect.fail('Expected error was not thrown')
        } catch (error: unknown) {
          if (error instanceof Error) {
            // Should provide context that error was in an OR expression
            expect(error.message).toMatch(/OR|expression/i)
          } else {
            expect.fail('Error is not an instance of Error')
          }
        }
      })

      test('handles mismatched parentheses with specific error', () => {
        try {
          parseExpression('((A+B) * C')
          expect.fail('Expected error was not thrown')
        } catch (error: unknown) {
          if (error instanceof Error) {
            expect(error.message).toMatch(/parentheses|mismatched|unbalanced/i)
          } else {
            expect.fail('Error is not an instance of Error')
          }
        }
      })
    })

    describe('removeOuterParentheses - Error Handling', () => {
      test('handles null or undefined gracefully', () => {
        // @ts-expect-error Testing with invalid input
        expect(() => removeOuterParentheses(null)).not.toThrow()
        // @ts-expect-error Testing with invalid input
        expect(() => removeOuterParentheses(undefined)).not.toThrow()
      })

      test('handles non-string inputs gracefully', () => {
        // @ts-expect-error Testing with invalid input
        expect(() => removeOuterParentheses(123)).not.toThrow()
        // @ts-expect-error Testing with invalid input
        expect(() => removeOuterParentheses({})).not.toThrow()
      })
    })
  })

  // ============================================================================
  // BOUNDARY TESTS
  // ============================================================================
  describe('Boundary Tests', () => {
    describe('parseExpression - Boundary Tests', () => {
      test('handles minimal valid inputs', () => {
        // Single variable
        expect(parseExpression('A').type).toBe('VARIABLE')

        // Single constants
        expect(parseExpression('0').type).toBe('CONSTANT')
        expect(parseExpression('1').type).toBe('CONSTANT')

        // Simple NOT expression
        expect(parseExpression('!A').type).toBe('NOT')
      })

      test('handles expressions with minimal whitespace', () => {
        // Test with no spaces
        const noSpaces = parseExpression('A*B+C')
        expect(noSpaces.type).toBe('OR')

        // Test with many spaces
        const manySpaces = parseExpression('  A  *  B  +  C  ')
        expect(manySpaces.type).toBe('OR')
      })

      test('handles expressions with maximum nested depth', () => {
        // Create a deeply nested expression
        let deepExpr = 'A'
        for (let i = 0; i < 20; i++) {
          deepExpr = `(${deepExpr})`
        }

        // Should parse successfully despite many levels of nesting
        const result = parseExpression(deepExpr)
        expect(result.type).toBe('VARIABLE')
        expect(result.value).toBe('A')
      })

      test('handles expressions with many variables', () => {
        // Create an expression with many variables
        // A+B+C+...+Z (26 variables)
        const variables = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
        const longExpr = variables.join('+')

        const result = parseExpression(longExpr)
        expect(result.type).toBe('OR')
      })

      test('handles boundary case for empty parentheses', () => {
        // utils/core::parseExpression directly will throw for "()" because the inner content is empty.
        // The fix for "()" -> "0" was in fixProblematicPatterns, which is called higher up in the main parser.
        expect(() => parseExpression('()')).toThrow(/Empty parentheses/i)
      })
    })

    describe('removeOuterParentheses - Boundary Tests', () => {
      test('handles boundary case of empty string', () => {
        expect(removeOuterParentheses('')).toBe('')
      })

      test('handles boundary case of empty parentheses', () => {
        expect(removeOuterParentheses('()')).toBe('()')
      })

      test('handles boundary case of single character', () => {
        expect(removeOuterParentheses('A')).toBe('A')
        expect(removeOuterParentheses('(')).toBe('(')
        expect(removeOuterParentheses(')')).toBe(')')
      })

      test('handles boundary case of maximum nesting', () => {
        // Create deeply nested parentheses
        let deepNested = 'A'
        for (let i = 0; i < 20; i++) {
          deepNested = `(${deepNested})`
        }

        // Should be able to remove all 20 levels of parentheses
        expect(removeOuterParentheses(deepNested)).toBe('A')
      })
    })
  })

  // ============================================================================
  // NEGATIVE PATH TESTS
  // ============================================================================
  describe('Negative Path Tests', () => {
    describe('parseExpression - Negative Path', () => {
      test('throws error on empty input', () => {
        expect(() => parseExpression('')).toThrow('Empty expression')
      })

      test('throws error on invalid variable names', () => {
        expect(() => parseExpression('a')).toThrow() // Lowercase not allowed
        expect(() => parseExpression('A1')).toThrow() // Numbers not allowed in variables
        expect(() => parseExpression('A_B')).toThrow() // Underscores not allowed
      })

      test('throws error on unbalanced parentheses', () => {
        expect(() => parseExpression('(A+B')).toThrow(/unbalanced|mismatched/i)
        expect(() => parseExpression('A+B)')).toThrow(/unbalanced|mismatched/i)
        expect(() => parseExpression('(A+B))')).toThrow(/unbalanced|mismatched/i)
      })

      test('throws error on missing operands', () => {
        expect(() => parseExpression('A+')).toThrow(/missing|invalid/i)
        expect(() => parseExpression('+B')).toThrow(/missing|invalid/i)
        expect(() => parseExpression('A*')).toThrow(/missing|invalid/i)
        expect(() => parseExpression('*B')).toThrow(/missing|invalid/i)
      })

      test('throws error on negation without operand', () => {
        expect(() => parseExpression('!')).toThrow(/empty|missing|invalid/i)
        expect(() => parseExpression('A+!')).toThrow(/empty|missing|invalid/i)
      })

      test('throws error on invalid constants', () => {
        expect(() => parseExpression('2')).toThrow() // Only 0 and 1 are valid constants
        expect(() => parseExpression('true')).toThrow() // Words not allowed
      })

      test('throws error on invalid operators', () => {
        expect(() => parseExpression('A % B')).toThrow() // Modulo not allowed
        expect(() => parseExpression('A $ B')).toThrow() // Dollar sign not allowed
        expect(() => parseExpression('A - B')).toThrow() // Subtraction not allowed
        // Caret '^' IS NOW a supported operator (XOR) by the core tokenizer, so this test line is removed.
        // expect(() => parseExpression('A ^ B')).toThrow()
      })
    })

    describe('removeOuterParentheses - Negative Path', () => {
      // This function is generally resilient and returns the input for most invalid cases
      test('handles mismatched parentheses by returning original', () => {
        expect(removeOuterParentheses('(A+B')).toBe('(A+B')
        expect(removeOuterParentheses(')A+B')).toBe(')A+B')
      })
    })
  })
})
