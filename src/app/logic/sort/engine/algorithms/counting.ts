'use client'

import { SortGenerator, SortStats, AuxiliaryStructure } from '../types'

// Note: Counting Sort assumes non-negative integer inputs.
// It's not a general-purpose comparison sort.
// Visualization will use tempSubArray to show the counts.

export const countingSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arrForMainDisplay = [...initialArray] // Use this for primary array viz unless actively building output
  const n = initialArray.length

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Counting Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
    swaps: 0,
  }

  const countAuxId = 'counting-sort-counts'
  const countDisplaySlot = 'counting-sort-counts-slot'
  const outputAuxId = 'counting-sort-output'
  const outputDisplaySlot = 'counting-sort-output-slot'

  const createCountAux = (
    counts: ReadonlyArray<number>,
    titleSuffix: string,
    minValForOffset?: number
  ): AuxiliaryStructure => ({
    id: `${countAuxId}-${titleSuffix.toLowerCase().replace(/\s+/g, '-')}`,
    title: `Count Array (${titleSuffix})`,
    data: counts.map((val, idx) => ({
      value: val,
      name: minValForOffset !== undefined ? (idx + minValForOffset).toString() : idx.toString(),
      id: `count-item-${idx}`,
    })),
    displaySlot: countDisplaySlot,
  })

  const createOutputAux = (
    outputArr: ReadonlyArray<number | undefined | null>,
    titleSuffix: string
  ): AuxiliaryStructure => ({
    id: `${outputAuxId}-${titleSuffix.toLowerCase().replace(/\s+/g, '-')}`,
    title: `Output Array (${titleSuffix})`,
    data: outputArr.map((val, idx) => ({
      value: val === undefined || val === null || Number.isNaN(val) ? NaN : val,
      originalIndex: idx,
    })),
    displaySlot: outputDisplaySlot,
  })

  if (n <= 1) {
    const finalCountAux = createCountAux([], 'N/A for Small Array')
    const finalOutputAux = createOutputAux(n === 1 ? [initialArray[0]] : [], 'Final')
    yield {
      array: [...initialArray],
      sortedIndices: n === 1 ? [0] : [],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1, 2],
      currentPassAuxiliaryStructure: finalCountAux,
      historicalAuxiliaryStructures: [finalOutputAux],
    }
    return {
      finalArray: [...initialArray],
      stats: liveStats as SortStats,
      finalAuxiliaryStructures: [finalCountAux, finalOutputAux],
    }
  }

  // Phase 1: Find Min and Max
  let minVal = initialArray[0]
  let maxVal = initialArray[0]
  for (let i = 1; i < n; i++) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    if (initialArray[i] < minVal) minVal = initialArray[i]
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
    if (initialArray[i] > maxVal) maxVal = initialArray[i]
  }

  const range = maxVal - minVal + 1
  const count: number[] = new Array(range).fill(0)
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + range // For initializing count array

  yield {
    array: [...arrForMainDisplay],
    mainArrayLabel: 'Input Array',
    message: `Phase 1 (Find Min/Max) Complete. Min: ${minVal}, Max: ${maxVal}. Range: ${range}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [4, 6, 7], // Covers findMinMax, create count array
    currentPassAuxiliaryStructure: createCountAux(count, 'Initialized to Zeros', minVal),
    historicalAuxiliaryStructures: [createOutputAux(new Array(n).fill(undefined), 'Initial')],
  }

  // Phase 2: Count Occurrences
  for (let i = 0; i < n; i++) {
    count[initialArray[i] - minVal]++
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
  }
  yield {
    array: [...arrForMainDisplay],
    mainArrayLabel: 'Input Array',
    message: `Phase 2 (Count Occurrences) Complete. Counts: ${count.join(', ')}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [8, 10], // Covers counting loop
    currentPassAuxiliaryStructure: createCountAux(count, 'Occurrences Counted', minVal),
    historicalAuxiliaryStructures: [createOutputAux(new Array(n).fill(undefined), 'Initial')],
  }

  // Phase 3: Calculate Cumulative Counts (for ascending or descending)
  const cumulativeCountTitlePart =
    direction === 'asc' ? 'Ascending Cumulative' : 'Desc. Prep. Cumulative'
  if (direction === 'asc') {
    for (let i = 1; i < range; i++) {
      count[i] += count[i - 1]
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    }
  } else {
    // For descending, a common way is to sum from right-to-left, or adjust placement logic.
    // Here, we use standard cumulative sum and adjust placement. Or, sum normally and subtract from total.
    // For simpler visualization of counts: sum normally, placement logic will differ.
    for (let i = 1; i < range; i++) {
      count[i] += count[i - 1]
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    }
  }
  yield {
    array: [...arrForMainDisplay],
    mainArrayLabel: 'Input Array',
    message: `Phase 3 (${cumulativeCountTitlePart} Counts) Complete. Counts: ${count.join(', ')}`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [12, 14], // Covers cumulative sum loop
    currentPassAuxiliaryStructure: createCountAux(count, cumulativeCountTitlePart, minVal),
    historicalAuxiliaryStructures: [createOutputAux(new Array(n).fill(undefined), 'Initial')],
  }

  // Phase 4: Build Output Array
  const outputArray = new Array(n).fill(undefined)
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + n // For initializing output array

  // Create a stable copy of counts for this phase as 'count' array will be modified.
  const stableCountsForOutputPhase = createCountAux(count, 'Stable for Output Build', minVal)
  const tempCountsForPlacement = [...count] // This will be decremented

  yield {
    array: [...arrForMainDisplay],
    mainArrayLabel: 'Input Array (Context)',
    message: 'Phase 4 (Build Output Array) Started.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [16, 17], // Covers output array creation and loop start
    currentPassAuxiliaryStructure: createOutputAux(outputArray, 'Building'),
    historicalAuxiliaryStructures: [stableCountsForOutputPhase],
  }

  for (let i = n - 1; i >= 0; i--) {
    const value = initialArray[i]
    const countIndex = value - minVal
    let outputIndex: number

    if (direction === 'asc') {
      outputIndex = tempCountsForPlacement[countIndex] - 1
      tempCountsForPlacement[countIndex]--
    } else {
      // direction === 'desc'
      outputIndex = n - tempCountsForPlacement[countIndex]
      tempCountsForPlacement[countIndex]--
    }
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // for tempCountsForPlacement modification
    outputArray[outputIndex] = value
    liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1 // This is effectively a main array write if output is final destination
    // Or aux write if output is an intermediate structure.
    // Let's count it as main for now as it's the sorted result placeholder.
    // No yield per element, consolidate to end of phase.
  }

  const finalCountsAfterPlacement = createCountAux(
    tempCountsForPlacement,
    'After Placement',
    minVal
  )
  const finalOutputArrayDisplay = createOutputAux(outputArray, 'Built')

  yield {
    array: [...outputArray].map(v => (Number.isNaN(v) ? NaN : v)), // Show the final sorted output array as main
    mainArrayLabel: 'Sorted Array',
    message: `Phase 4 (Build Output Array) Complete. Output: [${outputArray.join(',')}]`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [21], // Covers end of build loop
    currentPassAuxiliaryStructure: finalOutputArrayDisplay,
    historicalAuxiliaryStructures: [finalCountsAfterPlacement],
    sortedIndices: [...Array(n).keys()],
  }

  // Phase 5: Copy Output to Main Array (if initialArray was not directly modified, which it wasn't here)
  // This step is conceptual as outputArray is now the sorted version.
  // If the problem required modifying initialArray in-place, a copy loop would be here.
  // For this generator, outputArray holds the result.

  // Final Completion
  yield {
    array: [...outputArray].map(v => (Number.isNaN(v) ? NaN : v)),
    mainArrayLabel: 'Sorted Array',
    message: 'Counting Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [26, 27], // return list, end procedure
    sortedIndices: [...Array(n).keys()],
    currentPassAuxiliaryStructure: finalOutputArrayDisplay, // Keep showing final output
    historicalAuxiliaryStructures: [finalCountsAfterPlacement], // And final counts
  }

  return {
    finalArray: outputArray.map(v => (Number.isNaN(v) ? 0 : (v as number))), // Ensure numbers for final result
    stats: liveStats as SortStats,
    finalAuxiliaryStructures: [finalCountsAfterPlacement, finalOutputArrayDisplay],
  }
}
