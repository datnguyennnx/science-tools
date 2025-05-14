'use client'

import { SortGenerator } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer' // Import SortStats

// Comparison function based on direction
const shouldSwap = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  // Check if 'a' should come AFTER 'b' based on the direction
  return direction === 'asc' ? a < b : a > b
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
    message: 'Starting Selection Sort',
    activeRange: { start: 0, end: n - 1 }, // Initially, the whole array is unsorted
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i // Index of the minimum/maximum element in the unsorted portion

    // Yield state indicating the start of finding the minimum/maximum for the current pass
    yield {
      array: [...arr],
      highlightedIndices: [i], // Highlight the start of the unsorted section
      comparisonIndices: [i], // Potential minimum/maximum index
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: i, end: n - 1 },
      message: `Pass ${i + 1}: Finding ${direction === 'asc' ? 'minimum' : 'maximum'} for index ${i}. Starting check at index ${i}.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
    }

    // Find the index of the minimum/maximum element in the unsorted part
    for (let j = i + 1; j < n; j++) {
      // Highlight the current minimum/maximum and the element being compared
      yield {
        array: [...arr],
        highlightedIndices: [minIndex, j], // Highlight potential min/max and current comparison
        comparisonIndices: [minIndex, j],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: i, end: n - 1 },
        message: `Comparing element at current ${direction === 'asc' ? 'min' : 'max'} index ${minIndex} (${arr[minIndex]}) with element at index ${j} (${arr[j]})`,
        currentStats: { ...liveStats },
        swappingIndices: null,
      }

      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (shouldSwap(arr[j], arr[minIndex], direction)) {
        const oldMinIndex = minIndex
        minIndex = j
        // Yield state indicating a new minimum/maximum was found
        yield {
          array: [...arr],
          highlightedIndices: [oldMinIndex, j], // Highlight old min/max and new one
          comparisonIndices: [minIndex], // The new min/max index
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start: i, end: n - 1 },
          message: `New ${direction === 'asc' ? 'minimum' : 'maximum'} found at index ${minIndex} (${arr[minIndex]})`,
          currentStats: { ...liveStats },
          swappingIndices: null,
        }
      } else {
        // Yield state indicating comparison finished, no new min/max
        yield {
          array: [...arr],
          highlightedIndices: [minIndex, j], // Keep showing comparison indices
          comparisonIndices: [minIndex], // Keep highlighting current min/max
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start: i, end: n - 1 },
          message: `Element at index ${minIndex} remains the current ${direction === 'asc' ? 'minimum' : 'maximum'}.`,
          currentStats: { ...liveStats },
          swappingIndices: null,
        }
      }
    }

    // If the minimum/maximum is not already at the correct position, swap
    if (minIndex !== i) {
      yield {
        array: [...arr],
        highlightedIndices: [], // Clear general highlight, focus on swap
        comparisonIndices: [],
        swappingIndices: [i, minIndex],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: i, end: n - 1 },
        message: `Preparing to swap element at index ${i} (${arr[i]}) with found ${direction === 'asc' ? 'minimum' : 'maximum'} at index ${minIndex} (${arr[minIndex]})`,
        currentStats: { ...liveStats },
      }
      ;[arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
      liveStats.swaps = (liveStats.swaps || 0) + 1
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2

      // Yield state after swap
      yield {
        array: [...arr],
        highlightedIndices: [i, minIndex], // Highlight the positions that were swapped
        comparisonIndices: [],
        swappingIndices: [i, minIndex], // Show what was just swapped
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: i, end: n - 1 }, // Range remains the same before marking i as sorted
        message: `Swapped elements. New value at index ${i} is ${arr[i]}.`,
        currentStats: { ...liveStats },
      }
    } else {
      yield {
        array: [...arr],
        highlightedIndices: [i], // Just highlight the element already in place
        comparisonIndices: [],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: i, end: n - 1 },
        message: `Element at index ${i} (${arr[i]}) is already in its sorted position for this pass. No swap needed.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
      }
    }

    // Mark the current index as sorted
    sortedIndices.add(i)
    yield {
      array: [...arr],
      highlightedIndices: [], // Clear highlights for the next pass
      comparisonIndices: [],
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: i + 1, end: n - 1 }, // Shrink the active range
      message: `End of pass ${i + 1}. Index ${i} is now sorted.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
    }
  }

  // The last element is sorted by default when the loop finishes
  sortedIndices.add(n - 1)

  // Final sorted state confirmation
  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()], // All indices are sorted
    message: 'Selection Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
