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
      currentPseudoCodeLine: 0, // cocktailSort(array) { -> initialization covers lines 0-3
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
    currentPseudoCodeLine: 0, // cocktailSort(array) {
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
      currentPseudoCodeLine: 5, // Set swapped = false at start of while
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
        currentPseudoCodeLine: 7, // if (array[i] > array[i+1])
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
          currentPseudoCodeLine: 8, // swap(array[i], array[i+1])
        }
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swapped = true // Pseudo line 9: swapped = true
        yield {
          array: [...arr],
          highlightedIndices: [i, i + 1],
          swappingIndices: [i, i + 1], // Show what was just swapped
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start, end },
          message: `Swapped. New values: ${arr[i]} (at ${i}) and ${arr[i + 1]} (at ${i + 1}).`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 9, // after swap and set swapped = true
        }
      }
    }
    // Pseudo line 11: end of forward for loop
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: 'End of forward pass elements scan.',
      activeRange: { start, end },
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 11,
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
        currentPseudoCodeLine: 13, // break
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
      currentPseudoCodeLine: 15, // conceptually, before end = end - 1, we might reset swapped (though code does it later)
      // Let's align with the pseudo-code strict order for now
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
      currentPseudoCodeLine: 16,
    }

    swapped = false // Pseudo line 15 (actual placement in this code for backward pass prep)
    yield {
      array: [...arr],
      message: `Backward pass: [${start}...${end}]. Bubbling ${direction === 'asc' ? 'smallest' : 'largest'} to start.`,
      activeRange: { start, end },
      sortedIndices: Array.from(sortedIndices),
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 15, // swapped = false (for backward pass)
    }

    // Pseudo line 17: for (i = end - 1; i >= start; i--)
    // Our loop is `for (let i = end; i > start; i--)` comparing `arr[i-1]` and `arr[i]`.
    // This is effectively the same range. `end` in pseudo is inclusive, here `end` is also inclusive for elements considered.
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
        currentPseudoCodeLine: 18, // if (array[i] > array[i+1]) - adjusted for our loop indices
      }
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      // The pseudo code `if (array[i] > array[i+1])` for backward pass (i from `end-1` down to `start`)
      // means comparing `arr[k]` with `arr[k+1]` where `k` is decreasing.
      // Our code compares `arr[i-1]` with `arr[i]`. So `a = arr[i-1]`, `b = arr[i]`
      // If `shouldSwapBackward(arr[i-1], arr[i], direction)` is true...
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
          currentPseudoCodeLine: 19, // swap(array[i], array[i+1])
        }
        ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        swapped = true // Pseudo line 20: swapped = true
        yield {
          array: [...arr],
          highlightedIndices: [i - 1, i],
          swappingIndices: [i - 1, i], // Show what was just swapped
          sortedIndices: Array.from(sortedIndices),
          activeRange: { start, end },
          message: `Swapped. New values: ${arr[i - 1]} (at ${i - 1}) and ${arr[i]} (at ${i}).`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 20, // after swap and set swapped = true
        }
      }
    }
    // Pseudo line 22: end of backward for loop
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: 'End of backward pass elements scan.',
      activeRange: { start, end },
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 22,
    }

    sortedIndices.add(start)
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: `End of backward pass. Index ${start} is sorted.`,
      activeRange: { start, end },
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 22, // After loop, before start increment, conceptually end of backward pass work
    }
    // Pseudo line 23: start = start + 1
    start++
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: `Incremented start to ${start}.`,
      activeRange: { start, end },
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 23,
    }

    // Pseudo line 4: Loop condition check for while (swapped)
    // If !swapped, this iteration will be the last one, then break is implicit if loop condition fails
    // If swapped, loop continues. The check itself happens at the top of the while.
    // Yielding a step to show check of `while(swapped)` which is line 4
    yield {
      array: [...arr],
      sortedIndices: Array.from(sortedIndices),
      message: swapped
        ? 'Continuing to next iteration.'
        : 'No swaps in backward pass, array is sorted.',
      activeRange: { start, end },
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 4, // Re-checking while condition
    }
    if (!swapped) break // This break corresponds to an implicit check after a full pass
  }

  // Pseudo line 24: end of while loop
  // All remaining elements in [start, end] range are sorted by now
  for (let k = start; k <= end; k++) sortedIndices.add(k)

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()], // Mark all as sorted
    message: 'Cocktail Shaker Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 25, // End of function
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
