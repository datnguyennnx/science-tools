import { describe, test, expect } from 'vitest'
import {
  PATTERNS,
  fixProblematicPatterns,
  validateExpression,
  validateNestedExpressionStructure,
  getValidExamples,
} from '../utils/patterns'

describe('Boolean Algebra Parser - Patterns Tests', () => {
  // ============================================================================
  // FUNCTIONAL CORRECTNESS TESTS
  // ============================================================================
  describe('Functional Correctness', () => {
    describe('PATTERNS object', () => {
      test('contains all required pattern definitions', () => {
        expect(PATTERNS).toBeDefined()
        expect(PATTERNS.NEGATION_WITHOUT_OPERAND).toBeInstanceOf(RegExp)
        expect(PATTERNS.AND_MISSING_RIGHT).toBeInstanceOf(RegExp)
        expect(PATTERNS.AND_MISSING_LEFT).toBeInstanceOf(RegExp)
        expect(PATTERNS.OR_MISSING_RIGHT).toBeInstanceOf(RegExp)
        expect(PATTERNS.OR_MISSING_LEFT).toBeInstanceOf(RegExp)
        expect(PATTERNS.EMPTY_PARENS).toBeInstanceOf(RegExp)
        expect(PATTERNS.INVALID_VARIABLE).toBeInstanceOf(RegExp)
      })

      test('correctly identifies problematic patterns', () => {
        expect(PATTERNS.NEGATION_WITHOUT_OPERAND.test('!')).toBe(true)
        expect(PATTERNS.NEGATION_WITHOUT_OPERAND.test('!A')).toBe(false)

        expect(PATTERNS.AND_MISSING_RIGHT.test('A*')).toBe(true)
        expect(PATTERNS.AND_MISSING_RIGHT.test('A*B')).toBe(false)

        expect(PATTERNS.OR_MISSING_RIGHT.test('A+')).toBe(true)
        expect(PATTERNS.OR_MISSING_RIGHT.test('A+B')).toBe(false)

        expect(PATTERNS.EMPTY_PARENS.test('()')).toBe(true)
        expect(PATTERNS.EMPTY_PARENS.test('(A)')).toBe(false)

        expect(PATTERNS.INVALID_VARIABLE.test('abc')).toBe(true)
        expect(PATTERNS.INVALID_VARIABLE.test('A')).toBe(false)
      })
    })

    describe('fixProblematicPatterns', () => {
      test('correctly fixes number-before-negation patterns', () => {
        expect(fixProblematicPatterns('1!A')).toBe('1*!A')
        expect(fixProblematicPatterns('1!(A+B)')).toBe('1*!(A+B)')
      })

      test('preserves valid expressions', () => {
        const validExpressions = getValidExamples()
        validExpressions.forEach(expr => {
          expect(fixProblematicPatterns(expr)).toBe(expr)
        })
      })

      test('throws for empty parentheses', () => {
        expect(() => fixProblematicPatterns('()')).toThrow(/Empty parentheses/i)
      })

      test('correctly handles or throws if truly unfixable', () => {
        // Cases that should throw (truly unfixable by this function)
        expect(() => fixProblematicPatterns('A+')).toThrow()
        expect(() => fixProblematicPatterns('*B')).toThrow()
        expect(() => fixProblematicPatterns('!')).toThrow()
      })

      describe('Error Handling and Edge Cases', () => {
        test('provides descriptive error messages for missing operands', () => {
          try {
            fixProblematicPatterns('A+')
            expect.fail('Expected error was not thrown')
          } catch (error: unknown) {
            if (error instanceof Error) {
              expect(error.message).toMatch(/missing right operand/i)
            } else {
              expect.fail('Error is not an instance of Error')
            }
          }
        })

        test('provides descriptive error messages for missing operands', () => {
          try {
            fixProblematicPatterns('+B')
            expect.fail('Expected error was not thrown')
          } catch (error: unknown) {
            if (error instanceof Error) {
              expect(error.message).toMatch(/missing left operand/i)
            } else {
              expect.fail('Error is not an instance of Error')
            }
          }
        })

        test('provides descriptive error messages for missing operands', () => {
          try {
            fixProblematicPatterns('A*')
            expect.fail('Expected error was not thrown')
          } catch (error: unknown) {
            if (error instanceof Error) {
              expect(error.message).toMatch(/missing right operand/i)
            } else {
              expect.fail('Error is not an instance of Error')
            }
          }
        })

        test('provides descriptive error messages for missing operands', () => {
          try {
            fixProblematicPatterns('!')
            expect.fail('Expected error was not thrown')
          } catch (error: unknown) {
            if (error instanceof Error) {
              expect(error.message).toMatch(/missing operand/i)
            } else {
              expect.fail('Error is not an instance of Error')
            }
          }
        })

        test('throws error for empty parentheses', () => {
          expect(() => fixProblematicPatterns('()')).toThrow(/Empty parentheses/i)
        })

        test('provides descriptive error messages for unknown operators', () => {
          try {
            fixProblematicPatterns('A XOR B')
            expect.fail('Expected error was not thrown')
          } catch (error: unknown) {
            if (error instanceof Error) {
              expect(error.message).toMatch(/unknown operator/i)
              expect(error.message).toContain('XOR')
            } else {
              expect.fail('Error is not an instance of Error')
            }
          }
        })

        test('handles boundary case of single character inputs', () => {
          // Single valid variable
          expect(fixProblematicPatterns('A')).toBe('A')

          // Single invalid characters
          expect(() => fixProblematicPatterns('a')).toThrow(/invalid variable/i)
          expect(() => fixProblematicPatterns('!')).toThrow(
            /Missing operand for negation operator/i
          )
          expect(() => fixProblematicPatterns('+')).toThrow(
            /Missing right operand for OR operator/i
          )
          expect(() => fixProblematicPatterns('*')).toThrow(
            /Missing right operand for AND operator/i
          )
        })

        test('handles extreme cases of long expressions', () => {
          // Generate a long but valid expression
          const longExpr = 'A' + '+B'.repeat(100)

          // Shouldn't throw an error for valid long expressions
          expect(fixProblematicPatterns(longExpr)).toBe(longExpr)
        })

        test('handles boundary case with many number-before-negation patterns', () => {
          const input = '1!A+2!B+3!C+4!D+5!E'
          const expected = '1*!A+2*!B+3*!C+4*!D+5*!E'

          expect(fixProblematicPatterns(input)).toBe(expected)
        })
      })

      test('passes valid expressions through unchanged', () => {
        const validExpressions = ['A', 'A*B', '(A+B)*C', '!(A*B)+C', '1*A', '0+B', 'A*!(B+C)']

        validExpressions.forEach(expr => {
          expect(fixProblematicPatterns(expr)).toBe(expr)
        })
      })

      test('correctly applies multiple fixes in order', () => {
        const tests = [
          { input: '1!A', expected: '1*!A' },
          { input: '1!(A+B)', expected: '1*!(A+B)' },
          { input: 'A+1!B', expected: 'A+1*!B' },
          { input: '(1!A)*B', expected: '(1*!A)*B' },
          { input: 'A+B+1!C+D', expected: 'A+B+1*!C+D' },
        ]

        tests.forEach(({ input, expected }) => {
          expect(fixProblematicPatterns(input)).toBe(expected)
        })
      })

      test('fixes multiple issues in a single expression', () => {
        expect(fixProblematicPatterns('A*1!B+1!(C+D)')).toBe('A*1*!B+1*!(C+D)')
      })
    })

    describe('validateExpression', () => {
      test('validates correct expressions', () => {
        const validExpressions = ['A+B', 'A*B', '!(A+B)', 'A*!B', '(A+B)*C']

        validExpressions.forEach(expr => {
          const result = validateExpression(expr)
          expect(result.valid).toBe(true)
          expect(result.error).toBeUndefined()
        })
      })

      test('rejects expressions with missing operands', () => {
        const invalidExpressions = ['A+', '+B', 'A*', '*B', '!']

        invalidExpressions.forEach(expr => {
          const result = validateExpression(expr)
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
        })
      })

      test('rejects expressions with invalid variable names', () => {
        const result = validateExpression('a+b')
        expect(result.valid).toBe(false)
        expect(result.error).toMatch(/invalid variable/i)
      })

      test('rejects expressions with empty parentheses', () => {
        // validateExpression calls fixProblematicPatterns, which now throws for '()'
        // So 'A+()' should result in an error or be marked invalid.
        const result1 = validateExpression('A+()')
        expect(result1.valid).toBe(false)
        expect(result1.error).toMatch(/Empty parentheses/i)

        const result2 = validateExpression('()')
        expect(result2.valid).toBe(false)
        expect(result2.error).toMatch(/Empty parentheses/i)
      })

      test('accepts LaTeX format expressions', () => {
        const latexExpressions = [
          'A \\lor B',
          'A \\land B',
          '\\lnot A',
          'A \\vee B',
          'A \\wedge B',
          '\\neg A',
        ]

        latexExpressions.forEach(expr => {
          const result = validateExpression(expr)
          expect(result.valid).toBe(true)
        })
      })

      test('provides descriptive error messages for missing operands', () => {
        try {
          fixProblematicPatterns('A+')
          expect.fail('Expected error was not thrown')
        } catch (error: unknown) {
          if (error instanceof Error) {
            expect(error.message).toMatch(/missing right operand/i)
          } else {
            expect.fail('Error is not an instance of Error')
          }
        }

        try {
          fixProblematicPatterns('+B')
          expect.fail('Expected error was not thrown')
        } catch (error: unknown) {
          if (error instanceof Error) {
            expect(error.message).toMatch(/missing left operand/i)
          } else {
            expect.fail('Error is not an instance of Error')
          }
        }

        try {
          fixProblematicPatterns('A*')
          expect.fail('Expected error was not thrown')
        } catch (error: unknown) {
          if (error instanceof Error) {
            expect(error.message).toMatch(/missing right operand/i)
          } else {
            expect.fail('Error is not an instance of Error')
          }
        }

        try {
          fixProblematicPatterns('!')
          expect.fail('Expected error was not thrown')
        } catch (error: unknown) {
          if (error instanceof Error) {
            expect(error.message).toMatch(/missing operand/i)
          } else {
            expect.fail('Error is not an instance of Error')
          }
        }
      })

      test('correctly processes expressions with empty parentheses by converting to 0', () => {
        // This test's original premise (converting '()' to '0') is no longer how fixProblematicPatterns behaves.
        // fixProblematicPatterns throws for '()'.
        // validateExpression should identify 'A+()' as invalid.
        const result = validateExpression('A+()')
        expect(result.valid).toBe(false)
        expect(result.error).toMatch(/Empty parentheses/i)

        // If the original intent was to check if 'A+0' is valid:
        const resultWithZero = validateExpression('A+0')
        expect(resultWithZero.valid).toBe(true)
        expect(resultWithZero.error).toBeUndefined()
      })

      test('provides descriptive error messages for unknown operators', () => {
        try {
          fixProblematicPatterns('A XOR B')
          expect.fail('Expected error was not thrown')
        } catch (error: unknown) {
          if (error instanceof Error) {
            expect(error.message).toMatch(/unknown operator/i)
            expect(error.message).toContain('XOR')
          } else {
            expect.fail('Error is not an instance of Error')
          }
        }
      })

      test('returns detailed error messages for missing operands', () => {
        const testCases = [
          { input: 'A+', expectedError: /missing right operand/i },
          { input: '+B', expectedError: /missing left operand/i },
          { input: 'A*', expectedError: /missing right operand/i },
          { input: '*B', expectedError: /missing left operand/i },
          { input: '!', expectedError: /missing operand/i },
          { input: 'a+B', expectedError: /invalid variable/i },
          { input: 'undefined', expectedError: /undefined/i },
          { input: 'null', expectedError: /null/i },
          { input: 'A XOR B', expectedError: /unknown operator/i },
        ]

        testCases.forEach(({ input, expectedError }) => {
          const result = validateExpression(input)
          expect(result.valid).toBe(false)
          expect(result.error).toMatch(expectedError)
        })

        // Test for '()' separately: it's now invalid
        const resultForEmptyParens = validateExpression('()')
        expect(resultForEmptyParens.valid).toBe(false)
        expect(resultForEmptyParens.error).toMatch(/empty parentheses/i)
      })

      test('returns invalid result for expressions with empty parentheses', () => {
        const result = validateExpression('()')
        expect(result.valid).toBe(false)
        expect(result.error).toMatch(/empty parentheses/i)

        // Also check a case where it's part of a larger expression
        const resultInContext = validateExpression('A+()')
        expect(resultInContext.valid).toBe(false)
        expect(resultInContext.error).toMatch(/empty parentheses/i)
      })
    })

    describe('getValidExamples', () => {
      test('returns a non-empty array of examples', () => {
        const examples = getValidExamples()
        expect(Array.isArray(examples)).toBe(true)
        expect(examples.length).toBeGreaterThan(0)
      })

      test('all examples are valid expressions', () => {
        const examples = getValidExamples()
        examples.forEach(example => {
          const result = validateExpression(example)
          expect(result.valid).toBe(true)
        })
      })
    })
  })

  // ============================================================================
  // BOUNDARY TESTS
  // ============================================================================
  describe('Boundary Tests', () => {
    describe('fixProblematicPatterns - Boundary Tests', () => {
      test('handles empty string input', () => {
        expect(() => fixProblematicPatterns('')).toThrow(/empty expression/i)
      })

      test('handles boundary case of single character inputs', () => {
        expect(fixProblematicPatterns('A')).toBe('A')
        expect(() => fixProblematicPatterns('a')).toThrow(/invalid variable/i)
        expect(() => fixProblematicPatterns('!')).toThrow(/Missing operand for negation operator/i)
        expect(() => fixProblematicPatterns('+')).toThrow(/Missing right operand for OR operator/i)
        expect(() => fixProblematicPatterns('*')).toThrow(/Missing right operand for AND operator/i)
      })

      test('handles extreme cases of long expressions', () => {
        // Generate a long but valid expression
        const longExpr = 'A' + '+B'.repeat(100)

        // Shouldn't throw an error for valid long expressions
        expect(fixProblematicPatterns(longExpr)).toBe(longExpr)
      })

      test('handles boundary case with many number-before-negation patterns', () => {
        const input = '1!A+2!B+3!C+4!D+5!E'
        const expected = '1*!A+2*!B+3*!C+4*!D+5*!E'

        expect(fixProblematicPatterns(input)).toBe(expected)
      })
    })

    describe('validateExpression - Boundary Tests', () => {
      test('handles empty string input by returning invalid with error', () => {
        const result = validateExpression('')
        expect(result.valid).toBe(false)
        expect(result.error).toMatch(/empty expression/i)
      })

      test('handles boundary case of single character inputs', () => {
        // Valid single characters
        expect(validateExpression('A').valid).toBe(true)
        expect(validateExpression('0').valid).toBe(true)
        expect(validateExpression('1').valid).toBe(true)

        // Invalid single characters
        expect(validateExpression('a').valid).toBe(false)
        expect(validateExpression('!').valid).toBe(false)
        expect(validateExpression('+').valid).toBe(false)
        expect(validateExpression('*').valid).toBe(false)
      })

      test('handles extreme cases of very long expressions', () => {
        // Generate a long expression
        const longExpr = 'A' + '+B'.repeat(200)

        // Should validate correctly
        expect(validateExpression(longExpr).valid).toBe(true)
      })

      test('validates extremely nested expressions', () => {
        // Create deeply nested expression
        let deepExpr = 'A'
        for (let i = 0; i < 20; i++) {
          deepExpr = `(${deepExpr})`
        }

        // Deeply nested but valid
        expect(validateExpression(deepExpr).valid).toBe(true)
      })

      test('validates boundary case of expressions with all types of operators', () => {
        const complexExpr = 'A+B*C+!D*E+F+!G+H*(I+J)'

        // Complex expression with all operator types
        expect(validateExpression(complexExpr).valid).toBe(true)
      })
    })
  })

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================
  describe('Error Handling Tests', () => {
    describe('fixProblematicPatterns - Error Handling', () => {
      test('throws error for expressions that cannot be fixed by it', () => {
        const invalidUnfixableByThis = ['A+', '*B', '!']
        invalidUnfixableByThis.forEach(expr => {
          expect(() => fixProblematicPatterns(expr)).toThrow()
        })
      })

      test('throws errors for invalid variable names before attempting other fixes', () => {
        expect(() => fixProblematicPatterns('a+B')).toThrow(/invalid variable/i)
        expect(() => fixProblematicPatterns('A_B+C')).toThrow(/invalid variable/i)
        expect(() => fixProblematicPatterns('VariableWithLowercase')).toThrow(/invalid variable/i)
      })

      test('throws error for expressions with empty parentheses', () => {
        expect(() => fixProblematicPatterns('()')).toThrow(/Empty parentheses/i)
      })

      test('throws error for expressions containing undefined or null literals', () => {
        expect(() => fixProblematicPatterns('A + undefined')).toThrow(/undefined/i)
        expect(() => fixProblematicPatterns('null * B')).toThrow(/null/i)
      })
    })

    describe('validateExpression - Error Handling', () => {
      test('returns detailed error messages for invalid inputs', () => {
        const testCases = [
          { input: 'A+', expectedError: /missing right operand/i },
          { input: '+B', expectedError: /missing left operand/i },
          { input: 'A*', expectedError: /missing right operand/i },
          { input: '*B', expectedError: /missing left operand/i },
          { input: '!', expectedError: /missing operand/i },
          { input: 'a+B', expectedError: /invalid variable/i },
          { input: 'undefined', expectedError: /undefined/i },
          { input: 'null', expectedError: /null/i },
          { input: 'A XOR B', expectedError: /unknown operator/i },
        ]

        testCases.forEach(({ input, expectedError }) => {
          const result = validateExpression(input)
          expect(result.valid).toBe(false)
          expect(result.error).toMatch(expectedError)
        })

        // Test for '()' separately: it's now invalid
        const resultForEmptyParens = validateExpression('()')
        expect(resultForEmptyParens.valid).toBe(false)
        expect(resultForEmptyParens.error).toMatch(/empty parentheses/i)
      })
    })
  })

  // ============================================================================
  // HAPPY PATH TESTS
  // ============================================================================
  describe('Happy Path Tests', () => {
    describe('fixProblematicPatterns - Happy Path', () => {
      test('handles valid expressions without modification', () => {
        const validExpressions = [
          'A+B',
          '(A*B)+C',
          '!(A+B)',
          'A*!B',
          '(A+B)*(C+D)',
          'A+B+C+D',
          'A*B*C*D',
        ]

        validExpressions.forEach(expr => {
          expect(fixProblematicPatterns(expr)).toBe(expr)
        })
      })

      test('fixes number-before-negation patterns correctly', () => {
        const tests = [
          { input: '1!A', expected: '1*!A' },
          { input: '1!(A+B)', expected: '1*!(A+B)' },
          { input: 'A+1!B', expected: 'A+1*!B' },
          { input: '(1!A)*B', expected: '(1*!A)*B' },
          { input: 'A+B+1!C+D', expected: 'A+B+1*!C+D' },
        ]

        tests.forEach(({ input, expected }) => {
          expect(fixProblematicPatterns(input)).toBe(expected)
        })
      })

      test('fixes multiple issues in a single expression', () => {
        expect(fixProblematicPatterns('A*1!B+1!(C+D)')).toBe('A*1*!B+1*!(C+D)')
      })
    })

    describe('validateExpression - Happy Path', () => {
      test('validates standard boolean expressions correctly', () => {
        const validExpressions = [
          'A',
          'A+B',
          'A*B',
          '!A',
          '!(A+B)',
          'A*!B',
          '(A+B)*C',
          'A+B+C+D',
          'A*B*C*D',
        ]

        validExpressions.forEach(expr => {
          const result = validateExpression(expr)
          expect(result.valid).toBe(true)
          expect(result.error).toBeUndefined()
        })
      })

      test('validates LaTeX format expressions', () => {
        const latexExpressions = [
          'A \\lor B',
          'A \\land B',
          '\\lnot A',
          'A \\vee B',
          'A \\wedge B',
          '\\neg A',
          '\\overline{A}',
          'A ∧ B',
          'A ∨ B',
          '¬A',
        ]

        latexExpressions.forEach(expr => {
          const result = validateExpression(expr)
          expect(result.valid).toBe(true)
          expect(result.error).toBeUndefined()
        })
      })

      test('skips operand checking when specified', () => {
        // These would be invalid if operand checking was enabled
        const expressions = ['A+', '+B', '*C', '!']

        expressions.forEach(expr => {
          const result = validateExpression(expr, true)
          expect(result.valid).toBe(true)
        })
      })
    })

    describe('getValidExamples - Happy Path', () => {
      test('returns an array of valid example expressions', () => {
        const examples = getValidExamples()

        expect(Array.isArray(examples)).toBe(true)
        expect(examples.length).toBeGreaterThan(0)

        examples.forEach(example => {
          const result = validateExpression(example)
          expect(result.valid).toBe(true)
        })
      })

      test('returned examples include different operation types', () => {
        const examples = getValidExamples()

        // Check for examples with different operators
        const hasAnd = examples.some(ex => ex.includes('*'))
        const hasOr = examples.some(ex => ex.includes('+'))
        const hasNot = examples.some(ex => ex.includes('!'))

        expect(hasAnd).toBe(true)
        expect(hasOr).toBe(true)
        expect(hasNot).toBe(true)
      })
    })
  })

  // ============================================================================
  // NEGATIVE PATH TESTS
  // ============================================================================
  describe('Negative Path Tests', () => {
    describe('fixProblematicPatterns - Negative Path', () => {
      test('throws error for various malformed inputs', () => {
        const malformedInputs = ['A+!', 'A*(B+!)C', 'A()B']

        malformedInputs.forEach(input => {
          expect(() => fixProblematicPatterns(input)).toThrow()
        })
      })
    })

    describe('validateExpression - Negative Path', () => {
      test('returns invalid result for expressions with missing operands', () => {
        const invalidExpressions = ['A+', '+B', 'A*', '*B', '!']

        invalidExpressions.forEach(expr => {
          const result = validateExpression(expr)
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
        })
      })

      test('returns invalid result for expressions with empty parentheses', () => {
        const result = validateExpression('()')
        expect(result.valid).toBe(false)
        expect(result.error).toMatch(/empty parentheses/i)
      })

      test('returns invalid result for expressions with invalid variable names', () => {
        const result = validateExpression('a+B')
        expect(result.valid).toBe(false)
        expect(result.error).toMatch(/invalid variable/i)
      })

      test('returns invalid result for expressions with undefined/null tokens', () => {
        const resultUndefined = validateExpression('A+undefined')
        expect(resultUndefined.valid).toBe(false)
        expect(resultUndefined.error).toMatch(/undefined/i)

        const resultNull = validateExpression('null*B')
        expect(resultNull.valid).toBe(false)
        expect(resultNull.error).toMatch(/null/i)
      })

      test('returns invalid result for expressions with unknown operators', () => {
        const result = validateExpression('A XOR B')
        expect(result.valid).toBe(false)
        expect(result.error).toMatch(/unknown operator/i)
      })
    })
  })

  describe('validateNestedExpressionStructure', () => {
    test('should not throw for valid simple nested expressions', () => {
      expect(() => validateNestedExpressionStructure('(A+B)')).not.toThrow()
      expect(() => validateNestedExpressionStructure('A+(B*C)')).not.toThrow()
    })

    test('should not throw for deeply nested valid expressions', () => {
      expect(() => validateNestedExpressionStructure('((A+(B*C)) + (D*(E+F)))')).not.toThrow()
      expect(() => validateNestedExpressionStructure('A+(B+(C+(D+E)))')).not.toThrow()
    })

    test('should not throw for expressions with no parentheses', () => {
      expect(() => validateNestedExpressionStructure('A+B*C')).not.toThrow()
    })

    test('should throw for empty string because fixProblematicPatterns is called first', () => {
      // validateNestedExpressionStructure calls fixProblematicPatterns on the whole input first.
      // fixProblematicPatterns('') throws 'Empty expression'.
      expect(() => validateNestedExpressionStructure('')).toThrow(/empty expression/i)
    })

    test('should throw for unbalanced parentheses', () => {
      expect(() => validateNestedExpressionStructure('(A+B')).toThrow(/Unbalanced parentheses/i)
      expect(() => validateNestedExpressionStructure('A+B)')).toThrow(/Unbalanced parentheses/i)
      expect(() => validateNestedExpressionStructure('((A+B)')).toThrow(/Unbalanced parentheses/i)
      expect(() => validateNestedExpressionStructure('(A+B))')).toThrow(/Unbalanced parentheses/i)
    })

    test('should throw for invalid content within parentheses - e.g. missing operand', () => {
      expect(() => validateNestedExpressionStructure('(A+)')).toThrow(/missing right operand/i)
      expect(() => validateNestedExpressionStructure('A*(*B)')).toThrow(/missing left operand/i)
      expect(() => validateNestedExpressionStructure('(!)')).toThrow(
        /missing operand for negation/i
      )
    })

    test('should throw for invalid content within parentheses - e.g. invalid variable', () => {
      expect(() => validateNestedExpressionStructure('(a+B)')).toThrow(/invalid variable name/i)
    })

    test('should throw for invalid content within parentheses - e.g. empty parentheses that fixProblematicPatterns did not convert', () => {
      // validateNestedExpressionStructure calls fixProblematicPatterns.
      // fixProblematicPatterns will throw for '()' if it encounters it.
      // So, validateNestedExpressionStructure('(A+())') should throw.
      expect(() => validateNestedExpressionStructure('(A+())')).toThrow(/Empty parentheses/i)
    })
  })
})
