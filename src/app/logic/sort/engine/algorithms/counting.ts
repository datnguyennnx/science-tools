'use client'

import { SortGenerator } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer' // Import SortStats

// Note: Counting Sort assumes non-negative integer inputs.
// It's not a general-purpose comparison sort.
// Visualization will use tempSubArray to show the counts.

export const countingSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc' // Direction affects output placement
) {
  const arr = [...initialArray]
  const n = arr.length

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Counting Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
    swaps: 0, // Counting sort doesn't typically swap
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: n === 1 ? [0] : [],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 0, // Or a general "pre-condition met" line
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  // 1. Find the maximum element to determine the range
  let max = arr[0] // Assuming arr[0] exists due to n > 1 check
  // No explicit comparison stat for initializing max, but loops below will count.
  yield {
    array: [...arr],
    highlightedIndices: [0],
    message: `Starting Counting Sort. Finding maximum value. Current max: ${max}`,
    mainArrayLabel: 'Input Array',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 0, // General start
  }
  for (let i = 1; i < n; i++) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    yield {
      array: [...arr],
      highlightedIndices: [i],
      message: `Checking index ${i} (value ${arr[i]}). Current max: ${max}`,
      mainArrayLabel: 'Input Array',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 0, // Still part of finding max, related to input array
    }
    if (arr[i] > max) {
      max = arr[i]
      yield {
        array: [...arr],
        highlightedIndices: [i],
        message: `New maximum found: ${max} at index ${i}`,
        mainArrayLabel: 'Input Array',
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 0, // Still part of finding max
      }
    }
  }

  const countSize = max + 1
  const count: number[] = new Array(countSize).fill(0)
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + countSize // For .fill(0)

  yield {
    array: [...arr],
    highlightedIndices: [],
    mainArrayLabel: 'Input Array',
    auxiliaryStructures: [
      {
        id: 'counts',
        title: 'Count Array (Initialized)',
        data: [...count],
      },
    ],
    message: `Initialized count array of size ${countSize}. Max value is ${max}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 1, // count = array of (max - min + 1) zeros
  }

  // 2. Count occurrences of each element
  // Loop corresponds to "for each number in array:"
  for (let i = 0; i < n; i++) {
    // Highlight line 3 before entering the loop or at the first step of the loop
    yield {
      array: [...arr],
      highlightedIndices: [i],
      mainArrayLabel: 'Input Array',
      auxiliaryStructures: [{ id: 'counts', title: 'Count Array (Counting)', data: [...count] }],
      message: `About to count element ${arr[i]} at index ${i}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 3, // for each number in array:
    }

    count[arr[i]]++
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    yield {
      array: [...arr],
      highlightedIndices: [i], // Highlight the element being counted
      mainArrayLabel: 'Input Array',
      auxiliaryStructures: [
        {
          id: 'counts',
          title: 'Count Array (Counting)',
          data: [...count],
        },
      ],
      message: `Counting element ${arr[i]} at index ${i}. Incrementing count at index ${arr[i]}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 4, // count[number - min]++
    }
  }

  // 3. Modify count array to store cumulative counts
  yield {
    array: [...arr],
    highlightedIndices: [],
    mainArrayLabel: 'Input Array',
    auxiliaryStructures: [
      {
        id: 'counts',
        title: 'Count Array (Before Cumulative)',
        data: [...count],
      },
    ],
    message: 'Calculating cumulative counts.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 5, // // Calculate cumulative counts (comment line)
  }
  // Loop corresponds to "for i from 1 to count.length - 1:"
  for (let i = 1; i < countSize; i++) {
    yield {
      array: [...arr],
      highlightedIndices: [],
      comparisonIndices: [i - 1, i],
      mainArrayLabel: 'Input Array',
      auxiliaryStructures: [{ id: 'counts', title: 'Count Array (Cumulative)', data: [...count] }],
      message: `About to update cumulative count at index ${i}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 6, // for i from 1 to count.length - 1:
    }
    count[i] += count[i - 1]
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    yield {
      array: [...arr],
      highlightedIndices: [], // No specific array highlight
      comparisonIndices: [i - 1, i], // Show indices used in cumulative sum
      mainArrayLabel: 'Input Array',
      auxiliaryStructures: [
        {
          id: 'counts',
          title: 'Count Array (Cumulative)',
          data: [...count],
        },
      ],
      message: `Updating cumulative count at index ${i}. New value: ${count[i]}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 7, // count[i] = count[i] + count[i - 1]
    }
  }

  // 4. Build the output array based on counts
  const output: number[] = new Array(n)
  // liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n; // For initializing output array, though it's often not counted

  yield {
    array: new Array(n).fill(NaN), // Show empty output array using NaN as placeholder
    mainArrayLabel: 'Output Array (Building)',
    highlightedIndices: [],
    auxiliaryStructures: [
      {
        id: 'counts',
        title: 'Count Array (Final Cumulative)',
        data: [...count],
      },
    ],
    message: 'Building sorted output array using cumulative counts.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 9, // output = array of same size as input
  }

  // Iterate backwards for stability (though stability is less critical if only numbers)
  // Loop corresponds to "for i from array.length - 1 down to 0:"
  for (let i = n - 1; i >= 0; i--) {
    const value = arr[i]
    let outputIndex: number

    // The lookup count[value] is an operation.
    // The calculation count[value] - 1 is an operation.
    // These are not direct comparisons between elements of `arr`.
    yield {
      array: [...output].map(v => (v === undefined ? NaN : v)),
      mainArrayLabel: 'Output Array (Placing)',
      highlightedIndices: [],
      comparisonIndices: [i],
      auxiliaryStructures: [
        { id: 'counts', title: 'Count Array (Decrementing)', data: [...count] },
      ],
      message: `Processing element ${value} from original array at index ${i}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 10, // for i from array.length - 1 down to 0:
    }

    if (direction === 'asc') {
      outputIndex = count[value] - 1
      output[outputIndex] = value
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      // Yield after placing the element
      yield {
        array: [...output].map(v => (v === undefined ? NaN : v)),
        mainArrayLabel: 'Output Array (Placing)',
        highlightedIndices: [outputIndex],
        comparisonIndices: [i],
        auxiliaryStructures: [
          { id: 'counts', title: 'Count Array (Decrementing)', data: [...count] },
        ],
        message: `Placed element ${value} into output index ${outputIndex}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 11, // output[count[array[i] - min] - 1] = array[i]
      }
      count[value]--
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    } else {
      // For descending, standard counting sort is stable; we sort ascending then reverse.
      // So this part of logic is essentially for ascending placement.
      outputIndex = count[value] - 1
      output[outputIndex] = value
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      // Yield after placing the element
      yield {
        array: [...output].map(v => (v === undefined ? NaN : v)),
        mainArrayLabel: 'Output Array (Placing)',
        highlightedIndices: [outputIndex],
        comparisonIndices: [i],
        auxiliaryStructures: [
          { id: 'counts', title: 'Count Array (Decrementing)', data: [...count] },
        ],
        message: `Placed element ${value} into output index ${outputIndex}. (Descending logic follows ascending placement then reverse)`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 11, // output[count[array[i] - min] - 1] = array[i]
      }
      count[value]--
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    }

    // Yield state showing placement in output array and decrementing count
    yield {
      array: [...output].map(v => (v === undefined ? NaN : v)), // Show output progress (use NaN for undefined)
      mainArrayLabel: 'Output Array (Placing)',
      highlightedIndices: [outputIndex], // Highlight where the element was placed
      comparisonIndices: [i], // Highlight element from original array being placed
      auxiliaryStructures: [
        {
          id: 'counts',
          title: 'Count Array (Decrementing)',
          data: [...count],
        },
      ],
      message: `Placing element ${value} (from original index ${i}) into output index ${outputIndex}. Decrementing count for ${value}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 12, // count[array[i] - min]--
    }
  }

  // Handle descending order by reversing the ascending output
  if (direction === 'desc') {
    output.reverse() // In-place reverse
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n // Approximate n writes for reverse
    yield {
      array: [...output],
      mainArrayLabel: 'Output Array (Reversed)',
      highlightedIndices: [],
      message: 'Reversing array for descending order.',
      currentStats: { ...liveStats },
      // No specific pseudo code line for reverse, maybe related to return
      currentPseudoCodeLine: 13,
    }
  }

  // Final sorted state confirmation
  yield {
    array: [...output],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()], // All indices are sorted conceptually
    message: 'Counting Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 13, // return output
  }

  return { finalArray: output, stats: liveStats as SortStats }
}
