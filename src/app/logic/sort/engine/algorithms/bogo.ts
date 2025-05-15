'use client'

import { SortGenerator, SortStats, SortStep } from '../types'

// Helper function to check if the array is sorted
const isSorted = (
  arr: number[],
  direction: 'asc' | 'desc',
  liveStats: Partial<SortStats>
  // pseudoCodeLineForCheckStart?: number, // Could pass these for more granular pseudo-code
  // pseudoCodeLineForCompare?: number,
  // pseudoCodeLineForReturnFalse?: number,
  // pseudoCodeLineForReturnTrue?: number,
): boolean => {
  // currentPseudoCodeLine: pseudoCodeLineForCheckStart // e.g. 6 (isSorted loop)
  for (let i = 0; i < arr.length - 1; i++) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    // currentPseudoCodeLine: pseudoCodeLineForCompare // e.g. 7 (if condition)
    if (direction === 'asc' ? arr[i] > arr[i + 1] : arr[i] < arr[i + 1]) {
      // currentPseudoCodeLine: pseudoCodeLineForReturnFalse // e.g. 8 (return false)
      return false
    }
  }
  // currentPseudoCodeLine: pseudoCodeLineForReturnTrue // e.g. 11 (return true)
  return true
}

const shuffleGenerator = function* (
  arr: number[],
  liveStats: Partial<SortStats>
): Generator<SortStep, void, void> {
  const n = arr.length
  // currentPseudoCodeLine: 13 (shuffle(array))
  // currentPseudoCodeLine: 14 (for loop in shuffle)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // currentPseudoCodeLine: 15 (j = random)

    yield {
      array: [...arr],
      highlightedIndices: [],
      comparisonIndices: [],
      swappingIndices: [i, j],
      message: `Shuffle: Preparing to swap elements at index ${i} (${arr[i]}) and ${j} (${arr[j]}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 16, // swap(array[i], array[j])
    }

    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
    liveStats.swaps = (liveStats.swaps || 0) + 1
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2

    yield {
      array: [...arr],
      highlightedIndices: [i, j],
      comparisonIndices: [],
      swappingIndices: [i, j], // Show what was just swapped
      message: `Shuffle: Swapped. New values: ${arr[i]} (at ${i}) and ${arr[j]} (at ${j}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 16, // still on swap operation
    }
  }
  // currentPseudoCodeLine: 17 (end of for loop in shuffle)
  yield {
    array: [...arr],
    message: 'Shuffle complete for this attempt.',
    currentStats: { ...liveStats },
    swappingIndices: null, // Clear after shuffle pass
    currentPseudoCodeLine: 18, // end of shuffle()
  }
}

export const bogoSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Bogo Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
  }

  if (n <= 1) {
    if (n === 1) liveStats.comparisons = 0
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 0, // bogoSort(array) { -> considered part of initialization
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: 'Starting Bogo Sort ("The Patient Sort")... This might take a while!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 0, // bogoSort(array) {
  }

  let attempts = 0
  const MAX_ATTEMPTS = 100000 // Reduced for practical visualization purposes

  // Initial check for sorted state
  // This call to isSorted covers lines 5-12 of pseudo-code conceptually.
  // We will highlight line 1 when in the while loop condition.
  let sorted = isSorted(arr, direction, liveStats)
  yield {
    array: [...arr],
    message: sorted
      ? `Initial array is already sorted after ${liveStats.comparisons} comparisons.`
      : `Initial array not sorted after ${liveStats.comparisons} comparisons. Starting shuffles.`,
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 1, // conceptually, we've checked isSorted for the while loop
  }

  while (!sorted) {
    // currentPseudoCodeLine: 1 // while (!isSorted(array))
    attempts++
    if (attempts > MAX_ATTEMPTS) {
      yield {
        array: [...arr],
        message: `Bogo Sort stopped after ${MAX_ATTEMPTS} shuffles (Safety Break). Array may not be sorted.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: 1, // Still in the context of the while loop condition check
      }
      return { finalArray: arr, stats: liveStats as SortStats }
    }

    yield {
      array: [...arr],
      message: `Attempt ${attempts}: Array not sorted. Shuffling...`,
      highlightedIndices: [...Array(n).keys()], // Highlight whole array during shuffle prep
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 2, // shuffle(array)
    }

    // shuffleGenerator internal lines are 13-18
    // We'll mark the call to shuffle as line 2.
    yield* shuffleGenerator(arr, liveStats) // This will yield steps with lines 16, 18

    yield {
      array: [...arr],
      message: `Attempt ${attempts}: Array shuffled. Checking if sorted...`,
      highlightedIndices: [],
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 1, // while (!isSorted(array)) - re-evaluating condition
    }
    // This call to isSorted covers lines 5-12 of pseudo-code conceptually.
    sorted = isSorted(arr, direction, liveStats)
    yield {
      array: [...arr],
      message: sorted
        ? `Attempt ${attempts}: Sorted!`
        : `Attempt ${attempts}: Still not sorted after ${liveStats.comparisons} total comparisons.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: sorted ? 3 : 1, // If sorted, we are at line 3 (end of while), else back to line 1
    }
  }

  // currentPseudoCodeLine: 3 (closing brace of while)
  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: `Bogo Sort Complete after ${attempts} attempt(s)! Total comparisons: ${liveStats.comparisons}.`,
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 4, // Closing brace of bogoSort function
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
