'use client'

import { SortGenerator } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer' // Import SortStats

// Comparison function based on direction
const shouldSwap = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  // Check if 'a' should come AFTER 'b' based on the direction
  return direction === 'asc' ? a < b : a > b
}

export const selectionSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = new Set<number>()

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Selection Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0, // No auxiliary structures
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 0, // Corresponds to function definition
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Selection Sort',
    activeRange: { start: 0, end: n - 1 }, // Initially, the whole array is unsorted
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 0, // function selectionSort(array, n) {
  }

  for (let i = 0; i < n - 1; i++) {
    yield {
      array: [...arr],
      message: `Outer loop: i = ${i}`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 1, // for (let i = 0; i < n - 1; i++) {
      activeRange: { start: i, end: n - 1 },
      sortedIndices: Array.from(sortedIndices),
      swappingIndices: null,
    }
    let minIndex = i // Index of the minimum/maximum element in the unsorted portion
    yield {
      array: [...arr],
      message: `minIndex = ${minIndex}`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 2, // let minIndex = i;
      highlightedIndices: [i],
      comparisonIndices: [i],
      activeRange: { start: i, end: n - 1 },
      sortedIndices: Array.from(sortedIndices),
      swappingIndices: null,
    }

    // Find the index of the minimum/maximum element in the unsorted part
    for (let j = i + 1; j < n; j++) {
      yield {
        array: [...arr],
        message: `Inner loop: j = ${j}`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 3, // for (let j = i + 1; j < n; j++) {
        highlightedIndices: [minIndex, j],
        comparisonIndices: [minIndex, j],
        activeRange: { start: i, end: n - 1 },
        sortedIndices: Array.from(sortedIndices),
        swappingIndices: null,
      }

      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      yield {
        array: [...arr],
        highlightedIndices: [minIndex, j],
        comparisonIndices: [minIndex, j],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: i, end: n - 1 },
        message: `Comparing element at current ${direction === 'asc' ? 'min' : 'max'} index ${minIndex} (${arr[minIndex]}) with element at index ${j} (${arr[j]})`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: 4, // if (array[j] < array[minIndex]) {
      }
      if (shouldSwap(arr[j], arr[minIndex], direction)) {
        const oldMinIndex = minIndex
        minIndex = j
        yield {
          array: [...arr],
          highlightedIndices: [oldMinIndex, j],
          comparisonIndices: [minIndex],
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start: i, end: n - 1 },
          message: `New ${direction === 'asc' ? 'minimum' : 'maximum'} found at index ${minIndex} (${arr[minIndex]})`,
          currentStats: { ...liveStats },
          swappingIndices: null,
          currentPseudoCodeLine: 5, // minIndex = j;
        }
      } else {
        yield {
          array: [...arr],
          highlightedIndices: [minIndex, j],
          comparisonIndices: [minIndex],
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start: i, end: n - 1 },
          message: `Element at index ${minIndex} remains the current ${direction === 'asc' ? 'minimum' : 'maximum'}.`,
          currentStats: { ...liveStats },
          swappingIndices: null,
          currentPseudoCodeLine: 4, // Still on the if condition line or just after it
        }
      }
    } // End inner loop (j)
    yield {
      array: [...arr],
      message: 'End of inner for loop',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 7, // Closing brace of inner for loop, or start of if (minIndex !== i)
      activeRange: { start: i, end: n - 1 },
      sortedIndices: Array.from(sortedIndices),
      swappingIndices: null,
    }

    if (minIndex !== i) {
      yield {
        array: [...arr],
        highlightedIndices: [],
        comparisonIndices: [],
        swappingIndices: [i, minIndex],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: i, end: n - 1 },
        message: `Preparing to swap element at index ${i} (${arr[i]}) with found ${direction === 'asc' ? 'minimum' : 'maximum'} at index ${minIndex} (${arr[minIndex]})`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 8, // if (minIndex != i) {
      }
      ;[arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
      liveStats.swaps = (liveStats.swaps || 0) + 1
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
      yield {
        array: [...arr],
        highlightedIndices: [i, minIndex],
        comparisonIndices: [],
        swappingIndices: [i, minIndex],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: i, end: n - 1 },
        message: `Swapped elements. New value at index ${i} is ${arr[i]}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 9, // swap(array[i], array[minIndex]);
      }
    } else {
      yield {
        array: [...arr],
        highlightedIndices: [i],
        comparisonIndices: [],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: i, end: n - 1 },
        message: `Element at index ${i} (${arr[i]}) is already in its sorted position for this pass. No swap needed.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: 8, // Still on the if condition (or the else branch)
      }
    }
    yield {
      array: [...arr],
      message: 'End of if (minIndex !== i) block',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 10, // Closing brace of if block
      activeRange: { start: i + 1, end: n - 1 },
      sortedIndices: Array.from(sortedIndices),
      swappingIndices: null,
    }

    sortedIndices.add(i)
  } // End outer loop (i)
  yield {
    array: [...arr],
    message: 'End of outer for loop',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 11, // Closing brace of outer for loop
    sortedIndices: Array.from(sortedIndices),
    swappingIndices: null,
  }

  if (n > 0) sortedIndices.add(n - 1) // Ensure last element is marked sorted

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Selection Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 12, // Closing brace of function
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
