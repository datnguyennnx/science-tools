export type SortStep = {
  array: ReadonlyArray<number>
  mainChartData?: ReadonlyArray<{ name: string; value: number; originalIndex: number }>
  message?: string
  highlightedIndices?: ReadonlyArray<number>
  comparisonIndices?: ReadonlyArray<number>
  swappingIndices?: ReadonlyArray<number> | null
  sortedIndices?: ReadonlyArray<number>
  activeRange?: { start: number; end: number }
  tempSubArray?: ReadonlyArray<{ value: number; originalIndex: number }>
  mainArrayLabel?: string
  currentPassAuxiliaryStructure?: AuxiliaryStructure | null
  historicalAuxiliaryStructures?: ReadonlyArray<AuxiliaryStructure>
  currentStats?: Partial<SortStats>
  currentPseudoCodeLine?: number[]
  activeKeyInfo?: {
    value: number
    originalIndex: number
    currentIndex: number | null
  } | null
}

export interface SortResult {
  finalArray: number[]
  stats: SortStats
  finalAuxiliaryStructures?: AuxiliaryStructure | ReadonlyArray<AuxiliaryStructure> | null
}

export type SortGenerator = (
  initialArray: number[],
  direction: 'asc' | 'desc'
) => Generator<SortStep, SortResult, void>

export type AuxiliaryChartItem =
  | number
  | {
      value: number
      originalIndex?: number
      id?: string | number
      [key: string]: unknown
    }

export type AuxiliaryDataType = ReadonlyArray<AuxiliaryChartItem>

export interface AuxiliaryStructure {
  id: string
  title: string
  data: AuxiliaryDataType
  displaySlot?: string
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
