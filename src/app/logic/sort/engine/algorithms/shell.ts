'use client'

import { SortGenerator, SortStats } from '../types'

// Comparison function: Checks if a should come AFTER b (for insertion logic)
const shellShouldInsertBefore = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  return direction === 'asc' ? a < b : a > b
}

export const shellSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Shell Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0, // No auxiliary structures
    swaps: 0, // Counting direct writes instead of swaps for Shell Sort
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: n === 1 ? [0] : [],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0], // shellSort(array, n) {
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: 'Starting Shell Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0], // shellSort(array, n) {
  }

  // Start with a large gap, then reduce the gap (using n/2 sequence)
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    yield {
      array: [...arr],
      message: `Starting pass with gap = ${gap}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [3],
    }

    // Do a gapped insertion sort for this gap size.
    for (let i = gap; i < n; i++) {
      yield {
        array: [...arr],
        message: `Outer gapped loop: i = ${i}`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [4],
        highlightedIndices: [i],
      }
      const temp = arr[i]
      yield {
        array: [...arr],
        message: `temp = array[${i}] (${temp})`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [5],
        highlightedIndices: [i],
      }
      let j = i

      let comparedInLoop = false
      if (j >= gap) {
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
        comparedInLoop = true
      }
      yield {
        array: [...arr],
        message: `Checking while condition: j (${j}) >= gap (${gap}) and arr[j-gap] > temp `,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [7],
        highlightedIndices: [j, j - gap].filter(idx => idx >= 0),
        comparisonIndices: [j, j - gap].filter(idx => idx >= 0),
      }

      // Shift earlier gap-sorted elements up until the correct location for arr[i] is found
      while (j >= gap && shellShouldInsertBefore(temp, arr[j - gap], direction)) {
        if (!comparedInLoop) {
          liveStats.comparisons = (liveStats.comparisons || 0) + 1
        }
        comparedInLoop = false

        yield {
          array: [...arr],
          highlightedIndices: [j, j - gap],
          comparisonIndices: [j, j - gap],
          message: `Comparing ${temp} with ${arr[j - gap]} (gap=${gap}). Shifting ${arr[j - gap]} from ${j - gap} to ${j}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [7],
        }

        arr[j] = arr[j - gap]
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
        yield {
          array: [...arr],
          highlightedIndices: [j],
          comparisonIndices: [j - gap],
          message: `Shifted ${arr[j]} from index ${j - gap} to ${j}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [8],
        }
        j -= gap
        yield {
          array: [...arr],
          message: `Decremented j to ${j} (j -= gap)`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [9],
          highlightedIndices: [j, j - gap].filter(idx => idx >= 0),
        }
        if (j >= gap) {
          liveStats.comparisons = (liveStats.comparisons || 0) + 1
          comparedInLoop = true
          yield {
            array: [...arr],
            message: `Next while condition check: j (${j}) >= gap (${gap}) and arr[j-gap] > temp `,
            currentStats: { ...liveStats },
            currentPseudoCodeLine: [7],
            highlightedIndices: [j, j - gap].filter(idx => idx >= 0),
            comparisonIndices: [j, j - gap].filter(idx => idx >= 0),
          }
        }
      }
      yield {
        array: [...arr],
        message: 'Exited inner gapped loop (insertion part).',
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [10],
        highlightedIndices: [j],
      }

      arr[j] = temp
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      yield {
        array: [...arr],
        highlightedIndices: [j],
        message: `Inserted element ${temp} at index ${j}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [11],
      }
    }
    yield {
      array: [...arr],
      message: `Completed pass with gap = ${gap}. Gap will be updated.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [12],
    }
  }
  yield {
    array: [...arr],
    message: 'Finished all gap passes.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [14],
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Shell Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [15],
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
