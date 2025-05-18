'use client'

import { SortGenerator, SortStats, SortStep } from '../types'

const isSortedGenerator = function* (
  arr: ReadonlyArray<number>,
  direction: 'asc' | 'desc',
  liveStats: Partial<SortStats>,
  attemptNumber?: number
): Generator<SortStep, boolean, void> {
  const n = arr.length
  if (n <= 1) {
    yield {
      array: [...arr],
      message: `Attempt ${attemptNumber || 'Initial'}: Array has ${n} element(s), considered sorted.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [7], // Corresponds to "for i = 0 to length of list - 2" (vacuously true)
      sortedIndices: [...Array(n).keys()],
      swappingIndices: null,
    }
    return true
  }

  // Pseudo line 6: procedure isSorted(list, direction)
  yield {
    array: [...arr],
    message: `Attempt ${attemptNumber || 'N/A'} (isSorted): Starting check for sorted order.`,
    highlightedIndices: [...Array(n).keys()], // Highlight the whole range being checked
    comparisonIndices: [],
    swappingIndices: null,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [6, 7], // procedure isSorted, for i = ...
  }

  // Pseudo line 7: for i = 0 to length of list - 2
  for (let i = 0; i < n - 1; i++) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    const val1 = arr[i]
    const val2 = arr[i + 1]
    yield {
      array: [...arr],
      highlightedIndices: [i, i + 1],
      comparisonIndices: [i, i + 1],
      swappingIndices: null,
      message: `Attempt ${attemptNumber || 'N/A'} (isSorted): Comparing A[${i}] (${val1}) and A[${i + 1}] (${val2}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [7, 8], // for loop and if condition
    }

    // Pseudo line 8: if (direction == ASC and list[i] > list[i + 1]) or (direction == DESC and list[i] < list[i + 1]) then
    const outOfOrder = direction === 'asc' ? val1 > val2 : val1 < val2
    if (outOfOrder) {
      yield {
        array: [...arr],
        highlightedIndices: [i, i + 1],
        comparisonIndices: [i, i + 1],
        swappingIndices: null,
        message: `Attempt ${attemptNumber || 'N/A'} (isSorted): A[${i}] (${val1}) and A[${i + 1}] (${val2}) are out of order. Array not sorted.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [8, 9], // if condition true, return false
      }
      return false // Pseudo line 9: return false
    }
  }
  // Pseudo line 11: end for
  // Pseudo line 12: return true
  yield {
    array: [...arr],
    message: `Attempt ${attemptNumber || 'N/A'} (isSorted): All elements checked. Array appears sorted for this attempt.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [11, 12], // end for, return true
    sortedIndices: [...Array(n).keys()],
    swappingIndices: null,
  }
  return true
}

const shuffleGenerator = function* (
  arr: number[],
  liveStats: Partial<SortStats>,
  attemptNumber?: number
): Generator<SortStep, void, void> {
  const n = arr.length
  yield {
    array: [...arr],
    message: `Attempt ${attemptNumber || 'N/A'} (Shuffle): Starting Fisher-Yates shuffle.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [15, 16], // procedure shuffle, for i = ...
    highlightedIndices: [...Array(n).keys()], // Highlight whole array being shuffled
    swappingIndices: null,
  }
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)) // Pseudo line 17

    // const valI = arr[i]; // Value before swap
    // const valJ = arr[j]; // Value before swap

    ;[arr[i], arr[j]] = [arr[j], arr[i]] // Pseudo line 18
    liveStats.swaps = (liveStats.swaps || 0) + 1
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2

    yield {
      array: [...arr], // Array state *after* the swap
      highlightedIndices: [i, j], // Elements involved in the swap
      swappingIndices: [i, j], // Indicate these were swapped
      message: `Attempt ${attemptNumber || 'N/A'} (Shuffle): Swapped A[${i}] (now ${arr[i]}) with A[${j}] (now ${arr[j]}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [17, 18], // j = random, swap(...)
    }
  }
  yield {
    array: [...arr],
    message: `Attempt ${attemptNumber || 'N/A'}: Shuffle complete.`,
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [19, 20], // end for (shuffle), end procedure (shuffle)
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
      currentPseudoCodeLine: [0], // procedure bogoSort
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: 'Starting Bogo Sort ("The Patient Sort")... This might take a while!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [0], // procedure bogoSort
  }

  let attempts = 0
  const MAX_ATTEMPTS = 100000 // Safety break for practical visualization

  let sortedResult = yield* isSortedGenerator(arr, direction, liveStats, attempts + 1)

  yield {
    array: [...arr],
    message: sortedResult
      ? `Initial array is already sorted after ${liveStats.comparisons} comparisons (Attempt 1).`
      : `Initial array not sorted (Attempt 1). Starting shuffles.`,
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [1], // while not isSorted
  }

  while (!sortedResult) {
    attempts++
    if (attempts > MAX_ATTEMPTS) {
      yield {
        array: [...arr],
        message: `Bogo Sort stopped after ${MAX_ATTEMPTS} shuffles (Safety Break). Array may not be sorted. Total comparisons: ${liveStats.comparisons}.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: [1], // Still in the while loop conceptually
      }
      return { finalArray: arr, stats: liveStats as SortStats }
    }

    yield {
      array: [...arr],
      message: `Attempt ${attempts}: Array not sorted. Shuffling...`,
      highlightedIndices: [...Array(n).keys()], // Highlight whole array during shuffle
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [2], // shuffle(list)
    }

    yield* shuffleGenerator(arr, liveStats, attempts)

    yield {
      array: [...arr],
      message: `Attempt ${attempts}: Array shuffled. Checking if sorted...`,
      highlightedIndices: [], // Clear shuffle highlight
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [1], // while not isSorted (checking condition)
    }
    sortedResult = yield* isSortedGenerator(arr, direction, liveStats, attempts)
    yield {
      array: [...arr],
      message: sortedResult
        ? `Attempt ${attempts}: Sorted! Total comparisons: ${liveStats.comparisons}.`
        : `Attempt ${attempts}: Still not sorted. Total comparisons: ${liveStats.comparisons}.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: sortedResult ? [3] : [1], // end while (if sorted) or back to while
    }
  }

  yield {
    array: [...arr],
    message: `Bogo Sort Complete after ${attempts} attempt(s)! Total comparisons: ${liveStats.comparisons}. Total swaps: ${liveStats.swaps}.`,
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [4], // end procedure
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
