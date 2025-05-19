'use client'

import type { AuxiliaryStructure } from './types'
import { LIGHTWEIGHT_ALGORITHM_LIST, getAlgorithmDetails } from './algorithms-data'
import {
  MAX_ARRAY_SIZE,
  MAX_SPEED,
  MIN_ARRAY_SIZE,
  MIN_SPEED,
  DEFAULT_ARRAY_SIZE,
} from '@/app/logic/sort/constants/sortSettings'

export interface AlgorithmComplexity {
  time: {
    best: string
    average: string
    worst: string
  }
  space: string
}

export const TimeComplexityCategory = {
  CONSTANT: 'O(1)',
  LOGARITHMIC: 'O(log n)',
  LINEAR: 'O(n)',
  N_LOG_N: 'O(n log n)',
  QUADRATIC: 'O(n^2)',
  CUBIC: 'O(n^3)',
  EXPONENTIAL: 'O(2^n)',
  FACTORIAL: 'O(n!)',
  N_PLUS_K: 'O(n + k)',
  OTHER: 'Other',
} as const

export const SpaceComplexityCategory = {
  O_1: 'O(1)',
  O_LOG_N: 'O(log n)',
  O_N_K_ETC: 'O(n) / O(k) / O(n+k)',
  O_OTHER_SPACE: 'Other Space Complexities',
} as const

type TimeCategory = (typeof TimeComplexityCategory)[keyof typeof TimeComplexityCategory]
export type SpaceCategory = (typeof SpaceComplexityCategory)[keyof typeof SpaceComplexityCategory]

export function mapComplexityToCategory(complexity: string): {
  time?: TimeCategory
  space?: SpaceCategory
} {
  const s = complexity.trim()

  if (/^O\(n\)$/.test(s)) return { time: TimeComplexityCategory.LINEAR }
  if (/^O\(n log n\)$/.test(s)) return { time: TimeComplexityCategory.N_LOG_N }
  if (/^O\(n\^2\)$/.test(s)) return { time: TimeComplexityCategory.QUADRATIC }
  if (
    /^O\(\s*n\s*(\+|\*)\s*k\s*\)$/.test(s) ||
    /^O\(n\s*\+\s*(Range|N|b)\)$/.test(s) ||
    /^O\(d\s*\*\s*\(n\s*\+\s*k\)\)$/.test(s) ||
    s === 'O(n + k)' ||
    s === 'O(nk)' ||
    s === 'O(n + N)'
  ) {
    return { time: TimeComplexityCategory.N_PLUS_K }
  }
  if (
    s.includes('n log^2 n') ||
    s.includes('n!') ||
    s.includes('n^(3/2)') ||
    s.includes('Depends') ||
    s.includes('Unbounded') ||
    s.includes('∞') ||
    (s.includes('log^2 n') && !s.includes('n log n'))
  ) {
    return { time: TimeComplexityCategory.OTHER }
  }

  if (/^O\(1\)$/.test(s)) return { space: SpaceComplexityCategory.O_1 }
  if (/^O\(log n\)$/.test(s) && !s.includes('log^2'))
    return { space: SpaceComplexityCategory.O_LOG_N }

  if (
    /^O\(k\)$/.test(s) ||
    /^O\(N\)$/.test(s) ||
    s === 'O(n)' ||
    s === 'O(n + k)' ||
    s === 'O(n + b)' ||
    s === 'O(Range)'
  ) {
    return { space: SpaceComplexityCategory.O_N_K_ETC }
  }
  if (s.includes('n log^2 n')) {
    return { space: SpaceComplexityCategory.O_OTHER_SPACE }
  }
  if (s.includes('log^2 n') && !s.includes('n')) {
    return { space: SpaceComplexityCategory.O_OTHER_SPACE }
  }

  return {}
}

export interface AlgorithmOrigin {
  name: string
  year?: string | number
}

// Defines the types of performance scenarios for which paths can be highlighted
export type PerformanceScenario = 'average' | 'best' | 'worst'

// Maps performance scenarios to arrays of pseudo-code line IDs to highlight
export type PerformanceScenarioPaths = Partial<Record<PerformanceScenario, number[]>>

// Maps a pseudo-code line ID to its corresponding line numbers in actual code languages
export type PseudoCodeLanguageMap = Partial<
  Record<'c' | 'cpp' | 'python' | 'java' | 'javascript', number[]>
>

export type PseudoCodeLineMapping = {
  [pseudoCodeLineId: number]: PseudoCodeLanguageMap
}

export interface SortAlgorithmTimeComplexity {
  best: string
  average: string
  worst: string
}

export interface SortAlgorithmComplexity {
  time: SortAlgorithmTimeComplexity
  space: string
}

export interface SortAlgorithm {
  id: string
  name: string
  description: string
  complexity: SortAlgorithmComplexity
  auxiliaryStructures?: AuxiliaryStructure[]
  pseudoCode?: string[]
  performancePaths?: PerformanceScenarioPaths
  pseudoCodeMapping?: PseudoCodeLineMapping
  languageExamples?: {
    c?: string[]
    cpp?: string[]
    python?: string[]
  }
  origin?: AlgorithmOrigin
  img?: string
}

export const AVAILABLE_ALGORITHMS_LIST = LIGHTWEIGHT_ALGORITHM_LIST

export { getAlgorithmDetails }

export const defaultAlgorithmId = 'bubbleSort'

export const DEFAULT_SORT_SETTINGS = {
  arraySize: DEFAULT_ARRAY_SIZE,
  speed: Math.floor((MIN_SPEED + MAX_SPEED) / 2.5), // Default speed
  sortDirection: 'asc',
  minArraySize: MIN_ARRAY_SIZE,
  maxArraySize: MAX_ARRAY_SIZE,
  minSpeed: MIN_SPEED,
  maxSpeed: MAX_SPEED,
} as const

export const isAlgorithmId = (
  id: string,
  algorithms: ReadonlyArray<{ id: string; name: string }> // Use lightweight list for check
): boolean => algorithms.some(algo => algo.id === id)
