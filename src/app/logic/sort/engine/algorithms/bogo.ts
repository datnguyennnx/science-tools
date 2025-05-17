'use client'

import { SortGenerator, SortStats, SortStep } from '../types'

const isSorted = (
  arr: number[],
  direction: 'asc' | 'desc',
  liveStats: Partial<SortStats>
): boolean => {
  for (let i = 0; i < arr.length - 1; i++) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    if (direction === 'asc' ? arr[i] > arr[i + 1] : arr[i] < arr[i + 1]) {
      return false
    }
  }
  return true
}

const shuffleGenerator = function* (
  arr: number[],
  liveStats: Partial<SortStats>
): Generator<SortStep, void, void> {
  const n = arr.length
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

    yield {
      array: [...arr],
      highlightedIndices: [],
      comparisonIndices: [],
      swappingIndices: [i, j],
      message: `Shuffle: Preparing to swap elements at index ${i} (${arr[i]}) and ${j} (${arr[j]}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [18],
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
      swappingIndices: [i, j],
      message: `Shuffle: Swapped. New values: ${arr[i]} (at ${i}) and ${arr[j]} (at ${j}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [18],
    }
  }
  yield {
    array: [...arr],
    message: 'Shuffle complete for this attempt.',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [20],
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
      currentPseudoCodeLine: [0],
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: 'Starting Bogo Sort ("The Patient Sort")... This might take a while!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [0],
  }

  let attempts = 0
  const MAX_ATTEMPTS = 100000

  let sorted = isSorted(arr, direction, liveStats)
  yield {
    array: [...arr],
    message: sorted
      ? `Initial array is already sorted after ${liveStats.comparisons} comparisons.`
      : `Initial array not sorted after ${liveStats.comparisons} comparisons. Starting shuffles.`,
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [1],
  }

  while (!sorted) {
    attempts++
    if (attempts > MAX_ATTEMPTS) {
      yield {
        array: [...arr],
        message: `Bogo Sort stopped after ${MAX_ATTEMPTS} shuffles (Safety Break). Array may not be sorted.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: [1],
      }
      return { finalArray: arr, stats: liveStats as SortStats }
    }

    yield {
      array: [...arr],
      message: `Attempt ${attempts}: Array not sorted. Shuffling...`,
      highlightedIndices: [...Array(n).keys()],
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [2],
    }

    yield* shuffleGenerator(arr, liveStats)

    yield {
      array: [...arr],
      message: `Attempt ${attempts}: Array shuffled. Checking if sorted...`,
      highlightedIndices: [],
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [1],
    }
    sorted = isSorted(arr, direction, liveStats)
    yield {
      array: [...arr],
      message: sorted
        ? `Attempt ${attempts}: Sorted!`
        : `Attempt ${attempts}: Still not sorted after ${liveStats.comparisons} total comparisons.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: sorted ? [3] : [1],
    }
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: `Bogo Sort Complete after ${attempts} attempt(s)! Total comparisons: ${liveStats.comparisons}.`,
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [4],
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
