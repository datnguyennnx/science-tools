'use client'

import { SortGenerator, SortStats } from '../types'

// Comparison function based on direction
const shouldSwap = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  // Check if 'a' should come AFTER 'b' based on the direction
  return direction === 'asc' ? a > b : a < b
}

// Shrink factor for the gap
const SHRINK_FACTOR = 1.3

export const combSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  let gap = n
  let swapped = true

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Comb Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
  }

  // Comb sort doesn't inherently track sorted indices easily like Bubble/Selection
  // We'll only mark as sorted at the very end.
  const sortedIndices = new Set<number>()

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 0,
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Starting Comb Sort.',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 0,
  }

  // Main loop continues until the gap is 1 and no swaps occurred in the last pass
  while (gap > 1 || swapped) {
    yield {
      array: [...arr],
      message: `Checking while condition (gap=${gap}, swapped=${swapped}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 5,
    }

    // Calculate the next gap
    const nextGap = Math.floor(gap / SHRINK_FACTOR)
    yield {
      array: [...arr],
      message: `Calculating next gap: floor(${gap} / ${SHRINK_FACTOR}) = ${nextGap}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 6,
    }

    gap = nextGap

    if (gap < 1) {
      yield {
        array: [...arr],
        message: `Gap was < 1 (${gap}), setting gap to 1.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 7,
      }
      gap = 1
      yield {
        array: [...arr],
        message: `Gap is now ${gap}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 8,
      }
    } else {
      yield {
        array: [...arr],
        message: `Gap updated to ${gap}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 9,
      }
    }

    swapped = false
    yield {
      array: [...arr],
      message: `Reset swapped to false for current pass with gap ${gap}.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 10,
    }

    // Compare elements with the current gap
    for (let i = 0; i <= n - 1 - gap; i++) {
      const j = i + gap

      yield {
        array: [...arr],
        highlightedIndices: [i, j],
        comparisonIndices: [i, j],
        sortedIndices: Array.from(sortedIndices),
        activeRange: { start: i, end: j },
        message: `Comparing elements at index ${i} (${arr[i]}) and index ${j} (${arr[j]}) with gap ${gap}.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: 12,
      }
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (shouldSwap(arr[i], arr[j], direction)) {
        yield {
          array: [...arr],
          highlightedIndices: [],
          comparisonIndices: [],
          swappingIndices: [i, j],
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start: i, end: j },
          message: `Preparing to swap elements at indices ${i} (${arr[i]}) and ${j} (${arr[j]}).`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 13,
        }
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swapped = true

        yield {
          array: [...arr],
          highlightedIndices: [i, j],
          comparisonIndices: [],
          swappingIndices: [i, j],
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start: i, end: j },
          message: `Swapped. New values ${arr[i]} (at ${i}) and ${arr[j]} (at ${j}).`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 14,
        }
      } else {
        yield {
          array: [...arr],
          highlightedIndices: [i, j],
          comparisonIndices: [],
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start: i, end: j },
          message: `No swap needed for elements at indices ${i} and ${j}.`,
          currentStats: { ...liveStats },
          swappingIndices: null,
          currentPseudoCodeLine: 15,
        }
      }
    }

    yield {
      array: [...arr],
      message: `End of pass with gap ${gap}. Swapped this pass: ${swapped}`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 16,
    }

    if (gap === 1 && !swapped) {
      yield {
        array: [...arr],
        message: 'Gap is 1 and no swaps occurred, array is sorted.',
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 17,
      }
      break
    }
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Comb Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 18,
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
