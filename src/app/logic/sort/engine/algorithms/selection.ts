'use client'

import { SortGenerator, SortStats } from '../types'

// Comparison function based on direction
const shouldBeConsideredExtreme = (
  candidateValue: number,
  currentExtremeValue: number,
  direction: 'asc' | 'desc'
): boolean => {
  // True if candidateValue should replace currentExtremeValue
  return direction === 'asc'
    ? candidateValue < currentExtremeValue
    : candidateValue > currentExtremeValue
}

export const selectionSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = new Set<number>()

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Selection Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
  }

  if (n <= 1) {
    if (n === 1) sortedIndices.add(0)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1, 2], // Covers procedure, n=length, if n<=1 then return
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Selection Sort.',
    activeRange: { start: 0, end: n - 1 },
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0], // procedure selectionSort
  }

  for (let i = 0; i < n - 1; i++) {
    let extremeIndex = i
    const currentSearchRange = { start: i, end: n - 1 }

    // Yield 1: Start of Pass i - Announce search for extreme element for arr[i]
    yield {
      array: [...arr],
      message: `Pass ${i + 1}/${n - 1}: Finding ${direction === 'asc' ? 'minimum' : 'maximum'} for A[${i}]. Initial extreme: A[${extremeIndex}] (${arr[extremeIndex]}). Searching in A[${i}...${n - 1}].`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [2, 3], // for i = ..., extremeIndex = i
      activeRange: currentSearchRange,
      highlightedIndices: [i, extremeIndex], // Target position and current extreme candidate
      sortedIndices: Array.from(sortedIndices),
    }

    // Inner loop: Find the index of the minimum/maximum element in the unsorted part (A[i...n-1])
    // No yields inside this inner loop for individual comparisons.
    for (let j = i + 1; j < n; j++) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (shouldBeConsideredExtreme(arr[j], arr[extremeIndex], direction)) {
        extremeIndex = j
      }
    }

    // Yield 2: After Inner Loop - Announce the found extreme element for pass i
    yield {
      array: [...arr],
      message: `Pass ${i + 1}/${n - 1}: Found ${direction === 'asc' ? 'minimum' : 'maximum'} for A[${i}] is A[${extremeIndex}] (${arr[extremeIndex]}). Scanned A[${i + 1}...${n - 1}].`,
      highlightedIndices: [i, extremeIndex], // Target position i and the found extreme index
      activeRange: currentSearchRange,
      sortedIndices: Array.from(sortedIndices),
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [4, 5, 6, 8], // Covers inner loop scan and identification of extremeIndex
    }

    // Swap if the found extreme element is not already at position i
    if (extremeIndex !== i) {
      // Yield 3: Announce impending swap
      yield {
        array: [...arr], // Array state *before* the swap
        message: `Pass ${i + 1}/${n - 1}: About to swap target A[${i}] (${arr[i]}) with found extreme A[${extremeIndex}] (${arr[extremeIndex]}).`,
        swappingIndices: [i, extremeIndex],
        highlightedIndices: [i, extremeIndex],
        activeRange: currentSearchRange,
        sortedIndices: Array.from(sortedIndices),
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [10], // Corresponds to the swap(...) line in pseudo-code
      }

      // Perform the swap
      ;[arr[i], arr[extremeIndex]] = [arr[extremeIndex], arr[i]]
      liveStats.swaps = (liveStats.swaps || 0) + 1
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
    } else {
      // Yield if no swap is needed (already in place)
      yield {
        array: [...arr],
        message: `Pass ${i + 1}/${n - 1}: Element A[${i}] (${arr[i]}) is already the correct ${direction === 'asc' ? 'minimum' : 'maximum'}. No swap needed.`,
        highlightedIndices: [i],
        activeRange: currentSearchRange,
        sortedIndices: Array.from(sortedIndices),
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [9, 11], // Corresponds to `if extremeIndex != i` (false) and `end if` for the swap block
      }
    }

    sortedIndices.add(i)
    // Yield 4: After Swap / Pass Complete
    yield {
      array: [...arr],
      message: `Pass ${i + 1}/${n - 1} complete. A[${i}] (${arr[i]}) is now sorted.`,
      highlightedIndices: [i],
      comparisonIndices: [],
      swappingIndices: null,
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: i + 1, end: n - 1 },
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [12],
    }
  } // End outer loop (i)

  // Ensure the last element is marked as sorted (it will be by logic, but explicitly add)
  if (n > 0 && !sortedIndices.has(n - 1)) {
    sortedIndices.add(n - 1)
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Selection Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [14], // end procedure
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
