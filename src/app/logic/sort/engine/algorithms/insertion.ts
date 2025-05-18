'use client'

import { SortGenerator, SortStats } from '../types'

const shouldInsertBefore = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  return direction === 'asc' ? a < b : a > b
}

export const insertionSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const liveSortedIndices = new Set<number>()

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Insertion Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
    swaps: 0,
  }

  if (n <= 1) {
    if (n === 1) liveSortedIndices.add(0)
    yield {
      array: [...arr],
      sortedIndices: Array.from(liveSortedIndices),
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1, 2],
      swappingIndices: null,
      comparisonIndices: [],
      highlightedIndices: [],
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  liveSortedIndices.add(0)
  yield {
    array: [...arr],
    sortedIndices: Array.from(liveSortedIndices),
    message: 'Starting Insertion Sort. Index 0 is considered sorted.',
    activeRange: { start: 0, end: 0 },
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0, 3],
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [0],
  }

  for (let i = 1; i < n; i++) {
    const key = arr[i]
    const originalKeyIndex = i
    let j = i - 1

    let initialComparisonMessage = `Pass ${i}: Selected ${key} (from A[${originalKeyIndex}]). `
    if (j < 0) {
      initialComparisonMessage += `Will be placed at start as array was empty before it.`
    } else {
      initialComparisonMessage += `Comparing with A[${j}] (${arr[j]}).`
    }

    yield {
      array: [...arr],
      message: initialComparisonMessage,
      highlightedIndices: [originalKeyIndex, ...(j >= 0 ? [j] : [])],
      activeKeyInfo: { value: key, originalIndex: originalKeyIndex, currentIndex: null },
      comparisonIndices: j >= 0 ? [originalKeyIndex, j] : [originalKeyIndex],
      sortedIndices: Array.from(liveSortedIndices),
      activeRange: { start: 0, end: j },
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [5, 6, 7],
      swappingIndices: null,
    }

    let shiftedSomethingInLoop = false
    while (j >= 0 && shouldInsertBefore(key, arr[j], direction)) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      const shiftedValue = arr[j]
      arr[j + 1] = shiftedValue
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      shiftedSomethingInLoop = true
      const previousJ = j
      j = j - 1

      let messageAfterShift = `Pass ${i}: Shifted ${shiftedValue} (from A[${previousJ}]) to A[${previousJ + 1}]. `
      if (j >= 0) {
        messageAfterShift += `Next: comparing ${key} with A[${j}] (${arr[j]}).`
      } else {
        messageAfterShift += `Key ${key} will be placed at the start.`
      }

      yield {
        array: [...arr],
        message: messageAfterShift,
        highlightedIndices: [originalKeyIndex, ...(j >= 0 ? [j] : []), previousJ + 1],
        activeKeyInfo: { value: key, originalIndex: originalKeyIndex, currentIndex: null },
        comparisonIndices: j >= 0 ? [originalKeyIndex, j] : [originalKeyIndex],
        swappingIndices: [previousJ, previousJ + 1],
        sortedIndices: Array.from(liveSortedIndices),
        activeRange: { start: 0, end: i - 1 },
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [8, 9],
      }
    }

    if (!shiftedSomethingInLoop && j >= 0) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
    }

    const insertionPoint = j + 1
    if (arr[insertionPoint] !== key || insertionPoint !== originalKeyIndex) {
      arr[insertionPoint] = key
      if (insertionPoint !== originalKeyIndex) {
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      }
    }

    liveSortedIndices.add(i)

    yield {
      array: [...arr],
      message: `Pass ${i}: Inserted ${key} at A[${insertionPoint}]. Sorted portion is now [0...${i}].`,
      highlightedIndices: [insertionPoint],
      activeKeyInfo: { value: key, originalIndex: originalKeyIndex, currentIndex: insertionPoint },
      sortedIndices: Array.from(liveSortedIndices),
      activeRange: { start: 0, end: i },
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [11, 12],
      swappingIndices:
        insertionPoint !== originalKeyIndex ? [originalKeyIndex, insertionPoint] : null,
      comparisonIndices: [],
    }
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Insertion Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [13, 14],
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [...Array(n).keys()],
    activeKeyInfo: null,
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
