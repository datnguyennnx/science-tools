import { describe, test, expect } from 'vitest'
import {
  preprocessInput,
  normalizeOperators,
  preprocessStandardInput,
  preprocessLatexInput,
  normalizeStandardOperators,
  normalizeLatexOperators,
} from '../input-processor'

describe('Boolean Expression Input Processing Tests', () => {
  // ============================================================================
  // CORRECTNESS TESTS
  // ============================================================================
  describe('Correctness Tests', () => {
    describe('preprocessInput - Main Entry Point', () => {
      test('should preprocess standard input correctly', () => {
        const input = 'A AND B'
        const result = preprocessInput(input, 'standard')
        expect(result).toBe('A*B')
      })

      test('should preprocess LaTeX input correctly', () => {
        const input = 'A \\land B'
        const result = preprocessInput(input, 'latex')
        expect(result).toBe('A*B')
      })

      test('should default to standard input when format not specified', () => {
        const input = 'A AND B'
        const result = preprocessInput(input)
        expect(result).toBe('A*B')
      })
    })

    describe('normalizeOperators - Functional Correctness', () => {
      test('should normalize standard operators correctly', () => {
        const input = 'A AND B OR NOT C'
        const result = normalizeOperators(input, 'standard')
        expect(result).toBe('A*B+!C')
      })

      test('should normalize LaTeX operators correctly', () => {
        const input = 'A \\land B \\lor \\lnot C'
        const result = normalizeOperators(input, 'latex')
        expect(result).toBe('A*B+!C')
      })

      test('should default to standard format when not specified', () => {
        const input = 'A AND B'
        const result = normalizeOperators(input)
        expect(result).toBe('A*B')
      })
    })
  })

  // ============================================================================
  // EQUIVALENCE PARTITIONING TESTS
  // ============================================================================
  describe('Equivalence Partitioning Tests', () => {
    describe('Standard Operator Normalization - Equivalence Classes', () => {
      // Test different classes of operators
      test('should normalize textual AND operators equivalently', () => {
        expect(normalizeStandardOperators('A AND B')).toBe('A*B')
        expect(normalizeStandardOperators('A and B')).toBe('A*B')
        expect(normalizeStandardOperators('A And B')).toBe('A*B')
      })

      test('should normalize textual OR operators equivalently', () => {
        expect(normalizeStandardOperators('A OR B')).toBe('A+B')
        expect(normalizeStandardOperators('A or B')).toBe('A+B')
        expect(normalizeStandardOperators('A Or B')).toBe('A+B')
      })

      test('should normalize textual NOT operators equivalently', () => {
        expect(normalizeStandardOperators('NOT A')).toBe('!A')
        expect(normalizeStandardOperators('not A')).toBe('!A')
        expect(normalizeStandardOperators('Not A')).toBe('!A')
      })

      test('should normalize symbolic AND operators equivalently', () => {
        expect(normalizeStandardOperators('A & B')).toBe('A*B')
        expect(normalizeStandardOperators('A ∧ B')).toBe('A*B')
        expect(normalizeStandardOperators('A · B')).toBe('A*B')
      })

      test('should normalize symbolic OR operators equivalently', () => {
        expect(normalizeStandardOperators('A | B')).toBe('A+B')
        expect(normalizeStandardOperators('A ∨ B')).toBe('A+B')
        expect(normalizeStandardOperators('A V B')).toBe('AVB')
        expect(normalizeStandardOperators('A v B')).toBe('AvB')
      })

      test('should normalize symbolic NOT operators equivalently', () => {
        expect(normalizeStandardOperators('~A')).toBe('!A')
        expect(normalizeStandardOperators('¬A')).toBe('!A')
      })
    })

    describe('LaTeX Operator Normalization - Equivalence Classes', () => {
      test('should normalize LaTeX AND operators equivalently', () => {
        expect(normalizeLatexOperators('A \\land B')).toBe('A*B')
        expect(normalizeLatexOperators('A \\wedge B')).toBe('A*B')
        expect(normalizeLatexOperators('A ∧ B')).toBe('A*B')
      })

      test('should normalize LaTeX OR operators equivalently', () => {
        expect(normalizeLatexOperators('A \\lor B')).toBe('A+B')
        expect(normalizeLatexOperators('A \\vee B')).toBe('A+B')
        expect(normalizeLatexOperators('A ∨ B')).toBe('A+B')
      })

      test('should normalize LaTeX NOT operators equivalently', () => {
        expect(normalizeLatexOperators('\\lnot A')).toBe('!A')
        expect(normalizeLatexOperators('\\neg A')).toBe('!A')
        expect(normalizeLatexOperators('¬A')).toBe('!A')
      })
    })
  })

  // ============================================================================
  // BOUNDARY TESTS
  // ============================================================================
  describe('Boundary Tests', () => {
    describe('Standard Preprocessing - Boundary Cases', () => {
      // Simple cases (boundaries of expression complexity)
      test('should handle single variable', () => {
        expect(preprocessStandardInput('A')).toBe('A')
      })

      test('should handle single constant', () => {
        expect(preprocessStandardInput('0')).toBe('0')
        expect(preprocessStandardInput('1')).toBe('1')
      })

      // Multiple operators (boundaries of operator count)
      test('should handle multiple operators in sequence', () => {
        expect(normalizeStandardOperators('A && B')).toBe('A*B')
        expect(normalizeStandardOperators('A || B')).toBe('A+B')
        expect(normalizeStandardOperators('A ∧∧ B')).toBe('A*B')
        expect(normalizeStandardOperators('A ∨∨ B')).toBe('A+B')
        expect(normalizeStandardOperators('~~A')).toBe('!!A')
      })

      // Nesting (boundaries of expression depth)
      test('should process deeply nested expressions', () => {
        const input = 'A*(B+(C*(D+E)))'
        expect(preprocessStandardInput(input)).toBe(input)

        const complexInput = '((A+B)*((C+D)*(E+F)))'
        expect(preprocessStandardInput(complexInput)).toBe(complexInput)
      })

      // Length (boundaries of expression length)
      test('should handle very long expressions', () => {
        const longExpression = 'A+B+C+D+E+F+G+H+I+J+K+L+M+N+O+P'
        expect(preprocessStandardInput(longExpression)).toBe(longExpression)
      })

      // Chained operations (boundary of implicit operator handling)
      test('should add implicit operators in complex chained expressions', () => {
        // AB(CD)EF -> A*B*(C*D)*E*F
        expect(preprocessStandardInput('AB(CD)EF')).toBe('A*B*(C*D)*E*F')
      })
    })
  })

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================
  describe('Error Handling Tests', () => {
    describe('Problematic Pattern Fixing', () => {
      test('should fix number-before-negation patterns', () => {
        expect(preprocessStandardInput('1!A')).toBe('1*!A')
        expect(preprocessStandardInput('1!(A+B)')).toBe('1*!(A+B)')
      })

      test('should explicitly test fixProblematicPatterns function with no errors', () => {
        // Direct test of the utility function
        // Note: Importing the function directly from patterns
        // expect(fixProblematicPatterns('1!A', false)).toBe('1*!A')
        // expect(fixProblematicPatterns('1!(A+B)', false)).toBe('1*!(A+B)')

        // Using the public API instead
        expect(preprocessStandardInput('1!A')).toBe('1*!A')
        expect(preprocessStandardInput('1!(A+B)')).toBe('1*!(A+B)')
      })

      test('should pass through valid expressions unchanged', () => {
        const validExpression = 'A*(B+C)'
        expect(preprocessStandardInput(validExpression)).toBe(validExpression)
      })

      test('should throw for empty input due to fixProblematicPatterns', () => {
        expect(() => preprocessStandardInput('')).toThrow('Empty expression')
      })
    })
  })

  // ============================================================================
  // HAPPY PATH TESTS
  // ============================================================================
  describe('Happy Path Tests', () => {
    describe('preprocessStandardInput - Happy Path', () => {
      test('should handle simple expressions', () => {
        expect(preprocessStandardInput('A AND B')).toBe('A*B')
        expect(preprocessStandardInput('A OR B')).toBe('A+B')
        expect(preprocessStandardInput('NOT A')).toBe('!A')
      })

      test('should handle expressions with parentheses', () => {
        expect(preprocessStandardInput('(A AND B) OR C')).toBe('(A*B)+C')
        expect(preprocessStandardInput('A AND (B OR C)')).toBe('A*(B+C)')
      })

      test('should handle constants', () => {
        expect(preprocessStandardInput('A AND 1')).toBe('A*1')
        expect(preprocessStandardInput('0 OR B')).toBe('0+B')
      })

      test('should add implicit operators', () => {
        expect(preprocessStandardInput('AB')).toBe('A*B')
        expect(preprocessStandardInput('A(B+C)')).toBe('A*(B+C)')
        expect(preprocessStandardInput('(A+B)C')).toBe('(A+B)*C')
        expect(preprocessStandardInput('(A)(B)')).toBe('(A)*(B)')
      })
    })

    describe('preprocessLatexInput - Happy Path', () => {
      test('should handle LaTeX logical operators', () => {
        expect(preprocessLatexInput('A \\land B')).toBe('A*B')
        expect(preprocessLatexInput('A \\lor B')).toBe('A+B')
        expect(preprocessLatexInput('\\lnot A')).toBe('!A')
      })

      test('should handle LaTeX alternative operators', () => {
        expect(preprocessLatexInput('A \\wedge B')).toBe('A*B')
        expect(preprocessLatexInput('A \\vee B')).toBe('A+B')
        expect(preprocessLatexInput('\\neg A')).toBe('!A')
      })

      test('should handle LaTeX spacing commands', () => {
        expect(preprocessLatexInput('A \\quad \\land \\quad B')).toBe('A*B')
        expect(preprocessLatexInput('A\\;\\lor\\;B')).toBe('A+B')
      })

      test('should handle Unicode operators', () => {
        expect(preprocessLatexInput('A ∧ B')).toBe('A*B')
        expect(preprocessLatexInput('A ∨ B')).toBe('A+B')
        expect(preprocessLatexInput('¬A')).toBe('!A')
      })

      test('should handle \\overline notation', () => {
        expect(preprocessLatexInput('\\overline{A}')).toBe('!(A)')
        expect(preprocessLatexInput('\\overline A')).toBe('!(A)')
        expect(preprocessLatexInput('A \\land \\overline{B \\lor C}')).toBe('A*!(B+C)')
      })

      test('should handle textual constants', () => {
        expect(preprocessLatexInput('A \\land \\text{TRUE}')).toBe('A*1')
        expect(preprocessLatexInput('\\text{FALSE} \\lor B')).toBe('0+B')
      })
    })

    describe('normalizeStandardOperators - Happy Path', () => {
      test('should normalize textual operators', () => {
        expect(normalizeStandardOperators('A AND B')).toBe('A*B')
        expect(normalizeStandardOperators('A OR B')).toBe('A+B')
        expect(normalizeStandardOperators('NOT A')).toBe('!A')
      })

      test('should handle case-insensitive keywords', () => {
        expect(normalizeStandardOperators('A and B')).toBe('A*B')
        expect(normalizeStandardOperators('A or B')).toBe('A+B')
        expect(normalizeStandardOperators('not A')).toBe('!A')
        expect(normalizeStandardOperators('A And B Or Not C')).toBe('A*B+!C')
      })

      test('should normalize symbolic operators', () => {
        expect(normalizeStandardOperators('A & B')).toBe('A*B')
        expect(normalizeStandardOperators('A | B')).toBe('A+B')
        expect(normalizeStandardOperators('A ∧ B')).toBe('A*B')
        expect(normalizeStandardOperators('A ∨ B')).toBe('A+B')
        expect(normalizeStandardOperators('~A')).toBe('!A')
        expect(normalizeStandardOperators('¬A')).toBe('!A')
      })
    })
  })

  // ============================================================================
  // NEGATIVE PATH TESTS
  // ============================================================================
  describe('Negative Path Tests', () => {
    describe('Preprocessing Negative Paths', () => {
      test('should throw for empty input', () => {
        expect(() => preprocessStandardInput('')).toThrow('Empty expression')
        expect(() => preprocessLatexInput('')).toThrow('Empty expression')
      })

      test('should throw for whitespace-only input', () => {
        expect(() => preprocessStandardInput('   ')).toThrow('Empty expression')
        expect(() => preprocessLatexInput('   ')).toThrow('Empty expression')
      })

      // These tests verify that problematic patterns get fixed rather than throwing errors
      test('should handle problematic pattern number-before-negation', () => {
        expect(preprocessStandardInput('1!A')).toBe('1*!A')
        expect(preprocessStandardInput('1!(A+B)')).toBe('1*!(A+B)')
      })

      test('should throw on invalid variable names during preprocessing', () => {
        // Lowercase variable names are not allowed in this implementation
        expect(() => preprocessStandardInput('a + b')).toThrow('Invalid variable name')
      })
    })

    describe('Normalization Negative Paths', () => {
      test('should handle empty input', () => {
        expect(normalizeStandardOperators('')).toBe('')
        expect(normalizeLatexOperators('')).toBe('')
      })

      test('should handle whitespace-only input', () => {
        expect(normalizeStandardOperators('   ')).toBe('')
        expect(normalizeLatexOperators('   ')).toBe('')
      })

      test('should handle expressions with no operators', () => {
        expect(normalizeStandardOperators('ABC')).toBe('ABC')
        expect(normalizeLatexOperators('ABC')).toBe('ABC')
      })

      test('should handle invalid LaTeX commands', () => {
        // This tests that unknown LaTeX commands are passed through
        expect(normalizeLatexOperators('\\unknown{A}')).toBe('\\unknown{A}')
      })
    })
  })
})
