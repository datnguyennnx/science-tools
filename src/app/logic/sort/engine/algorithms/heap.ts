'use client'

import { SortGenerator, SortStep } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer'

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
    }
    if (shouldSwap(arr[largestOrSmallest], arr[leftChild], direction)) {
      largestOrSmallest = leftChild
    }
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
    }
    if (shouldSwap(arr[largestOrSmallest], arr[rightChild], direction)) {
      largestOrSmallest = rightChild
    }
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
    }
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
  }

  const startIdx = Math.floor(n / 2) - 1
  for (let i = startIdx; i >= 0; i--) {
    yield* heapifyGenerator(arr, n, i, direction, sortedIndices, n, liveStats)
  }
  // Clear swapping state after heap build is complete before starting extraction
  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: `Heap built (${direction === 'asc' ? 'Max' : 'Min'} Heap). Starting extraction phase.`,
    activeRange: { start: 0, end: n - 1 },
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  for (let i = n - 1; i > 0; i--) {
    yield {
      array: [...arr],
      highlightedIndices: [],
      comparisonIndices: [],
      swappingIndices: [0, i], // About to swap root with element at end of current heap
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: i },
      message: `Preparing to extract ${direction === 'asc' ? 'max' : 'min'} element (${arr[0]}) by swapping with element at index ${i} (${arr[i]}).`,
      currentStats: { ...liveStats },
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
    }

    yield* heapifyGenerator(arr, n, 0, direction, sortedIndices, currentHeapSize, liveStats)
    // Clear swapping state after heapify completes for this extraction pass
    if (i - 1 > 0) {
      // Only yield clear if more extractions are coming
      yield {
        array: [...arr],
        message: `Heap restored after extracting to index ${i}. Next extraction target: index ${i - 1}.`,
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: 0, end: i - 1 },
        swappingIndices: null,
        currentStats: { ...liveStats },
      }
    }
  }

  sortedIndices.add(0)

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Heap Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
