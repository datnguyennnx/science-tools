'use client'

import type { SortGenerator, AuxiliaryStructure } from './types'
import { SORT_ALGORITHMS } from './algorithms-data'

export interface AlgorithmComplexity {
  time: {
    best: string
    average: string
    worst: string
  }
  space: string
}

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
export type SpaceCategory = (typeof SpaceComplexityCategory)[keyof typeof SpaceComplexityCategory]

export function mapComplexityToCategory(complexity: string): {
  time?: TimeCategory
  space?: SpaceCategory
} {
  const s = complexity.trim()

  if (/^O\(n\)$/.test(s)) return { time: TimeComplexityCategory.O_N }
  if (/^O\(n log n\)$/.test(s)) return { time: TimeComplexityCategory.O_N_LOG_N }
  if (/^O\(n\^2\)$/.test(s)) return { time: TimeComplexityCategory.O_N_SQUARED }
  if (
    /^O\(\s*n\s*(\+|\*)\s*k\s*\)$/.test(s) ||
    /^O\(n\s*\+\s*(Range|N|b)\)$/.test(s) ||
    /^O\(d\s*\*\s*\(n\s*\+\s*k\)\)$/.test(s) ||
    s === 'O(n + k)' ||
    s === 'O(nk)' ||
    s === 'O(n + N)'
  ) {
    return { time: TimeComplexityCategory.O_N_PLUS_K_OR_NK }
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
    return { time: TimeComplexityCategory.O_OTHER_TIME }
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
  generator: SortGenerator
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
  hasAdvancedAuxiliaryVisuals?: boolean
}

export { SORT_ALGORITHMS }
