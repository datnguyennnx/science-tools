export type SortStep = {
  array: ReadonlyArray<number>
  message?: string
  highlightedIndices?: ReadonlyArray<number>
  comparisonIndices?: ReadonlyArray<number>
  swappingIndices?: ReadonlyArray<number> | null
  sortedIndices?: ReadonlyArray<number>
  activeRange?: { start: number; end: number }
  tempSubArray?: ReadonlyArray<{ value: number; originalIndex: number }>
  mainArrayLabel?: string
  auxiliaryStructures?: ReadonlyArray<AuxiliaryStructure>
  currentStats?: Partial<SortStats>
  currentPseudoCodeLine?: number[]
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
