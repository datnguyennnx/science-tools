'use client'

import { SortGenerator, SortStep, SortStats } from '../types'

// Helper function to get digit at a specific place (1s, 10s, 100s, etc.)
const getDigit = (num: number, place: number): number => Math.floor(Math.abs(num) / place) % 10

// Helper function to find the maximum absolute value in an array
const findMaxAbs = (arr: number[], liveStats: Partial<SortStats>): number => {
  let maxAbs = 0
  if (arr.length > 0) maxAbs = Math.abs(arr[0]) // Initialize with the first element's abs value
  // Start loop from 0 or 1 depending on initialization. If arr[0] used, start i=1.
  // For simplicity, iterate all and update if greater.
  for (const num of arr) {
    // Iterating n times
    const absNum = Math.abs(num)
    liveStats.comparisons = (liveStats.comparisons || 0) + 1 // Comparison with current maxAbs
    if (absNum > maxAbs) {
      maxAbs = absNum
    }
  }
  return maxAbs
}

// Stable Counting Sort adapted for a specific digit place
const countingSortByDigitGenerator = function* (
  arr: number[],
  place: number,
  _direction: 'asc' | 'desc', // Direction for Radix LSD is implicit in output construction order
  originalIndices: number[], // Keep track of original positions for visualization
  liveStats: Partial<SortStats> // Accept liveStats
): Generator<SortStep, { sortedArr: number[]; sortedOriginalIndices: number[] }, void> {
  const n = arr.length
  const output = new Array(n)
  const outputOriginalIndices = new Array(n)
  const count = new Array(10).fill(0) // Digits 0-9
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 10 // For .fill(0) on count array
  // Initializing output and outputOriginalIndices is also aux writes if we are strict.
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + n + n

  // Store count of occurrences in count[]
  yield {
    array: [...arr],
    mainArrayLabel: `Input for Place ${place}`,
    auxiliaryStructures: [
      {
        id: 'digitCounts',
        title: `Digit Counts (Place ${place}, Initial)`,
        data: [...count],
      },
    ],
    message: `Counting Sort (Radix): Counting digit at place ${place}. Initial counts.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 11, // count = new Array(10).fill(0)
  }
  for (let i = 0; i < n; i++) {
    const digit = getDigit(arr[i], place)
    yield {
      array: [...arr],
      mainArrayLabel: `Input for Place ${place}`,
      highlightedIndices: [originalIndices[i]],
      message: `Processing element ${arr[i]} (original index ${originalIndices[i]}), getting digit.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 13, // digit = getDigit(array[i], place)
    }
    count[digit]++
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // Write to count array
    yield {
      array: [...arr],
      mainArrayLabel: `Input for Place ${place}`,
      highlightedIndices: [originalIndices[i]],
      auxiliaryStructures: [
        {
          id: 'digitCounts',
          title: `Digit Counts (Place ${place}, Counting)`,
          data: [...count],
        },
      ],
      message: `Counting digit ${digit} for number ${arr[i]} (original index ${originalIndices[i]}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 14, // count[digit]++
    }
  }
  // End of loop for counting digits, pseudo line 15
  yield {
    array: [...arr],
    mainArrayLabel: `Input for Place ${place}`,
    auxiliaryStructures: [
      {
        id: 'digitCounts',
        title: `Digit Counts (Place ${place}, After Counting)`,
        data: [...count],
      },
    ],
    message: `Finished counting digits for place ${place}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 15,
  }

  // Change count[i] so that count[i] now contains actual
  // position of this digit in output[]
  yield {
    array: [...arr],
    mainArrayLabel: `Input for Place ${place}`,
    auxiliaryStructures: [
      {
        id: 'digitCounts',
        title: `Digit Counts (Place ${place}, Before Cumulative)`,
        data: [...count],
      },
    ],
    message: `Calculating cumulative counts for digit place ${place}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 16, // for i from 1 to 9
  }
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1]
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // Write to count array
    yield {
      array: [...arr],
      mainArrayLabel: `Input for Place ${place}`,
      comparisonIndices: [i - 1, i], // Indices of digits being summed
      auxiliaryStructures: [
        {
          id: 'digitCounts',
          title: `Digit Counts (Place ${place}, Cumulative)`,
          data: [...count],
        },
      ],
      message: `Cumulative count for digit <= ${i} is ${count[i]}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 17, // count[i] += count[i - 1]
    }
  }
  // End of loop for cumulative counts, pseudo line 18
  yield {
    array: [...arr],
    mainArrayLabel: `Input for Place ${place}`,
    auxiliaryStructures: [
      {
        id: 'digitCounts',
        title: `Digit Counts (Place ${place}, Cumulative Complete)`,
        data: [...count],
      },
    ],
    message: `Finished calculating cumulative counts for place ${place}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 18,
  }

  // Build the output array
  yield {
    array: new Array(n).fill(NaN), // Show empty output for this pass
    mainArrayLabel: `Output for Place ${place} (Building)`,
    auxiliaryStructures: [
      {
        id: 'digitCounts',
        title: `Digit Counts (Place ${place}, Final Cumulative)`,
        data: [...count],
      },
    ],
    message: `Building output array for digit place ${place}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 10, // output = new Array(n) (conceptually, before filling)
  }
  for (let i = n - 1; i >= 0; i--) {
    const value = arr[i]
    const digit = getDigit(value, place)
    yield {
      array: [...output].map(v => (v === undefined ? NaN : v)),
      mainArrayLabel: `Output for Place ${place} (Processing)`,
      highlightedIndices: [originalIndices[i]], // Original index of current item
      message: `Processing item ${arr[i]} (original index ${originalIndices[i]}), digit ${digit}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 20, // digit = getDigit(array[i], place) (in build loop)
    }
    const outputIndex = count[digit] - 1

    if (outputIndex < 0 || outputIndex >= n) {
      console.error(
        `Invalid outputIndex ${outputIndex} for digit ${digit}, value ${value}, count[digit] ${count[digit]}`
      )
      continue
    }

    output[outputIndex] = value
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // Write to output temp array
    outputOriginalIndices[outputIndex] = originalIndices[i] // Maintain original index mapping
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // Write to outputOriginalIndices temp array
    count[digit]--
    yield {
      array: [...output].map(v => (v === undefined ? NaN : v)),
      mainArrayLabel: `Output for Place ${place} (Decrement Count)`,
      highlightedIndices: [outputIndex],
      auxiliaryStructures: [
        {
          id: 'digitCounts',
          title: `Digit Counts (Place ${place}, Decremented)`,
          data: [...count],
        },
      ],
      message: `Decremented count for digit ${digit}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 22, // count[digit]--
    }
  }
  // End of loop for building output, pseudo line 23
  yield {
    array: [...output].map(v => (v === undefined ? NaN : v)),
    mainArrayLabel: `Output for Place ${place} (Built)`,
    auxiliaryStructures: [
      {
        id: 'digitCounts',
        title: `Digit Counts (Place ${place}, After Build)`,
        data: [...count],
      },
    ],
    message: `Finished building output array for place ${place}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 23,
  }

  // Return the sorted array and indices for this digit
  // The actual copy to arr in RadixSortGenerator will be line 25
  return { sortedArr: output, sortedOriginalIndices: outputOriginalIndices } // conceptually end of countingSortByDigit, line 27
}

// Main Radix Sort generator function (LSD)
export const radixSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc' // Note: Radix usually sorts asc, then reverse for desc
) {
  let arr = [...initialArray]
  const n = arr.length
  let originalIndices = arr.map((_, index) => index)

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Radix Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
    swaps: 0, // Radix sort doesn't swap
  }
  // arr.map for originalIndices is n aux reads and n aux writes if we are super strict.
  // For now, not counting this as it's part of setup for visualization tracking.

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: n === 1 ? [0] : [],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 0, // radixSort(array)
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  const maxAbs = findMaxAbs(arr, liveStats) // Pass liveStats to findMaxAbs
  yield {
    array: [...arr],
    mainArrayLabel: 'Initial Array',
    message: `Found max absolute value: ${maxAbs}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 1, // max = findMaxAbsolute(array)
  }

  yield {
    array: [...arr],
    mainArrayLabel: 'Initial Array',
    message: `Starting Radix Sort (LSD). Max absolute value: ${maxAbs}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 0, // radixSort(array)
  }

  let place = 1
  yield {
    array: [...arr],
    message: `Initializing place to ${place}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 2, // place = 1
  }
  while (maxAbs / place >= 1) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1 // Comparison for the while loop condition
    yield {
      array: [...arr],
      mainArrayLabel: `Array Before Place ${place} Sort`,
      message: `--- Starting pass for digit place ${place} ---`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 3, // while (max / place >= 1)
    }

    // Each call to countingSortByDigitGenerator will modify a copy (arr) and return it.
    // The writes within countingSortByDigitGenerator to its internal 'output' array are auxiliary.
    // The assignment arr = sortedArr is effectively copying n elements, counting as main array writes.
    const { sortedArr, sortedOriginalIndices } = yield* countingSortByDigitGenerator(
      arr, // Pass current state of arr
      place,
      direction,
      originalIndices,
      liveStats // Pass liveStats down
    )
    // When sortedArr is assigned back to arr, this constitutes main array writes if we consider arr the main array.
    // Or, if arr is itself a temporary array for the generator, these are still effectively writes to the conceptual main array.
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n // For copying sortedArr back to arr
    arr = sortedArr
    originalIndices = sortedOriginalIndices // Update original indices mapping

    yield {
      array: [...arr],
      mainArrayLabel: `Array After Place ${place} Sort`,
      message: `--- Completed pass for digit place ${place}. Array state after pass ---`,
      currentStats: { ...liveStats },
      // This yield represents the state after countingSortByDigit (line 4) AND array[i]=output[i] (line 25 from helper)
      currentPseudoCodeLine: 4, // countingSortByDigit completed for this place
    }

    place *= 10
    yield {
      array: [...arr],
      message: `Updating place to ${place}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 5, // place *= 10
    }
  }
  // End of while loop, pseudo line 6
  yield {
    array: [...arr],
    message: 'Finished all passes for Radix Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 6,
  }

  if (direction === 'desc') {
    arr.reverse() // In-place reverse
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n // Approximate n writes for reverse
    yield {
      array: [...arr],
      mainArrayLabel: 'Array (Reversed for Descending)',
      message: 'Reversing array for descending order.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 7, // End of radixSort function
    }
  }

  yield {
    array: [...arr],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()], // Array is now fully sorted
    message: 'Radix Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 7, // End of radixSort function
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
