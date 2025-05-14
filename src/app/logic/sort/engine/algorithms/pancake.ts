'use client'

import { SortGenerator } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer'

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
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Pancake Sort.',
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  for (let currentSize = n; currentSize > 1; currentSize--) {
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
        }
      }
    }

    if (maxIndex !== currentSize - 1) {
      if (maxIndex !== 0) {
        // Show the range about to be flipped using swappingIndices
        yield {
          array: [...arr],
          highlightedIndices: [], // Clear other highlights
          comparisonIndices: [],
          swappingIndices: [...Array(maxIndex + 1).keys()], // Entire range being flipped
          activeRange: { start: 0, end: maxIndex },
          sortedIndices: Array.from(sortedIndices),
          message: `Preparing to flip prefix arr[0...${maxIndex}] to bring ${arr[maxIndex]} to the front.`,
          currentStats: { ...liveStats },
        }
        flip(arr, maxIndex, liveStats)
        yield {
          array: [...arr],
          highlightedIndices: [...Array(maxIndex + 1).keys()],
          swappingIndices: [...Array(maxIndex + 1).keys()], // Show range that was just flipped
          activeRange: { start: 0, end: maxIndex },
          sortedIndices: Array.from(sortedIndices),
          message: `Prefix arr[0...${maxIndex}] flipped. ${arr[0]} is now at the front.`,
          currentStats: { ...liveStats },
        }
      }

      // Show the range about to be flipped using swappingIndices
      yield {
        array: [...arr],
        highlightedIndices: [], // Clear other highlights
        comparisonIndices: [],
        swappingIndices: [...Array(currentSize).keys()], // Entire range being flipped
        activeRange: { start: 0, end: currentSize - 1 },
        sortedIndices: Array.from(sortedIndices),
        message: `Preparing to flip prefix arr[0...${currentSize - 1}] to move ${arr[0]} to its sorted position.`,
        currentStats: { ...liveStats },
      }
      flip(arr, currentSize - 1, liveStats)
      yield {
        array: [...arr],
        highlightedIndices: [...Array(currentSize).keys()],
        swappingIndices: [...Array(currentSize).keys()], // Show range that was just flipped
        activeRange: { start: 0, end: currentSize - 1 },
        sortedIndices: Array.from(sortedIndices),
        message: `Prefix arr[0...${currentSize - 1}] flipped. Element ${arr[currentSize - 1]} is now sorted.`,
        currentStats: { ...liveStats },
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
      }
    }

    sortedIndices.add(currentSize - 1)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      activeRange: { start: 0, end: currentSize - 2 },
      message: `Element at index ${currentSize - 1} (${arr[currentSize - 1]}) is sorted.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
    }
  }

  if (n > 0 && !sortedIndices.has(0)) {
    sortedIndices.add(0)
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Pancake Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
