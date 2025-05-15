'use client'

import { SortGenerator, SortStep } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer' // Import SortStats

export const pigeonholeSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray] // Work with a copy
  const n = arr.length

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Pigeonhole Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
    swaps: 0, // Pigeonhole sort doesn't typically swap
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 0, // pigeonholeSort(array, n)
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: 'Starting Pigeonhole Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 0, // pigeonholeSort(array, n)
  }

  // 1. Find minimum and maximum values
  let min = arr[0] // Assuming arr[0] exists due to n > 1 check
  let max = arr[0]
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    highlightedIndices: [0],
    message: `Finding min/max. Current min: ${min}, max: ${max}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 1, // min = findMin(array) (initial step)
  }
  for (let i = 1; i < n; i++) {
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      message: `Checking index ${i}. Current min: ${min}, max: ${max}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 1, // Still part of findMin or findMax logic
    }
    liveStats.comparisons = (liveStats.comparisons || 0) + 1 // For the < min comparison
    if (arr[i] < min) {
      min = arr[i]
      yield {
        array: [...arr],
        mainArrayLabel: 'Input Array',
        highlightedIndices: [i],
        message: `New min found: ${min}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 1, // findMin updated
      }
    } else {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1 // For the > max comparison (only if not < min)
      if (arr[i] > max) {
        max = arr[i]
        yield {
          array: [...arr],
          mainArrayLabel: 'Input Array',
          highlightedIndices: [i],
          message: `New max found: ${max}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 2, // max = findMax(array) updated
        }
      }
    }
  }
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: `Min value: ${min}, Max value: ${max}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 2, // After findMax completes
  }

  const range = max - min + 1
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: `Calculated range: ${range}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 3, // range = max - min + 1
  }

  // 2. Create pigeonholes (array of arrays/lists)
  const holes: number[][] = Array.from({ length: range }, () => [])
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + range // For creating 'range' empty arrays

  // Visualize holes using auxiliaryStructures
  const visualizeHoles = (h: number[][], titleSuffix: string) => [
    {
      id: 'pigeonholes',
      title: `Pigeonholes (${titleSuffix})`,
      data: h.map((holeContent, idx) => ({
        value: holeContent.length,
        originalIndex: idx,
      })),
    },
  ]

  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    auxiliaryStructures: visualizeHoles(holes, 'Initialized'),
    message: `Created ${range} pigeonholes for values from ${min} to ${max}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 4, // holes = new array of lists...
  }

  // 3. Scatter: Put elements into their corresponding pigeonholes
  for (let i = 0; i < n; i++) {
    const value = arr[i]
    const holeIndex = value - min
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      message: `Processing element ${arr[i]} for scattering.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 5, // for each element in array
    }
    holes[holeIndex].push(value)
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // For .push() into a hole
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      comparisonIndices: [holeIndex],
      auxiliaryStructures: visualizeHoles(holes, 'Scattering'),
      message: `Placing element ${value} (from index ${i}) into hole ${holeIndex} (value ${min + holeIndex}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 6, // add element to holes[element - min]
    }
  }
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array (Before Gather)',
    auxiliaryStructures: visualizeHoles(holes, 'Scattered'),
    message: 'Finished scattering elements into holes. Starting gather phase.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 7, // Closing brace of scatter loop
  }

  // 4. Gather: Iterate through holes and put elements back into array
  let currentIndex = 0
  const outputArr = [...arr] // Build output into a copy. This copy itself is n aux writes if strict, or n main writes if it *becomes* the main array.
  // Since we return outputArr, let's count writes to it as mainArrayWrites.
  // The initial copy [...arr] could be counted as n reads from arr.

  const processHole = function* (
    holeIndex: number,
    statsRef: Partial<SortStats>
  ): Generator<SortStep, void, void> {
    // Pass liveStats as statsRef
    const currentHole = holes[holeIndex]
    if (currentHole.length === 0) return

    yield {
      array: [...outputArr].map((v, i) => (i < currentIndex ? v : NaN)),
      mainArrayLabel: 'Output Array (Gathering)',
      auxiliaryStructures: visualizeHoles(holes, `Gathering from Hole ${holeIndex}`),
      comparisonIndices: [holeIndex],
      message: `Gathering from hole ${holeIndex} (value ${min + holeIndex}). Contains: [${currentHole.join(', ')}]`,
      currentStats: { ...statsRef }, // Use passed statsRef
      currentPseudoCodeLine: 10, // for each element in holes[i]
    }

    for (const value of currentHole) {
      yield {
        array: [...outputArr].map((v, i) => (i < currentIndex ? v : NaN)),
        mainArrayLabel: 'Output Array (Placing)',
        highlightedIndices: [currentIndex],
        comparisonIndices: [holeIndex],
        auxiliaryStructures: visualizeHoles(holes, `Placing from Hole ${holeIndex}`),
        message: `Placing value ${value} from hole ${holeIndex} into array index ${currentIndex}.`,
        currentStats: { ...statsRef },
        currentPseudoCodeLine: 11, // array[index] = element
      }
      outputArr[currentIndex] = value
      statsRef.mainArrayWrites = (statsRef.mainArrayWrites || 0) + 1 // Update through statsRef
      currentIndex++
      yield {
        array: [...outputArr].map((v, i) => (i < currentIndex ? v : NaN)),
        mainArrayLabel: 'Output Array (Placed)',
        highlightedIndices: [currentIndex - 1],
        comparisonIndices: [holeIndex],
        auxiliaryStructures: visualizeHoles(holes, `Placed from Hole ${holeIndex}`),
        message: `Placed ${outputArr[currentIndex - 1]} at index ${currentIndex - 1}.`,
        currentStats: { ...statsRef },
        currentPseudoCodeLine: 12, // index++
      }
    }
    yield {
      array: [...outputArr].map((v, i) => (i < currentIndex ? v : NaN)),
      mainArrayLabel: 'Output Array (Gathering)',
      auxiliaryStructures: visualizeHoles(holes, `Finished Hole ${holeIndex}`),
      message: `Finished gathering from hole ${holeIndex}.`,
      currentStats: { ...statsRef },
      currentPseudoCodeLine: 13,
    }
  }

  if (direction === 'asc') {
    for (let i = 0; i < range; i++) {
      yield {
        array: [...outputArr].map((v, j) => (j < currentIndex ? v : NaN)),
        mainArrayLabel: 'Output Array (Gathering)',
        message: `Processing hole ${i} for ascending order.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 9, // for i from 0 to range - 1
      }
      yield* processHole(i, liveStats) // Pass liveStats
    }
  } else {
    for (let i = range - 1; i >= 0; i--) {
      yield {
        array: [...outputArr].map((v, j) => (j < currentIndex ? v : NaN)),
        mainArrayLabel: 'Output Array (Gathering)',
        message: `Processing hole ${i} for descending order.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 9, // for i from 0 to range - 1 (logic adapted for desc)
      }
      yield* processHole(i, liveStats) // Pass liveStats
    }
  }
  yield {
    array: [...outputArr].map((v, i) => (i < currentIndex ? v : NaN)),
    mainArrayLabel: 'Output Array (Gathering)',
    message: 'Finished gathering from all holes.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 14,
  }

  yield {
    array: [...outputArr],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()],
    message: 'Pigeonhole Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 15, // Closing brace of function
  }

  return { finalArray: outputArr, stats: liveStats as SortStats }
}
