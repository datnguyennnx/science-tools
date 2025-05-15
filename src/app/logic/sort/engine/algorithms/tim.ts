'use client'

import { SortGenerator, SortStep } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer' // Import SortStats

// Define the size of the runs (a common value in TimSort implementations)
const RUN_SIZE = 32

// Insertion sort for sorting runs (adapted to work on a slice and yield steps within the main array context)
const insertionSortForRunGenerator = function* (
  arr: number[],
  left: number,
  right: number, // inclusive right boundary of the run
  direction: 'asc' | 'desc',
  fullArrayRef: number[], // Reference to the full array for yielding
  liveStats: Partial<SortStats>, // Added liveStats
  currentPseudoCodeLine: number // Added currentPseudoCodeLine
): Generator<SortStep, void, void> {
  const runLength = right - left + 1
  yield {
    array: [...fullArrayRef],
    activeRange: { start: left, end: right },
    message: `Sorting run [${left}...${right}] with Insertion Sort.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: currentPseudoCodeLine,
  }

  for (let i = left + 1; i <= right; i++) {
    const key = arr[i]
    let j = i - 1

    yield {
      array: [...fullArrayRef],
      highlightedIndices: [i],
      comparisonIndices: j >= left ? [j] : [], // Compare with j if valid
      activeRange: { start: left, end: right },
      message: `Insertion Sort (Run [${left}...${right}]): Key ${key}. Comparing with ${j >= left ? arr[j] : 'start of run'}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine,
    }

    while (j >= left) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      const shouldInsertBefore = direction === 'asc' ? key < arr[j] : key > arr[j]
      if (!shouldInsertBefore) {
        break
      }

      yield {
        array: [...fullArrayRef],
        highlightedIndices: [j + 1, j],
        comparisonIndices: [i],
        activeRange: { start: left, end: right },
        message: `Shifting ${arr[j]} from index ${j} to ${j + 1}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: currentPseudoCodeLine,
      }
      arr[j + 1] = arr[j]
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      j--

      yield {
        array: [...fullArrayRef],
        highlightedIndices: [j + 1],
        comparisonIndices: j >= left ? [i, j] : [i],
        activeRange: { start: left, end: right },
        message:
          j >= left
            ? `Comparing key ${key} with ${arr[j]}.`
            : `Reached start of run for key ${key}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: currentPseudoCodeLine,
      }
    }
    arr[j + 1] = key
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    yield {
      array: [...fullArrayRef],
      highlightedIndices: [j + 1],
      activeRange: { start: left, end: right },
      message: `Inserted key ${key} at index ${j + 1}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine,
    }
  }
  yield {
    array: [...fullArrayRef],
    activeRange: { start: left, end: right },
    sortedIndices: [...Array(runLength).keys()].map(k => left + k),
    message: `Run [${left}...${right}] sorted.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: currentPseudoCodeLine,
  }
}

