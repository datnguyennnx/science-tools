'use client'

import { SortGenerator } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer'

// Comparison function based on direction
const shouldSwapForward = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  // Forward pass: Bubble larger/smaller to the end
  return direction === 'asc' ? a > b : a < b
}

const shouldSwapBackward = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  // Backward pass: Bubble smaller/larger to the start
  return direction === 'asc' ? a < b : a > b
}

export const cocktailSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = new Set<number>()
  let swapped = true
  let start = 0
  let end = n - 1

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Cocktail Shaker Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: n === 1 ? [0] : [],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      swappingIndices: null,
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Cocktail Shaker Sort.',
    activeRange: { start, end },
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  while (swapped) {
    swapped = false

    yield {
      array: [...arr],
      message: `Forward pass: [${start}...${end}]. Bubbling ${direction === 'asc' ? 'largest' : 'smallest'} to end.`,
      activeRange: { start, end },
      sortedIndices: Array.from(sortedIndices),
      currentStats: { ...liveStats },
      swappingIndices: null,
    }
    for (let i = start; i < end; i++) {
      yield {
        array: [...arr],
        highlightedIndices: [i, i + 1],
        comparisonIndices: [i, i + 1],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start, end },
        message: `Comparing ${arr[i]} and ${arr[i + 1]}`,
        currentStats: { ...liveStats },
        swappingIndices: null,
      }
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (shouldSwapForward(arr[i], arr[i + 1], direction)) {
        yield {
          array: [...arr],
          highlightedIndices: [],
          comparisonIndices: [],
          swappingIndices: [i, i + 1],
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start, end },
          message: `Preparing to swap ${arr[i]} and ${arr[i + 1]}.`,
          currentStats: { ...liveStats },
        }
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swapped = true
        yield {
          array: [...arr],
          highlightedIndices: [i, i + 1],
          swappingIndices: [i, i + 1], // Show what was just swapped
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start, end },
          message: `Swapped. New values: ${arr[i]} (at ${i}) and ${arr[i + 1]} (at ${i + 1}).`,
          currentStats: { ...liveStats },
        }
      }
    }

    if (!swapped) break

    sortedIndices.add(end)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: `End of forward pass. Index ${end} is sorted.`,
      activeRange: { start, end }, // Range still includes `end` before it's decremented
      currentStats: { ...liveStats },
      swappingIndices: null,
    }
    end--

    swapped = false
    yield {
      array: [...arr],
      message: `Backward pass: [${start}...${end}]. Bubbling ${direction === 'asc' ? 'smallest' : 'largest'} to start.`,
      activeRange: { start, end },
      sortedIndices: Array.from(sortedIndices),
      currentStats: { ...liveStats },
      swappingIndices: null,
    }
    for (let i = end; i > start; i--) {
      yield {
        array: [...arr],
        highlightedIndices: [i - 1, i],
        comparisonIndices: [i - 1, i],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start, end },
        message: `Comparing ${arr[i - 1]} and ${arr[i]}`,
        currentStats: { ...liveStats },
        swappingIndices: null,
      }
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (shouldSwapBackward(arr[i - 1], arr[i], direction)) {
        yield {
          array: [...arr],
          highlightedIndices: [],
          comparisonIndices: [],
          swappingIndices: [i - 1, i],
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start, end },
          message: `Preparing to swap ${arr[i - 1]} and ${arr[i]}.`,
          currentStats: { ...liveStats },
        }
        ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swapped = true
        yield {
          array: [...arr],
          highlightedIndices: [i - 1, i],
          swappingIndices: [i - 1, i], // Show what was just swapped
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start, end },
          message: `Swapped. New values: ${arr[i - 1]} (at ${i - 1}) and ${arr[i]} (at ${i}).`,
          currentStats: { ...liveStats },
        }
      }
    }

    sortedIndices.add(start)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: `End of backward pass. Index ${start} is sorted.`,
      activeRange: { start, end }, // Range still includes `start` before it's incremented
      currentStats: { ...liveStats },
      swappingIndices: null,
    }
    start++

    if (!swapped) break
  }

  for (let k = start; k <= end; k++) sortedIndices.add(k)

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Cocktail Shaker Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
