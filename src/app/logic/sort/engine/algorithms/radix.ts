'use client'

import { SortGenerator, SortStep, SortStats, AuxiliaryStructure } from '../types'

// Helper function to get digit at a specific place (1s, 10s, 100s, etc.)
const getDigit = (num: number, place: number): number => Math.floor(Math.abs(num) / place) % 10

// Helper function to find the maximum absolute value in an array
const findMaxAbs = (arr: number[], liveStats: Partial<SortStats>): number => {
  let maxAbs = 0
  if (arr.length === 0) return 0

  maxAbs = Math.abs(arr[0])
  liveStats.comparisons = (liveStats.comparisons || 0) + (arr.length > 1 ? arr.length - 1 : 0) // Approximate comparisons

  for (let i = 1; i < arr.length; i++) {
    const absNum = Math.abs(arr[i])
    if (absNum > maxAbs) {
      maxAbs = absNum
    }
  }
  return maxAbs
}

// Stable Counting Sort adapted for a specific digit place
const countingSortByDigitGenerator = function* (
  arr: number[],
  place: number,
  _direction: 'asc' | 'desc', // Direction is primarily handled by Radix sort's final reversal if needed for positive numbers
  originalIndices: number[],
  liveStats: Partial<SortStats>,
  priorPassesFinalAux: ReadonlyArray<AuxiliaryStructure>
): Generator<
  SortStep,
  { sortedArr: number[]; sortedOriginalIndices: number[]; finalAuxiliaryState: AuxiliaryStructure },
  void
> {
  const n = arr.length
  const output = new Array(n).fill(NaN)
  const outputOriginalIndices = new Array(n).fill(-1)
  const count = new Array(10).fill(0) // For digits 0-9
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 10 + n + n // count, output, outputOriginalIndices

  const auxIdPrefix = `radix-pass-place-${place}-counts` // More specific prefix
  const auxDisplaySlot = `radix-counts-visualization` // Consistent slot for counts visualization

  const createCountAuxStructure = (
    stepSuffix: string,
    currentCounts: ReadonlyArray<number>
  ): AuxiliaryStructure => ({
    id: `${auxIdPrefix}-${stepSuffix}`,
    title: `Counts (Place ${place}, ${stepSuffix})`,
    data: currentCounts.map((value, index) => ({
      value,
      originalIndex: index, // Digit value 0-9
      name: `Digit ${index}`,
    })),
    displaySlot: auxDisplaySlot,
  })

  yield {
    array: [...arr],
    mainArrayLabel: `Radix Pass (Place ${place}): Input`,
    historicalAuxiliaryStructures: [...priorPassesFinalAux],
    currentPassAuxiliaryStructure: createCountAuxStructure('Initial', count),
    message: `Counting Sort for Place ${place}: Initialized. Counts array for digits 0-9 is all zeros.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [12, 13, 14],
  }

  for (let i = 0; i < n; i++) {
    const digit = getDigit(arr[i], place)
    count[digit]++
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
  }

  yield {
    array: [...arr],
    mainArrayLabel: `Radix Pass (Place ${place}): Input (After Counting Occurrences)`,
    historicalAuxiliaryStructures: [...priorPassesFinalAux],
    currentPassAuxiliaryStructure: createCountAuxStructure('Occurrences Counted', count),
    message: `Counting Sort for Place ${place}: Counted digit occurrences. Counts: ${count.join(', ')}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [17],
  }

  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1]
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
  }

  yield {
    array: [...arr],
    mainArrayLabel: `Radix Pass (Place ${place}): Input (After Cumulative Sum)`,
    historicalAuxiliaryStructures: [...priorPassesFinalAux],
    currentPassAuxiliaryStructure: createCountAuxStructure('Cumulative Summed', count),
    message: `Counting Sort for Place ${place}: Calculated cumulative counts. Counts: ${count.join(', ')}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [20, 21],
  }

  for (let i = n - 1; i >= 0; i--) {
    const valueToPlace = arr[i]
    const originalIdxOfValue = originalIndices[i]
    const digit = getDigit(valueToPlace, place)

    const targetOutputIndex = count[digit] - 1
    output[targetOutputIndex] = valueToPlace
    outputOriginalIndices[targetOutputIndex] = originalIdxOfValue
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 2

    count[digit]--
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
  }

  const finalAuxForThisPass = createCountAuxStructure('Pass Complete', count)

  yield {
    array: [...output],
    mainArrayLabel: `Radix Pass (Place ${place}): Output (Sorted by this digit)`,
    historicalAuxiliaryStructures: [...priorPassesFinalAux],
    currentPassAuxiliaryStructure: finalAuxForThisPass,
    message: `Counting Sort for Place ${place}: Output array built. Array now sorted by digit at place ${place}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [27],
  }

  return {
    sortedArr: output,
    sortedOriginalIndices: outputOriginalIndices,
    finalAuxiliaryState: finalAuxForThisPass,
  }
}

