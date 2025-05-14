'use client'

import { SortGenerator } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer'

// Comparison function based on direction
const shouldSwap = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  // Check if 'a' should come AFTER 'b' based on the direction
  return direction === 'asc' ? a > b : a < b
}

export const oddEvenSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  let isSorted = false

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Odd-Even Sort',
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
      swappingIndices: null,
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: 'Starting Odd-Even Sort.',
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  while (!isSorted) {
    isSorted = true // Assume sorted until a swap is made

    // Perform Bubble sort on odd indexed element
    yield {
      array: [...arr],
      message: 'Odd pass: Comparing and swapping odd-indexed elements with their next element.',
      currentStats: { ...liveStats },
      swappingIndices: null,
    }
    for (let i = 1; i <= n - 2; i = i + 2) {
      yield {
        array: [...arr],
        highlightedIndices: [i, i + 1],
        comparisonIndices: [i, i + 1],
        message: `Comparing elements at index ${i} (${arr[i]}) and ${i + 1} (${arr[i + 1]}).`,
        currentStats: { ...liveStats },
        swappingIndices: null,
      }
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (shouldSwap(arr[i], arr[i + 1], direction)) {
        yield {
          array: [...arr],
          highlightedIndices: [],
          comparisonIndices: [],
          swappingIndices: [i, i + 1],
          message: `Preparing to swap elements at indices ${i} (${arr[i]}) and ${i + 1} (${arr[i + 1]}).`,
          currentStats: { ...liveStats },
        }
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        isSorted = false
        yield {
          array: [...arr],
          highlightedIndices: [i, i + 1],
          comparisonIndices: [],
          swappingIndices: [i, i + 1], // Show what was just swapped
          message: `Swapped. New values: ${arr[i]} (at ${i}) and ${arr[i + 1]} (at ${i + 1}).`,
          currentStats: { ...liveStats },
        }
      }
    }

    // Perform Bubble sort on even indexed element
    yield {
      array: [...arr],
      message: 'Even pass: Comparing and swapping even-indexed elements with their next element.',
      currentStats: { ...liveStats },
      swappingIndices: null,
    }
    for (let i = 0; i <= n - 2; i = i + 2) {
      yield {
        array: [...arr],
        highlightedIndices: [i, i + 1],
        comparisonIndices: [i, i + 1],
        message: `Comparing elements at index ${i} (${arr[i]}) and ${i + 1} (${arr[i + 1]}).`,
        currentStats: { ...liveStats },
        swappingIndices: null,
      }
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (shouldSwap(arr[i], arr[i + 1], direction)) {
        yield {
          array: [...arr],
          highlightedIndices: [],
          comparisonIndices: [],
          swappingIndices: [i, i + 1],
          message: `Preparing to swap elements at indices ${i} (${arr[i]}) and ${i + 1} (${arr[i + 1]}).`,
          currentStats: { ...liveStats },
        }
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        isSorted = false
        yield {
          array: [...arr],
          highlightedIndices: [i, i + 1],
          comparisonIndices: [],
          swappingIndices: [i, i + 1], // Show what was just swapped
          message: `Swapped. New values: ${arr[i]} (at ${i}) and ${arr[i + 1]} (at ${i + 1}).`,
          currentStats: { ...liveStats },
        }
      }
    }
    // After each full pair of odd/even passes, we can mark elements as sorted from ends if desired
    // For simplicity here, we will mark all sorted at the very end.
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()], // All elements are now sorted
    message: 'Odd-Even Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
