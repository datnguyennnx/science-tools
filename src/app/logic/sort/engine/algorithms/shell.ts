'use client'

import { SortGenerator } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer' // Import SortStats

// Comparison function: Checks if a should come AFTER b (for insertion logic)
const shouldInsertBefore = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
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
      currentPseudoCodeLine: 0, // shellSort(array, n) {
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: 'Starting Shell Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 0, // shellSort(array, n) {
  }

  // Start with a large gap, then reduce the gap (using n/2 sequence)
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    yield {
      array: [...arr],
      message: `Starting pass with gap = ${gap}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 1, // for (gap = n / 2; ...)
      // Highlight elements potentially involved in this gap pass (optional)
      // comparisonIndices: [...Array(n).keys()].filter(k => k % gap === 0), // Example: highlight start of each sublist
    }

    // Do a gapped insertion sort for this gap size.
    for (let i = gap; i < n; i++) {
      yield {
        array: [...arr],
        message: `Outer gapped loop: i = ${i}`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 2, // for (i = gap; i < n; ...)
        highlightedIndices: [i],
      }
      const temp = arr[i]
      yield {
        array: [...arr],
        message: `temp = array[${i}] (${temp})`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 3, // temp = array[i]
        highlightedIndices: [i],
      }
      let j = i

      // Initial comparison for the while loop is made before entering, if j >= gap
      let comparedInLoop = false
      if (j >= gap) {
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
        comparedInLoop = true
      }
      yield {
        array: [...arr],
        message: `Inner gapped loop (insertion): j = ${j}`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 4, // for (j = i; j >= gap ...)
        highlightedIndices: [j, j - gap].filter(idx => idx >= 0),
        comparisonIndices: [j, j - gap].filter(idx => idx >= 0),
      }

      // Shift earlier gap-sorted elements up until the correct location for arr[i] is found
      while (j >= gap && shouldInsertBefore(temp, arr[j - gap], direction)) {
        if (!comparedInLoop) {
          liveStats.comparisons = (liveStats.comparisons || 0) + 1
        }
        comparedInLoop = false // Reset for next potential iteration comparison

        yield {
          array: [...arr],
          highlightedIndices: [j, j - gap],
          comparisonIndices: [j, j - gap],
          message: `Comparing ${temp} with ${arr[j - gap]} (gap=${gap}). Shifting ${arr[j - gap]} from ${j - gap} to ${j}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 4, // still on the while condition
        }

        arr[j] = arr[j - gap]
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
        yield {
          array: [...arr],
          highlightedIndices: [j],
          comparisonIndices: [j - gap],
          message: `Shifted ${arr[j]} from index ${j - gap} to ${j}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 5, // array[j] = array[j - gap]
        }
        j -= gap
        if (j >= gap) {
          liveStats.comparisons = (liveStats.comparisons || 0) + 1
          comparedInLoop = true
        }
        // Yield after j is decremented, before next while check
        yield {
          array: [...arr],
          message: `Decremented j to ${j} (j -= gap)`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 4, // Back to while condition
          highlightedIndices: [j, j - gap].filter(idx => idx >= 0),
        }
      }
      yield {
        array: [...arr],
        message: 'Exited inner gapped loop (insertion part).',
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 6, // Closing brace of inner for (j...)
        highlightedIndices: [j],
      }

      arr[j] = temp
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      yield {
        array: [...arr],
        highlightedIndices: [j],
        message: `Inserted element ${temp} at index ${j}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 7, // array[j] = temp
      }
    }
    yield {
      array: [...arr],
      message: `Completed pass with gap = ${gap}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 8, // Closing brace of for (i = gap ...)
    }
  }
  yield {
    array: [...arr],
    message: 'Finished all gap passes.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 9, // Closing brace of for (gap = n/2 ...)
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Shell Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 10, // Closing brace of shellSort function
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
