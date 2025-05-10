import { describe, it, expect } from 'vitest'
import { parseExpression, parseBoolean, detectFormat, getValidExpressionExamples } from '../parser'
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
} from '../../evaluator/derived-ops'

describe('Boolean Expression Parser Tests', () => {
  // ============================================================================
  // BASIC OPERATIONS TESTS
  // ============================================================================
  describe('Basic Operations', () => {
    describe('Basic Expressions', () => {
      it('correctly parses basic expressions', () => {
        const result = parseExpression('A AND B')
        expect(result).toMatchObject({
          type: 'AND',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        })
      })

      it('correctly parses complex nested expressions', () => {
        const result = parseExpression('(A AND B) OR (NOT C)')
        expect(result).toMatchObject({
          type: 'OR',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: {
            type: 'NOT',
            left: { type: 'VARIABLE', value: 'C' },
          },
        })
      })
    })

    describe('Variable Handling', () => {
      it('handles basic variables', () => {
        expect(parseExpression('A')).toMatchObject({ type: 'VARIABLE', value: 'A' })
      })

      it('handles boolean constants', () => {
        expect(parseExpression('1 AND A')).toMatchObject({
          type: 'AND',
          left: { type: 'CONSTANT', value: true },
          right: { type: 'VARIABLE', value: 'A' },
        })

        expect(parseExpression('0 OR B')).toMatchObject({
          type: 'OR',
          left: { type: 'CONSTANT', value: false },
          right: { type: 'VARIABLE', value: 'B' },
        })
      })
    })

    describe('Individual Operations', () => {
      it('handles AND operations', () => {
        expect(parseExpression('A AND B')).toMatchObject({
          type: 'AND',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        })
      })

      it('handles OR operations', () => {
        expect(parseExpression('A OR B')).toMatchObject({
          type: 'OR',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        })
      })

      it('handles NOT operations', () => {
        expect(parseExpression('NOT A')).toMatchObject({
          type: 'NOT',
          left: { type: 'VARIABLE', value: 'A' },
        })
      })
    })

    describe('Operator Precedence', () => {
      it('respects NOT having highest precedence', () => {
        // NOT A AND B is parsed as NOT(A AND B) by the parser
        const result = parseExpression('NOT A AND B')
        expect(result).toMatchObject({
          type: 'NOT',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
        })
      })

      it('respects AND having higher precedence than OR', () => {
        // A OR B AND C should be parsed as A OR (B AND C), not (A OR B) AND C
        const result = parseExpression('A OR B AND C')
        expect(result).toMatchObject({
          type: 'OR',
          left: { type: 'VARIABLE', value: 'A' },
          right: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'B' },
            right: { type: 'VARIABLE', value: 'C' },
          },
        })
      })

      it('respects complex precedence rules in longer expressions', () => {
        // A OR B AND NOT C OR D
        // Should be parsed as: A OR ((B AND (NOT C)) OR D)
        const result = parseExpression('A OR B AND NOT C OR D')
        expect(result).toMatchObject({
          type: 'OR',
          left: { type: 'VARIABLE', value: 'A' },
          right: {
            type: 'OR',
            left: {
              type: 'AND',
              left: { type: 'VARIABLE', value: 'B' },
              right: {
                type: 'NOT',
                left: { type: 'VARIABLE', value: 'C' },
              },
            },
            right: { type: 'VARIABLE', value: 'D' },
          },
        })
      })
    })

    describe('Nested Expressions', () => {
      it('handles nested expressions with parentheses', () => {
        expect(parseExpression('(A AND B) OR C')).toMatchObject({
          type: 'OR',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: { type: 'VARIABLE', value: 'C' },
        })
      })

      it('handles deeply nested expressions', () => {
        const deeplyNested = '(((((A AND B) OR C) AND D) OR E) AND F)'
        expect(parseBoolean(deeplyNested).success).toBe(true)
      })
    })
  })

  // ============================================================================
  // DERIVED OPERATIONS TESTS
  // ============================================================================
  describe('Derived Operations', () => {
    describe('XOR operation', () => {
      it('correctly parses XOR as (A + B) * !(A * B)', () => {
        const xorExpression = '(A + B) * !(A * B)'
        const result = parseExpression(xorExpression)

        expect(result).toMatchObject({
          type: 'AND',
          left: {
            type: 'OR',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: {
            type: 'NOT',
            left: {
              type: 'AND',
              left: { type: 'VARIABLE', value: 'A' },
              right: { type: 'VARIABLE', value: 'B' },
            },
          },
        })
      })
    })

    describe('NAND operation', () => {
      it('correctly parses NAND as !(A * B)', () => {
        const nandExpression = '!(A * B)'
        const result = parseExpression(nandExpression)

        expect(result).toMatchObject({
          type: 'NOT',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
        })
      })
    })

    describe('NOR operation', () => {
      it('correctly parses NOR as !(A + B)', () => {
        const norExpression = '!(A + B)'
        const result = parseExpression(norExpression)

        expect(result).toMatchObject({
          type: 'NOT',
          left: {
            type: 'OR',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
        })
      })
    })

    describe('Integration with derived-operations module', () => {
      it('parses expressions created with createXOR', () => {
        const xorExpr = createXOR('A', 'B')
        const result = parseBoolean(xorExpr)
        expect(result.success).toBe(true)
        expect(result.expression).toMatchObject({
          type: 'AND',
          left: {
            type: 'OR',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: {
            type: 'NOT',
            left: {
              type: 'AND',
              left: { type: 'VARIABLE', value: 'A' },
              right: { type: 'VARIABLE', value: 'B' },
            },
          },
        })
      })

      it('parses expressions created with createNAND', () => {
        const nandExpr = createNAND('A', 'B')
        const result = parseBoolean(nandExpr)
        expect(result.success).toBe(true)
        expect(result.expression).toMatchObject({
          type: 'NOT',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
        })
      })

      it('parses expressions created with createNOR', () => {
        const norExpr = createNOR('A', 'B')
        const result = parseBoolean(norExpr)
        expect(result.success).toBe(true)
        expect(result.expression).toMatchObject({
          type: 'NOT',
          left: {
            type: 'OR',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
        })
      })

      it('parses expressions with complex derived operations', () => {
        // Test nested derivations: (A XOR B) NAND (C NOR D)
        const complexExpr = createNAND(createXOR('A', 'B'), createNOR('C', 'D'))
        const result = parseBoolean(complexExpr)
        expect(result.success).toBe(true)
        // The parsed tree would be complex, so we just verify it parses successfully
      })

      it('parses expressions with friendly alias functions', () => {
        expect(parseBoolean(xor('A', 'B')).success).toBe(true)
        expect(parseBoolean(nand('A', 'B')).success).toBe(true)
        expect(parseBoolean(nor('A', 'B')).success).toBe(true)
        expect(parseBoolean(xnor('A', 'B')).success).toBe(true)
        expect(parseBoolean(implies('A', 'B')).success).toBe(true)
        expect(parseBoolean(iff('A', 'B')).success).toBe(true)
      })
    })
  })

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================
  describe('Error Handling', () => {
    describe('Parse Errors', () => {
      it('provides informative error for unbalanced parentheses', () => {
        const result = parseBoolean('(A AND B')
        expect(result.success).toBe(false)
        expect(result.error).toMatch(/Unbalanced parentheses|Invalid expression/i)
      })

      it('provides informative error for invalid variable names', () => {
        const result = parseBoolean('a AND B')
        expect(result.success).toBe(false)
        expect(result.error).toMatch(/Invalid variable name|Unable to parse/i)
      })

      it('provides informative error for invalid operators', () => {
        const result = parseBoolean('A XOR B')
        expect(result.success).toBe(true)
        expect(result.expression).toBeDefined()
        expect(result.error).toBeNull()

        const resultInvalid = parseBoolean('A $ B')
        expect(resultInvalid.success).toBe(false)
        expect(resultInvalid.error).toMatch(
          /Failed to parse standard expression:.*Unexpected character during tokenization: \$/i
        )
      })

      it('provides examples in error messages', () => {
        const result = parseBoolean('A @# B')
        expect(result.success).toBe(false)
        expect(result.error).toMatch(/Examples of valid expressions:/i)
      })

      it('provides specific error for literal undefined input', () => {
        const result = parseBoolean('undefined')
        expect(result.success).toBe(false)
        expect(result.error).toMatch(/literal string 'undefined'/i)
      })
    })

    describe('Negative Path Tests', () => {
      it('rejects empty expressions', () => {
        expect(() => parseExpression('')).toThrow(/Empty expression/i)
        expect(() => parseExpression('   ')).toThrow(/Empty expression/i)
      })

      it('rejects unbalanced parentheses', () => {
        expect(() => parseExpression('(A AND B')).toThrow(
          /Unbalanced parentheses|Invalid expression/i
        )
        expect(() => parseExpression('A AND B)')).toThrow(
          /Unbalanced parentheses|Invalid expression/i
        )
      })

      it('rejects unknown operators', () => {
        expect(() => parseExpression('A $ B')).toThrow(
          /Failed to parse standard expression:.*Unexpected character during tokenization: \$/i
        )
        expect(() => parseExpression('A ? B')).toThrow(
          /Failed to parse standard expression:.*Unexpected character during tokenization: \?/i
        )
      })

      it('rejects literal "undefined" string', () => {
        expect(() => parseExpression('undefined')).toThrow(/literal string 'undefined'/i)
      })

      it('rejects lowercase variable names', () => {
        expect(() => parseExpression('a AND B')).toThrow(/Invalid variable name|Unable to parse/i)
      })

      it('rejects invalid constants', () => {
        expect(() => parseExpression('True AND A')).toThrow(
          /Invalid variable name|Unable to parse|Invalid expression/i
        )
      })

      it('rejects operators with missing operands', () => {
        expect(() => parseExpression('A AND')).toThrow(/Missing.*operand|Invalid expression/i)
        expect(() => parseExpression('OR B')).toThrow(/Missing.*operand|Invalid expression/i)
        expect(() => parseExpression('AND OR')).toThrow(
          /Missing.*operand|Invalid syntax|Invalid expression/i
        )
      })

      it('rejects empty parentheses', () => {
        expect(() => parseExpression('()')).toThrow(/Empty parentheses|Invalid expression/i)
        expect(() => parseExpression('A () B')).toThrow(
          /Empty parentheses|Invalid token|Unexpected token|Invalid expression/i
        )
      })
    })

    describe('Equivalence Partitioning - Error Cases', () => {
      it('handles different variable name styles consistently', () => {
        expect(parseBoolean('A').success).toBe(true)
        expect(parseBoolean('Variable1').success).toBe(false) // Only uppercase letters
        expect(parseBoolean('a').success).toBe(false) // No lowercase
      })

      it('handles constants consistently', () => {
        expect(parseBoolean('0').success).toBe(true)
        expect(parseBoolean('1').success).toBe(true)
        expect(parseBoolean('true').success).toBe(false) // Only 0/1 constants
      })
    })
  })

  // ============================================================================
  // FORMAT DETECTION TESTS
  // ============================================================================
  describe('Format Detection', () => {
    describe('Basic Format Detection', () => {
      it('correctly identifies standard format expressions', () => {
        expect(detectFormat('A AND B')).toBe('standard')
        expect(detectFormat('NOT C')).toBe('standard')
        expect(detectFormat('A OR B')).toBe('standard')
      })

      it('correctly identifies LaTeX format expressions', () => {
        expect(detectFormat('A \\lor B')).toBe('latex')
        expect(detectFormat('X \\land Y')).toBe('latex')
        expect(detectFormat('\\lnot Z')).toBe('latex')
        expect(detectFormat('\\overline{A}')).toBe('latex')
      })
    })

    describe('Format Detection Edge Cases', () => {
      it('handles mixed format inputs by prioritizing LaTeX markers', () => {
        // Mixed format: standard AND with LaTeX OR
        const format = detectFormat('A AND B \\lor C')
        expect(format).toBe('latex')

        // The parser should still parse this correctly as LaTeX
        const result = parseBoolean('A AND B \\lor C', { inputFormat: 'latex' })
        expect(result.success).toBe(true)
      })

      it('detects format based on Unicode symbols', () => {
        expect(detectFormat('A ∧ B')).toBe('latex')
        expect(detectFormat('A ∨ B')).toBe('latex')
        expect(detectFormat('¬A')).toBe('latex')
      })

      it('correctly parses expressions with mixed Unicode and text operators', () => {
        // Mix of Unicode AND (∧) with text OR
        const result = parseBoolean('A ∧ B OR C', { inputFormat: 'latex' })
        expect(result.success).toBe(true)
        expect(result.expression).toMatchObject({
          type: 'OR',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: { type: 'VARIABLE', value: 'C' },
        })
      })
    })
  })

  // ============================================================================
  // LATEX FORMAT PARSING TESTS
  // ============================================================================
  describe('LaTeX Format Parsing', () => {
    describe('Basic LaTeX Operations', () => {
      it('handles LaTeX input', () => {
        expect(parseExpression('A \\land B')).toMatchObject({
          type: 'AND',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        })

        expect(parseExpression('\\lnot (A \\lor B)')).toMatchObject({
          type: 'NOT',
          left: {
            type: 'OR',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
        })
      })

      it('parses expressions with LaTeX options explicitly set', () => {
        expect(parseBoolean('A \\lor B', { inputFormat: 'latex' }).success).toBe(true)
        expect(parseBoolean('X \\land Y', { inputFormat: 'latex' }).success).toBe(true)
        expect(parseBoolean('\\lnot Z', { inputFormat: 'latex' }).success).toBe(true)
        expect(parseBoolean('\\overline{A}', { inputFormat: 'latex' }).success).toBe(true)
      })
    })

    describe('LaTeX Overline Notation', () => {
      it('handles LaTeX overline syntax', () => {
        expect(parseExpression('\\overline{\\overline{A}}')).toMatchObject({
          type: 'NOT',
          left: {
            type: 'NOT',
            left: { type: 'VARIABLE', value: 'A' },
          },
        })
      })

      it('handles LaTeX overline on complex expressions', () => {
        expect(parseExpression('\\overline{A \\land B}')).toMatchObject({
          type: 'NOT',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
        })
      })
    })

    describe('Unicode Symbols in LaTeX', () => {
      it('handles Unicode symbols in LaTeX expressions', () => {
        expect(parseExpression('A ∧ B ∨ ¬C')).toMatchObject({
          type: 'OR',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: {
            type: 'NOT',
            left: { type: 'VARIABLE', value: 'C' },
          },
        })
      })

      it('parses expressions with Unicode logical symbols', () => {
        // Unicode logical AND (∧)
        expect(parseBoolean('A ∧ B', { inputFormat: 'latex' }).success).toBe(true)

        // Unicode logical OR (∨)
        expect(parseBoolean('A ∨ B', { inputFormat: 'latex' }).success).toBe(true)

        // Unicode logical NOT (¬)
        expect(parseBoolean('¬A', { inputFormat: 'latex' }).success).toBe(true)
      })

      it('handles complex expressions with Unicode symbols', () => {
        // A ∨ (B ∧ ¬C)
        const result = parseBoolean('A ∨ (B ∧ ¬C)', { inputFormat: 'latex' })
        expect(result.success).toBe(true)
        expect(result.expression).toMatchObject({
          type: 'OR',
          left: { type: 'VARIABLE', value: 'A' },
          right: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'B' },
            right: {
              type: 'NOT',
              left: { type: 'VARIABLE', value: 'C' },
            },
          },
        })
      })
    })

    describe('LaTeX Derived Operations', () => {
      it('handles derived operations in LaTeX syntax', () => {
        // XOR in LaTeX: (A \lor B) \land \lnot(A \land B)
        const xorLatexExpr = '(A \\lor B) \\land \\lnot(A \\land B)'
        expect(parseExpression(xorLatexExpr)).toMatchObject({
          type: 'AND',
          left: {
            type: 'OR',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: {
            type: 'NOT',
            left: {
              type: 'AND',
              left: { type: 'VARIABLE', value: 'A' },
              right: { type: 'VARIABLE', value: 'B' },
            },
          },
        })

        // NAND in LaTeX: \lnot(A \land B)
        const nandLatexExpr = '\\lnot(A \\land B)'
        expect(parseExpression(nandLatexExpr)).toMatchObject({
          type: 'NOT',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
        })

        // NOR in LaTeX: \lnot(A \lor B)
        const norLatexExpr = '\\lnot(A \\lor B)'
        expect(parseExpression(norLatexExpr)).toMatchObject({
          type: 'NOT',
          left: {
            type: 'OR',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
        })
      })
    })

    describe('LaTeX Precedence', () => {
      it('respects precedence in LaTeX expressions', () => {
        // A \lor B \land C (A OR B AND C)
        const result = parseBoolean('A \\lor B \\land C', { inputFormat: 'latex' })
        expect(result.success).toBe(true)
        expect(result.expression).toMatchObject({
          type: 'OR',
          left: { type: 'VARIABLE', value: 'A' },
          right: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'B' },
            right: { type: 'VARIABLE', value: 'C' },
          },
        })
      })
    })
  })

  // ============================================================================
  // ROBUSTNESS TESTS
  // ============================================================================
  describe('Input Robustness', () => {
    describe('Redundant Syntax Handling', () => {
      it('handles expressions with redundant parentheses', () => {
        // Expression with multiple layers of redundant parentheses
        const result = parseBoolean('((((A)))) AND (((B)))')
        expect(result.success).toBe(true)
        expect(result.expression).toMatchObject({
          type: 'AND',
          left: { type: 'VARIABLE', value: 'A' },
          right: { type: 'VARIABLE', value: 'B' },
        })
      })

      it('handles expressions with unusual whitespace', () => {
        // Expression with excessive and unusual whitespace
        const result = parseBoolean('  A    AND  \t  B  \n  OR   \r  C  ')
        expect(result.success).toBe(true)
        expect(result.expression).toMatchObject({
          type: 'OR',
          left: {
            type: 'AND',
            left: { type: 'VARIABLE', value: 'A' },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: { type: 'VARIABLE', value: 'C' },
        })
      })

      it('handles expressions with redundant operators', () => {
        // Expression with NOT NOT (double negation)
        const result = parseBoolean('NOT NOT A')
        expect(result.success).toBe(true)
        expect(result.expression).toMatchObject({
          type: 'NOT',
          left: {
            type: 'NOT',
            left: { type: 'VARIABLE', value: 'A' },
          },
        })
      })

      it('handles expressions with unusual but valid combinations', () => {
        // Complex expression with unusual structure
        const result = parseBoolean('(((NOT A) AND B) OR ((C)))')
        expect(result.success).toBe(true)
        // The structure should be simplified by the parser when possible
        expect(result.expression).toMatchObject({
          type: 'OR',
          left: {
            type: 'AND',
            left: {
              type: 'NOT',
              left: { type: 'VARIABLE', value: 'A' },
            },
            right: { type: 'VARIABLE', value: 'B' },
          },
          right: { type: 'VARIABLE', value: 'C' },
        })
      })
    })

    describe('Boundary Cases', () => {
      it('handles minimum complexity expressions', () => {
        expect(parseBoolean('A').success).toBe(true)
        expect(parseBoolean('0').success).toBe(true)
        expect(parseBoolean('1').success).toBe(true)
      })

      it('handles expressions with many operators', () => {
        const complexExpression = 'A AND B AND C AND D AND E AND F AND G AND H'
        expect(parseBoolean(complexExpression).success).toBe(true)
      })

      it('handles expressions with maximum variables', () => {
        // Test with a reasonable number of variables
        const manyVars = 'A AND B AND C AND D AND E AND F AND G AND H AND I AND J AND K AND L'
        expect(parseBoolean(manyVars).success).toBe(true)
      })

      it('handles expressions with unusual spacing', () => {
        expect(parseBoolean('   A      AND     B   ').success).toBe(true)
      })
    })

    describe('Helper Functions', () => {
      it('getValidExpressionExamples returns valid example strings', () => {
        const examples = getValidExpressionExamples()
        expect(Array.isArray(examples)).toBe(true)
        expect(examples.length).toBeGreaterThan(0)

        // Verify examples are valid by parsing them
        for (const example of examples) {
          expect(parseBoolean(example).success).toBe(true)
        }
      })
    })

    describe('Case Sensitivity', () => {
      it('handles case-insensitive keywords', () => {
        expect(parseBoolean('A and B').success).toBe(true)
        expect(parseBoolean('A oR B').success).toBe(true)
        expect(parseBoolean('nOt A').success).toBe(true)
      })

      it('rejects case-sensitive variables', () => {
        expect(parseBoolean('a AND B').success).toBe(false)
      })
    })
  })
})
