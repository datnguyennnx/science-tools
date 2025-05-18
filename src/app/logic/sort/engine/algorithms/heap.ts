'use client'

import { SortGenerator, SortStep, SortStats, AuxiliaryStructure } from '../types'

const shouldSwapParentWithChild = (
  parentValue: number,
  childValue: number,
  direction: 'asc' | 'desc' // For Max-Heap (asc sort) or Min-Heap (desc sort)
): boolean => {
  // If ascending sort (Max-Heap), parent should be GREATER than child.
  // Swap if parent is LESS than child.
  // If descending sort (Min-Heap), parent should be LESS than child.
  // Swap if parent is GREATER than child.
  return direction === 'asc' ? parentValue < childValue : parentValue > childValue
}

const heapifyGenerator = function* (
  arr: number[],
  heapSize: number,
  subtreeRootIndex: number,
  direction: 'asc' | 'desc',
  _sortedGlobalIndices: ReadonlySet<number>, // For context, not directly modified here
  liveStats: Partial<SortStats>,
  operationContext: string // e.g., "Build-Heap" or "Sort-Down"
): Generator<SortStep, void, void> {
  let extremeElementIndex = subtreeRootIndex // "largest" for Max-Heap, "smallest" for Min-Heap
  const leftChildIndex = 2 * subtreeRootIndex + 1
  const rightChildIndex = 2 * subtreeRootIndex + 2

  const heapViewAuxId = `heap-view-${operationContext.toLowerCase().replace(/\s+|-/g, '')}`
  const getHeapViewAuxStructure = (
    detail: string,
    currentArrState: ReadonlyArray<number>,
    currentHeapSize: number,
    highlightedNodesInAux?: number[]
  ): AuxiliaryStructure => ({
    id: `${heapViewAuxId}-root${subtreeRootIndex}-size${currentHeapSize}-${detail.toLowerCase().replace(/\s+/g, '-')}`,
    title: `Heap View (${operationContext} - ${detail})`,
    data: currentArrState.slice(0, currentHeapSize).map((value, index) => ({
      value,
      originalIndex: index, // This is index within the current heap, not necessarily original array
      // Property name changed for clarity in AuxiliaryStructureChart if it uses 'isHighlighted' directly
      // For data, we might pass generic properties. Let's assume chart can handle `isHighlighted` or adapt if needed.
      isHighlighted: highlightedNodesInAux?.includes(index),
    })),
    displaySlot: 'heap-active-view',
  })

  // Initial state for heapifying this subtree
  yield {
    array: [...arr],
    activeRange: { start: 0, end: heapSize - 1 }, // Active part of array treated as heap
    highlightedIndices: [subtreeRootIndex, leftChildIndex, rightChildIndex].filter(
      idx => idx < heapSize
    ),
    message: `${operationContext}: Heapifying subtree at index ${subtreeRootIndex} (value ${arr[subtreeRootIndex]}). Heap size: ${heapSize}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [14, 15, 16, 17], // heapify, largest=i, l, r
    currentPassAuxiliaryStructure: getHeapViewAuxStructure('Start Subtree Heapify', arr, heapSize, [
      subtreeRootIndex,
    ]),
    swappingIndices: null,
    comparisonIndices: [],
  }

  // Check left child
  if (leftChildIndex < heapSize) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    if (shouldSwapParentWithChild(arr[extremeElementIndex], arr[leftChildIndex], direction)) {
      extremeElementIndex = leftChildIndex
    }
  }
  // Yield after considering left child
  yield {
    array: [...arr],
    activeRange: { start: 0, end: heapSize - 1 },
    highlightedIndices: [subtreeRootIndex, leftChildIndex, extremeElementIndex].filter(
      idx => idx < heapSize
    ),
    comparisonIndices: [subtreeRootIndex, leftChildIndex].filter(
      idx => idx < heapSize && leftChildIndex < heapSize
    ),
    message: `${operationContext}: Compared root (${arr[subtreeRootIndex]}) with left child (${leftChildIndex < heapSize ? arr[leftChildIndex] : 'N/A'}). Potential extreme: ${arr[extremeElementIndex]} (at index ${extremeElementIndex}).`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [19, 20, 22, 23], // if l < n and arr[l] > arr[largest], largest = l
    currentPassAuxiliaryStructure: getHeapViewAuxStructure('After Left Check', arr, heapSize, [
      subtreeRootIndex,
      leftChildIndex,
      extremeElementIndex,
    ]),
    swappingIndices: null,
  }

  // Check right child
  const extremeAfterLeftCheck = extremeElementIndex // Save for comparison message if right child is chosen
  if (rightChildIndex < heapSize) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    if (shouldSwapParentWithChild(arr[extremeElementIndex], arr[rightChildIndex], direction)) {
      extremeElementIndex = rightChildIndex
    }
  }
  // Yield after considering right child
  yield {
    array: [...arr],
    activeRange: { start: 0, end: heapSize - 1 },
    highlightedIndices: [
      subtreeRootIndex,
      leftChildIndex,
      rightChildIndex,
      extremeElementIndex,
    ].filter(idx => idx < heapSize),
    comparisonIndices: [extremeAfterLeftCheck, rightChildIndex].filter(
      idx => idx < heapSize && rightChildIndex < heapSize
    ), // Compare current extreme with right child
    message: `${operationContext}: Compared current extreme (${arr[extremeAfterLeftCheck]}) with right child (${rightChildIndex < heapSize ? arr[rightChildIndex] : 'N/A'}). Final extreme for this level: ${arr[extremeElementIndex]} (at index ${extremeElementIndex}).`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [26, 27, 29, 30], // if r < n and arr[r] > arr[largest], largest = r
    currentPassAuxiliaryStructure: getHeapViewAuxStructure('After Right Check', arr, heapSize, [
      subtreeRootIndex,
      leftChildIndex,
      rightChildIndex,
      extremeElementIndex,
    ]),
    swappingIndices: null,
  }

  // If extreme element is not the original root of this subtree, swap and recurse
  if (extremeElementIndex !== subtreeRootIndex) {
    const valSubtreeRoot = arr[subtreeRootIndex]
    const valExtreme = arr[extremeElementIndex]
    ;[arr[subtreeRootIndex], arr[extremeElementIndex]] = [
      arr[extremeElementIndex],
      arr[subtreeRootIndex],
    ]
    liveStats.swaps = (liveStats.swaps || 0) + 1
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2

    yield {
      array: [...arr],
      activeRange: { start: 0, end: heapSize - 1 },
      swappingIndices: [subtreeRootIndex, extremeElementIndex],
      message: `${operationContext}: Swapped ${valSubtreeRoot} (idx ${subtreeRootIndex}) with ${valExtreme} (idx ${extremeElementIndex}). Recursively heapifying affected subtree at ${extremeElementIndex}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [33, 34, 35], // if largest != i, swap, heapify(largest)
      currentPassAuxiliaryStructure: getHeapViewAuxStructure('Swapped & Recursing', arr, heapSize, [
        subtreeRootIndex,
        extremeElementIndex,
      ]),
      comparisonIndices: [], // No new comparison in this specific step
    }
    yield* heapifyGenerator(
      arr,
      heapSize,
      extremeElementIndex, // New root for recursive call is the index of the element that was swapped down
      direction,
      _sortedGlobalIndices,
      liveStats,
      operationContext
    )
  } else {
    yield {
      array: [...arr],
      activeRange: { start: 0, end: heapSize - 1 },
      highlightedIndices: [subtreeRootIndex],
      message: `${operationContext}: Element ${arr[subtreeRootIndex]} (idx ${subtreeRootIndex}) already satisfies heap property relative to its children. No swap needed.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [33, 36], // if largest != i (false case)
      currentPassAuxiliaryStructure: getHeapViewAuxStructure('No Swap Needed', arr, heapSize, [
        subtreeRootIndex,
      ]),
      swappingIndices: null,
      comparisonIndices: [],
    }
  }
  // Final yield for this heapify call completion on subtreeRootIndex
  yield {
    array: [...arr],
    activeRange: { start: 0, end: heapSize - 1 },
    message: `${operationContext}: Heapify for subtree at index ${subtreeRootIndex} complete.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [37], // end heapify
    currentPassAuxiliaryStructure: getHeapViewAuxStructure(
      'Subtree Heapify Complete',
      arr,
      heapSize,
      [subtreeRootIndex]
    ),
    swappingIndices: null,
    comparisonIndices: [],
  }
}

