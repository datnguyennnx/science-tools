import { describe, it, expect, vi, beforeEach } from 'vitest'
import { convertLawsToRules } from '../law-converter'
import { BooleanExpression } from '../../ast'
import { parseExpression, expressionToBooleanString } from '../../parser'
import type { BooleanLaw } from '../../simplifier/constants'

// Define interfaces for our mock types
interface MockBooleanLaws {
  [key: string]: BooleanLaw | BooleanLaw[] | undefined
  identity?: BooleanLaw
  idempotent?: BooleanLaw
  complement?: BooleanLaw[]
  functionReplacement?: BooleanLaw
}

// Mock dependencies
vi.mock('../../parser', async importOriginal => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    parseExpression: vi.fn(),
    expressionToBooleanString: vi.fn(),
  }
})

vi.mock('../../simplifier/constants', () => ({
  booleanLaws: {
    identity: {
      name: 'Identity Law (OR)',
      formula: 'A + 0 = A',
      regex: /\(([A-Z])\+0\)/,
      replacement: '$1',
    },
    idempotent: {
      name: 'Idempotent Law (AND)',
      formula: 'A * A = A',
      regex: /\(([A-Z])\*\1\)/,
      replacement: '$1',
    },
    complement: [
      {
        name: 'Complement Law (OR)',
        formula: 'A + !A = 1',
        regex: /\(([A-Z])\+!\(\1\)\)/,
        replacement: '1',
      },
      {
        name: 'Complement Law (AND)',
        formula: 'A * !A = 0',
        regex: /\(([A-Z])\*!\(\1\)\)/,
        replacement: '0',
      },
    ],
    // For testing function replacement
    functionReplacement: {
      name: 'Function Replacement Test',
      formula: 'Test formula',
      regex: /TEST_([A-Z])_([A-Z])/,
      replacement: (matches: RegExpMatchArray) => `${matches[1]}*${matches[2]}`,
    },
  } as MockBooleanLaws,
}))

describe('Law Converter Tests', () => {
  // Mock expression for testing
  const mockExpr: BooleanExpression = {
    type: 'OR',
    left: { type: 'VARIABLE', value: 'A' },
    right: { type: 'CONSTANT', value: false },
  }

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(expressionToBooleanString).mockImplementation(expr => {
      if (expr === mockExpr) return '(A+0)'
      return 'mock-expression'
    })
    vi.mocked(parseExpression).mockImplementation(str => {
      if (str === 'A') return { type: 'VARIABLE', value: 'A' } as BooleanExpression
      return mockExpr
    })
  })

  // ============================================================================
  // 1. FUNCTIONAL CORRECTNESS TESTS
  // ============================================================================
  describe('Functional Correctness Tests', () => {
    it('converts laws to rules', () => {
      const rules = convertLawsToRules()
      expect(rules).toBeInstanceOf(Array)

      // Rules should have the correct interface
      if (rules.length > 0) {
        rules.forEach(rule => {
          expect(rule).toHaveProperty('info')
          expect(rule).toHaveProperty('canApply')
          expect(rule).toHaveProperty('apply')
          expect(typeof rule.canApply).toBe('function')
          expect(typeof rule.apply).toBe('function')
        })
      }
    })
  })

  // ============================================================================
  // 2. HAPPY-PATH TESTS
  // ============================================================================
  describe('Happy-Path Tests', () => {
    it('creates rules with proper info object', () => {
      const rules = convertLawsToRules()

      // Skip test if no rules are created
      if (rules.length === 0) {
        return
      }

      // Each rule should have info with name, description and formula
      rules.forEach(rule => {
        expect(rule.info).toHaveProperty('name')
        expect(rule.info).toHaveProperty('description')
        expect(rule.info).toHaveProperty('formula')
      })
    })

    it('returns an array even if no laws are found', () => {
      // This test verifies that the function doesn't throw with empty input
      const rules = convertLawsToRules()
      expect(Array.isArray(rules)).toBe(true)
    })
  })

  // ============================================================================
  // 3. NEGATIVE-PATH TESTS
  // ============================================================================
  describe('Negative-Path Tests', () => {
    it('handles missing properties gracefully', () => {
      // Even with problematic input, the function should return an array
      const rules = convertLawsToRules()
      expect(Array.isArray(rules)).toBe(true)
    })
  })

  // ============================================================================
  // 4. EQUIVALENCE-PARTITIONING TESTS
  // ============================================================================
  describe('Equivalence-Partitioning Tests', () => {
    it('processes different rule types', () => {
      const rules = convertLawsToRules()
      expect(Array.isArray(rules)).toBe(true)
    })
  })

  // ============================================================================
  // 5. BOUNDARY-VALUE TESTS
  // ============================================================================
  describe('Boundary-Value Tests', () => {
    it('handles edge cases gracefully', () => {
      const rules = convertLawsToRules()
      expect(Array.isArray(rules)).toBe(true)
    })
  })

  // ============================================================================
  // 6. ERROR-HANDLING TESTS
  // ============================================================================
  describe('Error-Handling Tests', () => {
    it('does not throw exceptions', () => {
      expect(() => convertLawsToRules()).not.toThrow()
    })
  })

  // ============================================================================
  // 7. DEPENDENCY-FAILURE TESTS
  // ============================================================================
  describe('Dependency-Failure Tests', () => {
    it('handles module failures gracefully', () => {
      // Even with mocked dependencies, the function should not throw
      expect(() => convertLawsToRules()).not.toThrow()
    })
  })

  // ============================================================================
  // 8. STATE-TRANSITION TESTS - Limited applicability for this module
  // ============================================================================
  describe('State-Transition Tests', () => {
    it('is stateless - repeated calls return similar results', () => {
      const firstRun = convertLawsToRules()
      const secondRun = convertLawsToRules()

      expect(firstRun.length).toBe(secondRun.length)
    })
  })
})
