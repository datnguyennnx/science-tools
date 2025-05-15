'use client'

import { SortGenerator, SortStep, SortStats } from '../types'

// Comparison function based on direction
const shouldSwap = (
  parentValue: number,
  childValue: number,
  direction: 'asc' | 'desc'
): boolean => {
  // Max-heap for ascending sort, Min-heap for descending sort
  return direction === 'asc' ? parentValue < childValue : parentValue > childValue
}

// Heapify a subtree rooted with node i which is an index in arr[]
const heapifyGenerator = function* (
  arr: number[],
  n: number, // total size of original array, used for full array context if needed
  i: number, // current root of subtree to heapify
  direction: 'asc' | 'desc',
  sortedIndices: Set<number>,
  heapSize: number, // current size of the heap being operated on
  liveStats: Partial<SortStats>
): Generator<SortStep, void, void> {
  let largestOrSmallest = i
  const leftChild = 2 * i + 1
  const rightChild = 2 * i + 2

  const activeHeapRange = { start: 0, end: heapSize - 1 }

  yield {
    array: [...arr],
    highlightedIndices: [i],
    comparisonIndices: [leftChild, rightChild].filter(idx => idx < heapSize),
    sortedIndices: Array.from(sortedIndices),
    activeRange: activeHeapRange,
    message: `Heapifying subtree rooted at index ${i} (value ${arr[i]}) within heap size ${heapSize}.`,
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 10, // heapify(array, n, i) {
  }
  yield {
    array: [...arr],
    message: `largest = ${i}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 11, // largest = i
    activeRange: activeHeapRange,
    highlightedIndices: [i],
  }
  yield {
    array: [...arr],
    message: `left = 2 * ${i} + 1 = ${leftChild}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 12, // left = 2 * i + 1
    activeRange: activeHeapRange,
    highlightedIndices: [i],
  }
  yield {
    array: [...arr],
    message: `right = 2 * ${i} + 2 = ${rightChild}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 13, // right = 2 * i + 2
    activeRange: activeHeapRange,
    highlightedIndices: [i],
  }

  if (leftChild < heapSize) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    yield {
      array: [...arr],
      highlightedIndices: [i, leftChild],
      comparisonIndices: [i, leftChild],
      sortedIndices: Array.from(sortedIndices),
      activeRange: activeHeapRange,
      message: `Comparing root (${arr[i]}) with left child (${arr[leftChild]}) at index ${leftChild}.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 14, // if (left < n && array[left] > array[largest]) {
    }
    if (shouldSwap(arr[largestOrSmallest], arr[leftChild], direction)) {
      largestOrSmallest = leftChild
      yield {
        array: [...arr],
        message: `New largest/smallest is ${arr[largestOrSmallest]} at index ${largestOrSmallest}`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 15, // largest = left
        activeRange: activeHeapRange,
        highlightedIndices: [largestOrSmallest],
      }
    }
  }
  // Yield for line 16 (closing brace of if left)
  yield {
    array: [...arr],
    message: 'Checked left child.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 16,
    activeRange: activeHeapRange,
    highlightedIndices: [largestOrSmallest],
  }

  if (rightChild < heapSize) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    yield {
      array: [...arr],
      highlightedIndices: [largestOrSmallest, rightChild],
      comparisonIndices: [largestOrSmallest, rightChild],
      sortedIndices: Array.from(sortedIndices),
      activeRange: activeHeapRange,
      message: `Comparing current ${direction === 'asc' ? 'max' : 'min'} (${arr[largestOrSmallest]}) with right child (${arr[rightChild]}) at index ${rightChild}.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 17, // if (right < n && array[right] > array[largest]) {
    }
    if (shouldSwap(arr[largestOrSmallest], arr[rightChild], direction)) {
      largestOrSmallest = rightChild
      yield {
        array: [...arr],
        message: `New largest/smallest is ${arr[largestOrSmallest]} at index ${largestOrSmallest}`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 18, // largest = right
        activeRange: activeHeapRange,
        highlightedIndices: [largestOrSmallest],
      }
    }
  }
  // Yield for line 19 (closing brace of if right)
  yield {
    array: [...arr],
    message: 'Checked right child.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 19,
    activeRange: activeHeapRange,
    highlightedIndices: [largestOrSmallest],
  }

  if (largestOrSmallest !== i) {
    yield {
      array: [...arr],
      highlightedIndices: [],
      comparisonIndices: [],
      swappingIndices: [i, largestOrSmallest],
      sortedIndices: Array.from(sortedIndices),
      activeRange: activeHeapRange,
      message: `Preparing to swap root (${arr[i]}) with new ${direction === 'asc' ? 'max' : 'min'} (${arr[largestOrSmallest]}) at index ${largestOrSmallest}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 20, // if (largest != i) {
    }
    ;[arr[i], arr[largestOrSmallest]] = [arr[largestOrSmallest], arr[i]]
    liveStats.swaps = (liveStats.swaps || 0) + 1
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2

    yield {
      array: [...arr],
      highlightedIndices: [i, largestOrSmallest],
      comparisonIndices: [],
      swappingIndices: [i, largestOrSmallest], // Show what was just swapped
      sortedIndices: Array.from(sortedIndices),
      activeRange: activeHeapRange,
      message: `Swapped. Heap property might be violated at index ${largestOrSmallest}. Recursively heapifying.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 21, // swap(array[i], array[largest])
    }

    yield* heapifyGenerator(
      arr,
      n,
      largestOrSmallest,
      direction,
      sortedIndices,
      heapSize,
      liveStats
    )
    // After recursive call returns, conceptually we are at line 22 for that call
    yield {
      array: [...arr],
      message: `Recursive heapify call for index ${largestOrSmallest} complete.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 22, // heapify(array, n, largest)
      activeRange: activeHeapRange,
    }
  } else {
    yield {
      array: [...arr],
      highlightedIndices: [i],
      comparisonIndices: [leftChild, rightChild].filter(idx => idx < heapSize),
      sortedIndices: Array.from(sortedIndices),
      activeRange: activeHeapRange,
      message: `Heap property maintained at root index ${i}. No swap needed.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 20, // Condition largest != i is false
    }
  }
  yield {
    array: [...arr],
    message: `Heapify for index ${i} complete.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 23, // Closing brace of if (largest != i)
    activeRange: activeHeapRange,
  }
  // Yield for line 24 (closing brace of heapify function)
  yield {
    array: [...arr],
    message: `Exiting heapify for index ${i}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 24,
    activeRange: activeHeapRange,
  }
}

// Main Heap Sort generator function
export const heapSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = new Set<number>()

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Heap Sort',
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
      swappingIndices: null,
      currentPseudoCodeLine: 0, // heapSort(array, n) {
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Heap Sort. Building max/min heap.',
    activeRange: { start: 0, end: n - 1 },
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 0, // heapSort(array, n) {
  }

  const startIdx = Math.floor(n / 2) - 1
  for (let i = startIdx; i >= 0; i--) {
    yield {
      array: [...arr],
      message: `Building heap: Calling heapify for index ${i}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 1, // for (i = n / 2 - 1; i >= 0; i--) {
      activeRange: { start: 0, end: n - 1 },
      highlightedIndices: [i],
    }
    yield* heapifyGenerator(arr, n, i, direction, sortedIndices, n, liveStats)
    yield {
      array: [...arr],
      message: `Heapify for index ${i} (build phase) complete.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 2, // heapify(array, n, i)
      activeRange: { start: 0, end: n - 1 },
    }
  }
  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: `Heap built (${direction === 'asc' ? 'Max' : 'Min'} Heap). Starting extraction phase.`,
    activeRange: { start: 0, end: n - 1 },
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 3, // Closing brace of first for loop
  }

  for (let i = n - 1; i > 0; i--) {
    yield {
      array: [...arr],
      message: `Extracting max/min: Swapping root with element at index ${i}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 4, // for (i = n - 1; i > 0; i--) {
      activeRange: { start: 0, end: i },
      swappingIndices: [0, i], // About to swap
    }
    ;[arr[0], arr[i]] = [arr[i], arr[0]]
    liveStats.swaps = (liveStats.swaps || 0) + 1
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
    sortedIndices.add(i)
    const currentHeapSize = i

    yield {
      array: [...arr],
      highlightedIndices: [0, i],
      comparisonIndices: [],
      swappingIndices: [0, i], // Show what was just swapped
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: i - 1 },
      message: `Swapped. Index ${i} is now sorted. Heap size reduced to ${currentHeapSize}. Re-heapifying root.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 5, // swap(array[0], array[i])
    }

    yield* heapifyGenerator(arr, n, 0, direction, sortedIndices, currentHeapSize, liveStats)
    yield {
      array: [...arr],
      message: `Heapify for index 0 (extraction phase for element at ${i}) complete.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 6, // heapify(array, i, 0)
      activeRange: { start: 0, end: i - 1 },
    }
    if (i - 1 > 0) {
      yield {
        array: [...arr],
        message: `Heap restored after extracting to index ${i}. Next extraction target: index ${i - 1}.`,
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: i - 1 },
        swappingIndices: null,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 4, // Back to for loop condition for next iteration
      }
    }
  }
  yield {
    array: [...arr],
    message: 'Finished extraction loop.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 7, // Closing brace of second for loop
    sortedIndices: Array.from(sortedIndices),
  }

  sortedIndices.add(0)

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Heap Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 8, // Closing brace of heapSort function
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
