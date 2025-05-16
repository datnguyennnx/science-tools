'use client'

import { SortGenerator, SortStats, AuxiliaryStructure } from '../types'

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

  const countAuxId = 'counting-sort-counts'
  const countDisplaySlot = 'counting-sort-main-slot'
  let countAuxStructure: AuxiliaryStructure = {
    id: countAuxId,
    title: 'Count Array (Initial)',
    data: [],
    displaySlot: countDisplaySlot,
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: n === 1 ? [0] : [],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 0, // Or a general "pre-condition met" line
      auxiliaryStructures: [countAuxStructure], // Ensure even empty state has it
    }
    return {
      finalArray: arr,
      stats: liveStats as SortStats,
      finalAuxiliaryStructures: [countAuxStructure],
    }
  }

  // 1. Find the maximum element to determine the range
  let max = arr[0] // Assuming arr[0] exists due to n > 1 check
  // No explicit comparison stat for initializing max, but loops below will count.
  countAuxStructure.title = 'Count Array (Finding Max)'
  yield {
    array: [...arr],
    highlightedIndices: [0],
    message: `Starting Counting Sort. Finding maximum value. Current max: ${max}`,
    mainArrayLabel: 'Input Array',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 0, // General start
    auxiliaryStructures: [countAuxStructure],
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
      auxiliaryStructures: [countAuxStructure],
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
        auxiliaryStructures: [countAuxStructure],
      }
    }
  }

  const countSize = max + 1
  const count: number[] = new Array(countSize).fill(0)
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + countSize // For .fill(0)

  countAuxStructure = {
    id: countAuxId,
    title: 'Count Array (Initialized)',
    data: [...count],
    displaySlot: countDisplaySlot,
  }
  yield {
    array: [...arr],
    highlightedIndices: [],
    mainArrayLabel: 'Input Array',
    auxiliaryStructures: [countAuxStructure],
    message: `Initialized count array of size ${countSize}. Max value is ${max}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 1, // count = array of (max - min + 1) zeros
  }

  // 2. Count occurrences of each element
  // Loop corresponds to "for each number in array:"
  for (let i = 0; i < n; i++) {
    // Highlight line 3 before entering the loop or at the first step of the loop
    countAuxStructure.title = 'Count Array (Counting)'
    countAuxStructure.data = [...count] // Show data *before* update for this step
    yield {
      array: [...arr],
      highlightedIndices: [i],
      mainArrayLabel: 'Input Array',
      auxiliaryStructures: [countAuxStructure],
      message: `About to count element ${arr[i]} at index ${i}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 3, // for each number in array:
    }

    count[arr[i]]++
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    countAuxStructure.data = [...count] // Show data *after* update
    yield {
      array: [...arr],
      highlightedIndices: [i], // Highlight the element being counted
      mainArrayLabel: 'Input Array',
      auxiliaryStructures: [countAuxStructure],
      message: `Counting element ${arr[i]} at index ${i}. Incrementing count at index ${arr[i]}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 4, // count[number - min]++
    }
  }

  // 3. Modify count array to store cumulative counts
  countAuxStructure.title = 'Count Array (Before Cumulative)'
  countAuxStructure.data = [...count]
  yield {
    array: [...arr],
    highlightedIndices: [],
    mainArrayLabel: 'Input Array',
    auxiliaryStructures: [countAuxStructure],
    message: 'Calculating cumulative counts.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 5, // // Calculate cumulative counts (comment line)
  }
  // Loop corresponds to "for i from 1 to count.length - 1:"
  for (let i = 1; i < countSize; i++) {
    countAuxStructure.title = 'Count Array (Cumulative)'
    countAuxStructure.data = [...count] // Show data *before* update
    yield {
      array: [...arr],
      highlightedIndices: [],
      comparisonIndices: [i - 1, i],
      mainArrayLabel: 'Input Array',
      auxiliaryStructures: [countAuxStructure],
      message: `About to update cumulative count at index ${i}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 6, // for i from 1 to count.length - 1:
    }
    count[i] += count[i - 1]
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    countAuxStructure.data = [...count] // Show data *after* update
    yield {
      array: [...arr],
      highlightedIndices: [], // No specific array highlight
      comparisonIndices: [i - 1, i], // Show indices used in cumulative sum
      mainArrayLabel: 'Input Array',
      auxiliaryStructures: [countAuxStructure],
      message: `Updating cumulative count at index ${i}. New value: ${count[i]}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 7, // count[i] = count[i] + count[i - 1]
    }
  }

  // 4. Build the output array based on counts
  const output: number[] = new Array(n)
  // liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n; // For initializing output array, though it's often not counted

  countAuxStructure.title = 'Count Array (Final Cumulative)'
  countAuxStructure.data = [...count]
  yield {
    array: new Array(n).fill(NaN), // Show empty output array using NaN as placeholder
    mainArrayLabel: 'Output Array (Building)',
    highlightedIndices: [],
    auxiliaryStructures: [countAuxStructure],
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
    countAuxStructure.title = 'Count Array (Decrementing)'
    countAuxStructure.data = [...count] // Show data *before* decrement
    yield {
      array: [...output].map(v => (v === undefined ? NaN : v)),
      mainArrayLabel: 'Output Array (Placing)',
      highlightedIndices: [],
      comparisonIndices: [i],
      auxiliaryStructures: [countAuxStructure],
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
        auxiliaryStructures: [countAuxStructure], // Still shows count *before* decrement for this specific element's placement logic
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
        auxiliaryStructures: [countAuxStructure], // Still shows count *before* decrement
        message: `Placed element ${value} into output index ${outputIndex}. (Descending logic follows ascending placement then reverse)`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 11, // output[count[array[i] - min] - 1] = array[i]
      }
      count[value]--
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    }

    // Yield state showing placement in output array and decrementing count
    countAuxStructure.data = [...count] // Now show count *after* decrement
    yield {
      array: [...output].map(v => (v === undefined ? NaN : v)), // Show output progress (use NaN for undefined)
      mainArrayLabel: 'Output Array (Placing)',
      highlightedIndices: [outputIndex], // Highlight where the element was placed
      comparisonIndices: [i], // Highlight element from original array being placed
      auxiliaryStructures: [countAuxStructure],
      message: `Placing element ${value} (from original index ${i}) into output index ${outputIndex}. Decremented count for ${value}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 12, // count[array[i] - min]--
    }
  }

  // Handle descending order by reversing the ascending output
  if (direction === 'desc') {
    output.reverse() // In-place reverse
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n // Approximate n writes for reverse
    countAuxStructure.title = 'Count Array (Final State After Decrements)' // Title remains relevant
    yield {
      array: [...output],
      mainArrayLabel: 'Output Array (Reversed)',
      highlightedIndices: [],
      message: 'Reversing array for descending order.',
      currentStats: { ...liveStats },
      // No specific pseudo code line for reverse, maybe related to return
      currentPseudoCodeLine: 13,
      auxiliaryStructures: [countAuxStructure],
    }
  }

  // Final sorted state confirmation
  countAuxStructure.title = 'Count Array (Final State After Sort)'
  yield {
    array: [...output],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()], // All indices are sorted conceptually
    message: 'Counting Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 13, // return output
    auxiliaryStructures: [countAuxStructure],
  }

  return {
    finalArray: output,
    stats: liveStats as SortStats,
    finalAuxiliaryStructures: [countAuxStructure],
  }
}
