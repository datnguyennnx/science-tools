'use client' // If this engine code is intended to be bundled with client components

import { SortStep, SortGenerator } from '../types' // Removed RecursiveSortGenerator, MergeGenerator from imports
import type { SortStats } from '../../components/AuxiliaryVisualizer' // Import SortStats

// Comparison function based on direction
const compare = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  return direction === 'asc' ? a <= b : a >= b // Use <= or >= for stability
}

// Updated type to use generic Generator
const mergeSortRecursive = function* (
  arr: number[],
  fullArrayRef: number[], // Reference to the *original* array for yielding global state
  offset: number, // Start index of `arr` within `fullArrayRef`
  direction: 'asc' | 'desc',
  sortedGlobalIndices: Set<number>,
  liveStats: Partial<SortStats> // Added liveStats
): Generator<SortStep, void, void> {
  const n = arr.length
  if (n <= 1) {
    if (n === 1) sortedGlobalIndices.add(offset)
    yield {
      array: [...fullArrayRef],
      comparisonIndices: n === 1 ? [offset] : [],
      sortedIndices: Array.from(sortedGlobalIndices),
      activeRange: { start: offset, end: offset + n - 1 },
      message:
        n === 1 ? `Index ${offset} sorted (base).` : `Range at offset ${offset} empty/sorted.`,
      currentStats: { ...liveStats },
    }
    return
  }

  const mid = Math.floor(n / 2)
  // These are for recursive calls and represent the structure to be sorted.
  const leftHalfRecursive = arr.slice(0, mid)
  const rightHalfRecursive = arr.slice(mid)
  liveStats.auxiliaryArrayWrites =
    (liveStats.auxiliaryArrayWrites || 0) + leftHalfRecursive.length + rightHalfRecursive.length

  yield {
    array: [...fullArrayRef],
    comparisonIndices: [...Array(n).keys()].map(i => offset + i),
    sortedIndices: Array.from(sortedGlobalIndices),
    activeRange: { start: offset, end: offset + n - 1 },
    message: `Dividing range [${offset}...${offset + n - 1}] into [${offset}...${offset + mid - 1}] and [${offset + mid}...${offset + n - 1}]`,
    currentStats: { ...liveStats },
  }

  yield* mergeSortRecursive(
    leftHalfRecursive, // Pass the slice for the left part
    fullArrayRef,
    offset,
    direction,
    sortedGlobalIndices,
    liveStats
  )
  yield* mergeSortRecursive(
    rightHalfRecursive, // Pass the slice for the right part
    fullArrayRef,
    offset + mid,
    direction,
    sortedGlobalIndices,
    liveStats
  )

  // After recursive calls, fullArrayRef contains the sorted left and right halves in their respective positions.
  // Create new slices from fullArrayRef to get the *sorted* data for the merge step.
  const sortedLeftHalfForMerge = fullArrayRef.slice(offset, offset + mid)
  const sortedRightHalfForMerge = fullArrayRef.slice(offset + mid, offset + n)

  // Account for the creation of these temporary arrays for the merge inputs
  liveStats.auxiliaryArrayWrites =
    (liveStats.auxiliaryArrayWrites || 0) +
    sortedLeftHalfForMerge.length +
    sortedRightHalfForMerge.length

  // The first parameter to merge (targetArr) is the current slice `arr`.
  // Merge reads from sortedLeftHalfForMerge and sortedRightHalfForMerge, and writes sorted output to fullArrayRef.
  yield* merge(
    arr, // This is the slice `arr` for the current level of recursion
    sortedLeftHalfForMerge,
    sortedRightHalfForMerge,
    fullArrayRef,
    offset,
    direction,
    sortedGlobalIndices,
    liveStats
  )

  for (let i = 0; i < n; i++) {
    sortedGlobalIndices.add(offset + i)
  }
  yield {
    array: [...fullArrayRef],
    comparisonIndices: [...Array(n).keys()].map(i => offset + i),
    sortedIndices: Array.from(sortedGlobalIndices),
    activeRange: { start: offset, end: offset + n - 1 },
    message: `Merged range [${offset}...${offset + n - 1}]`,
    currentStats: { ...liveStats },
  }
}

// Updated type to use generic Generator
const merge = function* (
  targetArr: number[], // The slice to merge results into
  leftHalf: number[],
  rightHalf: number[],
  fullArrayRef: number[], // Reference to the original array for yielding global state
  offset: number, // Start index of targetArr in fullArrayRef
  direction: 'asc' | 'desc',
  sortedGlobalIndices: Set<number>,
  liveStats: Partial<SortStats> // Added liveStats
): Generator<SortStep, void, void> {
  let i = 0
  let j = 0
  let k = 0
  const leftLen = leftHalf.length
  const rightLen = rightHalf.length

  yield {
    array: [...fullArrayRef],
    comparisonIndices: [...Array(leftLen + rightLen).keys()].map(idx => offset + idx),
    highlightedIndices: [offset + i, offset + leftLen + j].filter(
      idx => idx < offset + leftLen + rightLen
    ),
    sortedIndices: Array.from(sortedGlobalIndices),
    activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    message: `Merging [${offset}...${offset + leftLen - 1}] and [${offset + leftLen}...${offset + leftLen + rightLen - 1}]`,
    currentStats: { ...liveStats },
  }

  while (i < leftLen && j < rightLen) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    yield {
      array: [...fullArrayRef],
      comparisonIndices: [...Array(leftLen + rightLen).keys()].map(idx => offset + idx),
      highlightedIndices: [offset + i, offset + leftLen + j],
      sortedIndices: Array.from(sortedGlobalIndices),
      message: `Comparing ${leftHalf[i]} and ${rightHalf[j]}`,
      currentStats: { ...liveStats },
    }

    if (compare(leftHalf[i], rightHalf[j], direction)) {
      fullArrayRef[offset + k] = leftHalf[i]
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      i++
    } else {
      fullArrayRef[offset + k] = rightHalf[j]
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      j++
    }

    yield {
      array: [...fullArrayRef],
      comparisonIndices: [...Array(leftLen + rightLen).keys()].map(idx => offset + idx),
      highlightedIndices: [offset + k],
      sortedIndices: Array.from(sortedGlobalIndices),
      message: `Placed ${fullArrayRef[offset + k]} at index ${offset + k}`,
      currentStats: { ...liveStats },
    }
    k++
  }

  while (i < leftLen) {
    fullArrayRef[offset + k] = leftHalf[i]
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    i++
    k++
  }

  while (j < rightLen) {
    fullArrayRef[offset + k] = rightHalf[j]
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    j++
    k++
  }
}

export const mergeSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedGlobalIndices = new Set<number>()

  const finalStats: SortStats = {
    algorithmName: 'Merge Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0, // Writes to leftHalf/rightHalf during slice, and targetArr during merge
    // Other stats can be initialized to 0 or undefined
    swaps: 0, // Merge sort doesn't swap in the typical sense, but moves data
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...finalStats },
    }
    return { finalArray: arr, stats: finalStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedGlobalIndices),
    message: 'Starting Merge Sort',
    currentStats: { ...finalStats },
  }

  yield* mergeSortRecursive(arr.slice(), arr, 0, direction, sortedGlobalIndices, finalStats) // Pass arr.slice() as the initial 'arr' for recursion

  for (let i = 0; i < n; i++) sortedGlobalIndices.add(i)
  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedGlobalIndices),
    message: 'Merge Sort Complete!',
    currentStats: { ...finalStats },
  }

  return { finalArray: arr, stats: finalStats }
}
