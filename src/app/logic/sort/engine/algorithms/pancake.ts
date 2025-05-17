'use client'

import { SortGenerator, SortStats } from '../types'

// Helper function to flip a prefix of the array
// This function is synchronous and modifies arr directly.
// The generator will yield steps before and after calling this.
const flip = (arr: number[], k: number, liveStats: Partial<SortStats>): void => {
  let left = 0
  let right = k
  while (left < right) {
    ;[arr[left], arr[right]] = [arr[right], arr[left]]
    liveStats.swaps = (liveStats.swaps || 0) + 1 // Each pair exchange is one conceptual swap for stats
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
    left++
    right--
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
    auxiliaryArrayWrites: 0,
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [2], // if n <= 1 then return list
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Pancake Sort.',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [0], // procedure pancakeSort(list, direction)
  }

  for (let currentSize = n; currentSize > 1; currentSize--) {
    yield {
      array: [...arr],
      message: `Outer loop: currentSize = ${currentSize}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [3], // for currentSize = n down to 2
      activeRange: { start: 0, end: currentSize - 1 },
      sortedIndices: Array.from(sortedIndices),
    }
    let maxIndex = 0
    yield {
      array: [...arr],
      highlightedIndices: [0],
      comparisonIndices: [...Array(currentSize).keys()],
      activeRange: { start: 0, end: currentSize - 1 },
      sortedIndices: Array.from(sortedIndices),
      message: `Pass for size ${currentSize}: Finding ${direction === 'asc' ? 'max' : 'min'} in arr[0...${currentSize - 1}]. Current candidate: ${arr[0]} at index 0.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [16], // findExtremeIndex: idxOfExtreme = 0
    }
    for (let i = 1; i < currentSize; i++) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      yield {
        array: [...arr],
        highlightedIndices: [i, maxIndex],
        comparisonIndices: [...Array(currentSize).keys()],
        activeRange: { start: 0, end: currentSize - 1 },
        sortedIndices: Array.from(sortedIndices),
        message: `Comparing ${arr[i]} with current ${direction === 'asc' ? 'max' : 'min'} ${arr[maxIndex]}.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: [17], // findExtremeIndex: for i = 1 to size - 1
      }
      const shouldReplaceMax = direction === 'asc' ? arr[i] > arr[maxIndex] : arr[i] < arr[maxIndex]
      if (shouldReplaceMax) {
        maxIndex = i
        yield {
          array: [...arr],
          highlightedIndices: [i],
          comparisonIndices: [...Array(currentSize).keys()],
          activeRange: { start: 0, end: currentSize - 1 },
          sortedIndices: Array.from(sortedIndices),
          message: `New ${direction === 'asc' ? 'max' : 'min'} found: ${arr[maxIndex]} at index ${maxIndex}.`,
          currentStats: { ...liveStats },
          swappingIndices: null,
          currentPseudoCodeLine: [24], // findExtremeIndex: if isMoreExtreme then (leading to idxOfExtreme = i)
        }
      }
    }
    yield {
      array: [...arr],
      message: `Max/Min for current range found at index ${maxIndex}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [4], // extremeIndex = findExtremeIndex(list, currentSize, direction)
      activeRange: { start: 0, end: currentSize - 1 },
      sortedIndices: Array.from(sortedIndices),
      highlightedIndices: [maxIndex],
    }

    if (maxIndex !== currentSize - 1) {
      yield {
        array: [...arr],
        message: `Max/Min is not at the end of current range. Will perform flips.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [5], // if extremeIndex != currentSize - 1 then
        activeRange: { start: 0, end: currentSize - 1 },
        highlightedIndices: [maxIndex, currentSize - 1],
      }
      if (maxIndex !== 0) {
        yield {
          array: [...arr],
          highlightedIndices: [],
          comparisonIndices: [],
          swappingIndices: [...Array(maxIndex + 1).keys()],
          activeRange: { start: 0, end: maxIndex },
          sortedIndices: Array.from(sortedIndices),
          message: `Preparing to flip prefix arr[0...${maxIndex}] to bring ${arr[maxIndex]} to the front.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [6], // if extremeIndex != 0 then
        }
        flip(arr, maxIndex, liveStats)
        yield {
          array: [...arr],
          highlightedIndices: [...Array(maxIndex + 1).keys()],
          swappingIndices: [...Array(maxIndex + 1).keys()],
          activeRange: { start: 0, end: maxIndex },
          sortedIndices: Array.from(sortedIndices),
          message: `Prefix arr[0...${maxIndex}] flipped. ${arr[0]} is now at the front.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [7], // flip(list, extremeIndex + 1)
        }
      }

      yield {
        array: [...arr],
        highlightedIndices: [],
        comparisonIndices: [],
        swappingIndices: [...Array(currentSize).keys()],
        activeRange: { start: 0, end: currentSize - 1 },
        sortedIndices: Array.from(sortedIndices),
        message: `Preparing to flip prefix arr[0...${currentSize - 1}] to move ${arr[0]} to its sorted position.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [9], // flip(list, currentSize)
      }
      flip(arr, currentSize - 1, liveStats)
      yield {
        array: [...arr],
        highlightedIndices: [...Array(currentSize).keys()],
        swappingIndices: [...Array(currentSize).keys()],
        activeRange: { start: 0, end: currentSize - 1 },
        sortedIndices: Array.from(sortedIndices),
        message: `Prefix arr[0...${currentSize - 1}] flipped. Element ${arr[currentSize - 1]} is now sorted.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [9], // still on flip operation for currentSize
      }
    } else {
      yield {
        array: [...arr],
        highlightedIndices: [maxIndex],
        activeRange: { start: 0, end: currentSize - 1 },
        sortedIndices: Array.from(sortedIndices),
        message: `Element ${arr[maxIndex]} is already in its correct position for this pass.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: [5], // if extremeIndex != currentSize - 1 (condition was false)
      }
    }
    yield {
      array: [...arr],
      message: `Flip sequence for currentSize ${currentSize} complete.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [10], // end if (for maxIndex != currentSize - 1)
      activeRange: { start: 0, end: currentSize - 1 },
      sortedIndices: Array.from(sortedIndices),
    }

    sortedIndices.add(currentSize - 1)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: currentSize - 2 }, // Next iteration will consider one less element
      message: `Element at index ${currentSize - 1} (${arr[currentSize - 1]}) is sorted.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [3], // Back to for loop: for currentSize = n down to 2
    }
  }
  yield {
    array: [...arr],
    message: `All elements processed.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [11], // end for (for currentSize)
  }

  if (n > 0 && !sortedIndices.has(0)) {
    sortedIndices.add(0) // Ensure the first element is marked sorted if not already
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Pancake Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [13], // end procedure
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
