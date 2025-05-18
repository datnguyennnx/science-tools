'use client'

import { SortGenerator, SortStats } from '../types'

// Comparison function based on direction
const shouldSwap = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  // Check if 'a' should come AFTER 'b' based on the direction
  return direction === 'asc' ? a > b : a < b
}

// Shrink factor for the gap
const SHRINK_FACTOR = 1.3

export const combSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  let gap = n
  let swapped = true // Initialize swapped to true to enter the loop

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Comb Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
  }

  const sortedIndices = new Set<number>() // Keep track of sorted indices, primarily for final state

  if (n <= 1) {
    if (n === 1 && !sortedIndices.has(0)) sortedIndices.add(0)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1], // procedure, n = length (then check if n <=1 implicitly)
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Comb Sort.',
    currentStats: { ...liveStats },
    // PT Lines: 0 (procedure), 1 (n=len), 2 (gap=n), 3 (shrinkFactor), 4 (swapped=true)
    currentPseudoCodeLine: [0, 1, 2, 3, 4],
  }

  let passNumber = 0
  // Main loop continues until the gap is 1 and no swaps occurred in the last pass
  while (gap > 1 || swapped) {
    passNumber++

    // Calculate the next gap
    // const oldGap = gap; // Not strictly needed for message if new message format is used
    gap = Math.floor(gap / SHRINK_FACTOR)
    if (gap < 1) {
      gap = 1
    }
    swapped = false // Reset swapped for the new pass

    yield {
      array: [...arr],
      message: `Pass ${passNumber}: Gap set to ${gap}. Preparing for comparisons.`,
      currentStats: { ...liveStats },
      // PT Lines: 6 (while), 7 (gap calc), 8,9,10 (gap < 1 check), 12 (swapped = false), 13 (for loop upcoming)
      currentPseudoCodeLine: [6, 7, 8, 9, 10, 12, 13],
    }

    // Compare elements with the current gap
    for (let i = 0; i <= n - 1 - gap; i++) {
      const j = i + gap
      liveStats.comparisons = (liveStats.comparisons || 0) + 1

      const val1 = arr[i] // Value before potential swap
      const val2 = arr[j] // Value before potential swap

      if (shouldSwap(val1, val2, direction)) {
        ;[arr[i], arr[j]] = [val2, val1] // Use pre-swap values for clarity in assignment
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swapped = true

        yield {
          array: [...arr],
          highlightedIndices: [i, j],
          comparisonIndices: [i, j],
          swappingIndices: [i, j],
          activeRange: { start: i, end: j }, // Range of comparison
          message: `Pass ${passNumber}, Gap ${gap}: Compared A[${i}] (${val1}) and A[${j}] (${val2}). Swapped.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [14, 15, 16], // PT Lines: if list[i] > list[i+gap], swap, swapped = true
        }
      } else {
        // Yield for non-swap comparison for better step-by-step visualization
        yield {
          array: [...arr],
          highlightedIndices: [i, j],
          comparisonIndices: [i, j],
          swappingIndices: null,
          activeRange: { start: i, end: j },
          message: `Pass ${passNumber}, Gap ${gap}: Compared A[${i}] (${val1}) and A[${j}] (${val2}). No swap.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [14, 17], // PT Lines: if list[i] > list[i+gap] (condition false), end if
        }
      }
    } // End of for loop for comparisons

    yield {
      array: [...arr],
      message: `Pass ${passNumber} with gap ${gap} complete. Swapped this pass: ${swapped}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [18], // PT Line: end for (inner loop)
    }

    // Optimization: if gap is 1 and no swaps occurred in the last pass, the array is sorted
    if (gap === 1 && !swapped) {
      // All elements are now sorted
      for (let k = 0; k < n; ++k) sortedIndices.add(k)
      yield {
        array: [...arr],
        sortedIndices: Array.from(sortedIndices),
        message: 'Comb Sort optimization: Gap is 1 and no swaps in this pass. Array is sorted.',
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [21, 22, 23], // PT Lines: if gap == 1 and swapped == false, break, end if
      }
      break // Exit while loop
    }
  } // End of while loop (gap > 1 || swapped)

  // Ensure all indices are marked sorted if loop finished without early exit
  if (sortedIndices.size < n) {
    for (let i = 0; i < n; ++i) sortedIndices.add(i)
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Comb Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [24, 26, 27], // PT Lines: end while, return list, end procedure
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
