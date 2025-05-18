'use client'

import { SortGenerator, SortStep, SortStats, AuxiliaryStructure } from '../types'

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
  liveStats: Partial<SortStats>,
  depth: number // For message clarity
): Generator<SortStep, number, void> {
  const pivotValue = arr[high]
  let smallerElementBoundary = low - 1

  yield {
    array: [...arr],
    activeRange: { start: low, end: high },
    highlightedIndices: [high], // Pivot
    comparisonIndices: [], // No comparisons yet, just identifying pivot
    message: `(Depth ${depth}) Partitioning [${low}...${high}]. Pivot P=${pivotValue} (A[${high}]). Boundary i=${smallerElementBoundary}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [8, 9, 10], // partition func, pivot = arr[high], i = low - 1
    sortedIndices: Array.from(sortedIndices),
  }

  // Loop through elements (j) to compare with pivot
  for (let j = low; j < high; j++) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    let messageForThisIteration: string
    let swappedInThisIteration = false
    let finalSmallerBoundaryForYield = smallerElementBoundary // Capture state before potential change

    if (shouldBeBefore(arr[j], pivotValue, direction)) {
      smallerElementBoundary++
      finalSmallerBoundaryForYield = smallerElementBoundary // Capture state after potential change
      const valAtJBeforeSwap = arr[j] // Capture for message clarity
      const valAtSBBeforeSwap = arr[smallerElementBoundary] // Capture for message clarity

      // Perform swap only if j is not the same as smallerElementBoundary to avoid redundant writes/stats
      if (j !== smallerElementBoundary) {
        ;[arr[smallerElementBoundary], arr[j]] = [arr[j], arr[smallerElementBoundary]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swappedInThisIteration = true
        messageForThisIteration = `(Depth ${depth}) A[${j}](${valAtJBeforeSwap}) ${direction === 'asc' ? '<' : '>'} P(${pivotValue}). Increment i to ${smallerElementBoundary}. Swap A[i]=A[${smallerElementBoundary}](${arr[smallerElementBoundary]}) (was ${valAtSBBeforeSwap}) with A[${j}]=A[${j}](${arr[j]}).`
      } else {
        // Element is smaller/greater than pivot but already in correct relative position, no actual swap needed, just boundary increment.
        messageForThisIteration = `(Depth ${depth}) A[${j}](${valAtJBeforeSwap}) ${direction === 'asc' ? '<' : '>'} P(${pivotValue}). Increment i to ${smallerElementBoundary}. A[j] already in place relative to new boundary i, no swap needed.`
      }
    } else {
      messageForThisIteration = `(Depth ${depth}) A[${j}](${arr[j]}) not ${direction === 'asc' ? '<' : '>'} P(${pivotValue}). No swap. i remains ${smallerElementBoundary}.`
    }

    // Consolidated yield for each element j processed
    yield {
      array: [...arr],
      activeRange: { start: low, end: high },
      highlightedIndices: [high, j, finalSmallerBoundaryForYield].filter(
        idx => idx >= low && idx <= high
      ),
      comparisonIndices: [j, high], // Element j vs pivot
      // If a swap occurred, highlight the two indices that were swapped.
      // If smallerElementBoundary was incremented, it's also a key index.
      // Use finalSmallerBoundaryForYield to correctly highlight the boundary *after* this iteration's logic.
      swappingIndices:
        swappedInThisIteration && j !== finalSmallerBoundaryForYield
          ? [finalSmallerBoundaryForYield, j]
          : undefined,
      message: messageForThisIteration,
      currentStats: { ...liveStats },
      // Pseudo code lines depend on whether a swap happened
      currentPseudoCodeLine: swappedInThisIteration ? [11, 12, 13, 14] : [11, 12],
      sortedIndices: Array.from(sortedIndices),
    }
  } // End for loop - Pseudo line 16

  const pivotFinalIndex = smallerElementBoundary + 1
  const valueBeingSwappedWithPivot = arr[pivotFinalIndex] // Value at the position where pivot will go

  // Swap pivot to its final sorted position only if it's not already there.
  if (pivotFinalIndex !== high) {
    ;[arr[pivotFinalIndex], arr[high]] = [arr[high], arr[pivotFinalIndex]]
    liveStats.swaps = (liveStats.swaps || 0) + 1
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
  }
  sortedIndices.add(pivotFinalIndex)

  yield {
    array: [...arr],
    activeRange: { start: low, end: high },
    highlightedIndices: [pivotFinalIndex], // Final pivot position
    swappingIndices: pivotFinalIndex !== high ? [pivotFinalIndex, high] : undefined,
    message:
      `(Depth ${depth}) Placed pivot P=${arr[pivotFinalIndex]} into final sorted position A[${pivotFinalIndex}]` +
      (pivotFinalIndex !== high
        ? ` by swapping A[${high}] (original value ${arr[high]}, was ${valueBeingSwappedWithPivot} at target) with current P.`
        : `. Pivot was already at A[${high}].`) +
      ` Index ${pivotFinalIndex} is now sorted.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [17], // swap A[i+1] with A[high]
    sortedIndices: Array.from(sortedIndices),
  }

  return pivotFinalIndex // Pseudo line 18: return i+1
}

