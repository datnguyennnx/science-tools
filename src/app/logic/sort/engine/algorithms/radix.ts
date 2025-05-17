'use client'

import { SortGenerator, SortStep, SortStats, AuxiliaryStructure } from '../types'

// Helper function to get digit at a specific place (1s, 10s, 100s, etc.)
const getDigit = (num: number, place: number): number => Math.floor(Math.abs(num) / place) % 10

// Helper function to find the maximum absolute value in an array
const findMaxAbs = (arr: number[], liveStats: Partial<SortStats>): number => {
  let maxAbs = 0
  if (arr.length > 0) maxAbs = Math.abs(arr[0]) // Initialize with the first element's abs value
  // Start loop from 0 or 1 depending on initialization. If arr[0] used, start i=1.
  // For simplicity, iterate all and update if greater.
  for (const num of arr) {
    // Iterating n times
    const absNum = Math.abs(num)
    liveStats.comparisons = (liveStats.comparisons || 0) + 1 // Comparison with current maxAbs
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
  _direction: 'asc' | 'desc',
  originalIndices: number[],
  liveStats: Partial<SortStats>,
  priorPassesFinalAux: ReadonlyArray<AuxiliaryStructure>
): Generator<
  SortStep,
  { sortedArr: number[]; sortedOriginalIndices: number[]; finalAuxiliaryState: AuxiliaryStructure },
  void
> {
  const n = arr.length
  const output = new Array(n)
  const outputOriginalIndices = new Array(n)
  const count = new Array(10).fill(0)
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 10
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + n + n

  const baseAuxId = `digitCounts-place-${place}`
  const dynamicDisplaySlot = `digitCounts-pass-${place}`

  const currentPassAuxStructureInitial = {
    id: baseAuxId,
    title: `Digit Counts (Place ${place}, Initial)`,
    data: [...count],
    displaySlot: dynamicDisplaySlot,
  }
  yield {
    array: [...arr],
    mainArrayLabel: `Input for Place ${place}`,
    auxiliaryStructures: [...priorPassesFinalAux, currentPassAuxStructureInitial],
    message: `Counting Sort (Radix): Initializing counts for digit at place ${place}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [12],
  }

  // Phase 1: Count occurrences
  for (let i = 0; i < n; i++) {
    const digit = getDigit(arr[i], place)
    const currentPassAuxStructureCounting = {
      id: baseAuxId,
      title: `Digit Counts (Place ${place}, Counting)`,
      data: [...count], // Data before current digit increment
      displaySlot: dynamicDisplaySlot,
    }
    yield {
      array: [...arr],
      mainArrayLabel: `Input for Place ${place}`,
      highlightedIndices: [originalIndices[i]],
      auxiliaryStructures: [...priorPassesFinalAux, currentPassAuxStructureCounting],
      message: `Processing ${arr[i]} (Original Index: ${originalIndices[i]}); Digit at place ${place} is ${digit}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [15],
    }
    count[digit]++
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
  }
  const currentPassAuxStructureAfterCounting = {
    id: baseAuxId,
    title: `Digit Counts (Place ${place}, After Counting All)`,
    data: [...count],
    displaySlot: dynamicDisplaySlot,
  }
  yield {
    array: [...arr],
    mainArrayLabel: `Input for Place ${place}`,
    auxiliaryStructures: [...priorPassesFinalAux, currentPassAuxStructureAfterCounting],
    message: `Finished counting all digits for place ${place}. Counts: ${count.join(', ')}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [17],
  }

  // Phase 2: Calculate cumulative counts
  const currentPassAuxStructureBeforeCumulative = {
    id: baseAuxId,
    title: `Digit Counts (Place ${place}, Before Cumulative Sum)`,
    data: [...count],
    displaySlot: dynamicDisplaySlot,
  }
  yield {
    array: [...arr],
    mainArrayLabel: `Input for Place ${place}`,
    auxiliaryStructures: [...priorPassesFinalAux, currentPassAuxStructureBeforeCumulative],
    message: `Starting cumulative sum calculation for place ${place}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [19],
  }
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1]
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
  }
  const currentPassAuxStructureAfterCumulative = {
    id: baseAuxId,
    title: `Digit Counts (Place ${place}, Cumulative Sum Complete)`,
    data: [...count],
    displaySlot: dynamicDisplaySlot,
  }
  yield {
    array: [...arr],
    mainArrayLabel: `Input for Place ${place}`,
    auxiliaryStructures: [...priorPassesFinalAux, currentPassAuxStructureAfterCumulative],
    message: `Finished cumulative sum for place ${place}. Cumulative Counts: ${count.join(', ')}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [21],
  }

  // Phase 3: Build the output array
  const currentPassAuxStructureReadyForBuild = {
    id: baseAuxId,
    title: `Digit Counts (Place ${place}, Ready for Output Build)`,
    data: [...count],
    displaySlot: dynamicDisplaySlot,
  }
  yield {
    array: new Array(n).fill(NaN),
    mainArrayLabel: `Output for Place ${place} (Building)`,
    auxiliaryStructures: [...priorPassesFinalAux, currentPassAuxStructureReadyForBuild],
    message: `Building output array for place ${place}. Using cumulative counts to place elements.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [23],
  }

  for (let i = n - 1; i >= 0; i--) {
    const value = arr[i]
    const digit = getDigit(value, place)
    const currentPassAuxStructureLocating = {
      id: baseAuxId,
      title: `Digit Counts (Place ${place}, Locating Position)`,
      data: [...count], // Data before decrement for this item
      displaySlot: dynamicDisplaySlot,
    }
    yield {
      array: [...output].map(v => (v === undefined ? NaN : v)),
      mainArrayLabel: `Output for Place ${place} (Processing Input Item)`,
      highlightedIndices: [originalIndices[i]],
      auxiliaryStructures: [...priorPassesFinalAux, currentPassAuxStructureLocating],
      message: `Processing item ${arr[i]} (Original Index: ${originalIndices[i]}). Digit ${digit}. Target index in output: ${count[digit] - 1}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [24],
    }

    const outputIndex = count[digit] - 1
    if (outputIndex < 0 || outputIndex >= n) {
      console.error(
        `Invalid outputIndex ${outputIndex} for digit ${digit}, value ${value}, count[digit] ${count[digit]}`
      )
      continue
    }

    output[outputIndex] = value
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    outputOriginalIndices[outputIndex] = originalIndices[i]
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    count[digit]--

    const currentPassAuxStructureDecremented = {
      id: baseAuxId,
      title: `Digit Counts (Place ${place}, Count Decremented)`,
      data: [...count], // Data after decrement
      displaySlot: dynamicDisplaySlot,
    }
    yield {
      array: [...output].map(v => (v === undefined ? NaN : v)),
      mainArrayLabel: `Output for Place ${place} (Item Placed)`,
      highlightedIndices: [outputIndex],
      auxiliaryStructures: [...priorPassesFinalAux, currentPassAuxStructureDecremented],
      message: `Placed ${value} at output index ${outputIndex}. Decremented count for digit ${digit}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [25],
    }
  }

  const finalAuxForThisPass: AuxiliaryStructure = {
    id: baseAuxId,
    title: `Digit Counts (Place ${place}, Final State)`, // Clarified title for persisted state
    data: [...count], // This is the count array at the very end of this pass (should be mostly zeros if logic is correct)
    displaySlot: dynamicDisplaySlot,
  }
  yield {
    array: [...output].map(v => (v === undefined ? NaN : v)),
    mainArrayLabel: `Output for Place ${place} (Built)`,
    auxiliaryStructures: [...priorPassesFinalAux, finalAuxForThisPass],
    message: `Finished building output array for place ${place}.`,
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
  const accumulatedFinalAuxStates: AuxiliaryStructure[] = [] // Initialize accumulator

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Radix Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
    swaps: 0, // Radix sort doesn't swap
  }
  // arr.map for originalIndices is n aux reads and n aux writes if we are super strict.
  // For now, not counting this as it's part of setup for visualization tracking.

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: n === 1 ? [0] : [],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0], // radixSort(array)
      auxiliaryStructures: [...accumulatedFinalAuxStates], // Include even for early exit
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  const maxAbs = findMaxAbs(arr, liveStats)
  yield {
    array: [...arr],
    mainArrayLabel: 'Initial Array',
    message: `Found max absolute value: ${maxAbs}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [1], // max = findMaxAbsolute(array)
    auxiliaryStructures: [...accumulatedFinalAuxStates],
  }

  yield {
    array: [...arr],
    mainArrayLabel: 'Initial Array',
    message: `Starting Radix Sort (LSD). Max absolute value: ${maxAbs}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0], // radixSort(array)
    auxiliaryStructures: [...accumulatedFinalAuxStates],
  }

  let place = 1
  yield {
    array: [...arr],
    message: `Initializing place to ${place}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [2], // place = 1
    auxiliaryStructures: [...accumulatedFinalAuxStates],
  }
  while (maxAbs / place >= 1) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    yield {
      array: [...arr],
      mainArrayLabel: `Array Before Place ${place} Sort`,
      message: `--- Starting pass for digit place ${place} ---`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [3], // while (max / place >= 1)
      auxiliaryStructures: [...accumulatedFinalAuxStates], // Structures from *before* this pass starts
    }

    const { sortedArr, sortedOriginalIndices, finalAuxiliaryState } =
      yield* countingSortByDigitGenerator(
        arr,
        place,
        direction,
        originalIndices,
        liveStats,
        accumulatedFinalAuxStates // Pass the current accumulated states
      )

    // Add the final state from the completed pass to our list
    accumulatedFinalAuxStates.push(finalAuxiliaryState)

    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n
    arr = sortedArr
    originalIndices = sortedOriginalIndices

    yield {
      array: [...arr],
      mainArrayLabel: `Array After Place ${place} Sort`,
      message: `--- Completed pass for digit place ${place}. Array state after pass ---`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [4], // countingSortByDigit completed for this place
      auxiliaryStructures: [...accumulatedFinalAuxStates], // Now includes the one from the pass just finished
    }

    place *= 10
    yield {
      array: [...arr],
      message: `Updating place to ${place}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [5], // place *= 10
      auxiliaryStructures: [...accumulatedFinalAuxStates],
    }
  }
  // End of while loop, pseudo line 6
  yield {
    array: [...arr],
    message: 'Finished all passes for Radix Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [6],
    auxiliaryStructures: [...accumulatedFinalAuxStates],
  }

  if (direction === 'desc') {
    arr.reverse() // In-place reverse
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n // Approximate n writes for reverse
    yield {
      array: [...arr],
      mainArrayLabel: 'Array (Reversed for Descending)',
      message: 'Reversing array for descending order.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [7], // End of radixSort function
      auxiliaryStructures: [...accumulatedFinalAuxStates],
    }
  }

  yield {
    array: [...arr],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()], // Array is now fully sorted
    message: 'Radix Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [7], // End of radixSort function
    auxiliaryStructures: [...accumulatedFinalAuxStates],
  }

  return {
    finalArray: arr,
    stats: liveStats as SortStats,
    finalAuxiliaryStructures: accumulatedFinalAuxStates,
  }
}
