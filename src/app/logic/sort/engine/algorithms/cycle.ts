'use client'

import { SortGenerator, SortStats } from '../types'

export const cycleSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = new Set<number>()

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Cycle Sort',
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
      currentPseudoCodeLine: [0, 1],
      swappingIndices: null,
      comparisonIndices: [],
      highlightedIndices: [],
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: 'Starting Cycle Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0],
    sortedIndices: Array.from(sortedIndices),
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [],
  }

  for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
    let itemInHand = arr[cycleStart]
    const originalItemFromCycleStart = itemInHand

    yield {
      array: [...arr],
      highlightedIndices: [cycleStart],
      sortedIndices: Array.from(sortedIndices),
      message: `Pass ${cycleStart + 1}/${n - 1}: Considering cycle for item ${originalItemFromCycleStart} (at A[${cycleStart}]). Item in hand: ${itemInHand}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [2, 3],
      swappingIndices: null,
      comparisonIndices: [],
    }

    let pos = cycleStart
    const scanStartIndexForPos = cycleStart + 1
    for (let i = scanStartIndexForPos; i < n; i++) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (
        (direction === 'asc' && arr[i] < itemInHand) ||
        (direction === 'desc' && arr[i] > itemInHand)
      ) {
        pos++
      }
    }

    yield {
      array: [...arr],
      highlightedIndices: [cycleStart, pos],
      activeRange: { start: scanStartIndexForPos, end: n - 1 },
      sortedIndices: Array.from(sortedIndices),
      message: `Finding pos for item ${itemInHand} (from A[${cycleStart}]): Scanned A[${scanStartIndexForPos}...${n - 1}]. Calculated initial position is ${pos}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [4, 5, 6, 7, 8, 9],
      swappingIndices: null,
      comparisonIndices: [],
    }

    if (pos === cycleStart) {
      if (!sortedIndices.has(cycleStart)) sortedIndices.add(cycleStart)
      yield {
        array: [...arr],
        highlightedIndices: [cycleStart],
        sortedIndices: Array.from(sortedIndices),
        message: `Item ${itemInHand} (at A[${cycleStart}]) is already in its correct sorted position.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [11, 12],
        swappingIndices: null,
        comparisonIndices: [],
      }
      continue
    }

    const posBeforeDuplicateCheck = pos
    while (pos < n && itemInHand === arr[pos]) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      pos++
    }
    if (pos !== posBeforeDuplicateCheck) {
      yield {
        array: [...arr],
        highlightedIndices: [cycleStart, posBeforeDuplicateCheck, pos],
        sortedIndices: Array.from(sortedIndices),
        message: `Item ${itemInHand} (from A[${cycleStart}]): Found duplicates. Advanced target position from ${posBeforeDuplicateCheck} to ${pos}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [14, 15, 16],
        swappingIndices: null,
        comparisonIndices: [],
      }
    }

    if (pos < n && pos !== cycleStart) {
      const valAtPosBeforeSwap = arr[pos]
      ;[itemInHand, arr[pos]] = [arr[pos], itemInHand]
      liveStats.swaps = (liveStats.swaps || 0) + 1
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
      if (!sortedIndices.has(pos)) sortedIndices.add(pos)
      yield {
        array: [...arr],
        highlightedIndices: [pos, cycleStart],
        swappingIndices: [pos, cycleStart],
        sortedIndices: Array.from(sortedIndices),
        message: `Placed ${arr[pos]} (was ${originalItemFromCycleStart}) at A[${pos}]. Item in hand is now ${itemInHand} (was ${valAtPosBeforeSwap}).`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [18, 19, 20],
        comparisonIndices: [],
      }
    } else if (pos >= n) {
      yield {
        array: [...arr],
        message: `Item ${itemInHand} position ${pos} is out of bounds. Cycle for ${originalItemFromCycleStart} may be stuck or finished. Consider last element sorted. `,
        highlightedIndices: [cycleStart],
        sortedIndices: Array.from(sortedIndices),
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [18],
        swappingIndices: null,
        comparisonIndices: [],
      }
      if (!sortedIndices.has(cycleStart)) sortedIndices.add(cycleStart)
      continue
    }

    while (pos !== cycleStart && pos < n) {
      const currentItemInHandOriginalValue = itemInHand
      pos = cycleStart
      const scanStartIndexForCyclePos = cycleStart + 1
      for (let i = scanStartIndexForCyclePos; i < n; i++) {
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
        if (
          (direction === 'asc' && arr[i] < itemInHand) ||
          (direction === 'desc' && arr[i] > itemInHand)
        ) {
          pos++
        }
      }
      yield {
        array: [...arr],
        highlightedIndices: [pos, cycleStart],
        activeRange: { start: scanStartIndexForCyclePos, end: n - 1 },
        sortedIndices: Array.from(sortedIndices),
        message: `Continuing cycle: Finding pos for current item ${itemInHand}. Scanned A[${scanStartIndexForCyclePos}...${n - 1}]. Calculated position is ${pos}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [23, 24, 25, 26, 27, 28],
        swappingIndices: null,
        comparisonIndices: [],
      }

      const posBeforeCycleDupCheck = pos
      while (pos < n && itemInHand === arr[pos]) {
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
        pos++
      }
      if (pos !== posBeforeCycleDupCheck) {
        yield {
          array: [...arr],
          highlightedIndices: [cycleStart, posBeforeCycleDupCheck, pos],
          sortedIndices: Array.from(sortedIndices),
          message: `Continuing cycle: Item ${itemInHand} (for current cycle element) found duplicates. Advanced target position from ${posBeforeCycleDupCheck} to ${pos}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [29, 30, 31],
          swappingIndices: null,
          comparisonIndices: [],
        }
      }

      if (pos >= n) {
        yield {
          array: [...arr],
          message: `Continuing cycle: Item ${itemInHand} position ${pos} is out of bounds. Cycle for ${originalItemFromCycleStart} ending.`,
          highlightedIndices: [cycleStart],
          sortedIndices: Array.from(sortedIndices),
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [32],
          swappingIndices: null,
          comparisonIndices: [],
        }
        break
      }

      if (pos === cycleStart) {
        break
      }

      const valAtPosBeforeCycleSwap = arr[pos]
      ;[itemInHand, arr[pos]] = [arr[pos], itemInHand]
      liveStats.swaps = (liveStats.swaps || 0) + 1
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
      if (!sortedIndices.has(pos)) sortedIndices.add(pos)

      yield {
        array: [...arr],
        highlightedIndices: [pos, cycleStart],
        swappingIndices: [pos, cycleStart],
        sortedIndices: Array.from(sortedIndices),
        message: `Continuing cycle: Placed ${arr[pos]} (was ${currentItemInHandOriginalValue}) at A[${pos}]. Item in hand is now ${itemInHand} (was ${valAtPosBeforeCycleSwap}).`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [32],
        comparisonIndices: [],
      }
    }

    if (!sortedIndices.has(cycleStart)) sortedIndices.add(cycleStart)

    yield {
      array: [...arr],
      highlightedIndices: [cycleStart],
      sortedIndices: Array.from(sortedIndices),
      message: `Cycle starting with item ${originalItemFromCycleStart} (from A[${cycleStart}]) complete. A[${cycleStart}] is now ${arr[cycleStart]}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [22, 33],
      swappingIndices: null,
      comparisonIndices: [],
    }
  }

  for (let k = 0; k < n; k++) {
    if (!sortedIndices.has(k)) {
      sortedIndices.add(k)
    }
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Cycle Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [35, 36],
    swappingIndices: null,
    comparisonIndices: [],
    highlightedIndices: [...Array(n).keys()].filter(i => sortedIndices.has(i)),
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
