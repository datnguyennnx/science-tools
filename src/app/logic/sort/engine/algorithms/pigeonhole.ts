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
    holesAuxStructure.data =
      n === 1 ? [{ value: 1, originalIndex: 0, name: `Hole for ${arr[0]}` }] : []
    yield {
      array: [...arr],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0], // pigeonholeSort(array, n)
      currentPassAuxiliaryStructure: { ...holesAuxStructure },
    }
    return {
      finalArray: arr,
      stats: liveStats as SortStats,
      finalAuxiliaryStructures: [{ ...holesAuxStructure }],
    }
  }

  holesAuxStructure.title = 'Pigeonholes (Starting)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: 'Starting Pigeonhole Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0], // pigeonholeSort(array, n)
    currentPassAuxiliaryStructure: { ...holesAuxStructure },
  }

  // 1. Find minimum and maximum values
  let min = arr[0]
  let max = arr[0]

  holesAuxStructure.title = 'Pigeonholes (Scanning for Min/Max)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    highlightedIndices: [...Array(n).keys()], // Highlight whole array being scanned
    message: `Phase 1: Finding min/max values by scanning all ${n} elements. Initial min: ${min}, max: ${max}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [1, 2],
    currentPassAuxiliaryStructure: { ...holesAuxStructure },
  }

  for (let i = 1; i < n; i++) {
    // No yield inside this loop for individual comparisons to consolidate steps
    liveStats.comparisons = (liveStats.comparisons || 0) + 1 // Comparison for min
    if (arr[i] < min) {
      min = arr[i]
    }
    liveStats.comparisons = (liveStats.comparisons || 0) + 1 // Comparison for max
    if (arr[i] > max) {
      max = arr[i]
    }
  }

  holesAuxStructure.title = 'Pigeonholes (Min/Max Found)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: `Phase 1 Complete. Min value: ${min}, Max value: ${max}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [1, 2], // Still relates to finding min/max outcome
    currentPassAuxiliaryStructure: { ...holesAuxStructure },
  }

  const range = max - min + 1
  holesAuxStructure.title = 'Pigeonholes (Range Calculated)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: `Calculated range of values: ${range}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [3], // range = max - min + 1
    currentPassAuxiliaryStructure: { ...holesAuxStructure },
  }

  // 2. Create pigeonholes (array of arrays/lists)
  const holes: number[][] = Array.from({ length: range }, () => [])
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + range

  const updateHolesAuxStructure = (
    h: ReadonlyArray<ReadonlyArray<number>>,
    titleSuffix: string,
    currentMinVal: number
  ) => {
    holesAuxStructure.id = `${holesAuxId}-${titleSuffix.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    holesAuxStructure.data = h.map((holeContent, idx) => ({
      value: holeContent.length,
      originalIndex: idx, // This is the hole index relative to 0 (maps to value min + idx)
      name: `Hole ${idx} (Val ${currentMinVal + idx})`,
      count: holeContent.length,
    }))
    holesAuxStructure.title = `Pigeonholes (${titleSuffix})`
  }

  updateHolesAuxStructure(holes, 'Initialized', min)
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    currentPassAuxiliaryStructure: { ...holesAuxStructure },
    message: `Phase 2: Created ${range} empty pigeonholes for values from ${min} to ${max}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [5],
  }

  // 3. Scatter: Put elements into their corresponding pigeonholes
  // Yield before starting the scatter loop
  updateHolesAuxStructure(holes, 'Ready to Scatter', min)
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: 'Phase 3: Scattering elements into pigeonholes.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [7], // for each element in list
    currentPassAuxiliaryStructure: { ...holesAuxStructure },
  }

  for (let i = 0; i < n; i++) {
    const value = arr[i]
    const holeIndex = value - min

    holes[holeIndex].push(value)
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1

    // Yield once per element scattered, showing its destination and updated holes
    updateHolesAuxStructure(holes, `Scattering ${value} to Hole ${holeIndex}`, min)
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i], // Element being scattered
      message: `Scattering element ${value} (from input index ${i}) into Hole ${holeIndex} (for value ${min + holeIndex}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [7, 8], // for each element, place in hole
      currentPassAuxiliaryStructure: { ...holesAuxStructure },
      // Potentially use historicalAuxiliaryStructures to show state *before* this specific scatter if needed
    }
  }

  updateHolesAuxStructure(holes, 'All Scattered', min)
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array (Scattering Complete)',
    currentPassAuxiliaryStructure: { ...holesAuxStructure },
    message: 'Phase 3 Complete. All elements scattered. Starting gather phase.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [11], // end for (scattering)
  }

  let currentIndex = 0
  const outputArr = [...arr]

  // Inlining the logic from the removed processHole sub-generator:
  // Yield before starting the gather loop
  updateHolesAuxStructure(holes, 'Ready to Gather', min)
  yield {
    array: [...outputArr].map((v, j) => (j < currentIndex ? v : NaN)), // Show empty/partially filled output
    mainArrayLabel: 'Output Array (Building)',
    message: 'Phase 4: Gathering elements from pigeonholes.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [12], // for each hole...
    currentPassAuxiliaryStructure: { ...holesAuxStructure },
  }

  if (direction === 'asc') {
    for (let i = 0; i < range; i++) {
      if (holes[i].length === 0) continue // Skip empty holes quickly

      const currentHoleValue = min + i
      const numInHole = holes[i].length
      updateHolesAuxStructure(holes, `Gathering from Hole ${i} (Val ${currentHoleValue})`, min)
      yield {
        array: [...outputArr].map((v, j) => (j < currentIndex ? v : NaN)),
        mainArrayLabel: 'Output Array (Building)',
        currentPassAuxiliaryStructure: { ...holesAuxStructure },
        message: `Asc: Gathering ${numInHole} element(s) from Hole ${i} (value ${currentHoleValue}). Output to A[${currentIndex}...].`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [12, 14], // for each hole, for each item in hole
      }

      while (holes[i].length > 0) {
        const value = holes[i].shift()!
        liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
        outputArr[currentIndex] = value
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
        const placedIndex = currentIndex
        currentIndex++

        // Yield once per element gathered
        updateHolesAuxStructure(
          holes,
          `Took ${value} from Hole ${i}, Output Idx ${placedIndex}`,
          min
        )
        yield {
          array: [...outputArr].map((v, k) => (k < currentIndex ? v : NaN)),
          mainArrayLabel: 'Output Array (Element Placed)',
          highlightedIndices: [placedIndex],
          currentPassAuxiliaryStructure: { ...holesAuxStructure },
          message: `Asc: Placed ${value} at Output[${placedIndex}]. Hole ${i} (Val ${currentHoleValue}) size now ${holes[i].length}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [15], // list[index++] = element
        }
      }
    }
  } else {
    // Descending order
    for (let i = range - 1; i >= 0; i--) {
      if (holes[i].length === 0) continue

      const currentHoleValue = min + i
      const numInHole = holes[i].length
      updateHolesAuxStructure(holes, `Gathering from Hole ${i} (Val ${currentHoleValue})`, min)
      yield {
        array: [...outputArr].map((v, j) => (j < currentIndex ? v : NaN)),
        mainArrayLabel: 'Output Array (Building)',
        currentPassAuxiliaryStructure: { ...holesAuxStructure },
        message: `Desc: Gathering ${numInHole} element(s) from Hole ${i} (value ${currentHoleValue}). Output to A[${currentIndex}...].`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [12, 14],
      }

      while (holes[i].length > 0) {
        const value = holes[i].shift()!
        liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
        outputArr[currentIndex] = value
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
        const placedIndex = currentIndex
        currentIndex++

        updateHolesAuxStructure(
          holes,
          `Took ${value} from Hole ${i}, Output Idx ${placedIndex}`,
          min
        )
        yield {
          array: [...outputArr].map((v, k) => (k < currentIndex ? v : NaN)),
          mainArrayLabel: 'Output Array (Element Placed)',
          highlightedIndices: [placedIndex],
          currentPassAuxiliaryStructure: { ...holesAuxStructure },
          message: `Desc: Placed ${value} at Output[${placedIndex}]. Hole ${i} (Val ${currentHoleValue}) size now ${holes[i].length}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [15],
        }
      }
    }
  }

  updateHolesAuxStructure(holes, 'Gathering Complete', min)
  yield {
    array: [...outputArr], // Show fully populated array
    mainArrayLabel: 'Output Array (Sorted)',
    message: 'Phase 4 Complete. Finished gathering from all holes.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [17], // end for (gathering)
    currentPassAuxiliaryStructure: { ...holesAuxStructure }, // Holes should be empty
    sortedIndices: [...Array(n).keys()],
  }

  updateHolesAuxStructure(holes, 'Sort Complete', min)
  yield {
    array: [...outputArr],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()],
    message: 'Pigeonhole Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [18], // return list
    currentPassAuxiliaryStructure: { ...holesAuxStructure },
  }

  return {
    finalArray: outputArr,
    stats: liveStats as SortStats,
    finalAuxiliaryStructures: [{ ...holesAuxStructure }],
  }
}
