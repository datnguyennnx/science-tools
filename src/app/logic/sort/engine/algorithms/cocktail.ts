'use client'

import { SortGenerator, SortStats } from '../types'

// Comparison function based on direction
const shouldSwapForward = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  // Forward pass: Bubble larger/smaller to the end
  return direction === 'asc' ? a > b : a < b
}

const shouldSwapBackward = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  // Backward pass: Bubble smaller/larger to the start
  // Note: The pseudo-code uses `array[i] > array[i+1]` for both passes,
  // assuming it implicitly handles ascending sort. Here, we adjust for direction.
  // For a backward pass aiming to move the smallest left (asc sort):
  // if array[i-1] > array[i], swap. (This is what `a > b` means if a=arr[i-1], b=arr[i])
  // The provided pseudo-code for backward pass: `if (array[i] > array[i+1])` with `i` decreasing.
  // This means it compares `array[curr]` with `array[curr+1]` when `curr` is `end-1` down to `start`.
  // So if `array[curr] > array[curr+1]`, swap. This is for ASCENDING.
  // If direction is DESC, we want `array[curr] < array[curr+1]` to swap.
  // Our `shouldSwapBackward` is called with `arr[i-1]` and `arr[i]`. So `a = arr[i-1]`, `b = arr[i]`.
  // If asc: we want to swap if `a > b`. So `a > b` is correct.
  // If desc: we want to swap if `a < b`. So `a < b` is correct.
  // The pseudo-code for the backward pass (`for (i = end - 1; i >= start; i--)` then `if (array[i] > array[i+1])`)
  // is a bit confusing. If `i` is the current element, and it's compared with `i+1`, that means
  // it's comparing an element with one to its right, even when moving left. This seems unusual.
  // A more standard backward pass compares `array[i-1]` and `array[i]` and swaps if `array[i-1]` is greater.
  // Given the current implementation uses `arr[i-1]` and `arr[i]`, let's map to that.
  // Pseudo line 18: `if (array[i] > array[i+1])` where `i` goes from `end-1` down to `start`.
  // This translates to comparing `arr[current_scan_index]` and `arr[current_scan_index + 1]`
  // Our code compares `arr[i-1]` and `arr[i]` when `i` goes from `end` down to `start+1`.
  // So, pseudo line 18 matches this comparison.
  return direction === 'asc' ? a > b : a < b
}

export const cocktailSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = new Set<number>()
  let swapped = true // Pseudo line 1: swapped = true
  let start = 0 // Pseudo line 2: start = 0
  let end = n - 1 // Pseudo line 3: end = array.length - 1

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
      currentPseudoCodeLine: [0], // cocktailSort(array) { -> initialization covers lines 0-3
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
    currentPseudoCodeLine: [0], // cocktailSort(array) {
  }

  // Pseudo line 4: while (swapped)
  while (swapped) {
    swapped = false // Pseudo line 5: swapped = false

    yield {
      array: [...arr],
      message: `Forward pass: [${start}...${end}]. Bubbling ${direction === 'asc' ? 'largest' : 'smallest'} to end.`,
      activeRange: { start, end },
      sortedIndices: Array.from(sortedIndices),
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [6],
    }
    // Pseudo line 6: for (i = start; i < end; i++)
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
        currentPseudoCodeLine: [9],
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
          currentPseudoCodeLine: [10],
        }
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swapped = true
        yield {
          array: [...arr],
          highlightedIndices: [i, i + 1],
          swappingIndices: [i, i + 1],
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start, end },
          message: `Swapped. New values: ${arr[i]} (at ${i}) and ${arr[i + 1]} (at ${i + 1}).`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [11],
        }
      }
    }

    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: 'End of forward pass elements scan.',
      activeRange: { start, end },
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [13],
    }

    // Pseudo line 12: if (!swapped)
    if (!swapped) {
      yield {
        array: [...arr],
        sortedIndices: Array.from(sortedIndices),
        message: 'No swaps in forward pass, array is sorted.',
        activeRange: { start, end },
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: [15],
      }
      break
    }

    // Pseudo line 15: swapped = false (reset for backward pass)
    // This is implicitly handled by the logic, but we can yield a step for clarity
    // Or, the next `swapped = false` at the start of the backward pass block covers this.
    // The pseudo code has an explicit `swapped = false` here.

    sortedIndices.add(end)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: `End of forward pass. Index ${end} is sorted.`,
      activeRange: { start, end },
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [13],
    }
    // Pseudo line 16: end = end - 1
    end--
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: `Decremented end to ${end}. Preparing for backward pass.`,
      activeRange: { start, end },
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [17],
    }

    swapped = false
    yield {
      array: [...arr],
      message: `Backward pass: [${start}...${end}]. Bubbling ${direction === 'asc' ? 'smallest' : 'largest'} to start.`,
      activeRange: { start, end },
      sortedIndices: Array.from(sortedIndices),
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [18],
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
        currentPseudoCodeLine: [21],
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
          currentPseudoCodeLine: [22],
        }
        ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swapped = true
        yield {
          array: [...arr],
          highlightedIndices: [i - 1, i],
          swappingIndices: [i - 1, i],
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start, end },
          message: `Swapped. New values: ${arr[i - 1]} (at ${i - 1}) and ${arr[i]} (at ${i}).`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [23],
        }
      }
    }

    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: 'End of backward pass elements scan.',
      activeRange: { start, end },
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [25],
    }

    sortedIndices.add(start)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: `End of backward pass. Index ${start} is sorted.`,
      activeRange: { start, end },
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [25],
    }

    start++
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: `Incremented start to ${start}.`,
      activeRange: { start, end },
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [27],
    }

    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: swapped
        ? 'Continuing to next iteration.'
        : 'No swaps in backward pass, array is sorted.',
      activeRange: { start, end },
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: [5], // Re-checking while condition; plaintext[5]
    }
    if (!swapped) break
  }

  for (let k = start; k <= end; k++) sortedIndices.add(k)

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Cocktail Shaker Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: [29],
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
