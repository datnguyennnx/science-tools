'use client'

import { SortGenerator, SortStep, SortStats } from '../types'

const shouldSwap = (
  parentValue: number,
  childValue: number,
  direction: 'asc' | 'desc'
): boolean => {
  return direction === 'asc' ? parentValue < childValue : parentValue > childValue
}

const heapifyGenerator = function* (
  arr: number[],
  n: number,
  i: number,
  direction: 'asc' | 'desc',
  sortedIndices: Set<number>,
  heapSize: number,
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
    currentPseudoCodeLine: [14],
  }
  yield {
    array: [...arr],
    message: `largest = ${i}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [15],
    activeRange: activeHeapRange,
    highlightedIndices: [i],
  }
  yield {
    array: [...arr],
    message: `left = 2 * ${i} + 1 = ${leftChild}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [16],
    activeRange: activeHeapRange,
    highlightedIndices: [i],
  }
  yield {
    array: [...arr],
    message: `right = 2 * ${i} + 2 = ${rightChild}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [17],
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
      currentPseudoCodeLine: [20],
    }
    if (shouldSwap(arr[largestOrSmallest], arr[leftChild], direction)) {
      largestOrSmallest = leftChild
      yield {
        array: [...arr],
        message: `New largest/smallest is ${arr[largestOrSmallest]} at index ${largestOrSmallest}`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [22],
        activeRange: activeHeapRange,
        highlightedIndices: [largestOrSmallest],
      }
    }
  }
  yield {
    array: [...arr],
    message: 'Checked left child.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [24],
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
      currentPseudoCodeLine: [27],
    }
    if (shouldSwap(arr[largestOrSmallest], arr[rightChild], direction)) {
      largestOrSmallest = rightChild
      yield {
        array: [...arr],
        message: `New largest/smallest is ${arr[largestOrSmallest]} at index ${largestOrSmallest}`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [29],
        activeRange: activeHeapRange,
        highlightedIndices: [largestOrSmallest],
      }
    }
  }
  yield {
    array: [...arr],
    message: 'Checked right child.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [31],
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
      currentPseudoCodeLine: [33],
    }
    ;[arr[i], arr[largestOrSmallest]] = [arr[largestOrSmallest], arr[i]]
    liveStats.swaps = (liveStats.swaps || 0) + 1
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2

    yield {
      array: [...arr],
      highlightedIndices: [i, largestOrSmallest],
      comparisonIndices: [],
      swappingIndices: [i, largestOrSmallest],
      sortedIndices: Array.from(sortedIndices),
      activeRange: activeHeapRange,
      message: `Swapped. Heap property might be violated at index ${largestOrSmallest}. Recursively heapifying.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [34],
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
    yield {
      array: [...arr],
      message: `Recursive heapify call for index ${largestOrSmallest} complete.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [35],
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
      currentPseudoCodeLine: [33],
    }
  }
  yield {
    array: [...arr],
    message: `Heapify for index ${i} complete.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [37],
    activeRange: activeHeapRange,
  }
  // Yield for line 24 (closing brace of heapify function)
  yield {
    array: [...arr],
    message: `Exiting heapify for index ${i}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [37],
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
      currentPseudoCodeLine: [2],
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
    currentPseudoCodeLine: [0],
  }

  const startIdx = Math.floor(n / 2) - 1
  for (let i = startIdx; i >= 0; i--) {
    yield {
      array: [...arr],
      highlightedIndices: [i],
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: n - 1 }, // Heap is being built on the whole array
      message: `Building heap: Calling heapify for subtree rooted at index ${i}.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [4],
    }
    yield* heapifyGenerator(
      arr,
      n, // Heap size is full array length during build phase
      i,
      direction,
      sortedIndices,
      n, // Pass full N as heapSize for build phase
      liveStats
    )
    yield {
      array: [...arr],
      highlightedIndices: [i],
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: n - 1 },
      message: `Heapify for index ${i} (build phase) complete.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [6],
    }
  }
  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    activeRange: { start: 0, end: n - 1 },
    message: 'Heap build complete. Max/min element is at the root.',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [6],
  }

  for (let i = n - 1; i > 0; i--) {
    yield {
      array: [...arr],
      highlightedIndices: [0, i], // Show root and element to be swapped into sorted position
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: i - 1 }, // Heap size reduces
      message: `Extracting max/min: Preparing to swap root ${arr[0]} with element at index ${i}.`,
      currentStats: { ...liveStats },
      swappingIndices: [0, i],
      currentPseudoCodeLine: [8],
    }
    ;[arr[0], arr[i]] = [arr[i], arr[0]]
    liveStats.swaps = (liveStats.swaps || 0) + 1
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
    sortedIndices.add(i) // Element at i is now sorted

    yield {
      array: [...arr],
      highlightedIndices: [0, i], // Show the swapped elements
      swappingIndices: [0, i],
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: i - 1 }, // Heap size reduces
      message: `Swapped. Element ${arr[i]} at index ${i} is now sorted. Root is ${arr[0]}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [9],
    }

    yield {
      array: [...arr],
      highlightedIndices: [0], // Root of reduced heap
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: i - 1 },
      message: `Calling heapify on reduced heap of size ${i}, rooted at index 0.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [10],
    }
    yield* heapifyGenerator(
      arr,
      n, // Original n for array bounds, but actual heap operations use heapSize
      0, // Root is always 0 for the reduced heap
      direction,
      sortedIndices,
      i, // Heap size is now i (the current boundary of the unsorted part)
      liveStats
    )
    yield {
      array: [...arr],
      highlightedIndices: [0],
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: i - 1 },
      message: `Heapify for root of reduced heap (size ${i}) complete.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [11],
    }
  }
  if (n > 0) sortedIndices.add(0) // The last element (root) is sorted by default

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Heap Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [12],
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
