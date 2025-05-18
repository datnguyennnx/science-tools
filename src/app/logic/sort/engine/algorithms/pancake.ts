'use client'

import { SortGenerator, SortStats, SortStep, AuxiliaryStructure } from '../types'

// Helper function to flip a prefix of the array
// This function is synchronous and modifies arr directly.
// The generator will yield steps before and after calling this.
/*
const flip = (
  arr: number[],
  k: number, // k is the index up to which elements are flipped
  liveStats: Partial<SortStats>
) => {
  let start = 0
  let end = k
  liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + (end - start +1) // approx
  liveStats.swaps = (liveStats.swaps || 0) + Math.floor((end - start + 1) / 2)

  while (start < end) {
    ;[arr[start], arr[end]] = [arr[end], arr[start]]
    start++
    end--
  }
}
*/

const findExtremeIndexGenerator = function* (
  arr: ReadonlyArray<number>,
  currentSize: number,
  direction: 'asc' | 'desc',
  liveStats: Partial<SortStats>,
  passIdentifier: string
): Generator<SortStep, number, void> {
  if (currentSize === 0) return -1

  const activeRange = { start: 0, end: currentSize - 1 }
  let message: string

  if (currentSize === 1) {
    message = `${passIdentifier}: findExtremeIndex - Only one element in current range (size ${currentSize}), A[0] (${arr[0]}) is extreme.`
    yield {
      array: [...arr],
      message,
      highlightedIndices: [0],
      activeRange,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [16, 17, 28], // Covers procedure, idxOfExtreme = 0 (implicitly for size 1), return
    }
    return 0
  }

  let extremeIndex = 0 // PT Line 17
  message = `${passIdentifier}: findExtremeIndex - Initial candidate for ${direction === 'asc' ? 'max' : 'min'} is A[0] (${arr[0]}). Searching in A[0...${currentSize - 1}].`
  yield {
    array: [...arr],
    message,
    highlightedIndices: [0],
    comparisonIndices: [0], // Initial candidate is "compared" against itself conceptually
    activeRange,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [16, 17], // procedure findExtremeIndex, idxOfExtreme = 0
  }

  for (let i = 1; i < currentSize; i++) {
    // PT Line 18
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    const isMoreExtreme =
      direction === 'asc' ? arr[i] > arr[extremeIndex] : arr[i] < arr[extremeIndex]

    message = `${passIdentifier}: findExtremeIndex - Comparing A[${i}] (${arr[i]}) with current extreme A[${extremeIndex}] (${arr[extremeIndex]}).`
    if (isMoreExtreme) {
      // PT Line 24
      extremeIndex = i // PT Line 25
      message += ` New ${direction === 'asc' ? 'max' : 'min'} found: A[${extremeIndex}] (${arr[extremeIndex]}).`
    } else {
      message += ` No new extreme.`
    }

    yield {
      array: [...arr],
      message,
      highlightedIndices: [i, extremeIndex],
      comparisonIndices: [i, extremeIndex],
      activeRange,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: isMoreExtreme
        ? [18, 19, 20, 21, 22, 23, 24, 25, 26]
        : [18, 19, 20, 21, 22, 23],
    }
  }

  message = `${passIdentifier}: findExtremeIndex - Search complete. Final ${direction === 'asc' ? 'max' : 'min'} in A[0...${currentSize - 1}] is A[${extremeIndex}] (${arr[extremeIndex]}).`
  yield {
    array: [...arr],
    message,
    highlightedIndices: [extremeIndex],
    activeRange,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [27, 28], // end for, return idxOfExtreme
  }
  return extremeIndex
}

