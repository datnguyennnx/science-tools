'use client'

import { SortGenerator, SortStats } from '../types'

const isInOrder = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  return direction === 'asc' ? a >= b : a <= b
}

export const gnomeSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  let index = 0

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Gnome Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0],
      swappingIndices: null,
      comparisonIndices: [],
      highlightedIndices: [...Array(n).keys()],
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: [],
    message: `Starting Gnome Sort. Initializing gnome (position index) to ${index}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0, 1],
    highlightedIndices: [index],
    swappingIndices: null,
    comparisonIndices: [],
  }

  while (index < n) {
    if (index === 0) {
      const prevIndex = index
      index++
      yield {
        array: [...arr],
        highlightedIndices: [index],
        sortedIndices: [],
        message: `Gnome at start (was index ${prevIndex}). Advanced to index ${index}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [4, 5],
        swappingIndices: null,
        comparisonIndices: [],
      }
    } else {
      const gnomePreviousPosition = index
      const valAtIndex = arr[index]
      const valAtPrevIndex = arr[index - 1]
      let message: string
      let swappedThisIteration = false
      let pseudoCodeLineNumbers: number[]

      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (isInOrder(valAtIndex, valAtPrevIndex, direction)) {
        index++
        message = `Gnome at ${gnomePreviousPosition}: A[${gnomePreviousPosition}] (${valAtIndex}) and A[${gnomePreviousPosition - 1}] (${valAtPrevIndex}) are in order. Gnome advances to ${index}.`
        pseudoCodeLineNumbers = [6, 7]
      } else {
        ;[arr[index], arr[index - 1]] = [arr[index - 1], arr[index]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swappedThisIteration = true
        index--
        message = `Gnome at ${gnomePreviousPosition}: A[${gnomePreviousPosition}] (${valAtIndex}) and A[${gnomePreviousPosition - 1}] (${valAtPrevIndex}) were out of order. Swapped. Gnome moves back to ${index}.`
        pseudoCodeLineNumbers = [8, 9, 10]
      }

      yield {
        array: [...arr],
        message: message,
        highlightedIndices: [index],
        comparisonIndices: [gnomePreviousPosition, gnomePreviousPosition - 1],
        swappingIndices: swappedThisIteration
          ? [gnomePreviousPosition, gnomePreviousPosition - 1]
          : null,
        sortedIndices: [],
        currentStats: { ...liveStats },
        currentPseudoCodeLine: pseudoCodeLineNumbers,
      }
    }
  }

  const finalSortedIndices = [...Array(n).keys()]
  yield {
    array: [...arr],
    sortedIndices: finalSortedIndices,
    message: 'Gnome Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [13],
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: finalSortedIndices,
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
