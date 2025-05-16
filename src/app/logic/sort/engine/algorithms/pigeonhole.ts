'use client'

import { SortGenerator, SortStats, AuxiliaryStructure } from '../types'

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

  const holesAuxId = 'pigeonhole-sort-holes'
  const holesDisplaySlot = 'pigeonhole-sort-main-slot'
  const holesAuxStructure: AuxiliaryStructure = {
    id: holesAuxId,
    title: 'Pigeonholes (Initial)',
    data: [], // Data will be an array of objects representing holes
    displaySlot: holesDisplaySlot,
  }

  if (n <= 1) {
    holesAuxStructure.title = 'Pigeonholes (Completed)'
    holesAuxStructure.data = n === 1 ? [{ value: 1, originalIndex: 0, label: 'Hole 0' }] : []
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 0, // pigeonholeSort(array, n)
      auxiliaryStructures: [holesAuxStructure],
    }
    return {
      finalArray: arr,
      stats: liveStats as SortStats,
      finalAuxiliaryStructures: [holesAuxStructure],
    }
  }

  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: 'Starting Pigeonhole Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 0, // pigeonholeSort(array, n)
    auxiliaryStructures: [holesAuxStructure],
  }

  // 1. Find minimum and maximum values
  let min = arr[0]
  let max = arr[0]
  holesAuxStructure.title = 'Pigeonholes (Finding Min/Max)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    highlightedIndices: [0],
    message: `Finding min/max. Current min: ${min}, max: ${max}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 1,
    auxiliaryStructures: [holesAuxStructure],
  }
  for (let i = 1; i < n; i++) {
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      message: `Checking index ${i}. Current min: ${min}, max: ${max}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 1,
      auxiliaryStructures: [holesAuxStructure],
    }
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    if (arr[i] < min) {
      min = arr[i]
      yield {
        array: [...arr],
        mainArrayLabel: 'Input Array',
        highlightedIndices: [i],
        message: `New min found: ${min}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 1,
        auxiliaryStructures: [holesAuxStructure],
      }
    } else {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      if (arr[i] > max) {
        max = arr[i]
        yield {
          array: [...arr],
          mainArrayLabel: 'Input Array',
          highlightedIndices: [i],
          message: `New max found: ${max}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 2,
          auxiliaryStructures: [holesAuxStructure],
        }
      }
    }
  }
  holesAuxStructure.title = 'Pigeonholes (Min/Max Found)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: `Min value: ${min}, Max value: ${max}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 2,
    auxiliaryStructures: [holesAuxStructure],
  }

  const range = max - min + 1
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: `Calculated range: ${range}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 3, // range = max - min + 1
    auxiliaryStructures: [holesAuxStructure],
  }

  // 2. Create pigeonholes (array of arrays/lists)
  const holes: number[][] = Array.from({ length: range }, () => [])
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + range

  const updateHolesAuxStructure = (h: number[][], titleSuffix: string) => {
    holesAuxStructure.data = h.map((holeContent, idx) => ({
      value: holeContent.length,
      originalIndex: idx, // This is the hole index relative to 0 (maps to value min + idx)
      label: `Hole ${idx} (Val ${min + idx}): ${holeContent.length} items`,
    }))
    holesAuxStructure.title = `Pigeonholes (${titleSuffix})`
  }

  updateHolesAuxStructure(holes, 'Initialized')
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    auxiliaryStructures: [holesAuxStructure],
    message: `Created ${range} pigeonholes for values from ${min} to ${max}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 4,
  }

  // 3. Scatter: Put elements into their corresponding pigeonholes
  for (let i = 0; i < n; i++) {
    const value = arr[i]
    const holeIndex = value - min
    updateHolesAuxStructure(holes, 'Scattering') // Show state before adding
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      message: `Processing element ${arr[i]} for scattering.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 5, // for each element in array
      auxiliaryStructures: [holesAuxStructure],
    }
    holes[holeIndex].push(value)
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    updateHolesAuxStructure(holes, 'Scattering') // Show state after adding
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      comparisonIndices: [holeIndex],
      auxiliaryStructures: [holesAuxStructure],
      message: `Placing element ${value} (from index ${i}) into hole ${holeIndex} (value ${min + holeIndex}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 6,
    }
  }
  updateHolesAuxStructure(holes, 'Scattered')
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array (Before Gather)',
    auxiliaryStructures: [holesAuxStructure],
    message: 'Finished scattering elements into holes. Starting gather phase.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 7,
  }

  let currentIndex = 0
  const outputArr = [...arr]

  // Inlining the logic from the removed processHole sub-generator:
  if (direction === 'asc') {
    for (let i = 0; i < range; i++) {
      // For each hole
      updateHolesAuxStructure(holes, `Gathering from Hole ${i}`)
      yield {
        array: [...outputArr].map((v, j) => (j < currentIndex ? v : NaN)),
        mainArrayLabel: 'Output Array (Gathering)',
        auxiliaryStructures: [holesAuxStructure],
        comparisonIndices: [i],
        message: `Processing hole ${i} (value ${min + i}) for ascending order. Contains: [${holes[i].join(', ')}]`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 9,
      }
      while (holes[i].length > 0) {
        // For each element in the current hole
        const value = holes[i].shift()! // Get element from hole
        liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // For shift

        updateHolesAuxStructure(holes, `Placing from Hole ${i}`)
        yield {
          array: [...outputArr].map((v, k) => (k < currentIndex ? v : NaN)),
          mainArrayLabel: 'Output Array (Placing)',
          highlightedIndices: [currentIndex],
          comparisonIndices: [i],
          auxiliaryStructures: [holesAuxStructure],
          message: `Placing value ${value} from hole ${i} into array index ${currentIndex}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 11,
        }
        outputArr[currentIndex] = value
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1

        const placedValue = outputArr[currentIndex] // for message
        currentIndex++ // Increment current index for the main output array

        updateHolesAuxStructure(holes, `Placed from Hole ${i}`)
        yield {
          array: [...outputArr].map((v, k) => (k < currentIndex ? v : NaN)),
          mainArrayLabel: 'Output Array (Placed)',
          highlightedIndices: [currentIndex - 1],
          comparisonIndices: [i],
          auxiliaryStructures: [holesAuxStructure],
          message: `Placed ${placedValue} at index ${currentIndex - 1}. Hole ${i} size now ${holes[i].length}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 12,
        }
      }
      updateHolesAuxStructure(holes, `Finished Hole ${i}`)
      yield {
        array: [...outputArr].map((v, j) => (j < currentIndex ? v : NaN)),
        mainArrayLabel: 'Output Array (Gathering)',
        auxiliaryStructures: [holesAuxStructure],
        message: `Finished gathering from hole ${i}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 13,
      }
    }
  } else {
    // Descending order
    for (let i = range - 1; i >= 0; i--) {
      // Iterate holes in reverse for descending
      updateHolesAuxStructure(holes, `Gathering from Hole ${i}`)
      yield {
        array: [...outputArr].map((v, j) => (j < currentIndex ? v : NaN)),
        mainArrayLabel: 'Output Array (Gathering)',
        auxiliaryStructures: [holesAuxStructure],
        comparisonIndices: [i],
        message: `Processing hole ${i} (value ${min + i}) for descending order. Contains: [${holes[i].join(', ')}]`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 9,
      }
      while (holes[i].length > 0) {
        // For each element in the current hole
        const value = holes[i].shift()!
        liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1

        updateHolesAuxStructure(holes, `Placing from Hole ${i}`)
        yield {
          array: [...outputArr].map((v, k) => (k < currentIndex ? v : NaN)),
          mainArrayLabel: 'Output Array (Placing)',
          highlightedIndices: [currentIndex],
          comparisonIndices: [i],
          auxiliaryStructures: [holesAuxStructure],
          message: `Placing value ${value} from hole ${i} into array index ${currentIndex}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 11,
        }
        outputArr[currentIndex] = value
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1

        const placedValue = outputArr[currentIndex]
        currentIndex++

        updateHolesAuxStructure(holes, `Placed from Hole ${i}`)
        yield {
          array: [...outputArr].map((v, k) => (k < currentIndex ? v : NaN)),
          mainArrayLabel: 'Output Array (Placed)',
          highlightedIndices: [currentIndex - 1],
          comparisonIndices: [i],
          auxiliaryStructures: [holesAuxStructure],
          message: `Placed ${placedValue} at index ${currentIndex - 1}. Hole ${i} size now ${holes[i].length}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 12,
        }
      }
      updateHolesAuxStructure(holes, `Finished Hole ${i}`)
      yield {
        array: [...outputArr].map((v, j) => (j < currentIndex ? v : NaN)),
        mainArrayLabel: 'Output Array (Gathering)',
        auxiliaryStructures: [holesAuxStructure],
        message: `Finished gathering from hole ${i}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 13,
      }
    }
  }
  updateHolesAuxStructure(holes, 'Gathering Complete') // Holes should be empty now
  yield {
    array: [...outputArr].map((v, i) => (i < currentIndex ? v : NaN)),
    mainArrayLabel: 'Output Array (Gathering)',
    message: 'Finished gathering from all holes.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 14,
    auxiliaryStructures: [holesAuxStructure],
  }

  updateHolesAuxStructure(holes, 'Sort Complete')
  yield {
    array: [...outputArr],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()],
    message: 'Pigeonhole Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 15, // Closing brace of function
    auxiliaryStructures: [holesAuxStructure],
  }

  return {
    finalArray: outputArr,
    stats: liveStats as SortStats,
    finalAuxiliaryStructures: [holesAuxStructure],
  }
}
