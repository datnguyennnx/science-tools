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
      currentPseudoCodeLine: [2],
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
    currentPseudoCodeLine: [0], // function insertionSort(array, n) {
  }

  // Iterate from the second element
  for (let i = 1; i < n; i++) {
    yield {
      array: [...arr],
      message: `Outer loop: i = ${i}`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [4],
      activeRange: { start: 0, end: i - 1 },
      sortedIndices: Array.from(sortedIndices),
    }
    const key = arr[i]
    yield {
      array: [...arr],
      message: `Key = ${key}`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [5],
      activeRange: { start: 0, end: i - 1 },
      sortedIndices: Array.from(sortedIndices),
      highlightedIndices: [i],
    }
    let j = i - 1
    yield {
      array: [...arr],
      message: `j = ${j}`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [6],
      activeRange: { start: 0, end: i - 1 },
      sortedIndices: Array.from(sortedIndices),
      highlightedIndices: [i],
    }

    // Yield state showing the element picked as 'key'
    yield {
      array: [...arr],
      highlightedIndices: [i], // Highlight the key element
      comparisonIndices: [...Array(i).keys()], // Highlight the sorted portion being checked against
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: i - 1 }, // Current sorted range
      message: `Pass ${i}: Selecting element ${key} at index ${i} to insert into sorted portion [0...${i - 1}].`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [7],
    }

    let comparedIndex = -1
    let firstComparisonMade = false
    if (j >= 0) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      firstComparisonMade = true
    }

    // Move elements of the sorted portion [0...i-1] that are greater/smaller than key
    // one position ahead of their current position
    while (j >= 0 && shouldInsertBefore(key, arr[j], direction)) {
      if (!firstComparisonMade) {
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
        currentPseudoCodeLine: [7],
      }

      arr[j + 1] = arr[j] // Shift element
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      yield {
        array: [...arr],
        message: `Shifted arr[j+1] = arr[j]`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [8],
        highlightedIndices: [j + 1],
        comparisonIndices: [i],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: i - 1 },
      }

      // Yield state after shift
      yield {
        array: [...arr],
        highlightedIndices: [j + 1], // Highlight the new position of the shifted element
        comparisonIndices: [i], // Still comparing against the key
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: i - 1 },
        message: `Shifted ${arr[j + 1]} from index ${j} to ${j + 1}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [8],
      }
      j = j - 1
      yield {
        array: [...arr],
        message: `Decremented j to ${j}`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [9],
        highlightedIndices: [j + 1],
        comparisonIndices: [i],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: i - 1 },
      }
      if (j >= 0) {
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
        firstComparisonMade = true
      }
    } // End of while loop
    yield {
      array: [...arr],
      message: `End of while loop for key ${key}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [10],
      highlightedIndices: [i],
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: i - 1 },
      comparisonIndices: j >= 0 ? [i, j] : [i],
    }

    if (comparedIndex !== -1 && j !== comparedIndex) {
      yield {
        array: [...arr],
        highlightedIndices: [i, j + 1],
        comparisonIndices: j >= 0 ? [i, j] : [i],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: i - 1 },
        message:
          j >= 0
            ? `Key ${key} should be inserted before ${arr[j]} at index ${j + 1}.`
            : `Key ${key} is the smallest/largest so far, inserting at index 0.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [7],
      }
    } else if (comparedIndex === -1) {
      yield {
        array: [...arr],
        highlightedIndices: [i, j],
        comparisonIndices: [i, j],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: i - 1 },
        message: `Key ${key} is already in correct position relative to ${arr[j]}. No shifts needed in this pass.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [7],
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
      currentPseudoCodeLine: [11],
    }
  } // End of for loop
  yield {
    array: [...arr],
    message: `End of outer for loop.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [12],
    sortedIndices: Array.from(sortedIndices),
  }

  // Final confirmation (all elements are sorted)
  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Insertion Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [14],
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