// Main Heap Sort generator function
export const heapSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray] // Operates on a copy
  const n = arr.length
  const sortedGlobalIndices = new Set<number>()

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Heap Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
  }

  const overallHeapViewSlot = 'heap-sort-overall-view'
  const getOverallHeapViewAux = (
    titleSuffix: string,
    currentArrState: ReadonlyArray<number>,
    currentHeapSize: number
  ): AuxiliaryStructure => ({
    id: `heap-overall-${titleSuffix.toLowerCase().replace(/\s+/g, '-')}-size${currentHeapSize}`,
    title: `Heap State: ${titleSuffix} (Size: ${currentHeapSize})`,
    data: currentArrState
      .slice(0, Math.max(0, currentHeapSize))
      .map((val, idx) => ({ value: val, originalIndex: idx })),
    displaySlot: overallHeapViewSlot,
  })

  if (n <= 1) {
    if (n === 1) sortedGlobalIndices.add(0)
    const finalAux = getOverallHeapViewAux('Completed (Small Array)', arr, n)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedGlobalIndices),
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1, 2], // procedure, n=len, if n<=1
      currentPassAuxiliaryStructure: finalAux,
      swappingIndices: null,
      comparisonIndices: [],
      highlightedIndices: [],
    }
    return { finalArray: arr, stats: liveStats as SortStats, finalAuxiliaryStructures: [finalAux] }
  }

  yield {
    array: [...arr],
    message: 'Starting Heap Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0],
    currentPassAuxiliaryStructure: getOverallHeapViewAux('Initial Array', arr, n),
    sortedIndices: Array.from(sortedGlobalIndices),
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [],
  }

  // Build-Heap Phase
  yield {
    array: [...arr],
    message: `Build-Heap Phase: Converting array into a ${direction === 'asc' ? 'max' : 'min'}-heap.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [4], // buildHeap(list)
    activeRange: { start: 0, end: n - 1 },
    currentPassAuxiliaryStructure: getOverallHeapViewAux('Before Build-Heap', arr, n),
    sortedIndices: Array.from(sortedGlobalIndices),
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [],
  }
  const firstNonLeaf = Math.floor(n / 2) - 1
  for (let i = firstNonLeaf; i >= 0; i--) {
    // highlightedIndices will be managed by heapifyGenerator
    yield* heapifyGenerator(arr, n, i, direction, sortedGlobalIndices, liveStats, 'Build-Heap')
  }
  yield {
    array: [...arr],
    message: 'Build-Heap Phase Complete. Array is now a heap.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [6], // end buildHeap loop
    activeRange: { start: 0, end: n - 1 },
    currentPassAuxiliaryStructure: getOverallHeapViewAux('After Build-Heap', arr, n),
    sortedIndices: Array.from(sortedGlobalIndices),
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [],
  }

  // Sort-Down Phase
  yield {
    array: [...arr],
    message: `Sort-Down Phase: Extracting elements and placing them in sorted order.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [8], // for i = n-1 down to 1
    currentPassAuxiliaryStructure: getOverallHeapViewAux('Start Sort-Down', arr, n),
    sortedIndices: Array.from(sortedGlobalIndices),
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [],
  }
  for (let i = n - 1; i > 0; i--) {
    const rootVal = arr[0]
    const endVal = arr[i]
    ;[arr[0], arr[i]] = [arr[i], arr[0]] // Swap root (extreme) with last element of current heap
    liveStats.swaps = (liveStats.swaps || 0) + 1
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
    sortedGlobalIndices.add(i) // Element at index i is now in its sorted position

    yield {
      array: [...arr],
      swappingIndices: [0, i],
      sortedIndices: Array.from(sortedGlobalIndices),
      activeRange: { start: 0, end: i - 1 }, // Heap size is now `i` (from 0 to i-1)
      message: `Sort-Down: Swapped root ${rootVal} with ${endVal} (at index ${i}). ${arr[i]} is sorted. Heap size reduced to ${i}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [9, 10], // swap, heapify(0, i)
      currentPassAuxiliaryStructure: getOverallHeapViewAux(`Extracted ${arr[i]}`, arr, i), // Show heap of size `i`
      comparisonIndices: [], // No new comparison in this specific step
      highlightedIndices: [0, i], // Highlight the swapped elements
    }

    // highlightedIndices will be managed by heapifyGenerator for the reduced heap
    yield* heapifyGenerator(arr, i, 0, direction, sortedGlobalIndices, liveStats, 'Sort-Down')
  }
  sortedGlobalIndices.add(0) // The last remaining element (at index 0) is also sorted

  const finalAuxSortDown = getOverallHeapViewAux('Sort-Down Complete', arr, 0) // Heap is conceptually empty
  yield {
    array: [...arr],
    message: 'Sort-Down Phase Complete. All elements sorted.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [11], // end for loop for sort-down
    sortedIndices: Array.from(sortedGlobalIndices),
    currentPassAuxiliaryStructure: finalAuxSortDown,
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [],
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedGlobalIndices),
    message: 'Heap Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [12], // return list
    currentPassAuxiliaryStructure: getOverallHeapViewAux('Final Sorted Array', arr, 0),
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [...Array(n).keys()], // All elements are sorted and can be highlighted
  }

  return {
    finalArray: arr,
    stats: liveStats as SortStats,
    finalAuxiliaryStructures: [getOverallHeapViewAux('Final State', arr, 0)],
  }
}