const flipGenerator = function* (
  arr: number[],
  k_elements: number, // Number of elements from the start to flip
  liveStats: Partial<SortStats>,
  passIdentifier: string
): Generator<SortStep, void, void> {
  const flipEndIndex = k_elements - 1 // Index of the last element in the prefix to be flipped
  const activeRange = { start: 0, end: flipEndIndex }

  const getFlipAuxStructure = (
    currentArrState: ReadonlyArray<number>,
    startIdx: number,
    endIdx: number,
    stage: string
  ): AuxiliaryStructure => ({
    id: `flip-aux-${passIdentifier.toLowerCase().replace(/\s+/g, '')}-${startIdx}-${endIdx}-${stage}`,
    title: `${passIdentifier}: Flipping A[0...${flipEndIndex}] - Stage: ${stage}`,
    data: currentArrState.slice(0, k_elements).map((value, index) => ({
      value,
      originalIndex: index, // Index within the prefix being flipped
      isBeingSwapped: index === startIdx || index === endIdx,
    })),
    displaySlot: 'pancake-flip-operation',
  })

  if (flipEndIndex <= 0) {
    yield {
      array: [...arr],
      message: `${passIdentifier}: flip - Attempting to flip ${k_elements} element(s) (indices 0 to ${flipEndIndex}). No change needed.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [31, 32, 33, 38], // procedure flip, start/end init, end while (implicitly as loop doesn't run)
      activeRange: k_elements > 0 ? activeRange : undefined,
    }
    return
  }

  yield {
    array: [...arr],
    message: `${passIdentifier}: flip - Starting flip of first ${k_elements} elements (A[0...${flipEndIndex}]).`,
    activeRange,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [31, 32, 33], // procedure flip, start = 0, end = k_elements - 1
    currentPassAuxiliaryStructure: getFlipAuxStructure(arr, 0, flipEndIndex, 'Start'),
  }

  let start = 0 // PT Line 32
  let end = flipEndIndex

  while (start < end) {
    // PT Line 34
    const valStartBeforeSwap = arr[start]
    const valEndBeforeSwap = arr[end]

    // Swap operation
    ;[arr[start], arr[end]] = [arr[end], arr[start]] // PT Line 35
    liveStats.swaps = (liveStats.swaps || 0) + 1
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2

    const message = `${passIdentifier}: flip - Swapped A[${start}] (was ${valStartBeforeSwap}, now ${arr[start]}) with A[${end}] (was ${valEndBeforeSwap}, now ${arr[end]}).`

    yield {
      array: [...arr],
      message,
      highlightedIndices: [start, end],
      swappingIndices: [start, end],
      activeRange,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [34, 35, 36, 37], // while, swap, start++, end--
      currentPassAuxiliaryStructure: getFlipAuxStructure(arr, start, end, 'Swapping'),
    }

    start++ // PT Line 36
    end-- // PT Line 37
  }

  yield {
    array: [...arr],
    message: `${passIdentifier}: flip - Flip of first ${k_elements} elements (A[0...${flipEndIndex}]) complete.`,
    swappingIndices: null,
    activeRange,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [38, 39], // end while, end procedure flip
    currentPassAuxiliaryStructure: getFlipAuxStructure(arr, start, end, 'Complete'),
  }
}

export const pancakeSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = new Set<number>()

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Pancake Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0, // Flips are main array writes, not aux
  }

  const getOverallViewAuxStructure = (
    currentArrState: ReadonlyArray<number>,
    currentSizeForSort: number,
    stage: string
  ): AuxiliaryStructure => ({
    id: `pancake-overall-view-${stage.toLowerCase().replace(/\s+/g, '-')}`,
    title: `Pancake Sort State: ${stage} (Processing A[0...${currentSizeForSort - 1}])`,
    data: currentArrState.map((value, index) => ({
      value,
      originalIndex: index,
      isSorted: sortedIndices.has(index),
      isInActiveRange: index < currentSizeForSort,
    })),
    displaySlot: 'pancake-main-array-view',
  })

  if (n <= 1) {
    if (n === 1) sortedIndices.add(0)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1, 2],
      currentPassAuxiliaryStructure: n > 0 ? getOverallViewAuxStructure(arr, n, 'Trivial') : null,
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Pancake Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0, 1],
    currentPassAuxiliaryStructure: getOverallViewAuxStructure(arr, n, 'Initial'),
  }

  for (let currentSize = n; currentSize > 1; currentSize--) {
    const passId = `Pass for size ${currentSize}`
    const activeRange = { start: 0, end: currentSize - 1 }
    let message = `${passId}: Processing A[0...${currentSize - 1}]. Goal: Place ${direction === 'asc' ? 'largest' : 'smallest'} element at index ${currentSize - 1}.`

    yield {
      array: [...arr],
      message,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [3, 4], // for currentSize, extremeIndex = findExtremeIndex(...)
      activeRange,
      sortedIndices: Array.from(sortedIndices),
      currentPassAuxiliaryStructure: getOverallViewAuxStructure(arr, currentSize, 'FindExtreme'),
    }

    const extremeIndex = yield* findExtremeIndexGenerator(
      arr,
      currentSize,
      direction,
      liveStats,
      passId
    )

    message = `${passId}: Extreme element for A[0...${currentSize - 1}] is A[${extremeIndex}] (${arr[extremeIndex]}).`
    yield {
      array: [...arr],
      message,
      highlightedIndices: [extremeIndex],
      activeRange,
      sortedIndices: Array.from(sortedIndices),
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [4], // findExtremeIndex result
      currentPassAuxiliaryStructure: getOverallViewAuxStructure(arr, currentSize, 'ExtremeFound'),
    }

    if (extremeIndex !== currentSize - 1) {
      message = `${passId}: Extreme A[${extremeIndex}] (${arr[extremeIndex]}) is not at target position (index ${currentSize - 1}). Will perform flips.`
      yield {
        array: [...arr],
        message,
        highlightedIndices: [extremeIndex, currentSize - 1],
        activeRange,
        sortedIndices: Array.from(sortedIndices),
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [5], // if extremeIndex != currentSize - 1
        currentPassAuxiliaryStructure: getOverallViewAuxStructure(
          arr,
          currentSize,
          'PreFlipDecision'
        ),
      }

      if (extremeIndex !== 0) {
        message = `${passId}: Extreme A[${extremeIndex}] is not at index 0. Flipping A[0...${extremeIndex}] to bring it to front.`
        yield {
          array: [...arr],
          message,
          activeRange: { start: 0, end: extremeIndex },
          sortedIndices: Array.from(sortedIndices),
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [6, 7], // if extremeIndex != 0, flip(list, extremeIndex + 1)
          currentPassAuxiliaryStructure: getOverallViewAuxStructure(
            arr,
            currentSize,
            'PreFlipToFront'
          ),
        }
        yield* flipGenerator(arr, extremeIndex + 1, liveStats, passId)
        message = `${passId}: After first flip, extreme element ${arr[0]} is now at A[0].`
        yield {
          array: [...arr],
          message,
          highlightedIndices: [0],
          activeRange: { start: 0, end: extremeIndex }, // Focus on the flipped part
          sortedIndices: Array.from(sortedIndices),
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [7, 8], // End of first flip, end if
          currentPassAuxiliaryStructure: getOverallViewAuxStructure(
            arr,
            currentSize,
            'PostFlipToFront'
          ),
        }
      }

      message = `${passId}: Flipping A[0...${currentSize - 1}] to move extreme element (now at A[0]) to A[${currentSize - 1}].`
      yield {
        array: [...arr],
        message,
        activeRange, // Full range for this flip
        sortedIndices: Array.from(sortedIndices),
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [9], // flip(list, currentSize)
        currentPassAuxiliaryStructure: getOverallViewAuxStructure(
          arr,
          currentSize,
          'PreFlipToPlace'
        ),
      }
      yield* flipGenerator(arr, currentSize, liveStats, passId)
      message = `${passId}: After second flip, element ${arr[currentSize - 1]} is now at A[${currentSize - 1}] (sorted position).`
      yield {
        array: [...arr],
        message,
        highlightedIndices: [currentSize - 1],
        activeRange, // Show the full range that was just flipped
        sortedIndices: Array.from(sortedIndices),
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [9], // completion of flip to place
        currentPassAuxiliaryStructure: getOverallViewAuxStructure(
          arr,
          currentSize,
          'PostFlipToPlace'
        ),
      }
    } else {
      message = `${passId}: Extreme element A[${extremeIndex}] (${arr[extremeIndex]}) is already at target position (index ${currentSize - 1}). No flips needed for this pass.`
      yield {
        array: [...arr],
        message,
        highlightedIndices: [extremeIndex],
        activeRange,
        sortedIndices: Array.from(sortedIndices),
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [5, 10], // if condition false, end if
        currentPassAuxiliaryStructure: getOverallViewAuxStructure(
          arr,
          currentSize,
          'NoFlipsNeeded'
        ),
      }
    }
    sortedIndices.add(currentSize - 1)
    message = `${passId}: Element A[${currentSize - 1}] (${arr[currentSize - 1]}) is now sorted.`
    yield {
      array: [...arr],
      message,
      sortedIndices: Array.from(sortedIndices),
      highlightedIndices: [currentSize - 1],
      activeRange: { start: 0, end: currentSize - 2 }, // Next active range for finding extreme
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [11], // end for (implicitly loops back or finishes)
      currentPassAuxiliaryStructure: getOverallViewAuxStructure(
        arr,
        currentSize - 1,
        'PassComplete'
      ),
    }
  }

  if (n > 0 && !sortedIndices.has(0)) sortedIndices.add(0)
  for (let k = 0; k < n; ++k) if (!sortedIndices.has(k)) sortedIndices.add(k)

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Pancake Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [12, 13], // return list, end procedure
    currentPassAuxiliaryStructure: getOverallViewAuxStructure(arr, 0, 'FinalSorted'), // 0 indicates all sorted
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
