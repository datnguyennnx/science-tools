import { describe, it, expect } from 'vitest'
import { formatToBoolean, formatToLatex, formatExpression } from '../formatter'
import type { BooleanExpression } from '../../ast/types'

// Helper to create a variable node
const Var = (name: string): BooleanExpression => ({ type: 'VARIABLE', value: name })
// Helper to create a constant node
const Const = (val: boolean): BooleanExpression => ({ type: 'CONSTANT', value: val })
// Helper for NOT
const Not = (expr: BooleanExpression): BooleanExpression => ({ type: 'NOT', left: expr })
// Helper for AND
const And = (left: BooleanExpression, right: BooleanExpression): BooleanExpression => ({
  type: 'AND',
  left,
  right,
})
// Helper for OR
const Or = (left: BooleanExpression, right: BooleanExpression): BooleanExpression => ({
  type: 'OR',
  left,
  right,
})

describe('Boolean Algebra Formatters Tests', () => {
  // ============================================================================
  // CORRECTNESS TESTS
  // ============================================================================
  describe('Functional Correctness Tests', () => {
    describe('formatToBoolean - Basic Correctness', () => {
      it('should format atomic expressions correctly', () => {
        expect(formatToBoolean(Var('A'))).toBe('A')
        expect(formatToBoolean(Const(true))).toBe('1')
        expect(formatToBoolean(Const(false))).toBe('0')
      })

      it('should format unary operations correctly', () => {
        expect(formatToBoolean(Not(Var('A')))).toBe('!(A)')
        expect(formatToBoolean(Not(Const(true)))).toBe('!(1)')
      })

      it('should format binary operations correctly', () => {
        expect(formatToBoolean(And(Var('A'), Var('B')))).toBe('(A * B)')
        expect(formatToBoolean(Or(Var('A'), Var('B')))).toBe('(A + B)')
      })
    })

    describe('formatToLatex - Basic Correctness', () => {
      it('should format atomic expressions correctly', () => {
        expect(formatToLatex(Var('A'))).toBe('A')
        expect(formatToLatex(Const(true))).toBe('1')
        expect(formatToLatex(Const(false))).toBe('0')
      })

      it('should format unary operations correctly', () => {
        expect(formatToLatex(Not(Var('A')))).toBe('\\lnot A')
        expect(formatToLatex(Not(Const(false)))).toBe('\\lnot 0')
      })

      it('should format binary operations correctly', () => {
        expect(formatToLatex(And(Var('A'), Var('B')))).toBe('(A \\land B)')
        expect(formatToLatex(Or(Var('A'), Var('B')))).toBe('(A \\lor B)')
      })
    })

    describe('formatExpression - Format Selection Correctness', () => {
      const testExpr = Or(And(Var('A'), Not(Var('B'))), Const(true))

      it('should use the appropriate formatter based on format parameter', () => {
        expect(formatExpression(testExpr, 'standard')).toBe('((A * !(B)) + 1)')
        expect(formatExpression(testExpr, 'latex')).toBe('((A \\land \\lnot B) \\lor 1)')
      })

      it('should default to standard format when none specified', () => {
        expect(formatExpression(testExpr)).toBe('((A * !(B)) + 1)')
      })
    })
  })

  // ============================================================================
  // EQUIVALENCE PARTITIONING TESTS
  // ============================================================================
  describe('Equivalence Partitioning Tests', () => {
    describe('Expression Type Partitions', () => {
      it('should handle atomic expressions (variables and constants)', () => {
        // Variables
        expect(formatToBoolean(Var('A'))).toBe('A')
        expect(formatToLatex(Var('A'))).toBe('A')

        // Constants
        expect(formatToBoolean(Const(true))).toBe('1')
        expect(formatToLatex(Const(true))).toBe('1')
        expect(formatToBoolean(Const(false))).toBe('0')
        expect(formatToLatex(Const(false))).toBe('0')
      })

      it('should handle unary operations (NOT)', () => {
        // NOT with variable
        expect(formatToBoolean(Not(Var('A')))).toBe('!(A)')
        expect(formatToLatex(Not(Var('A')))).toBe('\\lnot A')

        // NOT with constant
        expect(formatToBoolean(Not(Const(true)))).toBe('!(1)')
        expect(formatToLatex(Not(Const(true)))).toBe('\\lnot 1')
      })

      it('should handle binary operations (AND, OR)', () => {
        // AND operation
        expect(formatToBoolean(And(Var('A'), Var('B')))).toBe('(A * B)')
        expect(formatToLatex(And(Var('A'), Var('B')))).toBe('(A \\land B)')

        // OR operation
        expect(formatToBoolean(Or(Var('A'), Var('B')))).toBe('(A + B)')
        expect(formatToLatex(Or(Var('A'), Var('B')))).toBe('(A \\lor B)')
      })
    })

    describe('Output Format Partitions', () => {
      const testExpr = Or(And(Var('A'), Var('B')), Not(Var('C')))

      it('should produce standard boolean format', () => {
        expect(formatExpression(testExpr, 'standard')).toBe('((A * B) + !(C))')
      })

      it('should produce LaTeX format', () => {
        expect(formatExpression(testExpr, 'latex')).toBe('((A \\land B) \\lor \\lnot C)')
      })

      it('should default to standard format', () => {
        expect(formatExpression(testExpr)).toBe('((A * B) + !(C))')
      })
    })

    describe('Expression Complexity Partitions', () => {
      it('should handle simple expressions (depth 1)', () => {
        // Single operation expressions
        expect(formatToBoolean(Not(Var('A')))).toBe('!(A)')
        expect(formatToBoolean(And(Var('A'), Var('B')))).toBe('(A * B)')
        expect(formatToBoolean(Or(Var('A'), Var('B')))).toBe('(A + B)')
      })

      it('should handle medium complexity expressions (depth 2-3)', () => {
        // Nested operations with depth 2-3
        const mediumExpr1 = And(Not(Var('A')), Or(Var('B'), Var('C')))
        expect(formatToBoolean(mediumExpr1)).toBe('(!(A) * (B + C))')

        const mediumExpr2 = Or(And(Var('A'), Not(Var('B'))), Not(And(Var('C'), Var('D'))))
        expect(formatToBoolean(mediumExpr2)).toBe('((A * !(B)) + !((C * D)))')
      })

      it('should handle complex expressions (depth 4+)', () => {
        // Deeply nested expression with depth 4+
        const deepExpr = And(
          Not(Or(And(Var('A'), Not(Var('B'))), Not(And(Var('C'), Var('D'))))),
          Or(Not(Var('E')), And(Var('F'), Or(Var('G'), Not(Var('H')))))
        )

        expect(formatToBoolean(deepExpr)).toBe(
          '(!(((A * !(B)) + !((C * D)))) * (!(E) + (F * (G + !(H)))))'
        )
      })
    })
  })

  // ============================================================================
  // BOUNDARY TESTS
  // ============================================================================
  describe('Boundary Value Tests', () => {
    describe('Variable Name Boundaries', () => {
      it('should handle empty variable names', () => {
        expect(() => formatToBoolean(Var(''))).toThrow(
          'Invalid or empty variable value in AST node'
        )
        expect(() => formatToLatex(Var(''))).toThrow('Invalid or empty variable value in AST node')
      })

      it('should handle single character variable names', () => {
        expect(formatToBoolean(Var('X'))).toBe('X')
        expect(formatToLatex(Var('X'))).toBe('X')
      })

      it('should handle extremely long variable names', () => {
        const shortLongName = 'A'.repeat(10) // 10 characters
        expect(formatToBoolean(Var(shortLongName))).toBe(shortLongName)
        expect(formatToLatex(Var(shortLongName))).toBe(shortLongName)

        const mediumLongName = 'A'.repeat(50) // 50 characters
        expect(formatToBoolean(Var(mediumLongName))).toBe(mediumLongName)
        expect(formatToLatex(Var(mediumLongName))).toBe(mediumLongName)

        const extremeLongName = 'A'.repeat(100) // 100 characters
        expect(formatToBoolean(Var(extremeLongName))).toBe(extremeLongName)
        expect(formatToLatex(Var(extremeLongName))).toBe(extremeLongName)
      })
    })

    describe('Special Character Handling', () => {
      it('should handle variable names with special characters', () => {
        const specialChars = ['X_1', 'Y′', 'Z₂', 'α', 'β', 'X₁₅']

        for (const char of specialChars) {
          expect(formatToBoolean(Var(char))).toBe(char)
          expect(formatToLatex(Var(char))).toBe(char)
        }
      })

      it('should handle variable names that contain LaTeX-like sequences', () => {
        const latexLikeNames = ['\\lnot', '\\land', '\\lor', '\\alpha']

        for (const name of latexLikeNames) {
          expect(formatToBoolean(Var(name))).toBe(name)
          expect(formatToLatex(Var(name))).toBe(name)
        }
      })
    })

    describe('Expression Nesting Boundaries', () => {
      it('should handle deeply nested NOT operations', () => {
        // Check double negation
        let expr: BooleanExpression = Var('A')
        expect(formatToBoolean(Not(Not(expr)))).toBe('!(!(A))')
        expect(formatToLatex(Not(Not(expr)))).toBe('\\lnot \\lnot A')

        // Check triple negation
        expr = Not(Not(expr))
        expect(formatToBoolean(Not(expr))).toBe('!(!(!(A)))')
        expect(formatToLatex(Not(expr))).toBe('\\lnot \\lnot \\lnot A')

        // Check quadruple negation
        expr = Not(expr)
        expect(formatToBoolean(Not(expr))).toBe('!(!(!(!(A))))')
        expect(formatToLatex(Not(expr))).toBe('\\lnot \\lnot \\lnot \\lnot A')
      })
    })

    describe('formatToLatex - Invalid Inputs', () => {
      it('should throw for malformed expression objects', () => {
        // Empty object
        const emptyObj = {} as unknown as BooleanExpression
        expect(() => formatToLatex(emptyObj)).toThrow()

        // Missing type property
        const noType = { left: Var('A'), right: Var('B') } as unknown as BooleanExpression
        expect(() => formatToLatex(noType)).toThrow()

        // Incorrect value types
        const badValueType = { type: 'VARIABLE', value: 123 } as unknown as BooleanExpression
        expect(() => formatToLatex(badValueType)).toThrow(
          'Invalid or empty variable value in AST node'
        )
      })
    })
  })

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================
  describe('Error Handling Tests', () => {
    describe('formatToBoolean - Error Handling', () => {
      it('should throw for unknown expression types', () => {
        const badExpr = { type: 'UNKNOWN' } as unknown as BooleanExpression
        expect(() => formatToBoolean(badExpr)).toThrow('Unknown expression type: UNKNOWN')
      })

      it('should throw for null expressions', () => {
        expect(() => formatToBoolean(null as unknown as BooleanExpression)).toThrow()
      })

      it('should throw for undefined expressions', () => {
        expect(() => formatToBoolean(undefined as unknown as BooleanExpression)).toThrow()
      })

      it('should throw for malformed binary expressions', () => {
        const missingLeft = { type: 'AND', right: Var('B') } as unknown as BooleanExpression
        expect(() => formatToBoolean(missingLeft)).toThrow()

        const missingRight = { type: 'OR', left: Var('A') } as unknown as BooleanExpression
        expect(() => formatToBoolean(missingRight)).toThrow()
      })

      it('should throw for malformed unary expressions', () => {
        const missingChild = { type: 'NOT' } as unknown as BooleanExpression
        expect(() => formatToBoolean(missingChild)).toThrow()
      })

      it('should throw for invalid expression types', () => {
        const invalidTypeExpr = {
          type: 'INVALID_TYPE',
          left: Var('A'),
          right: Var('B'),
        } as unknown as BooleanExpression
        expect(() => formatToBoolean(invalidTypeExpr)).toThrow(
          'Unknown expression type: INVALID_TYPE'
        )
      })
    })

    describe('formatToLatex - Error Handling', () => {
      it('should throw for unknown expression types', () => {
        const badExpr = { type: 'UNKNOWN' } as unknown as BooleanExpression
        expect(() => formatToLatex(badExpr)).toThrow('Unknown expression type: UNKNOWN')
      })

      it('should throw for null expressions', () => {
        expect(() => formatToLatex(null as unknown as BooleanExpression)).toThrow()
      })

      it('should throw for undefined expressions', () => {
        expect(() => formatToLatex(undefined as unknown as BooleanExpression)).toThrow()
      })

      it('should throw for malformed binary expressions', () => {
        const missingLeft = { type: 'AND', right: Var('B') } as unknown as BooleanExpression
        expect(() => formatToLatex(missingLeft)).toThrow()

        const missingRight = { type: 'OR', left: Var('A') } as unknown as BooleanExpression
        expect(() => formatToLatex(missingRight)).toThrow()
      })

      it('should throw for malformed unary expressions', () => {
        const missingChild = { type: 'NOT' } as unknown as BooleanExpression
        expect(() => formatToLatex(missingChild)).toThrow()
      })

      it('should throw for invalid expression types', () => {
        const invalidTypeExpr = {
          type: 'INVALID_TYPE',
          left: Var('A'),
          right: Var('B'),
        } as unknown as BooleanExpression
        expect(() => formatToLatex(invalidTypeExpr)).toThrow(
          'Unknown expression type: INVALID_TYPE'
        )
      })
    })

    describe('formatExpression - Error Handling', () => {
      it('should propagate errors from internal formatters', () => {
        const badExpr = { type: 'UNKNOWN' } as unknown as BooleanExpression

        expect(() => formatExpression(badExpr, 'standard')).toThrow(
          'Unknown expression type: UNKNOWN'
        )
        expect(() => formatExpression(badExpr, 'latex')).toThrow('Unknown expression type: UNKNOWN')
      })
    })
  })

  // ============================================================================
  // HAPPY PATH TESTS
  // ============================================================================
  describe('Happy Path Tests', () => {
    describe('formatToBoolean - Complex Nested Expressions', () => {
      it('should format nested binary operations correctly', () => {
        // A AND (B OR C)
        expect(formatToBoolean(And(Var('A'), Or(Var('B'), Var('C'))))).toBe('(A * (B + C))')

        // (A OR B) AND C
        expect(formatToBoolean(And(Or(Var('A'), Var('B')), Var('C')))).toBe('((A + B) * C)')
      })

      it('should format expressions with NOT operations correctly', () => {
        // NOT(A) AND B
        expect(formatToBoolean(And(Not(Var('A')), Var('B')))).toBe('(!(A) * B)')

        // A AND NOT(B)
        expect(formatToBoolean(And(Var('A'), Not(Var('B'))))).toBe('(A * !(B))')

        // NOT(A OR B)
        expect(formatToBoolean(Not(Or(Var('A'), Var('B'))))).toBe('!((A + B))')
      })

      it('should format deeply nested expressions correctly', () => {
        // ((A AND NOT(B)) OR (C AND (D OR NOT(E))))
        const deepExpr = Or(
          And(Var('A'), Not(Var('B'))),
          And(Var('C'), Or(Var('D'), Not(Var('E'))))
        )
        expect(formatToBoolean(deepExpr)).toBe('((A * !(B)) + (C * (D + !(E))))')

        // Complex multi-level nesting
        const extremeNesting = And(
          Not(Or(And(Var('A'), Not(Var('B'))), Not(And(Var('C'), Var('D'))))),
          Or(Not(Var('E')), And(Var('F'), Or(Var('G'), Not(Var('H')))))
        )
        expect(formatToBoolean(extremeNesting)).toBe(
          '(!(((A * !(B)) + !((C * D)))) * (!(E) + (F * (G + !(H)))))'
        )
      })
    })

    describe('formatToLatex - Complex Nested Expressions', () => {
      it('should format expressions with NOT operations correctly', () => {
        // \lnot A \land B
        expect(formatToLatex(And(Not(Var('A')), Var('B')))).toBe('(\\lnot A \\land B)')

        // \lnot (A \lor B)
        expect(formatToLatex(Not(Or(Var('A'), Var('B'))))).toBe('\\lnot (A \\lor B)')

        // \lnot \lnot A (double negation)
        expect(formatToLatex(Not(Not(Var('A'))))).toBe('\\lnot \\lnot A')
      })

      it('should format deeply nested expressions correctly', () => {
        // ((\lnot A \land B) \lor (C \land (D \lor \lnot E)))
        const deepExpr = Or(
          And(Not(Var('A')), Var('B')),
          And(Var('C'), Or(Var('D'), Not(Var('E'))))
        )
        expect(formatToLatex(deepExpr)).toBe(
          '((\\lnot A \\land B) \\lor (C \\land (D \\lor \\lnot E)))'
        )
      })
    })

    describe('formatToBoolean - Constants in Complex Expressions', () => {
      it('should format expressions with constants correctly', () => {
        // (1 AND A)
        expect(formatToBoolean(And(Const(true), Var('A')))).toBe('(1 * A)')

        // (A OR 0)
        expect(formatToBoolean(Or(Var('A'), Const(false)))).toBe('(A + 0)')

        // NOT((A AND 1) OR (B AND 0))
        const constExpr = Not(Or(And(Var('A'), Const(true)), And(Var('B'), Const(false))))
        expect(formatToBoolean(constExpr)).toBe('!(((A * 1) + (B * 0)))')
      })
    })
  })

  // ============================================================================
  // NEGATIVE PATH TESTS
  // ============================================================================
  describe('Negative Path Tests', () => {
    describe('formatToBoolean - Invalid Inputs', () => {
      it('should throw for null expressions', () => {
        expect(() => formatToBoolean(null as unknown as BooleanExpression)).toThrow()
      })

      it('should throw for undefined expressions', () => {
        expect(() => formatToBoolean(undefined as unknown as BooleanExpression)).toThrow()
      })

      it('should throw for invalid expression types', () => {
        const invalidTypeExpr = {
          type: 'INVALID_TYPE',
          left: Var('A'),
          right: Var('B'),
        } as unknown as BooleanExpression
        expect(() => formatToBoolean(invalidTypeExpr)).toThrow(
          'Unknown expression type: INVALID_TYPE'
        )
      })

      it('should throw for malformed expression objects', () => {
        // Empty object
        const emptyObj = {} as unknown as BooleanExpression
        expect(() => formatToBoolean(emptyObj)).toThrow()

        // Missing type property
        const noType = { left: Var('A'), right: Var('B') } as unknown as BooleanExpression
        expect(() => formatToBoolean(noType)).toThrow()

        // Incorrect value types
        const badValueType = { type: 'VARIABLE', value: 123 } as unknown as BooleanExpression
        expect(() => formatToBoolean(badValueType)).toThrow(
          'Invalid or empty variable value in AST node'
        )
      })
    })

    describe('formatToLatex - Invalid Inputs', () => {
      it('should throw for null expressions', () => {
        expect(() => formatToLatex(null as unknown as BooleanExpression)).toThrow()
      })

      it('should throw for undefined expressions', () => {
        expect(() => formatToLatex(undefined as unknown as BooleanExpression)).toThrow()
      })

      it('should throw for invalid expression types', () => {
        const invalidTypeExpr = {
          type: 'INVALID_TYPE',
          left: Var('A'),
          right: Var('B'),
        } as unknown as BooleanExpression
        expect(() => formatToLatex(invalidTypeExpr)).toThrow(
          'Unknown expression type: INVALID_TYPE'
        )
      })

      it('should throw for malformed expressions with missing children', () => {
        const missingLeft = { type: 'AND', right: Var('B') } as unknown as BooleanExpression
        expect(() => formatToLatex(missingLeft)).toThrow()

        const missingRight = { type: 'OR', left: Var('A') } as unknown as BooleanExpression
        expect(() => formatToLatex(missingRight)).toThrow()

        const missingChild = { type: 'NOT' } as unknown as BooleanExpression
        expect(() => formatToLatex(missingChild)).toThrow()
      })
    })

    describe('formatExpression - Invalid Inputs', () => {
      it('should default to standard format for invalid format parameter', () => {
        const expr = Var('A')

        // @ts-expect-error - Testing invalid format
        expect(formatExpression(expr, 'invalid_format')).toBe('A')
        // Note: current implementation doesn't validate format string and defaults to 'standard'
      })

      it('should propagate errors from internal formatters', () => {
        const invalidExpr = { type: 'INVALID' } as unknown as BooleanExpression

        expect(() => formatExpression(invalidExpr, 'standard')).toThrow()
        expect(() => formatExpression(invalidExpr, 'latex')).toThrow()
      })
    })

    describe('Non-BooleanExpression Inputs', () => {
      it('should throw when passing non-object values', () => {
        expect(() => formatToBoolean('string' as unknown as BooleanExpression)).toThrow()
        expect(() => formatToLatex(42 as unknown as BooleanExpression)).toThrow()
        expect(() => formatToBoolean(true as unknown as BooleanExpression)).toThrow()
        expect(() => formatToLatex([] as unknown as BooleanExpression)).toThrow()
      })
    })
  })
})
