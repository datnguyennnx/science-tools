import type { SortStats } from '../components/AuxiliaryVisualizer' // Import SortStats

export type SortStep = {
  array: ReadonlyArray<number>
  message?: string
  // Indices being actively compared or involved in a swap/merge operation
  highlightedIndices?: ReadonlyArray<number>
  // Indices that are part of a sub-array being actively processed or focused on
  comparisonIndices?: ReadonlyArray<number>
  // Indices specifically involved in a swap operation (typically a pair)
  swappingIndices?: ReadonlyArray<number> | null // Can be a pair or more for complex swaps
  // Indices of elements that are confirmed to be in their final sorted places
  sortedIndices?: ReadonlyArray<number>
  // Optional: Indices indicating the range being operated on (e.g., merge range, bubble pass range)
  activeRange?: { start: number; end: number }
  // Optional: Temp storage during merge visualized (can be adapted for other needs)
  tempSubArray?: ReadonlyArray<{ value: number; originalIndex: number }>
  mainArrayLabel?: string
  auxiliaryStructures?: ReadonlyArray<AuxiliaryStructure>
  currentStats?: Partial<SortStats> // Add currentStats for live updates
  currentPseudoCodeLine?: number
}

export interface SortResult {
  finalArray: number[]
  stats: SortStats
}

export type SortGenerator = (
  initialArray: number[],
  direction: 'asc' | 'desc'
) => Generator<SortStep, SortResult, void>

// ----- New Types for Generic Visualization -----
export type AuxiliaryDataType =
  | ReadonlyArray<number> // Simple list of numbers
  | ReadonlyArray<{ value: number; [key: string]: unknown }> // Use unknown instead of any

export interface AuxiliaryStructure {
  id: string // Unique key, e.g., 'counts', 'buckets', 'resultList', 'strand'
  title: string // Display title, e.g., 'Count Array', 'Result List'
  data: AuxiliaryDataType
}