// Merge function similar to Merge Sort, adapted for runs
const mergeRunsGenerator = function* (
  arr: number[],
  left: number,
  mid: number,
  right: number, // inclusive right boundary
  direction: 'asc' | 'desc',
  fullArrayRef: number[], // Reference to the full array for yielding
  liveStats: Partial<SortStats>, // Added liveStats
  currentPseudoCodeLine: number // Added currentPseudoCodeLine
): Generator<SortStep, void, void> {
  const len1 = mid - left + 1
  const len2 = right - mid
  const leftTemp = arr.slice(left, mid + 1)
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + len1
  const rightTemp = arr.slice(mid + 1, right + 1)
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + len2

  yield {
    array: [...fullArrayRef],
    activeRange: { start: left, end: right },
    comparisonIndices: [...Array(len1).keys()]
      .map(k => left + k)
      .concat([...Array(len2).keys()].map(k => mid + 1 + k)),
    message: `Merging runs [${left}...${mid}] and [${mid + 1}...${right}]. Left temp: [${leftTemp.join(',')}], Right temp: [${rightTemp.join(',')}]`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: currentPseudoCodeLine,
  }

  let i = 0
  let j = 0
  let k = left

  while (i < len1 && j < len2) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    yield {
      array: [...fullArrayRef],
      activeRange: { start: left, end: right },
      highlightedIndices: [left + i, mid + 1 + j],
      comparisonIndices: [k],
      message: `Comparing ${leftTemp[i]} (from left temp) and ${rightTemp[j]} (from right temp). Placing result at index ${k}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine,
    }

    const takeFromLeft =
      direction === 'asc' ? leftTemp[i] <= rightTemp[j] : leftTemp[i] >= rightTemp[j]

    if (takeFromLeft) {
      arr[k] = leftTemp[i]
      i++
    } else {
      arr[k] = rightTemp[j]
      j++
    }
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    yield {
      array: [...fullArrayRef],
      activeRange: { start: left, end: right },
      highlightedIndices: [k],
      message: `Placed ${arr[k]} at index ${k}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine,
    }
    k++
  }

  while (i < len1) {
    yield {
      array: [...fullArrayRef],
      activeRange: { start: left, end: right },
      highlightedIndices: [left + i],
      comparisonIndices: [k],
      message: `Copying remaining ${leftTemp[i]} from left temp to index ${k}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine,
    }
    arr[k] = leftTemp[i]
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    k++
    i++
    yield {
      array: [...fullArrayRef],
      activeRange: { start: left, end: right },
      highlightedIndices: [k - 1],
      message: `Placed ${arr[k - 1]} at index ${k - 1}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine,
    }
  }

  while (j < len2) {
    yield {
      array: [...fullArrayRef],
      activeRange: { start: left, end: right },
      highlightedIndices: [mid + 1 + j],
      comparisonIndices: [k],
      message: `Copying remaining ${rightTemp[j]} from right temp to index ${k}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine,
    }
    arr[k] = rightTemp[j]
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
    k++
    j++
    yield {
      array: [...fullArrayRef],
      activeRange: { start: left, end: right },
      highlightedIndices: [k - 1],
      message: `Placed ${arr[k - 1]} at index ${k - 1}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: currentPseudoCodeLine,
    }
  }
  yield {
    array: [...fullArrayRef],
    activeRange: { start: left, end: right },
    sortedIndices: [...Array(right - left + 1).keys()].map(idx => left + idx),
    message: `Finished merging runs. Range [${left}...${right}] is now sorted.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: currentPseudoCodeLine,
  }
}

export const timSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Tim Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
    swaps: 0, // Tim Sort uses moves/writes, not direct swaps in the same way as bubble sort
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 0,
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: 'Starting TimSort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 0,
  }

  // Phase 1: Sort individual runs
  yield {
    array: [...arr],
    message: 'Phase 1: Sorting initial runs using Insertion Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 4,
  }
  for (let i = 0; i < n; i += RUN_SIZE) {
    const left = i
    const right = Math.min(i + RUN_SIZE - 1, n - 1)
    yield {
      array: [...arr],
      message: `Creating run for range [${left}...${right}]. Min merge: ${RUN_SIZE}`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 5,
    }
    yield* insertionSortForRunGenerator(arr, left, right, direction, arr, liveStats, 7)
  }

  yield {
    array: [...arr],
    message: 'Finished sorting initial runs. Starting merge phase.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 10,
  }

  // Phase 2: Merge runs
  for (let size = RUN_SIZE; size < n; size = 2 * size) {
    yield {
      array: [...arr],
      message: `Merging runs. Current merge size: ${size}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 12,
    }
    for (let left = 0; left < n; left += 2 * size) {
      const mid = Math.min(left + size - 1, n - 1)
      const right = Math.min(left + 2 * size - 1, n - 1)
      yield {
        array: [...arr],
        message: `Identifying runs to merge. Left: ${left}, Mid: ${mid}, Right: ${right}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 13,
      }

      if (mid < right) {
        yield {
          array: [...arr],
          message: `Condition mid < right true. Merging range [${left}...${right}].`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 16,
        }
        yield* mergeRunsGenerator(arr, left, mid, right, direction, arr, liveStats, 17)
      } else {
        yield {
          array: [...arr],
          activeRange: { start: left, end: right },
          message: `Skipping merge for block starting at ${left} (only one run).`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 16,
        }
      }
    }
    yield {
      array: [...arr],
      message: `Finished merging runs of size ${size}. Preparing for next size.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 20,
    }
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'TimSort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 22,
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