// Recursive Quick Sort helper generator
const quickSortRecursiveGenerator = function* (
  arr: number[],
  low: number,
  high: number,
  direction: 'asc' | 'desc',
  sortedIndices: Set<number>,
  liveStats: Partial<SortStats>,
  depth: number // For tracking recursion depth in messages
): Generator<SortStep, void, void> {
  const currentSubArrayAuxId = `quicksort-subarray-${low}-${high}-${depth}`
  const currentSubArrayAuxSlot = `quicksort-current-subarray`

  const getCurrentSubArrayAux = (stepTitle: string): AuxiliaryStructure | null => {
    if (low > high) return null
    return {
      id: `${currentSubArrayAuxId}-${stepTitle.replace(/\s+/g, '-').toLowerCase()}`,
      title: `Depth ${depth}: Range [${low}-${high}] (${stepTitle})`,
      data: arr.slice(low, high + 1).map((value, index) => ({
        value,
        originalIndex: low + index,
        isSorted: sortedIndices.has(low + index),
      })),
      displaySlot: currentSubArrayAuxSlot,
    }
  }

  yield {
    array: [...arr],
    activeRange: { start: low, end: high },
    message: `(Depth ${depth}) quickSort([${low}...${high}]).`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0],
    sortedIndices: Array.from(sortedIndices),
    currentPassAuxiliaryStructure: getCurrentSubArrayAux('Start'),
  }

  if (low < high) {
    const pivotIndex: number = yield* partitionGenerator(
      arr,
      low,
      high,
      direction,
      sortedIndices,
      liveStats,
      depth
    )
    // After partition, the pivot is in its sorted place.
    yield {
      array: [...arr],
      activeRange: { start: low, end: high }, // Keep full range for context of this call
      highlightedIndices: [pivotIndex], // Pivot is now sorted
      message: `(Depth ${depth}) Partitioned [${low}...${high}]. Pivot P=${arr[pivotIndex]} at A[${pivotIndex}] is now sorted.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [2],
      sortedIndices: Array.from(sortedIndices),
      currentPassAuxiliaryStructure: getCurrentSubArrayAux('Partitioned'),
    }

    yield* quickSortRecursiveGenerator(
      arr,
      low,
      pivotIndex - 1,
      direction,
      sortedIndices,
      liveStats,
      depth + 1
    )

    yield* quickSortRecursiveGenerator(
      arr,
      pivotIndex + 1,
      high,
      direction,
      sortedIndices,
      liveStats,
      depth + 1
    )
    // Yield after both recursive calls for this level are done.
    yield {
      array: [...arr],
      activeRange: { start: low, end: high },
      message: `(Depth ${depth}) Sub-arrays for [${low}...${high}] (left of pivot, right of pivot) now sorted.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [3, 4], // Corresponds to the two recursive calls being completed
      sortedIndices: Array.from(sortedIndices),
      currentPassAuxiliaryStructure: getCurrentSubArrayAux('Sub-arrays Sorted'),
    }
  } else {
    if (low === high && low >= 0 && low < arr.length && !sortedIndices.has(low)) {
      // Single element sub-array, if not already marked by partition, mark as sorted.
      sortedIndices.add(low)
    }
    yield {
      array: [...arr],
      activeRange: { start: low, end: high },
      message: `(Depth ${depth}) Base case for [${low}...${high}] (size ${high - low + 1}). Already sorted.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [1],
      sortedIndices: Array.from(sortedIndices),
      currentPassAuxiliaryStructure: getCurrentSubArrayAux('Base Case'),
    }
  }
  // Final yield for this specific quickSortRecursiveGenerator call, confirming its completion.
  yield {
    array: [...arr],
    activeRange: { start: low, end: high }, // Still focused on the range this call was responsible for
    message: `(Depth ${depth}) quickSort([${low}...${high}]) completed.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [5], // end if / end func for recursive call
    sortedIndices: Array.from(sortedIndices),
    currentPassAuxiliaryStructure: getCurrentSubArrayAux('Completed'),
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
    auxiliaryArrayWrites: 0,
  }

  if (n <= 1) {
    if (n === 1) sortedIndices.add(0)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [25, 26, 27],
    }
    return { finalArray: arr, stats: liveStats as SortStats, finalAuxiliaryStructures: null }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Quick Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [25],
    // Optionally, show initial full array as an auxiliary structure if desired
    // currentPassAuxiliaryStructure: { id: 'initial-array', title: 'Initial State', data: arr.map((v, i)=>({value: v, originalIndex: i}))}
  }

  yield* quickSortRecursiveGenerator(arr, 0, n - 1, direction, sortedIndices, liveStats, 0)

  // Final pass to ensure all indices are in sortedIndices, though pivot placement should cover this.
  for (let k = 0; k < n; k++) {
    if (!sortedIndices.has(k)) sortedIndices.add(k)
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices), // All should be sorted
    message: 'Quick Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [30], // Corresponds to end of main function
  }

  return {
    finalArray: arr,
    stats: liveStats as SortStats,
    finalAuxiliaryStructures: null, // No specific final structure beyond the sorted array itself
  }
}
