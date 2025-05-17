'use client'

import { SortGenerator, SortStep, SortStats } from '../types'

const shouldBeBefore = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  return direction === 'asc' ? a < b : a > b
}

// Partition function using Lomuto partition scheme (pivot is the last element)
const partitionGenerator = function* (
  arr: number[],
  low: number,
  high: number,
  direction: 'asc' | 'desc',
  sortedIndices: Set<number>,
  liveStats: Partial<SortStats>
): Generator<SortStep, number, void> {
  yield {
    // Entering partition function
    array: [...arr],
    message: `partition(arr, ${low}, ${high})`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [8],
    activeRange: { start: low, end: high },
  }
  const pivot = arr[high]
  yield {
    // pivot = array[high]
    array: [...arr],
    highlightedIndices: [high],
    comparisonIndices: [...Array(high - low + 1).keys()].map(k => low + k),
    sortedIndices: Array.from(sortedIndices),
    activeRange: { start: low, end: high },
    message: `Pivot is ${pivot} at index ${high}.`,
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [9],
  }

  let i = low - 1 // Index of smaller/larger element (depending on direction)
  yield {
    // i = (low - 1)
    array: [...arr],
    message: `Initialize i to ${i}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [10],
    activeRange: { start: low, end: high },
    highlightedIndices: [high],
  }

  for (let j = low; j < high; j++) {
    yield {
      // for (j = low; j <= high - 1; j++)
      array: [...arr],
      message: `Inner loop: j = ${j}`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [11],
      highlightedIndices: [high, j],
      comparisonIndices: [i + 1, j],
      activeRange: { start: low, end: high },
    }

    // Highlight pivot and element being compared
    yield {
      array: [...arr],
      highlightedIndices: [high, j],
      comparisonIndices: [i + 1, j],
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: low, end: high },
      message: `Comparing element ${arr[j]} at index ${j} with pivot ${pivot}.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [12],
    }

    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    if (shouldBeBefore(arr[j], pivot, direction)) {
      i++
      yield {
        // i++
        array: [...arr],
        message: `Element ${arr[j]} should be before pivot. Increment i to ${i}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [13],
        highlightedIndices: [high, j, i],
        activeRange: { start: low, end: high },
      }

      // Yield state before swap
      yield {
        array: [...arr],
        highlightedIndices: [],
        comparisonIndices: [],
        swappingIndices: [i, j], // Elements arr[i] and arr[j] about to be swapped
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: low, end: high },
        message: `Preparing to swap elements at indices ${i} (${arr[i]}) and ${j} (${arr[j]}).`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [14],
      }
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      liveStats.swaps = (liveStats.swaps || 0) + 1
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2

      // Yield state after swap
      yield {
        array: [...arr],
        highlightedIndices: [i, j],
        comparisonIndices: [],
        swappingIndices: [i, j], // Show what was just swapped
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: low, end: high },
        message: `Swapped. New values: ${arr[i]} (at ${i}) and ${arr[j]} (at ${j}).`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [14],
      }
    } else {
      yield {
        array: [...arr],
        highlightedIndices: [high, j],
        comparisonIndices: [i + 1, j],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: low, end: high },
        message: `Element ${arr[j]} is in correct partition relative to pivot.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: [12],
      }
    }
  }
  yield {
    // End of for loop
    array: [...arr],
    message: 'Finished inner loop for partitioning.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [16],
    activeRange: { start: low, end: high },
  }

  // Place pivot in its final sorted position
  const pivotFinalIndex = i + 1
  yield {
    array: [...arr],
    highlightedIndices: [],
    comparisonIndices: [],
    swappingIndices: [pivotFinalIndex, high], // Pivot arr[high] and arr[pivotFinalIndex] about to be swapped
    sortedIndices: Array.from(sortedIndices),
    activeRange: { start: low, end: high },
    message: `Preparing to place pivot ${pivot} in its final position. Swapping with element at ${pivotFinalIndex} (${arr[pivotFinalIndex]}).`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [17],
  }
  ;[arr[pivotFinalIndex], arr[high]] = [arr[high], arr[pivotFinalIndex]]
  liveStats.swaps = (liveStats.swaps || 0) + 1
  liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
  sortedIndices.add(pivotFinalIndex) // The pivot is now sorted

  yield {
    array: [...arr],
    highlightedIndices: [pivotFinalIndex],
    comparisonIndices: [],
    swappingIndices: [pivotFinalIndex, high], // Show what was just swapped to place pivot
    sortedIndices: Array.from(sortedIndices),
    activeRange: { start: low, end: high },
    message: `Pivot ${arr[pivotFinalIndex]} is now at its sorted index ${pivotFinalIndex}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [17],
  }

  yield {
    // return (i + 1)
    array: [...arr],
    message: `Partition complete. Pivot index is ${pivotFinalIndex}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [18],
    activeRange: { start: low, end: high },
    highlightedIndices: [pivotFinalIndex],
  }
  return pivotFinalIndex // Return the pivot's final index
}

