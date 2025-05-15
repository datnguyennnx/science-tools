'use client'

import { SortGenerator } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer'

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
      swappingIndices: null,
      currentPseudoCodeLine: 0,
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: 'Starting Cycle Sort.',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 0,
  }

  for (let cycleStart = 0; cycleStart <= n - 2; cycleStart++) {
    yield {
      array: [...arr],
      highlightedIndices: [cycleStart],
      sortedIndices: Array.from(sortedIndices),
      message: `Considering cycle starting at index ${cycleStart} (value: ${arr[cycleStart]}).`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 2,
    }

    let itemInHand = arr[cycleStart]
    yield {
      array: [...arr],
      highlightedIndices: [cycleStart],
      sortedIndices: Array.from(sortedIndices),
      message: `Item in hand = ${itemInHand}.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 3,
    }
    let pos = cycleStart
    yield {
      array: [...arr],
      highlightedIndices: [cycleStart],
      sortedIndices: Array.from(sortedIndices),
      message: `Initial position for item = ${pos}.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 4,
    }

    for (let i = cycleStart + 1; i < n; i++) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      yield {
        array: [...arr],
        highlightedIndices: [cycleStart],
        comparisonIndices: [i],
        sortedIndices: Array.from(sortedIndices),
        message: `Finding position for ${itemInHand}: comparing with ${arr[i]}.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: 5,
      }
      if (
        (direction === 'asc' && arr[i] < itemInHand) ||
        (direction === 'desc' && arr[i] > itemInHand)
      ) {
        pos++
        yield {
          array: [...arr],
          highlightedIndices: [cycleStart, i],
          comparisonIndices: [i],
          sortedIndices: Array.from(sortedIndices),
          message: `Element ${arr[i]} is smaller (asc) / larger (desc). Incrementing pos to ${pos}.`,
          currentStats: { ...liveStats },
          swappingIndices: null,
          currentPseudoCodeLine: 6,
        }
      }
    }
    yield {
      array: [...arr],
      highlightedIndices: [cycleStart],
      sortedIndices: Array.from(sortedIndices),
      message: `Finished finding initial position for ${itemInHand}. Correct position: ${pos}.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 7,
    }

    if (pos === cycleStart) {
      yield {
        array: [...arr],
        highlightedIndices: [cycleStart],
        sortedIndices: Array.from(sortedIndices),
        message: `Element ${itemInHand} at index ${cycleStart} is already in its correct sorted position.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: 8,
      }
      sortedIndices.add(cycleStart)
      continue
    }

    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    while (itemInHand === arr[pos]) {
      yield {
        array: [...arr],
        highlightedIndices: [pos],
        sortedIndices: Array.from(sortedIndices),
        message: `Duplicate of ${itemInHand} found at target position ${pos}. Advancing position.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: 9,
      }
      pos++
      if (pos >= n) break
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
    }
    yield {
      array: [...arr],
      highlightedIndices: [pos],
      sortedIndices: Array.from(sortedIndices),
      message: `Final target position for ${itemInHand} is ${pos}.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 9,
    }

    if (pos >= n && itemInHand === arr[n - 1] && pos === n) {
    } else if (pos !== cycleStart) {
      yield {
        array: [...arr],
        highlightedIndices: [],
        comparisonIndices: [],
        swappingIndices: [pos, cycleStart],
        sortedIndices: Array.from(sortedIndices),
        message: `Preparing to place ${itemInHand} (originally from index ${cycleStart}) into position ${pos}. Swapping with ${arr[pos]}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 10,
      }
      ;[itemInHand, arr[pos]] = [arr[pos], itemInHand]
      liveStats.swaps = (liveStats.swaps || 0) + 1
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
      yield {
        array: [...arr],
        highlightedIndices: [pos],
        swappingIndices: [pos, cycleStart],
        sortedIndices: Array.from(sortedIndices),
        message: `Element ${arr[pos]} placed at index ${pos}. New item in hand: ${itemInHand}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 11,
      }
    }
    yield {
      array: [...arr],
      highlightedIndices: [pos],
      sortedIndices: Array.from(sortedIndices),
      message: `Initial placement complete for item from cycleStart ${cycleStart}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 13,
    }

    while (pos !== cycleStart) {
      yield {
        array: [...arr],
        highlightedIndices: [pos, cycleStart],
        sortedIndices: Array.from(sortedIndices),
        message: `Continuing cycle. Current item in hand: ${itemInHand}. Target cycleStart: ${cycleStart}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 14,
      }
      pos = cycleStart
      yield {
        array: [...arr],
        highlightedIndices: [pos],
        sortedIndices: Array.from(sortedIndices),
        message: `Reset pos to cycleStart: ${cycleStart}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 15,
      }
      for (let i = cycleStart + 1; i < n; i++) {
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
        yield {
          array: [...arr],
          comparisonIndices: [i],
          highlightedIndices: [i],
          sortedIndices: Array.from(sortedIndices),
          message: `Cycle rotation: Finding position for item ${itemInHand}. Comparing with ${arr[i]}.`,
          currentStats: { ...liveStats },
          swappingIndices: null,
          currentPseudoCodeLine: 16,
        }
        if (
          (direction === 'asc' && arr[i] < itemInHand) ||
          (direction === 'desc' && arr[i] > itemInHand)
        ) {
          pos++
          yield {
            array: [...arr],
            comparisonIndices: [i],
            highlightedIndices: [i, pos],
            sortedIndices: Array.from(sortedIndices),
            message: `Element ${arr[i]} is smaller (asc) / larger (desc). Incrementing pos to ${pos}.`,
            currentStats: { ...liveStats },
            swappingIndices: null,
            currentPseudoCodeLine: 17,
          }
        }
      }
      yield {
        array: [...arr],
        highlightedIndices: [pos],
        sortedIndices: Array.from(sortedIndices),
        message: `Finished finding next position in cycle for ${itemInHand}. Correct position: ${pos}.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: 18,
      }

      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      while (itemInHand === arr[pos]) {
        yield {
          array: [...arr],
          highlightedIndices: [pos],
          sortedIndices: Array.from(sortedIndices),
          message: `Duplicate of ${itemInHand} found at target position ${pos}. Advancing position.`,
          currentStats: { ...liveStats },
          swappingIndices: null,
          currentPseudoCodeLine: 19,
        }
        pos++
        if (pos >= n) break
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
      }
      yield {
        array: [...arr],
        highlightedIndices: [pos],
        sortedIndices: Array.from(sortedIndices),
        message: `Final target position in cycle for ${itemInHand} is ${pos}.`,
        currentStats: { ...liveStats },
        swappingIndices: null,
        currentPseudoCodeLine: 19,
      }

      if (pos >= n && itemInHand === arr[n - 1] && pos === n) {
      } else if (pos !== cycleStart || (pos === cycleStart && itemInHand !== arr[pos])) {
        const isFinalPlacementInCycle = pos === cycleStart
        const originalElementAtPos = arr[pos]
        yield {
          array: [...arr],
          highlightedIndices: [],
          comparisonIndices: [],
          swappingIndices: [pos, -1],
          sortedIndices: Array.from(sortedIndices),
          message: `Cycle rotation: Preparing to place item ${itemInHand} into position ${pos}. Swapping with ${originalElementAtPos}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 20,
        }
        ;[itemInHand, arr[pos]] = [arr[pos], itemInHand]
        liveStats.swaps = (liveStats.swaps || 0) + 1
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 2
        yield {
          array: [...arr],
          highlightedIndices: [pos],
          swappingIndices: [pos, -1],
          sortedIndices: Array.from(sortedIndices),
          message: `Element ${arr[pos]} placed at index ${pos}. New item in hand: ${itemInHand}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 21,
        }
        if (isFinalPlacementInCycle && itemInHand === initialArray[cycleStart]) {
        }
      }
      yield {
        array: [...arr],
        highlightedIndices: [pos],
        sortedIndices: Array.from(sortedIndices),
        message: `Cycle rotation placement complete.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 23,
      }
    }
    sortedIndices.add(cycleStart)
    yield {
      array: [...arr],
      highlightedIndices: [cycleStart],
      sortedIndices: Array.from(sortedIndices),
      message: `Cycle for original index ${cycleStart} complete. Element ${arr[cycleStart]} is sorted.`,
      currentStats: { ...liveStats },
      swappingIndices: null,
      currentPseudoCodeLine: 24,
    }
  }

  if (n > 0 && !sortedIndices.has(n - 1)) {
    sortedIndices.add(n - 1)
  }

  yield {
    array: [...arr],
    sortedIndices: Array.from(sortedIndices),
    message: 'Cycle Sort Complete!',
    currentStats: { ...liveStats },
    swappingIndices: null,
    currentPseudoCodeLine: 25,
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}
