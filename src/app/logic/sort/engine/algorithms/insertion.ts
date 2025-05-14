'use client'

import { SortGenerator } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer' // Import SortStats

// Comparison function: Checks if b should come AFTER a
const shouldInsertBefore = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  return direction === 'asc' ? a < b : a > b
}

export const insertionSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = new Set<number>()

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Insertion Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0, // No auxiliary structures
    swaps: 0, // Insertion sort shifts, not swaps in the typical sense for stats
  }

  if (n <= 1) {
    if (n === 1) sortedIndices.add(0)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  // The first element is trivially sorted
  sortedIndices.add(0)
  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Insertion Sort. Index 0 is initially considered sorted.',
    activeRange: { start: 0, end: 0 }, // Initially sorted range
    currentStats: { ...liveStats },
  }

  // Iterate from the second element
  for (let i = 1; i < n; i++) {
    const key = arr[i]
    let j = i - 1

    // Yield state showing the element picked as 'key'
    yield {
      array: [...arr],
      highlightedIndices: [i], // Highlight the key element
      comparisonIndices: [...Array(i).keys()], // Highlight the sorted portion being checked against
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: i - 1 }, // Current sorted range
      message: `Pass ${i}: Selecting element ${key} at index ${i} to insert into sorted portion [0...${i - 1}].`,
      currentStats: { ...liveStats },
    }

    let comparedIndex = -1
    let firstComparisonMade = false
    if (j >= 0) {
      // Check if at least one comparison will be made by the while loop condition
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      firstComparisonMade = true
    }

    // Move elements of the sorted portion [0...i-1] that are greater/smaller than key
    // one position ahead of their current position
    while (j >= 0 && shouldInsertBefore(key, arr[j], direction)) {
      if (!firstComparisonMade) {
        // If the first comparison was not made outside, count it now
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
      }
      firstComparisonMade = false // Reset for subsequent iterations

      comparedIndex = j
      // Yield state showing comparison and preparing for shift
      yield {
        array: [...arr],
        highlightedIndices: [i, j], // Highlight key and element being compared
        comparisonIndices: [i, j],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: i - 1 },
        message: `Comparing key ${key} with ${arr[j]} at index ${j}. Shift ${arr[j]} to index ${j + 1}.`,
        currentStats: { ...liveStats },
      }

      arr[j + 1] = arr[j] // Shift element
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1

      // Yield state after shift
      yield {
        array: [...arr],
        highlightedIndices: [j + 1], // Highlight the new position of the shifted element
        comparisonIndices: [i], // Still comparing against the key
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: i - 1 },
        message: `Shifted ${arr[j + 1]} from index ${j} to ${j + 1}.`,
        currentStats: { ...liveStats },
      }
      j = j - 1
      if (j >= 0) {
        // If another comparison will occur due to while condition
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
        firstComparisonMade = true // Mark that the next comparison is pre-counted
      }
    }

    if (comparedIndex !== -1 && j !== comparedIndex) {
      // If a shift happened, show the comparison that stopped the loop (or end of loop)
      yield {
        array: [...arr],
        highlightedIndices: [i, j + 1], // Highlight key and its insertion point
        comparisonIndices: j >= 0 ? [i, j] : [i], // Show comparison if j is valid
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: i - 1 },
        message:
          j >= 0
            ? `Key ${key} should be inserted before ${arr[j]} at index ${j + 1}.`
            : `Key ${key} is the smallest/largest so far, inserting at index 0.`,
        currentStats: { ...liveStats },
      }
    } else if (comparedIndex === -1) {
      // If no shift happened at all (key was already in sorted position relative to j=i-1)
      yield {
        array: [...arr],
        highlightedIndices: [i, j], // Highlight key and element it was compared with
        comparisonIndices: [i, j],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: i - 1 },
        message: `Key ${key} is already in correct position relative to ${arr[j]}. No shifts needed in this pass.`,
        currentStats: { ...liveStats },
      }
    }

    // Place the key at its correct position
    arr[j + 1] = key
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    sortedIndices.add(i) // The range up to i is now sorted

    // Yield state after inserting the key
    yield {
      array: [...arr],
      highlightedIndices: [j + 1], // Highlight the final position of the key
      comparisonIndices: [],
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: i }, // Update sorted range
      message: `Inserted key ${key} at index ${j + 1}. Sorted portion is now [0...${i}].`,
      currentStats: { ...liveStats },
    }
  }

  // Final confirmation (all elements are sorted)
  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Insertion Sort Complete!',
    currentStats: { ...liveStats },
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
