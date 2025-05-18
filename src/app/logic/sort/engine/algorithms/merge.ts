'use client'

import { SortGenerator, SortStep, SortStats, AuxiliaryStructure } from '../types'

// Comparison function based on direction
const compare = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  return direction === 'asc' ? a <= b : a >= b // Use <= or >= for stability
}

// Updated type to use generic Generator
const mergeSortRecursive = function* (
  arrSliceToProcess: number[], // Current slice being processed by this recursive call
  fullArrayRef: number[], // Reference to the *original* array for yielding global state
  offset: number, // Start index of `arrSliceToProcess` within `fullArrayRef`
  direction: 'asc' | 'desc',
  sortedGlobalIndices: Set<number>, // Set of globally confirmed sorted indices
  liveStats: Partial<SortStats>,
  depth: number // For tracking recursion depth in messages
): Generator<SortStep, void, void> {
  const n = arrSliceToProcess.length
  const currentRangeEnd = offset + n - 1

  yield {
    array: [...fullArrayRef],
    activeRange: { start: offset, end: currentRangeEnd },
    message: `(Depth ${depth}) Entering mergeSortRecursive for A[${offset}...${currentRangeEnd}]. Slice: [${arrSliceToProcess.join(',')}]`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [7], // procedure _mergeSortRecursive
    sortedIndices: Array.from(sortedGlobalIndices),
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: Array.from({ length: n }, (_, idx) => offset + idx), // Highlight the current slice
  }

  if (n <= 1) {
    // For visualization, we can mark single elements as "sorted" within their context.
    // The overall sortedGlobalIndices will be built up by merged ranges.
    const singleElementHighlight = n === 1 ? [offset] : []
    if (n === 1) sortedGlobalIndices.add(offset) // Add to actual sorted set if it's a single element base case

    yield {
      array: [...fullArrayRef],
      activeRange: { start: offset, end: currentRangeEnd },
      message: `(Depth ${depth}) Base case: A[${offset}...${currentRangeEnd}] (length ${n}) is considered sorted.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [8], // if left < right (false here)
      sortedIndices: Array.from(sortedGlobalIndices),
      swappingIndices: null,
      comparisonIndices: [],
      highlightedIndices: singleElementHighlight,
    }
    return
  }

  const midPointRelative = Math.floor(n / 2)
  const midPointAbsolute = offset + midPointRelative - 1 // End of left half
  const rightHalfStartAbsolute = offset + midPointRelative // Start of right half

  yield {
    array: [...fullArrayRef],
    activeRange: { start: offset, end: currentRangeEnd }, // Entire current range being divided
    message: `(Depth ${depth}) Dividing A[${offset}...${currentRangeEnd}]. Midpoint at index ${midPointAbsolute}. Left: A[${offset}...${midPointAbsolute}], Right: A[${rightHalfStartAbsolute}...${currentRangeEnd}].`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [9], // middle = ...
    sortedIndices: Array.from(sortedGlobalIndices),
    swappingIndices: null,
    comparisonIndices: [],
    // Highlight the two sub-ranges that will be created
    highlightedIndices: [
      ...Array.from({ length: midPointRelative }, (_, idx) => offset + idx),
      ...Array.from({ length: n - midPointRelative }, (_, idx) => rightHalfStartAbsolute + idx),
    ],
  }

  const leftHalfSlice = arrSliceToProcess.slice(0, midPointRelative)
  const rightHalfSlice = arrSliceToProcess.slice(midPointRelative)
  liveStats.auxiliaryArrayWrites =
    (liveStats.auxiliaryArrayWrites || 0) + leftHalfSlice.length + rightHalfSlice.length

  // Recursive call for first half
  yield* mergeSortRecursive(
    leftHalfSlice,
    fullArrayRef,
    offset,
    direction,
    new Set(sortedGlobalIndices), // Pass a copy so child modifications don't affect this level's sibling
    liveStats,
    depth + 1
  )
  yield {
    array: [...fullArrayRef],
    activeRange: { start: offset, end: midPointAbsolute }, // Focus on the left half that was just processed
    message: `(Depth ${depth}) Left half A[${offset}...${midPointAbsolute}] sorted.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [10], // _mergeSortRecursive(list, left, middle, direction)
    sortedIndices: Array.from(sortedGlobalIndices), // This level's sortedGlobalIndices
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: Array.from({ length: midPointRelative }, (_, idx) => offset + idx),
  }

  // Recursive call for second half
  yield* mergeSortRecursive(
    rightHalfSlice,
    fullArrayRef,
    rightHalfStartAbsolute,
    direction,
    new Set(sortedGlobalIndices), // Pass a copy
    liveStats,
    depth + 1
  )
  yield {
    array: [...fullArrayRef],
    activeRange: { start: rightHalfStartAbsolute, end: currentRangeEnd }, // Focus on right half
    message: `(Depth ${depth}) Right half A[${rightHalfStartAbsolute}...${currentRangeEnd}] sorted.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [11], // _mergeSortRecursive(list, middle + 1, right, direction)
    sortedIndices: Array.from(sortedGlobalIndices),
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: Array.from(
      { length: n - midPointRelative },
      (_, idx) => rightHalfStartAbsolute + idx
    ),
  }

  // Create sorted slices FROM fullArrayRef FOR MERGING - reflects results of recursive calls
  const sortedLeftForMerge = fullArrayRef.slice(offset, rightHalfStartAbsolute)
  const sortedRightForMerge = fullArrayRef.slice(rightHalfStartAbsolute, offset + n)
  // liveStats.auxiliaryArrayWrites already accounted for when slices were made for recursion
  // Re-slicing for merge doesn't incur new aux writes unless these are considered new temp arrays

  const leftMergeAux: AuxiliaryStructure = {
    id: `merge-left-${offset}-${depth}`,
    title: `Left to Merge (A[${offset}...${midPointAbsolute}])`,
    data: sortedLeftForMerge.map((value, idx) => ({
      value,
      originalIndex: offset + idx,
      id: `L_orig_${offset}_${idx}`,
    })),
    displaySlot: 'merge-left-half',
  }
  const rightMergeAux: AuxiliaryStructure = {
    id: `merge-right-${rightHalfStartAbsolute}-${depth}`,
    title: `Right to Merge (A[${rightHalfStartAbsolute}...${currentRangeEnd}])`,
    data: sortedRightForMerge.map((value, idx) => ({
      value,
      originalIndex: rightHalfStartAbsolute + idx,
      id: `R_orig_${rightHalfStartAbsolute}_${idx}`,
    })),
    displaySlot: 'merge-right-half',
  }

  yield {
    array: [...fullArrayRef],
    activeRange: { start: offset, end: currentRangeEnd }, // The full range to be merged
    message: `(Depth ${depth}) Preparing to merge A[${offset}...${midPointAbsolute}] and A[${rightHalfStartAbsolute}...${currentRangeEnd}].`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [12], // _merge(...)
    sortedIndices: Array.from(sortedGlobalIndices),
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: Array.from({ length: n }, (_, idx) => offset + idx), // Highlight range being merged
    currentPassAuxiliaryStructure: null,
    historicalAuxiliaryStructures: [leftMergeAux, rightMergeAux],
  }

  yield* merge(
    sortedLeftForMerge,
    sortedRightForMerge,
    fullArrayRef,
    offset,
    direction,
    sortedGlobalIndices, // Pass the current level's sorted set; merge itself doesn't modify it
    liveStats,
    depth // Pass depth for consistent messaging
  )

  // After merge, this current range [offset...currentRangeEnd] is now sorted.
  // Add all its indices to the sortedGlobalIndices set for this level and potentially propagate up.
  for (let k = offset; k <= currentRangeEnd; k++) {
    sortedGlobalIndices.add(k)
  }

  yield {
    array: [...fullArrayRef],
    activeRange: { start: offset, end: currentRangeEnd },
    message: `(Depth ${depth}) Range A[${offset}...${currentRangeEnd}] is now merged and sorted.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [13], // end if (after merge call in recursive function)
    sortedIndices: Array.from(sortedGlobalIndices), // Reflect newly updated sorted indices
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: Array.from({ length: n }, (_, idx) => offset + idx),
    historicalAuxiliaryStructures: [], // Clear aux from this level as merge is done
  }
}

const merge = function* (
  leftHalf: number[],
  rightHalf: number[],
  fullArrayRef: number[], // Reference to the original array for yielding global state and writing results
  writeOffset: number, // Start index in fullArrayRef where merged result should be written
  direction: 'asc' | 'desc',
  _sortedGlobalIndices: Set<number>, // Currently not directly modified by merge, but passed for consistency
  liveStats: Partial<SortStats>,
  depth: number // For tracking recursion depth in messages
): Generator<SortStep, void, void> {
  let i = 0 // Pointer for leftHalf
  let j = 0 // Pointer for rightHalf
  let k = writeOffset // Pointer for fullArrayRef (where to write next merged element)

  const leftLen = leftHalf.length
  const rightLen = rightHalf.length
  const mergeRangeEnd = writeOffset + leftLen + rightLen - 1

  const getAuxiliaryData = (arr: number[], baseId: string) =>
    arr.map((val, idx) => ({ value: val, id: `${baseId}_${idx}` }))

  // Create AuxiliaryStructure objects for left and right halves for this merge operation
  const currentLeftAux: AuxiliaryStructure = {
    id: `merge-active-left-${writeOffset}-${depth}`,
    title: `Merging: Left Source [${leftHalf.join(',')}]`,
    data: getAuxiliaryData(leftHalf, `L_merge_${writeOffset}`),
    displaySlot: 'merge-left-active',
  }
  const currentRightAux: AuxiliaryStructure = {
    id: `merge-active-right-${writeOffset}-${depth}`,
    title: `Merging: Right Source [${rightHalf.join(',')}]`,
    data: getAuxiliaryData(rightHalf, `R_merge_${writeOffset}`),
    displaySlot: 'merge-right-active',
  }

  yield {
    array: [...fullArrayRef],
    activeRange: { start: writeOffset, end: mergeRangeEnd },
    message: `(Depth ${depth}) Merging [${leftHalf.join(',')}] and [${rightHalf.join(',')}]. Target A[${writeOffset}...${mergeRangeEnd}].`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [16, 17, 18, 19, 20, 27], // Covers merge proc, n1, n2, L/R array creation, i,j,k init
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [k], // Highlight start of merge area in main array
    historicalAuxiliaryStructures: [{ ...currentLeftAux }, { ...currentRightAux }], // Show both halves before merge loop
  }

  while (i < leftLen && j < rightLen) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    const iGlobal = writeOffset + i // Conceptual global index for leftHalf[i]
    const jGlobal = writeOffset + leftLen + j // Conceptual global index for rightHalf[j]

    if (compare(leftHalf[i], rightHalf[j], direction)) {
      const takenValue = leftHalf[i]
      fullArrayRef[k] = takenValue
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      i++

      currentLeftAux.data = getAuxiliaryData(leftHalf.slice(i), `L_merge_${writeOffset}_sl`)
      currentLeftAux.title = `Merging: Left (Took ${takenValue}) [${leftHalf.slice(i).join(',')}]`

      yield {
        array: [...fullArrayRef],
        activeRange: { start: writeOffset, end: mergeRangeEnd },
        highlightedIndices: [k], // Highlight written position in main array
        // Comparison was between leftHalf[i-1] and rightHalf[j] (using original values of i,j for this step)
        comparisonIndices: [iGlobal, jGlobal],
        swappingIndices: null, // It's a write from aux to main
        message: `(Depth ${depth}) Compared L[${i - 1}] (${takenValue}) with R[${j}] (${rightHalf[j]}). Took ${takenValue} from Left. Placed at A[${k}]. Left remaining: ${leftLen - i}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [31, 32, 33],
        currentPassAuxiliaryStructure: { ...currentLeftAux },
        historicalAuxiliaryStructures: [{ ...currentRightAux }],
      }
    } else {
      const takenValue = rightHalf[j]
      fullArrayRef[k] = takenValue
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      j++

      currentRightAux.data = getAuxiliaryData(rightHalf.slice(j), `R_merge_${writeOffset}_sl`)
      currentRightAux.title = `Merging: Right (Took ${takenValue}) [${rightHalf.slice(j).join(',')}]`

      yield {
        array: [...fullArrayRef],
        activeRange: { start: writeOffset, end: mergeRangeEnd },
        highlightedIndices: [k],
        // Comparison was between leftHalf[i] and rightHalf[j-1]
        comparisonIndices: [iGlobal, jGlobal],
        swappingIndices: null,
        message: `(Depth ${depth}) Compared L[${i}] (${leftHalf[i]}) with R[${j - 1}] (${takenValue}). Took ${takenValue} from Right. Placed at A[${k}]. Right remaining: ${rightLen - j}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [34, 35, 36],
        currentPassAuxiliaryStructure: { ...currentRightAux },
        historicalAuxiliaryStructures: [{ ...currentLeftAux }],
      }
    }
    k++

    // Yield to show state before next comparison in the loop
    if (i < leftLen && j < rightLen) {
      yield {
        array: [...fullArrayRef],
        activeRange: { start: writeOffset, end: mergeRangeEnd },
        message: `(Depth ${depth}) Next comparison: L[${i}] (${leftHalf[i]}) vs R[${j}] (${rightHalf[j]}). Writing to A[${k}].`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [30], // while i < n1 and j < n2
        swappingIndices: null,
        comparisonIndices: [writeOffset + i, writeOffset + leftLen + j], // Conceptual global indices
        highlightedIndices: [k], // Highlight next write position
        currentPassAuxiliaryStructure: null, // No single aux structure is primary here, context from historical
        historicalAuxiliaryStructures: [{ ...currentLeftAux }, { ...currentRightAux }],
      }
    }
  }

  // Copy remaining elements of leftHalf, if any
  while (i < leftLen) {
    const takenValue = leftHalf[i]
    fullArrayRef[k] = takenValue
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    i++

    currentLeftAux.data = getAuxiliaryData(leftHalf.slice(i), `L_merge_${writeOffset}_rem`)
    currentLeftAux.title = `Merging: Left (Copying ${takenValue}) [${leftHalf.slice(i).join(',')}]`

    yield {
      array: [...fullArrayRef],
      activeRange: { start: writeOffset, end: mergeRangeEnd },
      highlightedIndices: [k], // Highlight written position
      message: `(Depth ${depth}) Copying remaining ${takenValue} from Left. Placed at A[${k}]. Left remaining: ${leftLen - i}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [39, 40, 41], // while i < n1, list[k]=L[i], i++, k++
      swappingIndices: null,
      comparisonIndices: [],
      currentPassAuxiliaryStructure: { ...currentLeftAux },
      historicalAuxiliaryStructures: [
        {
          ...currentRightAux,
          data: getAuxiliaryData(
            currentRightAux.data.map(item => (typeof item === 'number' ? item : item.value)),
            `R_merge_${writeOffset}_rem_ctx`
          ),
        },
      ], // Show right as context, potentially empty
    }
    k++
  }

  // Copy remaining elements of rightHalf, if any
  while (j < rightLen) {
    const takenValue = rightHalf[j]
    fullArrayRef[k] = takenValue
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    j++

    currentRightAux.data = getAuxiliaryData(rightHalf.slice(j), `R_merge_${writeOffset}_rem`)
    currentRightAux.title = `Merging: Right (Copying ${takenValue}) [${rightHalf.slice(j).join(',')}]`

    yield {
      array: [...fullArrayRef],
      activeRange: { start: writeOffset, end: mergeRangeEnd },
      highlightedIndices: [k], // Highlight written position
      message: `(Depth ${depth}) Copying remaining ${takenValue} from Right. Placed at A[${k}]. Right remaining: ${rightLen - j}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [44, 45, 46], // while j < n2, list[k]=R[j], j++, k++
      swappingIndices: null,
      comparisonIndices: [],
      currentPassAuxiliaryStructure: { ...currentRightAux },
      historicalAuxiliaryStructures: [
        {
          ...currentLeftAux,
          data: getAuxiliaryData(
            currentLeftAux.data.map(item => (typeof item === 'number' ? item : item.value)),
            `L_merge_${writeOffset}_rem_ctx`
          ),
        },
      ], // Show left as context
    }
    k++
  }

  yield {
    array: [...fullArrayRef],
    activeRange: { start: writeOffset, end: mergeRangeEnd },
    message: `(Depth ${depth}) Merge complete for range A[${writeOffset}...${mergeRangeEnd}].`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [48], // end merge procedure
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: Array.from(
      { length: mergeRangeEnd - writeOffset + 1 },
      (_, idx) => writeOffset + idx
    ),
    historicalAuxiliaryStructures: [], // Clear aux structures for this level as merge is done
  }
}

export const mergeSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray] // Create a mutable copy to sort in-place for the generator
  const n = arr.length
  const sortedGlobalIndices = new Set<number>()

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Merge Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0, // Merge sort doesn't swap in the traditional sense, but we count main array writes
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
  }

  if (n <= 1) {
    if (n === 1) sortedGlobalIndices.add(0)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedGlobalIndices),
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1, 2], // procedure, n=len, if n<=1
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedGlobalIndices),
    message: 'Starting Merge Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0], // procedure mergeSort
  }

  // Initial call to the recursive helper
  // arr is passed as arrSliceToProcess and also as fullArrayRef because the top-level call works on the whole array.
  yield* mergeSortRecursive(arr, arr, 0, direction, sortedGlobalIndices, liveStats, 0)

  // After all recursive calls and merges, the original `arr` is sorted.
  // Ensure all indices are marked sorted for final display
  for (let k = 0; k < n; ++k) sortedGlobalIndices.add(k)

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedGlobalIndices),
    message: 'Merge Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [4, 5], // return list, end procedure
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
