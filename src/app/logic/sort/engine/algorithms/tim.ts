'use client'

import { SortGenerator, SortStep, SortStats, AuxiliaryStructure } from '../types'

// Define the size of the runs (a common value in TimSort implementations)
const RUN_SIZE = 32

// Insertion sort for sorting runs (adapted to work on a slice and yield steps within the main array context)
const insertionSortForRunGenerator = function* (
  arr: number[],
  left: number,
  right: number, // inclusive right boundary of the run
  direction: 'asc' | 'desc',
  fullArrayRef: number[], // Reference to the full array for yielding
  liveStats: Partial<SortStats>,
  currentPseudoCodeLine: number[],
  passId: string // Added to create unique aux IDs
): Generator<SortStep, void, void> {
  const runLength = right - left + 1

  const getCurrentRunAux = (
    titleSuffix: string,
    highlightKeyIndexInRun?: number
  ): AuxiliaryStructure => ({
    id: `timsort-insertion-run-${passId}-${left}-${right}-${titleSuffix.toLowerCase().replace(/\s+/g, '-')}`,
    title: `Insertion Sort on Run A[${left}-${right}] (${titleSuffix})`,
    data: arr.slice(left, right + 1).map((value, indexInRun) => ({
      value,
      originalIndex: left + indexInRun, // Global index in the main array
      isHighlighted: highlightKeyIndexInRun === indexInRun,
    })),
    displaySlot: `timsort-current-run-${passId}`,
  })

  yield {
    array: [...fullArrayRef],
    activeRange: { start: left, end: right },
    message: `Sorting run A[${left}...${right}] with Insertion Sort.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: currentPseudoCodeLine, // e.g., PT: [calculate_min_run_length, for_each_run_insertion_sort]
    currentPassAuxiliaryStructure: getCurrentRunAux('Start'),
    historicalAuxiliaryStructures: [],
  }

  for (let i = left + 1; i <= right; i++) {
    const key = arr[i]
    let j = i - 1
    const originalKeyIndexGlobal = i // original global index of the key
    let elementsShifted = 0
    let lastComparedValue: number | undefined = undefined
    let lastComparedIndexGlobal: number | undefined = undefined

    // Initial yield for selecting the key within the run
    yield {
      array: [...fullArrayRef],
      highlightedIndices: [originalKeyIndexGlobal, ...(j >= left ? [j] : [])], // Highlight key and first comparison target
      comparisonIndices: j >= left ? [originalKeyIndexGlobal, j] : [originalKeyIndexGlobal],
      activeRange: { start: left, end: right },
      message: `Run A[${left}...${right}]: Selected key ${key} (from A[${originalKeyIndexGlobal}]). Comparing with A[${j >= left ? j : '?'}] (${j >= left ? arr[j] : 'run start'}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine, // PT: Line for selecting key/starting inner loop of insertion
      currentPassAuxiliaryStructure: getCurrentRunAux('Selecting Key', i - left),
    }

    const initialJ = j // For message generation if shifts occur

    while (j >= left) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      lastComparedValue = arr[j]
      lastComparedIndexGlobal = j
      const shouldInsertBefore = direction === 'asc' ? key < arr[j] : key > arr[j]
      if (!shouldInsertBefore) {
        break // Key has found its position relative to arr[j]
      }

      // Shift arr[j] to arr[j+1]
      arr[j + 1] = arr[j]
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      elementsShifted++
      j--
      // NO YIELD INSIDE THIS SHIFTING LOOP
    }

    // Place the key in its correct position
    const finalKeyPositionGlobal = j + 1
    if (arr[finalKeyPositionGlobal] !== key || finalKeyPositionGlobal !== originalKeyIndexGlobal) {
      arr[finalKeyPositionGlobal] = key
      if (finalKeyPositionGlobal !== originalKeyIndexGlobal) {
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      }
    }

    let suffixPart1 = ''
    if (elementsShifted > 0) {
      suffixPart1 = `Shifted ${elementsShifted} element(s) (from A[${initialJ}] down to A[${finalKeyPositionGlobal}]). `
    } else {
      if (finalKeyPositionGlobal === originalKeyIndexGlobal) {
        suffixPart1 = `Element was already in its gapped sorted position. `
      } else {
        suffixPart1 = `No elements shifted. `
      }
    }

    let suffixPart2 = ''
    if (lastComparedValue !== undefined && lastComparedIndexGlobal !== undefined) {
      suffixPart2 = `Last comparison: ${key} vs ${lastComparedValue} (at A[${lastComparedIndexGlobal}]).`
    } else if (j < left && elementsShifted === 0 && finalKeyPositionGlobal === left) {
      suffixPart2 = `Key is smallest/largest, placed at start of run (A[${left}]).`
    }
    const messageSuffix = suffixPart1 + suffixPart2

    yield {
      array: [...fullArrayRef],
      highlightedIndices: [finalKeyPositionGlobal, originalKeyIndexGlobal],
      comparisonIndices:
        lastComparedIndexGlobal !== undefined
          ? [originalKeyIndexGlobal, lastComparedIndexGlobal]
          : [originalKeyIndexGlobal],
      swappingIndices:
        finalKeyPositionGlobal !== originalKeyIndexGlobal
          ? [originalKeyIndexGlobal, finalKeyPositionGlobal]
          : null,
      activeRange: { start: left, end: right },
      message: `Run A[${left}...${right}]: Inserted key ${key} at A[${finalKeyPositionGlobal}]. ${messageSuffix}`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine,
      currentPassAuxiliaryStructure: getCurrentRunAux(
        'Key Inserted',
        finalKeyPositionGlobal - left
      ),
    }
  }
  yield {
    array: [...fullArrayRef],
    activeRange: { start: left, end: right },
    sortedIndices: [...Array(runLength).keys()].map(k => left + k), // Mark run as sorted locally
    message: `Run A[${left}...${right}] sorted.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: currentPseudoCodeLine, // PT: End of insertion sort for run
    currentPassAuxiliaryStructure: getCurrentRunAux('Sorted'),
  }
}

// Merge function similar to Merge Sort, adapted for runs
const mergeRunsGenerator = function* (
  arr: number[],
  left: number,
  mid: number,
  right: number, // inclusive right boundary
  direction: 'asc' | 'desc',
  fullArrayRef: number[], // Reference to the full array for yielding
  liveStats: Partial<SortStats>, // Added liveStats
  currentPseudoCodeLine: number[] // Added currentPseudoCodeLine
): Generator<SortStep, void, void> {
  const len1 = mid - left + 1
  const len2 = right - mid
  const leftTemp = arr.slice(left, mid + 1)
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + len1
  const rightTemp = arr.slice(mid + 1, right + 1)
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + len2

  const leftTempAux: AuxiliaryStructure = {
    id: `tim-merge-left-${left}-${mid}`,
    title: `Left Run Temp: [${leftTemp.join(',')}]`,
    data: leftTemp.map((value, idx) => ({ value, originalIndex: left + idx })),
    displaySlot: 'tim-merge-left-temp',
  }
  const rightTempAux: AuxiliaryStructure = {
    id: `tim-merge-right-${mid + 1}-${right}`,
    title: `Right Run Temp: [${rightTemp.join(',')}]`,
    data: rightTemp.map((value, idx) => ({ value, originalIndex: mid + 1 + idx })),
    displaySlot: 'tim-merge-right-temp',
  }

  yield {
    array: [...fullArrayRef],
    activeRange: { start: left, end: right },
    message: `Merging runs [${left}...${mid}] and [${mid + 1}...${right}].`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: currentPseudoCodeLine,
    currentPassAuxiliaryStructure: null,
    historicalAuxiliaryStructures: [leftTempAux, rightTempAux],
  }

  let i = 0
  let j = 0
  let k = left

  // Yield before starting the main merge loop, showing initial state of temp arrays
  yield {
    array: [...fullArrayRef],
    activeRange: { start: left, end: right },
    message: `Merging runs. Left: [${leftTemp.join(',')}] (len ${len1}). Right: [${rightTemp.join(',')}] (len ${len2}). Target A[${left}...${right}].`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: currentPseudoCodeLine, // PT: initial lines of merge
    historicalAuxiliaryStructures: [
      {
        id: leftTempAux.id,
        title: leftTempAux.title,
        displaySlot: leftTempAux.displaySlot,
        data: leftTempAux.data.map((chartItem, itemIdx) => {
          if (typeof chartItem === 'number') {
            return { value: chartItem, isHighlighted: itemIdx === i }
          }
          // chartItem is an object here
          return { ...chartItem, isHighlighted: itemIdx === i }
        }),
      },
      {
        id: rightTempAux.id,
        title: rightTempAux.title,
        displaySlot: rightTempAux.displaySlot,
        data: rightTempAux.data.map((chartItem, itemIdx) => {
          if (typeof chartItem === 'number') {
            return { value: chartItem, isHighlighted: itemIdx === j }
          }
          // chartItem is an object here
          return { ...chartItem, isHighlighted: itemIdx === j }
        }),
      },
    ],
    highlightedIndices: [k], // Highlight where first element will be written
  }

  while (i < len1 && j < len2) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    const valFromLeft = leftTemp[i]
    const valFromRight = rightTemp[j]
    let message: string

    const shouldTakeFromLeft =
      direction === 'asc' ? valFromLeft <= valFromRight : valFromLeft >= valFromRight

    if (shouldTakeFromLeft) {
      arr[k] = valFromLeft
      i++
      message = `Compared L[${i - 1}] (${valFromLeft}) with R[${j}] (${valFromRight}). Took ${valFromLeft} from Left. Placed at A[${k}]. Left remaining: ${len1 - i}.`
    } else {
      arr[k] = valFromRight
      j++
      message = `Compared L[${i}] (${valFromLeft}) with R[${j - 1}] (${valFromRight}). Took ${valFromRight} from Right. Placed at A[${k}]. Right remaining: ${len2 - j}.`
    }
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1

    // Construct currentLeftTempAuxState without spreading leftTempAux
    const currentLeftTempAuxState: AuxiliaryStructure = {
      id: `${leftTempAux.id}-step-${k}`,
      title: `Left Source (Next: ${i < len1 ? leftTemp[i] : 'empty'})`,
      data: leftTemp.map((val, idx) => ({
        value: val,
        originalIndex: left + idx,
        isDimmed: idx < (shouldTakeFromLeft ? i - 1 : i),
        isHighlighted: idx === (shouldTakeFromLeft ? i - 1 : i),
      })),
      displaySlot: leftTempAux.displaySlot,
    }

    // Construct currentRightTempAuxState without spreading rightTempAux
    const currentRightTempAuxState: AuxiliaryStructure = {
      id: `${rightTempAux.id}-step-${k}`,
      title: `Right Source (Next: ${j < len2 ? rightTemp[j] : 'empty'})`,
      data: rightTemp.map((val, idx) => ({
        value: val,
        originalIndex: mid + 1 + idx,
        isDimmed: idx < (shouldTakeFromLeft ? j : j - 1),
        isHighlighted: idx === (shouldTakeFromLeft ? j : j - 1),
      })),
      displaySlot: rightTempAux.displaySlot,
    }

    k++

    yield {
      array: [...fullArrayRef],
      activeRange: { start: left, end: right },
      highlightedIndices: [k - 1], // Highlight the index that was just written to
      comparisonIndices: [
        left + (shouldTakeFromLeft ? i - 1 : i),
        mid + 1 + (shouldTakeFromLeft ? j : j - 1),
      ], // Global indices of compared elements
      message: message,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine, // PT: lines for while, if/else, assignments
      historicalAuxiliaryStructures: [currentLeftTempAuxState, currentRightTempAuxState],
    }
  }

  // Consolidate copying remaining elements from leftTemp
  if (i < len1) {
    const startK = k
    const numToCopy = len1 - i
    for (let idx = 0; idx < numToCopy; idx++) {
      arr[k + idx] = leftTemp[i + idx]
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    }
    k += numToCopy
    i += numToCopy

    const finalLeftTempAuxState: AuxiliaryStructure = {
      id: `${leftTempAux.id}-step-remaining-left`,
      title: `Left Source (Copied Remaining ${numToCopy})`,
      data: leftTemp.map((val, idx_map) => ({
        value: val,
        originalIndex: left + idx_map,
        isDimmed: true, // All are now dimmed as they are copied
      })),
      displaySlot: leftTempAux.displaySlot,
    }
    const finalRightTempAuxStateUnchanged: AuxiliaryStructure = {
      id: `${rightTempAux.id}-step-remaining-left-context`,
      title: `Right Source (Unchanged)`,
      data: rightTemp.map((val, idx_map) => ({
        value: val,
        originalIndex: mid + 1 + idx_map,
        isDimmed: idx_map < j, // Dim what was already processed from right
        isHighlighted: false,
      })),
      displaySlot: rightTempAux.displaySlot,
    }

    yield {
      array: [...fullArrayRef],
      activeRange: { start: left, end: right },
      highlightedIndices: Array.from({ length: numToCopy }, (_, c_idx) => startK + c_idx),
      message: `Copied remaining ${numToCopy} element(s) from Left temp array to A[${startK}...${k - 1}].`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine, // PT: lines for copying remaining left elements
      historicalAuxiliaryStructures: [finalLeftTempAuxState, finalRightTempAuxStateUnchanged],
    }
  }

  // Consolidate copying remaining elements from rightTemp
  if (j < len2) {
    const startK = k
    const numToCopy = len2 - j
    for (let idx = 0; idx < numToCopy; idx++) {
      arr[k + idx] = rightTemp[j + idx]
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    }
    k += numToCopy
    j += numToCopy

    const finalRightTempAuxState: AuxiliaryStructure = {
      id: `${rightTempAux.id}-step-remaining-right`,
      title: `Right Source (Copied Remaining ${numToCopy})`,
      data: rightTemp.map((val, idx_map) => ({
        value: val,
        originalIndex: mid + 1 + idx_map,
        isDimmed: true, // All are now dimmed
      })),
      displaySlot: rightTempAux.displaySlot,
    }
    const finalLeftTempAuxStateUnchanged: AuxiliaryStructure = {
      id: `${leftTempAux.id}-step-remaining-right-context`,
      title: `Left Source (All Copied)`,
      data: leftTemp.map((val, idx_map) => ({
        value: val,
        originalIndex: left + idx_map,
        isDimmed: true, // All from left are already copied and dimmed
      })),
      displaySlot: leftTempAux.displaySlot,
    }

    yield {
      array: [...fullArrayRef],
      activeRange: { start: left, end: right },
      highlightedIndices: Array.from({ length: numToCopy }, (_, c_idx) => startK + c_idx),
      message: `Copied remaining ${numToCopy} element(s) from Right temp array to A[${startK}...${k - 1}].`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine, // PT: lines for copying remaining right elements
      historicalAuxiliaryStructures: [finalLeftTempAuxStateUnchanged, finalRightTempAuxState],
    }
  }

  // Final yield for merge completion
  yield {
    array: [...fullArrayRef],
    activeRange: { start: left, end: right },
    sortedIndices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
    message: `Merge of runs A[${left}...${mid}] and A[${mid + 1}...${right}] into A[${left}...${right}] complete.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: currentPseudoCodeLine, // PT: line for end of merge
    // Clear specific merge pass auxiliary structures, or show final state of main array
    currentPassAuxiliaryStructure: null,
    historicalAuxiliaryStructures: [], // Or could show the final state of original aux structures if needed for context post-merge
  }
}

