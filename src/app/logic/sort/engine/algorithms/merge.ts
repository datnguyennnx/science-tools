'use client'

import { SortGenerator, SortStep, SortStats } from '../types'

// Comparison function based on direction
const compare = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  return direction === 'asc' ? a <= b : a >= b // Use <= or >= for stability
}

// Updated type to use generic Generator
const mergeSortRecursive = function* (
  arr: number[],
  fullArrayRef: number[], // Reference to the *original* array for yielding global state
  offset: number, // Start index of `arr` within `fullArrayRef`
  direction: 'asc' | 'desc',
  sortedGlobalIndices: Set<number>,
  liveStats: Partial<SortStats> // Added liveStats
): Generator<SortStep, void, void> {
  const n = arr.length
  yield {
    // Entering mergeSortRecursive, maps to line 0
    array: [...fullArrayRef],
    comparisonIndices: [],
    sortedIndices: Array.from(sortedGlobalIndices),
    activeRange: { start: offset, end: offset + n - 1 },
    message: `mergeSort(arr, ${offset}, ${offset + n - 1})`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [7],
  }

  if (n <= 1) {
    if (n === 1) sortedGlobalIndices.add(offset)
    yield {
      array: [...fullArrayRef],
      comparisonIndices: n === 1 ? [offset] : [],
      sortedIndices: Array.from(sortedGlobalIndices),
      activeRange: { start: offset, end: offset + n - 1 },
      message:
        n === 1 ? `Index ${offset} sorted (base).` : `Range at offset ${offset} empty/sorted.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [8],
    }
    return
  }
  yield {
    // if (left < right) is true
    array: [...fullArrayRef],
    comparisonIndices: [...Array(n).keys()].map(i => offset + i),
    sortedIndices: Array.from(sortedGlobalIndices),
    activeRange: { start: offset, end: offset + n - 1 },
    message: `Condition left < right is true for [${offset}...${offset + n - 1}]`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [8],
  }

  const mid = Math.floor(n / 2)
  const actualMidIndex = offset + mid - 1 // for messaging
  yield {
    // Middle point calculation
    array: [...fullArrayRef],
    comparisonIndices: [...Array(n).keys()].map(i => offset + i),
    sortedIndices: Array.from(sortedGlobalIndices),
    activeRange: { start: offset, end: offset + n - 1 },
    message: `Calculated middle: ${actualMidIndex}. Dividing range [${offset}...${offset + n - 1}] into [${offset}...${actualMidIndex}] and [${offset + mid}...${offset + n - 1}]`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [9],
  }

  // These are for recursive calls and represent the structure to be sorted.
  const leftHalfRecursive = arr.slice(0, mid)
  const rightHalfRecursive = arr.slice(mid)
  liveStats.auxiliaryArrayWrites =
    (liveStats.auxiliaryArrayWrites || 0) + leftHalfRecursive.length + rightHalfRecursive.length

  // Recursive call for first half
  yield {
    array: [...fullArrayRef],
    message: `Calling mergeSort for left half: [${offset}...${actualMidIndex}]`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [10],
    activeRange: { start: offset, end: actualMidIndex },
  }
  yield* mergeSortRecursive(
    leftHalfRecursive, // Pass the slice for the left part
    fullArrayRef,
    offset,
    direction,
    sortedGlobalIndices,
    liveStats
  )

  // Recursive call for second half
  yield {
    array: [...fullArrayRef],
    message: `Calling mergeSort for right half: [${offset + mid}...${offset + n - 1}]`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [11],
    activeRange: { start: offset + mid, end: offset + n - 1 },
  }
  yield* mergeSortRecursive(
    rightHalfRecursive, // Pass the slice for the right part
    fullArrayRef,
    offset + mid,
    direction,
    sortedGlobalIndices,
    liveStats
  )

  // After recursive calls, fullArrayRef contains the sorted left and right halves in their respective positions.
  // Create new slices from fullArrayRef to get the *sorted* data for the merge step.
  const sortedLeftHalfForMerge = fullArrayRef.slice(offset, offset + mid)
  const sortedRightHalfForMerge = fullArrayRef.slice(offset + mid, offset + n)

  // Account for the creation of these temporary arrays for the merge inputs
  liveStats.auxiliaryArrayWrites =
    (liveStats.auxiliaryArrayWrites || 0) +
    sortedLeftHalfForMerge.length +
    sortedRightHalfForMerge.length

  // The first parameter to merge (targetArr) is the current slice `arr`.
  // Merge reads from sortedLeftHalfForMerge and sortedRightHalfForMerge, and writes sorted output to fullArrayRef.
  yield {
    array: [...fullArrayRef],
    message: `Calling merge for range [${offset}...${offset + n - 1}]`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [12],
    activeRange: { start: offset, end: offset + n - 1 },
  }
  yield* merge(
    arr, // This is the slice `arr` for the current level of recursion
    sortedLeftHalfForMerge,
    sortedRightHalfForMerge,
    fullArrayRef,
    offset,
    direction,
    sortedGlobalIndices,
    liveStats
  )

  for (let i = 0; i < n; i++) {
    sortedGlobalIndices.add(offset + i)
  }
  yield {
    array: [...fullArrayRef],
    comparisonIndices: [...Array(n).keys()].map(i => offset + i),
    sortedIndices: Array.from(sortedGlobalIndices),
    activeRange: { start: offset, end: offset + n - 1 },
    message: `Merged range [${offset}...${offset + n - 1}] is now sorted.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [13],
  }
}

// Updated type to use generic Generator
const merge = function* (
  _targetArr: number[], // The slice to merge results into (now unused, writes directly to fullArrayRef at offset)
  leftHalf: number[],
  rightHalf: number[],
  fullArrayRef: number[], // Reference to the original array for yielding global state
  offset: number, // Start index of targetArr in fullArrayRef
  direction: 'asc' | 'desc',
  sortedGlobalIndices: Set<number>,
  liveStats: Partial<SortStats> // Added liveStats
): Generator<SortStep, void, void> {
  let i = 0
  let j = 0
  let k = offset // k is the write index into fullArrayRef
  const leftLen = leftHalf.length
  const rightLen = rightHalf.length

  yield {
    // Entering merge function
    array: [...fullArrayRef],
    comparisonIndices: [...Array(leftLen).keys()]
      .map(idx => offset + idx) // Left part in full array
      .concat([...Array(rightLen).keys()].map(idx => offset + leftLen + idx)), // Right part in full array
    highlightedIndices: [offset + i, offset + leftLen + j].filter(
      idx => idx < offset + leftLen + rightLen
    ),
    sortedIndices: Array.from(sortedGlobalIndices),
    activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    message: `merge(arr, ${offset}, ${offset + leftLen - 1}, ${offset + leftLen + rightLen - 1}). Left temp: [${leftHalf.join(',')}], Right temp: [${rightHalf.join(',')}]`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [16],
  }

  yield {
    // n1 = middle - left + 1
    array: [...fullArrayRef],
    message: `n1 = ${leftLen}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [17],
    activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
  }
  yield {
    // n2 = right - middle
    array: [...fullArrayRef],
    message: `n2 = ${rightLen}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [18],
    activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
  }
  yield {
    // L = new array[n1]
    array: [...fullArrayRef],
    message: `Created temp array L of size ${leftLen}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [19],
    activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
  }
  yield {
    // R = new array[n2]
    array: [...fullArrayRef],
    message: `Created temp array R of size ${rightLen}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [20],
    activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
  }
  // Pseudo lines 14 & 15 (copy to temp arrays) are implicitly covered by slice before calling merge

  yield {
    // i = 0; j = 0; k = left;
    array: [...fullArrayRef],
    message: `Initializing indices: i=0 (for L), j=0 (for R), k=${offset} (for main array)`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [27],
    activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
  }

  while (i < leftLen && j < rightLen) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    yield {
      // while (i < n1 && j < n2)
      array: [...fullArrayRef],
      highlightedIndices: [k],
      comparisonIndices: [offset + i, offset + leftLen + j],
      sortedIndices: Array.from(sortedGlobalIndices),
      message: `Comparing L[${i}] (${leftHalf[i]}) and R[${j}] (${rightHalf[j]})`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [31],
      activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    }

    if (compare(leftHalf[i], rightHalf[j], direction)) {
      yield {
        // if (L[i] <= R[j])
        array: [...fullArrayRef],
        message: `${leftHalf[i]} <= ${rightHalf[j]} (or chosen for stability/desc). Taking from L.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [32],
        highlightedIndices: [k],
        activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
      }
      fullArrayRef[k] = leftHalf[i]
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      yield {
        array: [...fullArrayRef],
        message: `Placed ${leftHalf[i]} at index ${k}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [32],
        highlightedIndices: [k],
        activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
      }
      i++
      yield {
        array: [...fullArrayRef],
        message: `Incremented i to ${i}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [33],
        highlightedIndices: [k],
        activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
      }
    } else {
      yield {
        // else (L[i] > R[j])
        array: [...fullArrayRef],
        message: `${leftHalf[i]} > ${rightHalf[j]} (or chosen for desc). Taking from R.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [35],
        highlightedIndices: [k],
        activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
      }
      fullArrayRef[k] = rightHalf[j]
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      yield {
        array: [...fullArrayRef],
        message: `Placed ${rightHalf[j]} at index ${k}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [35],
        highlightedIndices: [k],
        activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
      }
      j++
      yield {
        array: [...fullArrayRef],
        message: `Incremented j to ${j}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [36],
        highlightedIndices: [k],
        activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
      }
    }
    // Closing brace of if/else is pseudo line 38
    k++
    yield {
      array: [...fullArrayRef],
      message: `Incremented k to ${k}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [38],
      highlightedIndices: [k - 1], // Show where element was just placed
      activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    }
  }
  // Closing brace of while is pseudo line 39

  while (i < leftLen) {
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    fullArrayRef[k] = leftHalf[i]
    yield {
      array: [...fullArrayRef],
      message: `Copying remaining elements from L. L[${i}] = ${leftHalf[i]}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [41],
      highlightedIndices: [k],
      activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    }
    i++
    k++
    yield {
      array: [...fullArrayRef],
      message: `Placed ${fullArrayRef[k - 1]} at index ${k - 1}. Incremented i to ${i}, k to ${k}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [42, 43], // Covers L[k]=L[i], i++, k++
      highlightedIndices: [k - 1],
      activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    }
  }
  // Closing brace of while is pseudo line 44

  while (j < rightLen) {
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    fullArrayRef[k] = rightHalf[j]
    yield {
      array: [...fullArrayRef],
      message: `Copying remaining elements from R. R[${j}] = ${rightHalf[j]}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [46],
      highlightedIndices: [k],
      activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    }
    j++
    k++
    yield {
      array: [...fullArrayRef],
      message: `Placed ${fullArrayRef[k - 1]} at index ${k - 1}. Incremented j to ${j}, k to ${k}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [47, 48], // Covers L[k]=R[j], j++, k++
      highlightedIndices: [k - 1],
      activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    }
  }
  // Closing brace of while is pseudo line 49
  // Closing brace of merge function is pseudo line 50
}

export const mergeSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray] // Main array copy for this top-level call
  const n = arr.length
  const sortedGlobalIndices = new Set<number>()

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Merge Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0, // Merge sort doesn\'t swap in the traditional sense for this stat
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedGlobalIndices),
    message: 'Merge Sort Initializing...',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0], // procedure mergeSort(list, direction)
  }

  if (n <= 1) {
    if (n === 1) sortedGlobalIndices.add(0) // Mark single element as sorted
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedGlobalIndices),
      message: n === 1 ? 'Array has 1 element, considered sorted.' : 'Array is empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [2], // if n <= 1 then return list
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  // Initial call to the recursive helper
  // fullArrayRef is initially the same as arr for the top-level call.
  yield {
    array: [...arr],
    message: `Initial call to _mergeSortRecursive for range [0...${n - 1}]`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [3], // _mergeSortRecursive(list, 0, n - 1, direction)
    activeRange: { start: 0, end: n - 1 },
  }
  yield* mergeSortRecursive(arr, arr, 0, direction, sortedGlobalIndices, liveStats)

  // Final state after all merges are complete
  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()], // All indices are sorted
    message: 'Merge Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [5], // end procedure (for main mergeSort)
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
