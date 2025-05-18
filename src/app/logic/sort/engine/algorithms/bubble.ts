'use client'

import { SortGenerator, SortStats } from '../types'

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
      currentPseudoCodeLine: [0], // or a specific line for empty/sorted case
      swappingIndices: null,
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Bubble Sort',
    activeRange: { start: 0, end: n - 1 },
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0], // function bubbleSort(array, n) {
    swappingIndices: null,
  }

  // Outer loop for passes
  for (let i = 0; i < n - 1; i++) {
    yield {
      array: [...arr],
      message: `Pass ${i + 1} (comparing elements from index 0 to ${n - 2 - i})`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [2], // for i = 0 to n - 2
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: n - 1 - i },
      swappingIndices: null,
    }
    swapped = false

    const currentPassEnd = n - 1 - i
    for (let j = 0; j < currentPassEnd; j++) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      const val1 = arr[j]
      const val2 = arr[j + 1]
      let message = `Comparing ${val1} (A[${j}]) and ${val2} (A[${j + 1}]).`
      let swappedThisStep = false

      if (compare(arr[j], arr[j + 1], direction)) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swapped = true
        swappedThisStep = true
        message += ` Swapped. New: A[${j}]=${arr[j]}, A[${j + 1}]=${arr[j + 1]}.`
      } else {
        message += ` No swap.`
      }

      yield {
        array: [...arr], // Reflects state after potential swap
        message: message,
        highlightedIndices: [j, j + 1],
        comparisonIndices: [j, j + 1],
        swappingIndices: swappedThisStep ? [j, j + 1] : null,
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: currentPassEnd },
        currentStats: { ...liveStats },
        currentPseudoCodeLine: swappedThisStep ? [4, 5, 6, 7] : [4, 5], // if swapped, includes swap and set flag lines
      }
    }

    sortedIndices.add(currentPassEnd)
    yield {
      array: [...arr],
      message: `End of pass ${i + 1}. Element ${arr[currentPassEnd]} at index ${currentPassEnd} is now sorted.`,
      highlightedIndices: [currentPassEnd], // Highlight the newly sorted element
      comparisonIndices: [],
      swappingIndices: null,
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: currentPassEnd - 1 }, // Active range shrinks
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [9], // end for (inner loop)
    }

    // If no swaps occurred in a pass, the array is sorted
    if (!swapped) {
      // Mark all elements as sorted because no swaps in a full pass means sorted.
      for (let k = 0; k < n; k++) {
        sortedIndices.add(k)
      }
      yield {
        array: [...arr],
        message: 'No swaps in this pass. Array is now sorted (early exit).',
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [10, 11, 12], // if not swapped then break (and completion)
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: -1 }, // No active range left
        swappingIndices: null,
        comparisonIndices: [],
      }
      break // Exit outer loop
    }
  } // End outer loop (i)

  // Ensure all elements are marked sorted if loop finishes naturally or breaks
  // This handles the case where the loop finishes without the !swapped break,
  // or if the break happened, it redundantly ensures all are marked.
  if (sortedIndices.size < n) {
    for (let k = 0; k < n; k++) {
      if (!sortedIndices.has(k)) sortedIndices.add(k)
    }
  }

  // Final sorted state confirmation
  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()], // All indices are sorted
    message: 'Bubble Sort Complete!',
    swappingIndices: null,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [14],
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
