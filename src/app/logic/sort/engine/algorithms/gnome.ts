'use client'

import { SortGenerator } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer'

// Comparison function: Checks if arr[index] >= arr[index - 1] (for asc) or <= (for desc)
const isInOrder = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  return direction === 'asc' ? a >= b : a <= b
}

export const gnomeSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  let index = 0

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Gnome Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
  }

  const sortedIndices = new Set<number>()

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
    message: 'Starting Gnome Sort.',
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  while (index < n) {
    if (index === 0) {
      yield {
        array: [...arr],
        highlightedIndices: [index],
        comparisonIndices: [index],
        message: `At the start (index ${index}). Moving to next element.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
      }
      index++
    } else {
      yield {
        array: [...arr],
        highlightedIndices: [index, index - 1],
        comparisonIndices: [index, index - 1],
        message: `Comparing element at index ${index} (${arr[index]}) with previous at index ${index - 1} (${arr[index - 1]}).`,
        currentStats: { ...liveStats },
        swappingIndices: null,
      }
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (isInOrder(arr[index], arr[index - 1], direction)) {
        yield {
          array: [...arr],
          highlightedIndices: [index],
          comparisonIndices: [index, index - 1],
          message: `Elements are in order. Moving forward (index ${index + 1}).`,
          currentStats: { ...liveStats },
          swappingIndices: null,
        }
        index++
      } else {
        yield {
          array: [...arr],
          highlightedIndices: [],
          comparisonIndices: [],
          swappingIndices: [index, index - 1],
          message: `Elements out of order. Preparing to swap index ${index} (${arr[index]}) and ${index - 1} (${arr[index - 1]}).`,
          currentStats: { ...liveStats },
        }
        ;[arr[index], arr[index - 1]] = [arr[index - 1], arr[index]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        yield {
          array: [...arr],
          highlightedIndices: [index, index - 1],
          comparisonIndices: [],
          swappingIndices: [index, index - 1], // Show what was just swapped
          message: `Swapped. New values: ${arr[index]} (at ${index}), ${arr[index - 1]} (at ${index - 1}). Moving backward.`,
          currentStats: { ...liveStats },
        }
        index--
      }
    }
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Gnome Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
