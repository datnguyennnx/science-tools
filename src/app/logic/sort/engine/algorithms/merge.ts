'use client' // If this engine code is intended to be bundled with client components

import { SortStep, SortGenerator, SortStats } from '../types'

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
    currentPseudoCodeLine: 0,
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
      currentPseudoCodeLine: 1, // if (left < right) is false or base case
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
    currentPseudoCodeLine: 1,
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
    currentPseudoCodeLine: 2,
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
    currentPseudoCodeLine: 3,
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
    currentPseudoCodeLine: 4,
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
    currentPseudoCodeLine: 5,
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
    currentPseudoCodeLine: 6, // End of if block
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
    currentPseudoCodeLine: 9,
  }

  yield {
    // n1 = middle - left + 1
    array: [...fullArrayRef],
    message: `n1 = ${leftLen}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 10,
    activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
  }
  yield {
    // n2 = right - middle
    array: [...fullArrayRef],
    message: `n2 = ${rightLen}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 11,
    activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
  }
  yield {
    // L = new array[n1]
    array: [...fullArrayRef],
    message: `Created temp array L of size ${leftLen}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 12,
    activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
  }
  yield {
    // R = new array[n2]
    array: [...fullArrayRef],
    message: `Created temp array R of size ${rightLen}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 13,
    activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
  }
  // Pseudo lines 14 & 15 (copy to temp arrays) are implicitly covered by slice before calling merge

  yield {
    // i = 0; j = 0; k = left;
    array: [...fullArrayRef],
    message: `Initializing indices: i=0 (for L), j=0 (for R), k=${offset} (for main array)`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 16,
    activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
  }

  while (i < leftLen && j < rightLen) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    yield {
      // while (i < n1 && j < n2)
      array: [...fullArrayRef],
      // Highlight elements in temp arrays conceptually via message or a dedicated aux structure if desired
      highlightedIndices: [k], // Highlight current write position in fullArrayRef
      comparisonIndices: [offset + i, offset + leftLen + j], // These are conceptual original positions
      sortedIndices: Array.from(sortedGlobalIndices),
      message: `Comparing L[${i}] (${leftHalf[i]}) and R[${j}] (${rightHalf[j]})`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 17,
      activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    }

    if (compare(leftHalf[i], rightHalf[j], direction)) {
      yield {
        // if (L[i] <= R[j])
        array: [...fullArrayRef],
        message: `${leftHalf[i]} <= ${rightHalf[j]} (or chosen for stability/desc). Taking from L.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 18,
        highlightedIndices: [k],
        activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
      }
      fullArrayRef[k] = leftHalf[i]
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      yield {
        // array[k] = L[i]
        array: [...fullArrayRef],
        message: `Placed ${leftHalf[i]} at index ${k}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 19,
        highlightedIndices: [k],
        activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
      }
      i++
      yield {
        // i++
        array: [...fullArrayRef],
        message: `Incremented i to ${i}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 20,
        highlightedIndices: [k],
        activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
      }
    } else {
      yield {
        // else (L[i] > R[j])
        array: [...fullArrayRef],
        message: `${leftHalf[i]} > ${rightHalf[j]} (or chosen for desc). Taking from R.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 21,
        highlightedIndices: [k],
        activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
      }
      fullArrayRef[k] = rightHalf[j]
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      yield {
        // array[k] = R[j]
        array: [...fullArrayRef],
        message: `Placed ${rightHalf[j]} at index ${k}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 22,
        highlightedIndices: [k],
        activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
      }
      j++
      yield {
        // j++
        array: [...fullArrayRef],
        message: `Incremented j to ${j}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 23,
        highlightedIndices: [k],
        activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
      }
    }
    // Closing brace of if/else is pseudo line 24
    k++
    yield {
      // k++
      array: [...fullArrayRef],
      message: `Incremented k to ${k}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 25,
      highlightedIndices: [k - 1], // Show where element was just placed
      activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    }
  }
  // Closing brace of while is pseudo line 26

  while (i < leftLen) {
    yield {
      // while (i < n1)
      array: [...fullArrayRef],
      message: `Copying remaining elements from L. L[${i}] = ${leftHalf[i]}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 27,
      highlightedIndices: [k],
      activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    }
    fullArrayRef[k] = leftHalf[i]
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    i++
    k++
    yield {
      // array[k] = L[i]; i++; k++;
      array: [...fullArrayRef],
      message: `Placed ${fullArrayRef[k - 1]} at index ${k - 1}. Incremented i to ${i}, k to ${k}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 28,
      highlightedIndices: [k - 1],
      activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    }
  }
  // Closing brace of while is pseudo line 29

  while (j < rightLen) {
    yield {
      // while (j < n2)
      array: [...fullArrayRef],
      message: `Copying remaining elements from R. R[${j}] = ${rightHalf[j]}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 30,
      highlightedIndices: [k],
      activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    }
    fullArrayRef[k] = rightHalf[j]
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    j++
    k++
    yield {
      // array[k] = R[j]; j++; k++;
      array: [...fullArrayRef],
      message: `Placed ${fullArrayRef[k - 1]} at index ${k - 1}. Incremented j to ${j}, k to ${k}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 31,
      highlightedIndices: [k - 1],
      activeRange: { start: offset, end: offset + leftLen + rightLen - 1 },
    }
  }
  // Closing brace of while is pseudo line 32
  // Closing brace of merge function is pseudo line 33
}

export const mergeSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedGlobalIndices = new Set<number>()

  const finalStats: SortStats = {
    algorithmName: 'Merge Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0, // Writes to leftHalf/rightHalf during slice, and targetArr during merge
    // Other stats can be initialized to 0 or undefined
    swaps: 0, // Merge sort doesn't swap in the typical sense, but moves data
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...finalStats },
      currentPseudoCodeLine: 0, // Or specific line indicating base case
    }
    return { finalArray: arr, stats: finalStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedGlobalIndices),
    message: 'Starting Merge Sort',
    currentStats: { ...finalStats },
    currentPseudoCodeLine: 0, // Main function call
  }

  // Pass arr.slice() as the initial 'arr' for recursion to avoid modifying initialArray directly in recursive calls
  // mergeSortRecursive will write to the `arr` (which is fullArrayRef for it)
  yield* mergeSortRecursive(arr.slice(), arr, 0, direction, sortedGlobalIndices, finalStats)

  for (let i = 0; i < n; i++) sortedGlobalIndices.add(i)
  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedGlobalIndices),
    message: 'Merge Sort Complete!',
    currentStats: { ...finalStats },
    currentPseudoCodeLine: 7, // End of mergeSort function
  }

  return { finalArray: arr, stats: finalStats }
}