// Recursive Quick Sort helper generator
const quickSortRecursiveGenerator = function* (
  arr: number[],
  low: number,
  high: number,
  direction: 'asc' | 'desc',
  sortedIndices: Set<number>,
  liveStats: Partial<SortStats>
): Generator<SortStep, void, void> {
  yield {
    // quickSort(array, low, high)
    array: [...arr],
    message: `quickSort(arr, ${low}, ${high})`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0],
    activeRange: { start: low, end: high },
  }
  if (low < high) {
    yield {
      // if (low < high)
      array: [...arr],
      message: `Condition low < high is true for [${low}...${high}].`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [1],
      activeRange: { start: low, end: high },
    }

    // Partition the array and get the pivot index
    // pi = partition(array, low, high)
    const pivotIndex: number = yield* partitionGenerator(
      arr,
      low,
      high,
      direction,
      sortedIndices,
      liveStats
    )
    yield {
      // After partition returns, conceptually at line 2
      array: [...arr],
      message: `Partition returned pivot index ${pivotIndex}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [2],
      activeRange: { start: low, end: high },
      highlightedIndices: [pivotIndex],
    }

    // After partition, ensure swappingIndices is cleared before next recursive step if it was set by last step of partition
    yield {
      array: [...arr],
      message: `Range [${low}...${high}] partitioned around pivot ${arr[pivotIndex]} at index ${pivotIndex}. Proceeding with recursion.`,
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: low, end: high },
      swappingIndices: null,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [2], // Still on pi = partition(...)
    }

    // Recursively sort elements before partition
    // quickSort(array, low, pi - 1)
    yield {
      array: [...arr],
      message: `Calling quickSort for left part: [${low}...${pivotIndex - 1}]`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [3],
      activeRange: { start: low, end: pivotIndex - 1 },
    }
    yield* quickSortRecursiveGenerator(
      arr,
      low,
      pivotIndex - 1,
      direction,
      sortedIndices,
      liveStats
    )

    // Recursively sort elements after partition
    // quickSort(array, pi + 1, high)
    yield {
      array: [...arr],
      message: `Calling quickSort for right part: [${pivotIndex + 1}...${high}]`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [4],
      activeRange: { start: pivotIndex + 1, end: high },
    }
    yield* quickSortRecursiveGenerator(
      arr,
      pivotIndex + 1,
      high,
      direction,
      sortedIndices,
      liveStats
    )
    yield {
      // End of if (low < high) block
      array: [...arr],
      message: `Finished recursive calls for range [${low}...${high}]`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [5], // Closing brace of if
      activeRange: { start: low, end: high },
    }
  } else if (low === high) {
    // Base case: single element is considered sorted
    sortedIndices.add(low)
    yield {
      array: [...arr],
      highlightedIndices: [low],
      comparisonIndices: [low],
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: low, end: high },
      message: `Base case: Range [${low}...${high}] has one element, considered sorted.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [1], // if (low < high) is false
    }
  } else {
    // Base case: empty range
    yield {
      array: [...arr],
      highlightedIndices: [],
      comparisonIndices: [],
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: low, end: high },
      message: `Base case: Range [${low}...${high}] is empty, skipping.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [1], // if (low < high) is false
    }
  }
}

// Main Quick Sort generator function
export const quickSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = new Set<number>()

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Quick Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0, // Quick Sort (Lomuto) is in-place
  }

  if (n <= 1) {
    if (n === 1) sortedIndices.add(0)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [0], // Or specific line for base case
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Quick Sort',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [0], // quickSort(arr, 0, n-1)
  }

  // Start the recursive sort
  yield* quickSortRecursiveGenerator(arr, 0, n - 1, direction, sortedIndices, liveStats)

  // Ensure all indices are marked sorted in the final step if any were missed (shouldn't happen with Lomuto if base cases are handled)
  if (sortedIndices.size < n) {
    for (let i = 0; i < n; i++) sortedIndices.add(i)
  }

  // Final sorted state confirmation
  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Quick Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [6],
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
