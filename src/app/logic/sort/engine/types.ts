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
  finalAuxiliaryStructures?: ReadonlyArray<AuxiliaryStructure>
}

export type SortGenerator = (
  initialArray: number[],
  direction: 'asc' | 'desc'
) => Generator<SortStep, SortResult, void>

// ----- New Types for Generic Visualization -----
export type AuxiliaryChartItem =
  | number
  | {
      value: number
      originalIndex?: number
      id?: string | number
      [key: string]: unknown
    }
export type AuxiliaryDataType = ReadonlyArray<AuxiliaryChartItem>

/**
 * Represents an auxiliary data structure to be visualized.
 */
export interface AuxiliaryStructure {
  id: string // Unique identifier for React keys and animation, e.g., 'counts', 'buckets-pass-1'
  title: string // Title of the chart for this structure, e.g., 'Digit Counts (Pass 1)'
  data: AuxiliaryDataType // Data for the chart
  displaySlot?: string // Optional identifier for grouping into a specific display container/slot, e.g., 'digitCounts', 'outputBuffer'
}

export interface SortStats {
  algorithmName?: string
  numElements?: number
  numUniqueElements?: number
  delay?: string
  visualTime?: string
  sortTime?: string
  comparisons?: number
  swaps?: number
  accesses?: number
  reversals?: number
  mainArrayWrites?: number
  auxiliaryArrayWrites?: number
  externalArrayItems?: number
  percentSorted?: number
  segments?: number
}
