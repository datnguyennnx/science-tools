'use client'

import { SortGenerator } from './types'
import { SORT_ALGORITHMS } from './algorithms-data' // Updated import
import type { SupportedLanguages } from '../components/PseudoCodeDisplay' // Corrected Import SupportedLanguages again

export interface AlgorithmComplexity {
  time: {
    best: string
    average: string
    worst: string
  }
  space: string
}

// Complexity Categories for Filtering
export const TimeComplexityCategory = {
  O_N: 'O(n)',
  O_N_LOG_N: 'O(n log n)',
  O_N_PLUS_K_OR_NK: 'O(n+k) / O(nk)',
  O_N_SQUARED: 'O(n^2)',
  O_OTHER_TIME: 'Other Time Complexities',
} as const

export const SpaceComplexityCategory = {
  O_1: 'O(1)',
  O_LOG_N: 'O(log n)',
  O_N_K_ETC: 'O(n) / O(k) / O(n+k)',
  O_OTHER_SPACE: 'Other Space Complexities',
} as const

type TimeCategory = (typeof TimeComplexityCategory)[keyof typeof TimeComplexityCategory]
type SpaceCategory = (typeof SpaceComplexityCategory)[keyof typeof SpaceComplexityCategory]

export function mapComplexityToCategory(complexity: string): {
  time?: TimeCategory
  space?: SpaceCategory
} {
  const s = complexity.trim()

  // --- Time Complexity Mapping ---
  // Order is important: more specific patterns first.

  // O(n)
  if (/^O\(n\)$/.test(s)) return { time: TimeComplexityCategory.O_N }
  // O(n log n) - ensure not to catch O(n log^2 n) here
  if (/^O\(n log n\)$/.test(s)) return { time: TimeComplexityCategory.O_N_LOG_N }
  // O(n^2)
  if (/^O\(n\^2\)$/.test(s)) return { time: TimeComplexityCategory.O_N_SQUARED }
  // O(n+k), O(nk), O(d*(n+k)), O(n+Range), O(n+N)
  if (
    /^O\(\s*n\s*(\+|\*)\s*k\s*\)$/.test(s) || // O(n+k), O(n*k)
    /^O\(n\s*\+\s*(Range|N|b)\)$/.test(s) || // O(n+Range), O(n+N), O(n+b)
    /^O\(d\s*\*\s*\(n\s*\+\s*k\)\)$/.test(s) || // O(d*(n+k))
    s === 'O(n + k)' ||
    s === 'O(nk)' ||
    s === 'O(n + N)'
  ) {
    // Explicit for safety
    return { time: TimeComplexityCategory.O_N_PLUS_K_OR_NK }
  }
  // Other Time Complexities: O(n log^2 n), O(n*n!), O(n^(3/2)), Depends, Unbounded, O(log^2 n) not already O(n log n)
  if (
    s.includes('n log^2 n') ||
    s.includes('n!') ||
    s.includes('n^(3/2)') ||
    s.includes('Depends') ||
    s.includes('Unbounded') ||
    s.includes('∞') ||
    (s.includes('log^2 n') && !s.includes('n log n'))
  ) {
    // Avoid re-matching O(n log n)
    return { time: TimeComplexityCategory.O_OTHER_TIME }
  }

  // --- Space Complexity Mapping ---
  // These are checked if no time complexity was matched above.
  // This ordering implies that if a string like "O(n)" could be time or space,
  // it will be categorized as time by the rules above.

  // O(1)
  if (/^O\(1\)$/.test(s)) return { space: SpaceComplexityCategory.O_1 }
  // O(log n) - ensure not O(log^2 n) if that has a different space category
  if (/^O\(log n\)$/.test(s) && !s.includes('log^2'))
    return { space: SpaceComplexityCategory.O_LOG_N }

  // O(n), O(k), O(N), O(n+k), O(Range), O(n+b) for space
  // Note: If 's' was "O(n)", it would have been matched by the time rule TimeComplexityCategory.O_N.
  // This section for space will only match "O(n)" if the time rule for "O(n)" was removed or made more specific.
  // Thus, direct O(n) space might not be caught here if the string is identical to O(n) time.
  if (
    /^O\(k\)$/.test(s) || // O(k)
    /^O\(N\)$/.test(s) || // O(N) (Pigeonhole space)
    s === 'O(n)' || // Explicit O(n) for space (may be overshadowed by time's O(n))
    s === 'O(n + k)' ||
    s === 'O(n + b)' ||
    s === 'O(Range)'
  ) {
    // O(n+k) etc. for space
    return { space: SpaceComplexityCategory.O_N_K_ETC }
  }
  // O(n log^2 n) for space (e.g., Bitonic Sort)
  if (s.includes('n log^2 n')) {
    // Check again if not caught by 'Other Time'
    return { space: SpaceComplexityCategory.O_OTHER_SPACE }
  }
  // Other log^2 n forms for space if not time.
  if (s.includes('log^2 n') && !s.includes('n')) {
    // e.g. O(log^2 n) space
    return { space: SpaceComplexityCategory.O_OTHER_SPACE }
  }

  return {} // No specific category found
}

export interface AlgorithmOrigin {
  name: string
  year?: string | number
}

export interface SortAlgorithm {
  id: string
  name: string
  description: string
  generator: SortGenerator
  complexity: AlgorithmComplexity
  origin?: AlgorithmOrigin
  img?: string
  pseudoCodes?: Record<SupportedLanguages, string[]> // New field for multiple pseudo-codes
  // pseudoCode?: string[] // Old field - removed
  // pseudoCodeLanguage?: 'c' | 'cpp' | 'python' | 'plaintext' // Old field - removed
}

// Re-export SORT_ALGORITHMS from the centralized location
export { SORT_ALGORITHMS }
