'use client'

import { SortGenerator, SortStep } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer'

const ASCENDING = true
const DESCENDING = false
type BitonicDirection = typeof ASCENDING | typeof DESCENDING

// Helper function to calculate the next power of two
const getNextPowerOfTwo = (num: number): number => {
  if (num <= 0) return 1 // Smallest power of 2 for non-positive is debatable, 1 is common for array sizes
  let power = 1
  while (power < num) {
    power *= 2
  }
  return power
}

// Helper to compare and swap if needed, yielding steps
const compareAndSwapIfNeededGenerator = function* (
  arr: number[],
  i: number,
  j: number,
  direction: BitonicDirection,
  low: number,
  count: number,
  liveStats: Partial<SortStats>
): Generator<SortStep, void, void> {
  liveStats.comparisons = (liveStats.comparisons || 0) + 1
  yield {
    array: [...arr],
    highlightedIndices: [i, j],
    comparisonIndices: [i, j],
    activeRange: { start: low, end: low + count - 1 },
    message: `Comparing ${arr[i]} (at index ${i}) and ${arr[j]} (at index ${j}) for ${direction === ASCENDING ? 'ascending' : 'descending'} merge.`,
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  const shouldSwap = direction === ASCENDING ? arr[i] > arr[j] : arr[i] < arr[j]

  if (shouldSwap) {
    yield {
      array: [...arr],
      highlightedIndices: [],
      comparisonIndices: [],
      swappingIndices: [i, j],
      activeRange: { start: low, end: low + count - 1 },
      message: `Preparing to swap ${arr[i]} (at ${i}) and ${arr[j]} (at ${j}).`,
      currentStats: { ...liveStats },
    }
    liveStats.swaps = (liveStats.swaps || 0) + 1
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    yield {
      array: [...arr],
      highlightedIndices: [i, j],
      swappingIndices: [i, j], // Show what was just swapped
      activeRange: { start: low, end: low + count - 1 },
      message: `Swapped. New values: ${arr[j]} (new at ${i}) and ${arr[i]} (new at ${j}).`,
      currentStats: { ...liveStats },
    }
  } else {
    yield {
      array: [...arr],
      highlightedIndices: [i, j],
      comparisonIndices: [i, j], // keep comparison active if no swap
      activeRange: { start: low, end: low + count - 1 },
      message: `No swap needed for ${arr[i]} and ${arr[j]}.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
    }
  }
}

// Merges a bitonic sequence into a sorted sequence
const bitonicMergeGenerator = function* (
  arr: number[],
  low: number,
  count: number,
  direction: BitonicDirection,
  liveStats: Partial<SortStats>
): Generator<SortStep, void, void> {
  if (count > 1) {
    const k = Math.floor(count / 2)
    yield {
      array: [...arr],
      activeRange: { start: low, end: low + count - 1 },
      message: `Bitonic Merge on range [${low}...${low + count - 1}] in ${direction === ASCENDING ? 'ascending' : 'descending'} order. Distance k=${k}`,
      currentStats: { ...liveStats },
      swappingIndices: null, // Ensure swap state is clear before merge operations
    }

    for (let i = low; i < low + k; i++) {
      if (i + k < low + count) {
        // Ensure second index is within the current sub-array part for merge
        yield* compareAndSwapIfNeededGenerator(arr, i, i + k, direction, low, count, liveStats)
      }
    }
    // Ensure swappingIndices is cleared after a series of compareAndSwaps before recursive calls
    yield {
      array: [...arr],
      activeRange: { start: low, end: low + count - 1 },
      message: `Completed comparisons for first part of merge. Distance k=${k}`,
      currentStats: { ...liveStats },
      swappingIndices: null,
    }
    yield* bitonicMergeGenerator(arr, low, k, direction, liveStats)
    yield* bitonicMergeGenerator(arr, low + k, count - k, direction, liveStats)
  }
}

// Recursively sorts to form bitonic sequences, then merges them
const bitonicSortRecursiveGenerator = function* (
  arr: number[],
  low: number,
  count: number,
  direction: BitonicDirection,
  liveStats: Partial<SortStats>
): Generator<SortStep, void, void> {
  if (count > 1) {
    const k = Math.floor(count / 2)
    yield {
      array: [...arr],
      activeRange: { start: low, end: low + count - 1 },
      message: `Bitonic Sort on range [${low}...${low + count - 1}]. Aiming for ${direction === ASCENDING ? 'ascending' : 'descending'} overall.`,
      currentStats: { ...liveStats },
      swappingIndices: null, // Clear swap state
    }

    yield {
      array: [...arr],
      activeRange: { start: low, end: low + k - 1 },
      message: `Sorting first half [${low}...${low + k - 1}] ascending to form bitonic sequence.`,
      currentStats: { ...liveStats },
      swappingIndices: null, // Clear swap state
    }
    yield* bitonicSortRecursiveGenerator(arr, low, k, ASCENDING, liveStats)
    // Ensure swappingIndices is cleared after recursive sort call
    yield {
      array: [...arr],
      activeRange: { start: low, end: low + k - 1 },
      message: `First half sorted ascending.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
    }

    yield {
      array: [...arr],
      activeRange: { start: low + k, end: low + count - 1 },
      message: `Sorting second half [${low + k}...${low + count - 1}] descending to form bitonic sequence.`,
      currentStats: { ...liveStats },
      swappingIndices: null, // Clear swap state
    }
    yield* bitonicSortRecursiveGenerator(arr, low + k, count - k, DESCENDING, liveStats)
    // Ensure swappingIndices is cleared after recursive sort call
    yield {
      array: [...arr],
      activeRange: { start: low + k, end: low + count - 1 },
      message: `Second half sorted descending.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
    }

    yield {
      array: [...arr],
      activeRange: { start: low, end: low + count - 1 },
      message: `Merging bitonic sequence [${low}...${low + count - 1}] into ${direction === ASCENDING ? 'ascending' : 'descending'} order.`,
      currentStats: { ...liveStats },
      swappingIndices: null, // Clear swap state before merge
    }
    yield* bitonicMergeGenerator(arr, low, count, direction, liveStats)
    // Ensure swappingIndices is cleared after merge call
    yield {
      array: [...arr],
      activeRange: { start: low, end: low + count - 1 },
      message: `Bitonic sequence merged.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
    }
  }
}

export const bitonicSortGenerator: SortGenerator = function* (
  initialArray: number[],
  sortDirectionInput: 'asc' | 'desc' = 'asc'
) {
  const original_n = initialArray.length
  const overallDirection = sortDirectionInput === 'asc' ? ASCENDING : DESCENDING

  if (original_n <= 1) {
    const statsForEmptyOrSingle: SortStats = {
      algorithmName: 'Bitonic Sort',
      numElements: original_n,
      comparisons: 0,
      swaps: 0,
      mainArrayWrites: 0,
    }
    yield {
      array: [...initialArray],
      sortedIndices: [...Array(original_n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...statsForEmptyOrSingle },
      swappingIndices: null,
    }
    return { finalArray: [...initialArray], stats: statsForEmptyOrSingle }
  }

  const n = getNextPowerOfTwo(original_n)
  let arr: number[]
  let isPadded = false

  if (n !== original_n) {
    isPadded = true
    arr = new Array(n)
    const sentinelValue = overallDirection === ASCENDING ? Infinity : -Infinity
    for (let i = 0; i < n; i++) {
      if (i < original_n) {
        arr[i] = initialArray[i]
      } else {
        arr[i] = sentinelValue
      }
    }
  } else {
    arr = [...initialArray]
  }

  const finalStats: SortStats = {
    algorithmName: 'Bitonic Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
  }
  if (isPadded) {
    finalStats.auxiliaryArrayWrites = (finalStats.auxiliaryArrayWrites || 0) + n
  }

  yield {
    array: [...arr],
    message: `Starting Bitonic Sort (Overall ${sortDirectionInput}). Original size: ${original_n}, Padded size: ${n}.`,
    currentStats: { ...finalStats },
    swappingIndices: null,
  }

  yield* bitonicSortRecursiveGenerator(arr, 0, n, overallDirection, finalStats)
  yield {
    array: [...arr],
    message: 'Recursive bitonic sort calls complete.',
    currentStats: { ...finalStats },
    swappingIndices: null, // Clear after all recursive calls complete
  }

  const finalResultArray = isPadded ? arr.slice(0, original_n) : arr

  yield {
    array: [...finalResultArray],
    sortedIndices: [...Array(original_n).keys()],
    message: 'Bitonic Sort Complete!',
    currentStats: { ...finalStats, numElements: original_n },
    swappingIndices: null,
  }

  return { finalArray: finalResultArray, stats: { ...finalStats, numElements: original_n } }
}
