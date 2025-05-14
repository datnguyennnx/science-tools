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
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: 'Starting Shell Sort.',
    currentStats: { ...liveStats },
  }

  // Start with a large gap, then reduce the gap (using n/2 sequence)
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    yield {
      array: [...arr],
      message: `Starting pass with gap = ${gap}.`,
      currentStats: { ...liveStats },
      // Highlight elements potentially involved in this gap pass (optional)
      // comparisonIndices: [...Array(n).keys()].filter(k => k % gap === 0), // Example: highlight start of each sublist
    }

    // Do a gapped insertion sort for this gap size.
    // The first gap elements arr[0..gap-1] are already in gapped order
    // keep adding one more element until the entire array is gap sorted
    for (let i = gap; i < n; i++) {
      // Add arr[i] to the elements that have been gap sorted
      // Save arr[i] in temp and make a hole at position i
      const temp = arr[i]
      let j = i

      // Yield state showing the element being picked for insertion
      yield {
        array: [...arr],
        highlightedIndices: [i], // Highlight the element being inserted
        // comparisonIndices: [...Array(Math.ceil(i / gap)).keys()].map(k => i - k * gap).filter(k => k >= 0), // Indices compared against
        message: `Selecting element ${temp} at index ${i} for gapped insertion (gap ${gap}).`,
        currentStats: { ...liveStats },
      }

      // Initial comparison for the while loop is made before entering, if j >= gap
      let comparedInLoop = false
      if (j >= gap) {
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
        comparedInLoop = true
      }

      // Shift earlier gap-sorted elements up until the correct location for arr[i] is found
      while (j >= gap && shouldInsertBefore(temp, arr[j - gap], direction)) {
        // If not the first comparison (already counted), count subsequent ones
        if (!comparedInLoop) {
          liveStats.comparisons = (liveStats.comparisons || 0) + 1
        }
        comparedInLoop = false // Reset for next potential iteration comparison

        // Yield state showing comparison and preparing for shift
        yield {
          array: [...arr],
          highlightedIndices: [j, j - gap], // Highlight elements being compared
          comparisonIndices: [j, j - gap],
          message: `Comparing ${temp} with ${arr[j - gap]} (gap=${gap}). Shifting ${arr[j - gap]} from ${j - gap} to ${j}.`,
          currentStats: { ...liveStats },
        }

        arr[j] = arr[j - gap] // Shift element
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1

        // Yield state after shift
        yield {
          array: [...arr],
          highlightedIndices: [j], // Highlight the new position of the shifted element
          comparisonIndices: [j - gap], // Show where it came from
          message: `Shifted ${arr[j]} from index ${j - gap} to ${j}.`,
          currentStats: { ...liveStats },
        }
        j -= gap
        // Count comparison for the next iteration of the while loop, if condition holds
        if (j >= gap) {
          liveStats.comparisons = (liveStats.comparisons || 0) + 1
          comparedInLoop = true // Mark that this comparison for next iter is counted
        }
      }

      // Put temp (the original arr[i]) in its correct location
      if (j !== i) {
        // Only yield if a shift actually happened
        arr[j] = temp
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
        yield {
          array: [...arr],
          highlightedIndices: [j], // Highlight where temp was placed
          // comparisonIndices: [],
          message: `Inserted element ${temp} at index ${j}.`,
          currentStats: { ...liveStats },
        }
      } else {
        // Yield state if no shift was needed
        yield {
          array: [...arr],
          highlightedIndices: [i], // Highlight the element that didn't need to move
          // comparisonIndices: [i - gap].filter(k => k >=0), // Compare with the element `gap` positions before
          message: `Element ${temp} at index ${i} is already in correct gapped position.`,
          currentStats: { ...liveStats },
        }
      }
    }
    yield {
      array: [...arr],
      message: `Completed pass with gap = ${gap}.`,
      currentStats: { ...liveStats },
    }
  }

  // Final state confirmation (gap is 1, equivalent to insertion sort)
  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Shell Sort Complete!',
    currentStats: { ...liveStats },
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