// Main Radix Sort generator function (LSD)
export const radixSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  let arr = [...initialArray]
  const n = arr.length
  let originalIndices = arr.map((_, index) => index)
  const accumulatedFinalAuxStates: AuxiliaryStructure[] = []

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Radix Sort (LSD)',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
    swaps: 0,
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [30, 31, 32],
      sortedIndices: arr.map((_, i) => i),
    }
    return { finalArray: arr, stats: liveStats as SortStats, finalAuxiliaryStructures: null }
  }

  const maxAbsValue = findMaxAbs(arr, liveStats)
  const numDigits = maxAbsValue === 0 ? 1 : Math.floor(Math.log10(maxAbsValue)) + 1

  yield {
    array: [...arr],
    message: `Starting Radix Sort (LSD). Max abs value: ${maxAbsValue} (~${numDigits} digits). Each pass sorts by one digit place.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [35],
  }

  let passNumber = 1
  for (let place = 1; Math.floor(maxAbsValue / place) > 0; place *= 10) {
    yield {
      array: [...arr],
      mainArrayLabel: `Radix Main: Input for Pass ${passNumber} (Place ${place})`,
      historicalAuxiliaryStructures: [...accumulatedFinalAuxStates],
      currentPassAuxiliaryStructure: null,
      message: `Radix Sort: Starting Pass ${passNumber} (sorting by digit at place ${place}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [36],
    }

    const { sortedArr, sortedOriginalIndices, finalAuxiliaryState } =
      yield* countingSortByDigitGenerator(arr, place, 'asc', originalIndices, liveStats, [
        ...accumulatedFinalAuxStates,
      ])

    arr = sortedArr
    originalIndices = sortedOriginalIndices
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n

    const finalAuxForDisplayThisRadixPass: AuxiliaryStructure = {
      ...finalAuxiliaryState,
      id: `radix-pass-${passNumber}-place-${place}-counts-final-summary`,
      title: `Counts (Place ${place}) - End of Radix Pass ${passNumber}`,
    }
    accumulatedFinalAuxStates.push(finalAuxForDisplayThisRadixPass)

    yield {
      array: [...arr],
      mainArrayLabel: `Radix Main: Array after Pass ${passNumber} (Place ${place} Sorted)`,
      historicalAuxiliaryStructures: [...accumulatedFinalAuxStates],
      currentPassAuxiliaryStructure: null,
      message: `Radix Sort: Pass ${passNumber} (place ${place}) complete. Array sorted by this digit.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [37],
    }
    passNumber++
  }

  if (direction === 'desc') {
    arr.reverse()
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n
    liveStats.reversals = (liveStats.reversals || 0) + 1

    yield {
      array: [...arr],
      mainArrayLabel: 'Radix Main: Final Array (Reversed for Descending)',
      message: 'Final array reversed for descending order (based on absolute value sorting). ',
      currentStats: { ...liveStats },
      sortedIndices: arr.map((_, i) => i),
      historicalAuxiliaryStructures: [...accumulatedFinalAuxStates],
      currentPassAuxiliaryStructure: null,
      currentPseudoCodeLine: [39, 40],
    }
  }

  yield {
    array: [...arr],
    mainArrayLabel: 'Radix Main: Sorted Array',
    message: 'Radix Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [42],
    sortedIndices: arr.map((_, i) => i),
    historicalAuxiliaryStructures: [...accumulatedFinalAuxStates],
  }

  return {
    finalArray: arr,
    stats: liveStats as SortStats,
    finalAuxiliaryStructures:
      accumulatedFinalAuxStates.length > 0 ? accumulatedFinalAuxStates : null,
  }
}
