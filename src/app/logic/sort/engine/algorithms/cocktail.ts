'use client'

import { SortGenerator, SortStats } from '../types'

// Comparison function based on direction
const shouldSwapForward = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  // Forward pass: Bubble larger/smaller to the end
  return direction === 'asc' ? a > b : a < b
}

const shouldSwapBackward = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  // Backward pass: Bubble smaller/larger to the start
  // Note: The pseudo-code uses `array[i] > array[i+1]` for both passes,
  // assuming it implicitly handles ascending sort. Here, we adjust for direction.
  // For a backward pass aiming to move the smallest left (asc sort):
  // if array[i-1] > array[i], swap. (This is what `a > b` means if a=arr[i-1], b=arr[i])
  // The provided pseudo-code for backward pass: `if (array[i] > array[i+1])` with `i` decreasing.
  // This means it compares `array[curr]` with `array[curr+1]` when `curr` is `end-1` down to `start`.
  // So if `array[curr] > array[curr+1]`, swap. This is for ASCENDING.
  // If direction is DESC, we want `array[curr] < array[curr+1]` to swap.
  // Our `shouldSwapBackward` is called with `arr[i-1]` and `arr[i]`. So `a = arr[i-1]`, `b = arr[i]`.
  // If asc: we want to swap if `a > b`. So `a > b` is correct.
  // If desc: we want to swap if `a < b`. So `a < b` is correct.
  // The pseudo-code for the backward pass (`for (i = end - 1; i >= start; i--)` then `if (array[i] > array[i+1])`)
  // is a bit confusing. If `i` is the current element, and it's compared with `i+1`, that means
  // it's comparing an element with one to its right, even when moving left. This seems unusual.
  // A more standard backward pass compares `array[i-1]` and `array[i]` and swaps if `array[i-1]` is greater.
  // Given the current implementation uses `arr[i-1]` and `arr[i]`, let's map to that.
  // Pseudo line 18: `if (array[i] > array[i+1])` where `i` goes from `end-1` down to `start`.
  // This translates to comparing `arr[current_scan_index]` and `arr[current_scan_index + 1]`
  // Our code compares `arr[i-1]` and `arr[i]` when `i` goes from `end` down to `start+1`.
  // So, pseudo line 18 matches this comparison.
  return direction === 'asc' ? a > b : a < b
}

