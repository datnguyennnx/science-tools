'use client'

import { SortGenerator } from '../types' // Removed SortStep as it's implicitly used by SortGenerator
import type { SortStats } from '../../components/AuxiliaryVisualizer' // Import SortStats

// Comparison function based on direction (using const arrow function style)
const compare = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  // For Bubble Sort, we check if `a` should come AFTER `b` to trigger a swap
  return direction === 'asc' ? a > b : a < b
}

// Bubble Sort generator function
export const bubbleSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = new Set<number>()
  let swapped: boolean

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Bubble Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0, // No auxiliary structures
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Bubble Sort',
    activeRange: { start: 0, end: n - 1 },
    currentStats: { ...liveStats },
  }

  // Outer loop for passes
  for (let i = 0; i < n - 1; i++) {
    swapped = false
    // Inner loop for comparisons and swaps
    const currentPassEnd = n - 1 - i
    for (let j = 0; j < currentPassEnd; j++) {
      // Highlight elements being compared
      yield {
        array: [...arr],
        highlightedIndices: [j, j + 1],
        comparisonIndices: [j, j + 1],
        swappingIndices: null, // Clear previous swap state
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: currentPassEnd },
        message: `Comparing ${arr[j]} and ${arr[j + 1]} at indices ${j} and ${j + 1}`,
        currentStats: { ...liveStats },
      }

      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (compare(arr[j], arr[j + 1], direction)) {
        // Yield state indicating elements are about to be swapped
        yield {
          array: [...arr],
          highlightedIndices: [], // Clear general highlight, focus on swap
          comparisonIndices: [],
          swappingIndices: [j, j + 1], // Mark for swap visual
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start: 0, end: currentPassEnd },
          message: `Preparing to swap ${arr[j]} and ${arr[j + 1]}.`,
          currentStats: { ...liveStats },
        }

        // Swap elements
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swapped = true

        // Yield state after swap
        yield {
          array: [...arr],
          highlightedIndices: [j, j + 1], // Highlight after swap
          comparisonIndices: [],
          swappingIndices: [j, j + 1], // Indicate these were just swapped
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start: 0, end: currentPassEnd },
          message: `Swapped. New values: ${arr[j]} (at ${j}) and ${arr[j + 1]} (at ${j + 1}).`,
          currentStats: { ...liveStats },
        }
      } else {
        // Yield state if no swap occurred (optional, but good for clarity)
        yield {
          array: [...arr],
          highlightedIndices: [j, j + 1],
          comparisonIndices: [],
          swappingIndices: null, // Ensure swap state is cleared
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start: 0, end: currentPassEnd },
          message: `No swap needed for ${arr[j]} and ${arr[j + 1]}.`,
          currentStats: { ...liveStats },
        }
      }
    }

    // After each pass, the last element of the active range is sorted
    sortedIndices.add(currentPassEnd)
    yield {
      array: [...arr],
      highlightedIndices: [],
      comparisonIndices: [],
      swappingIndices: null,
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: currentPassEnd - 1 }, // Reduce active range
      message: `End of pass ${i + 1}. Index ${currentPassEnd} is sorted.`,
      currentStats: { ...liveStats },
    }

    // If no swaps occurred in a pass, the array is sorted
    if (!swapped) {
      // Mark remaining unsorted elements as sorted
      for (let k = 0; k < currentPassEnd; k++) {
        sortedIndices.add(k)
      }
      yield {
        array: [...arr],
        highlightedIndices: [],
        comparisonIndices: [],
        swappingIndices: null,
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: -1 }, // No active range
        message: 'Array sorted (no swaps in last pass).',
        currentStats: { ...liveStats },
      }
      break // Exit outer loop
    }
  }

  // Ensure the first element is marked sorted if loop finishes naturally
  if (sortedIndices.size < n) {
    sortedIndices.add(0)
  }

  // Final sorted state confirmation
  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()], // All indices are sorted
    message: 'Bubble Sort Complete!',
    swappingIndices: null,
    currentStats: { ...liveStats },
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
