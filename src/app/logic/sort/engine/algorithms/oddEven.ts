'use client'

import { SortGenerator, SortStats } from '../types'

const shouldSwap = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  return direction === 'asc' ? a > b : a < b
}

export const oddEvenSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  let isSorted = false

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Odd-Even Sort',
    numElements: n,
    comparisons: 0,
    swaps: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
  }
  const liveSortedIndices = new Set<number>() // Tracks confirmed sorted elements from ends

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1, 2],
      swappingIndices: null,
      comparisonIndices: [],
      highlightedIndices: [...Array(n).keys()],
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: `Starting Odd-Even Sort. isSorted = ${isSorted}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0, 3],
    sortedIndices: Array.from(liveSortedIndices),
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [],
  }

  let passes = 0

  while (!isSorted) {
    passes++
    isSorted = true
    yield {
      array: [...arr],
      sortedIndices: Array.from(liveSortedIndices),
      message: `Pass ${passes}: Starting new pass. Assuming array is sorted (isSorted = true).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [4, 5],
      swappingIndices: null,
      comparisonIndices: [],
      highlightedIndices: [],
    }

    // Odd phase
    const oddPhaseAllPairs = []
    for (let i = 1; i <= n - 2; i = i + 2) oddPhaseAllPairs.push(i, i + 1)
    yield {
      array: [...arr],
      sortedIndices: Array.from(liveSortedIndices),
      message: `Pass ${passes}: Starting Odd Phase (comparing A[i] with A[i+1] for odd i).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [6],
      swappingIndices: null,
      comparisonIndices: [],
      highlightedIndices: oddPhaseAllPairs.length > 0 ? oddPhaseAllPairs : [],
    }
    for (let i = 1; i <= n - 2; i = i + 2) {
      const val1_before_swap = arr[i]
      const val2_before_swap = arr[i + 1]
      let message: string
      let swappedThisPair = false
      let pseudoCodeLineNumbers: number[]

      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (shouldSwap(val1_before_swap, val2_before_swap, direction)) {
        ;[arr[i], arr[i + 1]] = [val2_before_swap, val1_before_swap]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        isSorted = false
        swappedThisPair = true
        message = `Pass ${passes} (Odd): Compared A[${i}] (${val1_before_swap}) with A[${i + 1}] (${val2_before_swap}). Swapped. New: A[${i}]=${arr[i]}, A[${i + 1}]=${arr[i + 1]}. isSorted is now false.`
        pseudoCodeLineNumbers = [7, 8, 9]
      } else {
        message = `Pass ${passes} (Odd): Compared A[${i}] (${val1_before_swap}) with A[${i + 1}] (${val2_before_swap}). Elements in order. No swap.`
        pseudoCodeLineNumbers = [7, 10]
      }
      yield {
        array: [...arr],
        message: message,
        highlightedIndices: [i, i + 1],
        comparisonIndices: [i, i + 1],
        swappingIndices: swappedThisPair ? [i, i + 1] : null,
        sortedIndices: Array.from(liveSortedIndices),
        currentStats: { ...liveStats },
        currentPseudoCodeLine: pseudoCodeLineNumbers,
      }
    }
    yield {
      array: [...arr],
      sortedIndices: Array.from(liveSortedIndices),
      message: `Pass ${passes}: Odd Phase Complete.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [11],
      swappingIndices: null,
      comparisonIndices: [],
      highlightedIndices: oddPhaseAllPairs.length > 0 ? oddPhaseAllPairs : [],
    }

    // Even phase
    const evenPhaseAllPairs = []
    for (let i = 0; i <= n - 2; i = i + 2) evenPhaseAllPairs.push(i, i + 1)
    yield {
      array: [...arr],
      sortedIndices: Array.from(liveSortedIndices),
      message: `Pass ${passes}: Starting Even Phase (comparing A[i] with A[i+1] for even i).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [12],
      swappingIndices: null,
      comparisonIndices: [],
      highlightedIndices: evenPhaseAllPairs.length > 0 ? evenPhaseAllPairs : [],
    }
    for (let i = 0; i <= n - 2; i = i + 2) {
      const val1_before_swap = arr[i]
      const val2_before_swap = arr[i + 1]
      let message: string
      let swappedThisPair = false
      let pseudoCodeLineNumbers: number[]

      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (shouldSwap(val1_before_swap, val2_before_swap, direction)) {
        ;[arr[i], arr[i + 1]] = [val2_before_swap, val1_before_swap]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        isSorted = false
        swappedThisPair = true
        message = `Pass ${passes} (Even): Compared A[${i}] (${val1_before_swap}) with A[${i + 1}] (${val2_before_swap}). Swapped. New: A[${i}]=${arr[i]}, A[${i + 1}]=${arr[i + 1]}. isSorted is now false.`
        pseudoCodeLineNumbers = [13, 14, 15]
      } else {
        message = `Pass ${passes} (Even): Compared A[${i}] (${val1_before_swap}) with A[${i + 1}] (${val2_before_swap}). Elements in order. No swap.`
        pseudoCodeLineNumbers = [13, 16]
      }
      yield {
        array: [...arr],
        message: message,
        highlightedIndices: [i, i + 1],
        comparisonIndices: [i, i + 1],
        swappingIndices: swappedThisPair ? [i, i + 1] : null,
        sortedIndices: Array.from(liveSortedIndices),
        currentStats: { ...liveStats },
        currentPseudoCodeLine: pseudoCodeLineNumbers,
      }
    }
    yield {
      array: [...arr],
      sortedIndices: Array.from(liveSortedIndices),
      message: `Pass ${passes}: Even Phase Complete. isSorted is now ${isSorted}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [17],
      swappingIndices: null,
      comparisonIndices: [],
      highlightedIndices: evenPhaseAllPairs.length > 0 ? evenPhaseAllPairs : [],
    }

    // Update sortedIndices based on completed passes
    if (direction === 'asc') {
      for (let k = 0; k < passes; k++) {
        if (n - 1 - k >= 0) liveSortedIndices.add(n - 1 - k) // Largest elements settle at the end
      }
    } else {
      // desc
      for (let k = 0; k < passes; k++) {
        if (k < n) liveSortedIndices.add(k) // Smallest elements settle at the beginning
      }
    }
    // Yield after updating sortedIndices for the pass
    yield {
      array: [...arr],
      sortedIndices: Array.from(liveSortedIndices),
      message: `Pass ${passes} complete. Updated sorted regions. isSorted is ${isSorted}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [18], // after even phase, before checking while condition
      swappingIndices: null,
      comparisonIndices: [],
      highlightedIndices: Array.from(liveSortedIndices), // Highlight all currently known sorted indices
    }
  }

  // Final sweep to ensure all indices are marked if isSorted became true without full n passes
  for (let k = 0; k < n; ++k) liveSortedIndices.add(k)

  yield {
    array: [...arr],
    sortedIndices: Array.from(liveSortedIndices),
    message: 'Odd-Even Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [19],
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [...Array(n).keys()],
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