export const cocktailSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = new Set<number>()
  let swapped = true // Pseudo line 2
  let start = 0 // Pseudo line 3
  let end = n - 1 // Pseudo line 4

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Cocktail Shaker Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
  }

  if (n <= 1) {
    if (n === 1) sortedIndices.add(0)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1], // procedure, n = length
      swappingIndices: null,
      comparisonIndices: [],
      activeRange: { start: 0, end: n > 0 ? n - 1 : 0 },
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Cocktail Shaker Sort.',
    activeRange: { start, end },
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0, 2, 3, 4], // Covers lines up to while swapped
    swappingIndices: null,
    comparisonIndices: [],
  }

  let passCount = 0
  while (swapped) {
    // Pseudo line 5
    passCount++
    swapped = false // Pseudo line 6

    yield {
      array: [...arr],
      message: `Pass ${passCount} (Forward): Bubbling ${direction === 'asc' ? 'largest' : 'smallest'} from index ${start} to ${end}.`,
      activeRange: { start, end },
      sortedIndices: Array.from(sortedIndices),
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [5, 6, 8], // while swapped, swapped=false, for i = start...
      swappingIndices: null,
      comparisonIndices: [],
    }

    for (let i = start; i < end; i++) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      const val1 = arr[i]
      const val2 = arr[i + 1]
      let message = `Forward pass: Comparing ${val1} (A[${i}]) and ${val2} (A[${i + 1}]).`
      let swappedThisStep = false

      if (shouldSwapForward(arr[i], arr[i + 1], direction)) {
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swapped = true
        swappedThisStep = true
        message += ` Swapped. New: A[${i}]=${arr[i]}, A[${i + 1}]=${arr[i + 1]}.`
      } else {
        message += ` No swap.`
      }

      yield {
        array: [...arr],
        message: message,
        highlightedIndices: [i, i + 1],
        comparisonIndices: [i, i + 1],
        swappingIndices: swappedThisStep ? [i, i + 1] : null,
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start, end },
        currentStats: { ...liveStats },
        currentPseudoCodeLine: swappedThisStep ? [9, 10, 11] : [9], // if swapped, includes swap and set flag lines
      }
    }

    if (!swapped) {
      // Pseudo line 15
      // Mark all remaining as sorted
      for (let k = 0; k < n; ++k) sortedIndices.add(k) // Ensure all are marked if we exit early
      yield {
        array: [...arr],
        message: 'No swaps in forward pass. Array is sorted.',
        activeRange: { start: 0, end: n - 1 }, // Show full range as sorted
        sortedIndices: Array.from(sortedIndices),
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [15, 28], // if not swapped then break (and end while)
        swappingIndices: null,
        comparisonIndices: [],
      }
      break
    }

    sortedIndices.add(end) // Mark current end as sorted
    yield {
      array: [...arr],
      message: `Forward pass complete. Element ${arr[end]} (at index ${end}) is sorted.`,
      highlightedIndices: [end],
      activeRange: { start, end: end - 1 }, // Next active range shown
      sortedIndices: Array.from(sortedIndices),
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [13, 17], // end for (forward), end = end - 1
      swappingIndices: null,
      comparisonIndices: [],
    }
    end-- // Pseudo line 17

    // If start collapsed past end, array is sorted (e.g. n=2, after 1 forward pass, end becomes 0, start is 0. start >= end implies sorted)
    if (start > end) {
      swapped = false // Ensure loop terminates
      // All elements should be in sortedIndices by now. If not, add remaining.
      for (let k = 0; k < n; ++k) if (!sortedIndices.has(k)) sortedIndices.add(k)
      yield {
        array: [...arr],
        message: `Array fully sorted after forward pass completion (start=${start}, end=${end}).`,
        activeRange: { start: 0, end: n - 1 },
        sortedIndices: Array.from(sortedIndices),
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [17], // Context after end decremented
        swappingIndices: null,
        comparisonIndices: [],
      }
      break // Break main while loop
    }

    swapped = false // Pseudo line 18
    yield {
      array: [...arr],
      message: `Pass ${passCount} (Backward): Bubbling ${direction === 'asc' ? 'smallest' : 'largest'} from index ${end} to ${start}.`,
      activeRange: { start, end },
      sortedIndices: Array.from(sortedIndices),
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [18, 20], // swapped=false, for i = end -1 ...
      swappingIndices: null,
      comparisonIndices: [],
    }

    // Backward pass: `i` goes from `end` (new end) down to `start + 1`
    // Comparison is `arr[i-1]` with `arr[i]`
    for (let i = end; i > start; i--) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      const val1 = arr[i - 1]
      const val2 = arr[i]
      let message = `Backward pass: Comparing ${val1} (A[${i - 1}]) and ${val2} (A[${i}]).`
      let swappedThisStep = false

      if (shouldSwapBackward(arr[i - 1], arr[i], direction)) {
        ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swapped = true
        swappedThisStep = true
        message += ` Swapped. New: A[${i - 1}]=${arr[i - 1]}, A[${i}]=${arr[i]}.`
      } else {
        message += ` No swap.`
      }

      yield {
        array: [...arr],
        message: message,
        highlightedIndices: [i - 1, i],
        comparisonIndices: [i - 1, i],
        swappingIndices: swappedThisStep ? [i - 1, i] : null,
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start, end },
        currentStats: { ...liveStats },
        currentPseudoCodeLine: swappedThisStep ? [21, 22, 23] : [21], // if swapped, includes swap and set flag lines
      }
    }

    sortedIndices.add(start)
    yield {
      array: [...arr],
      message: `Backward pass complete. Element ${arr[start]} (at index ${start}) is sorted.`,
      highlightedIndices: [start],
      activeRange: { start: start + 1, end }, // Next active range
      sortedIndices: Array.from(sortedIndices),
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [25, 27], // end for (backward), start = start + 1
      swappingIndices: null,
      comparisonIndices: [],
    }
    start++ // Pseudo line 27

    if (!swapped && passCount > 0) {
      // Check if no swaps in the *entire* last full pass (forward + backward)
      // This condition is actually caught by the while(swapped) at the beginning of the next iteration
      // or the break in the forward pass. If we reach here and swapped is false from backward pass,
      // the while loop condition `while(swapped)` will terminate it.
      // The initial `if (!swapped)` after forward pass is the primary early exit.
    }
  } // Pseudo line 28: end while

  // Ensure all elements are marked as sorted if loop terminates early or completes
  for (let k = 0; k < n; ++k) {
    if (!sortedIndices.has(k)) sortedIndices.add(k) // Ensure all are marked
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Cocktail Shaker Sort Complete!',
    activeRange: { start: 0, end: n - 1 },
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [29], // end procedure
    swappingIndices: null,
    comparisonIndices: [],
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