export const timSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Tim Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
    swaps: 0, // Tim Sort uses moves/writes, not direct swaps in the same way as bubble sort
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0],
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: 'Starting Tim Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0],
  }

  // Phase 1: Sort individual runs
  yield {
    array: [...arr],
    message: 'Phase 1: Sorting initial runs using Insertion Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [4],
  }
  for (let i = 0; i < n; i += RUN_SIZE) {
    const left = i
    const right = Math.min(i + RUN_SIZE - 1, n - 1)
    const runPassId = `run-${i}` // Unique ID for this run pass
    yield {
      array: [...arr],
      message: `Creating run for range [${left}...${right}]. Min merge: ${RUN_SIZE}`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [5],
    }
    yield* insertionSortForRunGenerator(arr, left, right, direction, arr, liveStats, [7], runPassId)
  }

  yield {
    array: [...arr],
    message: 'Finished sorting initial runs. Starting merge phase.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [9],
  }

  // Phase 2: Merge runs
  for (let size = RUN_SIZE; size < n; size = 2 * size) {
    yield {
      array: [...arr],
      message: `Merging runs. Current merge size: ${size}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [11],
    }
    for (let left = 0; left < n; left += 2 * size) {
      const mid = Math.min(left + size - 1, n - 1)
      const right = Math.min(left + 2 * size - 1, n - 1)
      yield {
        array: [...arr],
        message: `Identifying runs to merge. Left: ${left}, Mid: ${mid}, Right: ${right}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [14],
      }

      if (mid < right) {
        yield {
          array: [...arr],
          message: `Condition mid < right true. Merging range [${left}...${right}].`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [15],
        }
        yield* mergeRunsGenerator(arr, left, mid, right, direction, arr, liveStats, [16])
      } else {
        yield {
          array: [...arr],
          activeRange: { start: left, end: right },
          message: `Skipping merge for block starting at ${left} (only one run).`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [17],
        }
      }
    }
    yield {
      array: [...arr],
      message: `Finished merging runs of size ${size}. Preparing for next size.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [18],
    }
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'TimSort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [21],
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
