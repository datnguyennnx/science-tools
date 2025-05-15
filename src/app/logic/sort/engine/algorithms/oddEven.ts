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
      currentPseudoCodeLine: 0, // oddEvenSort(array, n) {
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: 'Starting Odd-Even Sort.',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 0, // oddEvenSort(array, n) {
  }
  // isSorted = false is line 1
  yield {
    array: [...arr],
    message: 'isSorted initialized to false.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 1,
  }

  while (!isSorted) {
    yield {
      array: [...arr],
      message: 'Checking while condition: !isSorted.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 2, // while (!isSorted)
    }
    isSorted = true // Assume sorted until a swap is made
    yield {
      array: [...arr],
      message: 'Assuming array is sorted for this pass (isSorted = true).',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 3, // isSorted = true
    }

    // Perform Bubble sort on odd indexed element
    yield {
      array: [...arr],
      message: 'Odd pass: Comparing and swapping odd-indexed elements with their next element.',
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 4, // // Odd phase (comment line)
    }
    for (let i = 1; i <= n - 2; i = i + 2) {
      yield {
        array: [...arr],
        highlightedIndices: [i, i + 1],
        comparisonIndices: [i, i + 1],
        message: `Comparing elements at index ${i} (${arr[i]}) and ${i + 1} (${arr[i + 1]}).`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: 5, // for (i = 1; ...)
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
          currentPseudoCodeLine: 6, // if (array[i] > array[i + 1])
        }
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        yield {
          array: [...arr],
          highlightedIndices: [i, i + 1],
          message: `Swapped. isSorted will be set to false.`,
          currentStats: { ...liveStats },
          swappingIndices: [i, i + 1],
          currentPseudoCodeLine: 7, // swap(array[i], array[i + 1])
        }
        isSorted = false
        yield {
          array: [...arr],
          highlightedIndices: [i, i + 1],
          comparisonIndices: [],
          swappingIndices: [i, i + 1], // Show what was just swapped
          message: `Swapped. New values: ${arr[i]} (at ${i}) and ${arr[i + 1]} (at ${i + 1}). isSorted set to false.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 8, // isSorted = false
        }
      } else {
        // Yield if no swap, still on line 6 (if condition)
        yield {
          array: [...arr],
          highlightedIndices: [i, i + 1],
          comparisonIndices: [i, i + 1],
          message: `No swap needed for ${arr[i]} and ${arr[i + 1]}.`,
          currentStats: { ...liveStats },
          swappingIndices: null,
          currentPseudoCodeLine: 6, // if condition was false
        }
      }
      // Conceptually at line 9, closing brace of if
      yield {
        array: [...arr],
        message: `End of if block for odd phase, i=${i}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 9,
      }
    }
    // Conceptually at line 10, closing brace of odd phase for loop
    yield {
      array: [...arr],
      message: `End of odd phase loop.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 10,
    }

    // Perform Bubble sort on even indexed element
    yield {
      array: [...arr],
      message: 'Even pass: Comparing and swapping even-indexed elements with their next element.',
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 11, // // Even phase (comment line)
    }
    for (let i = 0; i <= n - 2; i = i + 2) {
      yield {
        array: [...arr],
        highlightedIndices: [i, i + 1],
        comparisonIndices: [i, i + 1],
        message: `Comparing elements at index ${i} (${arr[i]}) and ${i + 1} (${arr[i + 1]}).`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: 12, // for (i = 0; ...)
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
          currentPseudoCodeLine: 13, // if (array[i] > array[i + 1])
        }
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        yield {
          array: [...arr],
          highlightedIndices: [i, i + 1],
          message: `Swapped. isSorted will be set to false.`,
          currentStats: { ...liveStats },
          swappingIndices: [i, i + 1],
          currentPseudoCodeLine: 14, // swap(array[i], array[i + 1])
        }
        isSorted = false
        yield {
          array: [...arr],
          highlightedIndices: [i, i + 1],
          comparisonIndices: [],
          swappingIndices: [i, i + 1], // Show what was just swapped
          message: `Swapped. New values: ${arr[i]} (at ${i}) and ${arr[i + 1]} (at ${i + 1}). isSorted set to false.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 15, // isSorted = false
        }
      } else {
        // Yield if no swap, still on line 13 (if condition)
        yield {
          array: [...arr],
          highlightedIndices: [i, i + 1],
          comparisonIndices: [i, i + 1],
          message: `No swap needed for ${arr[i]} and ${arr[i + 1]}.`,
          currentStats: { ...liveStats },
          swappingIndices: null,
          currentPseudoCodeLine: 13, // if condition was false
        }
      }
      // Conceptually at line 16, closing brace of if
      yield {
        array: [...arr],
        message: `End of if block for even phase, i=${i}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 16,
      }
    }
    // Conceptually at line 17, closing brace of even phase for loop
    yield {
      array: [...arr],
      message: `End of even phase loop.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 17,
    }
    // After each full pair of odd/even passes, we can mark elements as sorted from ends if desired
    // For simplicity here, we will mark all sorted at the very end.
  }
  // Conceptually at line 18, closing brace of while loop
  yield {
    array: [...arr],
    message: `While loop finished (isSorted is true).`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 18,
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()], // All elements are now sorted
    message: 'Odd-Even Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 19, // Closing brace of function
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
