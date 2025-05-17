'use client'

import { SortGenerator, SortStep, AuxiliaryStructure, SortStats } from '../types'

// Modified Insertion Sort for buckets to be a generator and update stats
const insertionSortForBucketGenerator = function* (
  bucket: number[],
  direction: 'asc' | 'desc',
  liveStats: Partial<SortStats>,
  mainArrayVisual: ReadonlyArray<number>,
  bucketActualIndex: number,
  getAllBucketsOverviewAux: () => AuxiliaryStructure[],
  allPriorAuxStructures: ReadonlyArray<AuxiliaryStructure>,
  targetBucketContentAuxId: string
): Generator<SortStep, void, void> {
  const bucketLen = bucket.length

  const updateAndYield = function* (
    stepMessage: string,
    pseudoCodeLine: number,
    isComparisonStep: boolean = false
  ) {
    // Find the specific aux structure for this bucket's content and update it
    const updatedAuxStructures = allPriorAuxStructures.map(aux =>
      aux.id === targetBucketContentAuxId
        ? { ...aux, data: [...bucket], title: `Bucket ${bucketActualIndex} Content (Sorting)` }
        : aux
    )

    // Get the current overview of all buckets to add/replace if it exists
    // For simplicity, let's assume getAllBucketsOverviewAux provides the most current overview
    // and we can filter out any old overview before adding the new one.
    const overviewAux = getAllBucketsOverviewAux() // This likely returns an array, e.g., [overviewStructure]
    const baseStructures = updatedAuxStructures.filter(aux => aux.id !== overviewAux[0]?.id) // Remove old overview

    yield {
      array: [...mainArrayVisual],
      mainArrayLabel: 'Output Array (Building)',
      auxiliaryStructures: [...baseStructures, ...overviewAux],
      message: `Bucket ${bucketActualIndex} (Insertion Sort): ${stepMessage}`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [pseudoCodeLine], // Map to relevant insertion sort pseudo lines
      highlightedIndices: isComparisonStep ? [] : [], // Add specific highlights if needed
      comparisonIndices: isComparisonStep ? [] : [],
    }
  }

  for (let i = 1; i < bucketLen; i++) {
    const key = bucket[i]
    let j = i - 1
    const shouldMove = (k: number, val: number) => (direction === 'asc' ? k > val : k < val)

    // Initial comparison for the loop
    if (j >= 0) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      yield* updateAndYield(`Comparing key ${key} with ${bucket[j]}.`, 1, true) // Pseudo line for insertion sort inner compare
    }

    while (j >= 0 && shouldMove(bucket[j], key)) {
      bucket[j + 1] = bucket[j]
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
      yield* updateAndYield(`Shifted ${bucket[j + 1]} to index ${j + 1}.`, 2) // Pseudo line for shift
      j--
      if (j >= 0) {
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
        yield* updateAndYield(`Next compare with ${bucket[j]}.`, 3, true) // Pseudo line for next compare
      }
    }
    bucket[j + 1] = key
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    yield* updateAndYield(`Placed key ${key} at index ${j + 1}.`, 4) // Pseudo line for placement
  }
  // After sorting, update the specific bucket content one last time to reflect its sorted state.
  const finalUpdatedAuxStructures = allPriorAuxStructures.map(aux =>
    aux.id === targetBucketContentAuxId
      ? { ...aux, data: [...bucket], title: `Bucket ${bucketActualIndex} Content (Sorted)` }
      : aux
  )
  const overviewAuxFinal = getAllBucketsOverviewAux()
  const baseStructuresFinal = finalUpdatedAuxStructures.filter(
    aux => aux.id !== overviewAuxFinal[0]?.id
  )

  yield {
    array: [...mainArrayVisual],
    mainArrayLabel: 'Output Array (Building)',
    auxiliaryStructures: [...baseStructuresFinal, ...overviewAuxFinal],
    message: `Bucket ${bucketActualIndex} (Insertion Sort): Finished sorting bucket.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [5], // End of insertion sort for bucket
  }
}

export const bucketSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length
  const accumulatedFinalAuxStates: AuxiliaryStructure[] = []

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Bucket Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
    swaps: 0, // Not typical swap based
  }

  const bucketOverviewId = 'bucket-sort-overview'
  const bucketOverviewSlot = 'bucket-sort-overview-slot'
  const bucketOverviewAux: AuxiliaryStructure = {
    id: bucketOverviewId,
    title: 'Bucket Overview (Initial)',
    data: [],
    displaySlot: bucketOverviewSlot,
  }
  accumulatedFinalAuxStates.push(bucketOverviewAux)

  if (n <= 1) {
    bucketOverviewAux.data = n === 1 ? [{ value: 1, originalIndex: 0 }] : []
    bucketOverviewAux.title = 'Bucket Overview (Completed)'
    yield {
      array: [...initialArray],
      sortedIndices: n === 1 ? [0] : [],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [1],
      auxiliaryStructures: [...accumulatedFinalAuxStates],
    }
    return {
      finalArray: initialArray,
      stats: liveStats as SortStats,
      finalAuxiliaryStructures: [...accumulatedFinalAuxStates],
    }
  }

  // 1. Find min and max values
  let minVal = arr[0]
  let maxVal = arr[0]
  bucketOverviewAux.title = 'Bucket Overview (Finding Min/Max)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    highlightedIndices: [0],
    message: `Finding min/max. Min: ${minVal}, Max: ${maxVal}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [2],
    auxiliaryStructures: [...accumulatedFinalAuxStates],
  }
  for (let i = 1; i < n; i++) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1 // For < minVal
    if (arr[i] < minVal) minVal = arr[i]
    else {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1 // For > maxVal (only if not < minVal)
      if (arr[i] > maxVal) maxVal = arr[i]
    }
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      message: `Min: ${minVal}, Max: ${maxVal}. Checking index ${i}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [3],
      auxiliaryStructures: [...accumulatedFinalAuxStates],
    }
  }
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: `Min/Max found. Min: ${minVal}, Max: ${maxVal}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [3],
    auxiliaryStructures: [...accumulatedFinalAuxStates],
  }

  if (minVal === maxVal) {
    bucketOverviewAux.title = 'Bucket Overview (All Elements Identical)'
    bucketOverviewAux.data = [{ value: n, originalIndex: 0, label: 'All same' }]
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      sortedIndices: [...Array(n).keys()],
      message: 'All elements are identical. Array is effectively sorted.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [4],
      auxiliaryStructures: [...accumulatedFinalAuxStates],
    }
    return {
      finalArray: arr,
      stats: liveStats as SortStats,
      finalAuxiliaryStructures: [...accumulatedFinalAuxStates],
    }
  }

  // 2. Create buckets
  const bucketCount = n > 0 ? n : 1
  const buckets: number[][] = Array.from({ length: bucketCount }, () => [])
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + bucketCount

  const getCurrentBucketOverviewData = (b: number[][]) =>
    b.map((content, index) => ({ value: content.length, originalIndex: index }))

  bucketOverviewAux.data = getCurrentBucketOverviewData(buckets)
  bucketOverviewAux.title = 'Bucket Overview (Initialized)'

  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    auxiliaryStructures: [...accumulatedFinalAuxStates],
    message: `Created ${bucketCount} empty buckets. Range: [${minVal}-${maxVal}].`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [9],
  }

  // 3. Distribute elements into buckets
  bucketOverviewAux.title = 'Bucket Overview (Preparing to Scatter)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    auxiliaryStructures: [...accumulatedFinalAuxStates],
    message: 'Preparing to scatter elements into buckets.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [12],
  }

  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal
  for (let i = 0; i < n; i++) {
    const value = arr[i]
    const normalizedValue = (value - minVal) / range
    let bucketIndex = Math.floor(normalizedValue * (bucketCount - 1))
    if (value === maxVal && bucketIndex < bucketCount - 1) bucketIndex = bucketCount - 1 // Ensure maxVal goes to last bucket

    // Ensure bucketIndex is within bounds [0, bucketCount - 1]
    bucketIndex = Math.max(0, Math.min(bucketIndex, bucketCount - 1))

    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      message: `Processing element ${arr[i]} for scattering.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [13],
      auxiliaryStructures: [...accumulatedFinalAuxStates],
    }

    buckets[bucketIndex].push(value)
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    bucketOverviewAux.data = getCurrentBucketOverviewData(buckets)
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      message: `Scattered element ${value} into bucket ${bucketIndex}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [16],
      auxiliaryStructures: [...accumulatedFinalAuxStates],
    }
  }
  bucketOverviewAux.title = 'Bucket Overview (Scattered)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    auxiliaryStructures: [...accumulatedFinalAuxStates],
    message: 'All elements scattered into buckets. Preparing to sort individual buckets.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [17],
  }

  // 4. Sort individual buckets
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    auxiliaryStructures: [...accumulatedFinalAuxStates],
    message: 'Sorting individual buckets using Insertion Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [19],
  }

  for (let bucketIdx = 0; bucketIdx < bucketCount; bucketIdx++) {
    if (buckets[bucketIdx].length > 0) {
      const currentBucketContentForMsg = [...buckets[bucketIdx]] // For message before sort

      // Create and add aux structure for this specific bucket's content
      const bucketContentAuxId = `bucket-content-${bucketIdx}`
      const bucketContentSlot = `bucket-slot-${bucketIdx}`
      const bucketContentAux: AuxiliaryStructure = {
        id: bucketContentAuxId,
        title: `Bucket ${bucketIdx} Content (Unsorted)`,
        data: [...buckets[bucketIdx]],
        displaySlot: bucketContentSlot,
      }
      // Add if not already present (e.g. if replaying steps), or update if present
      const existingBucketContentIndex = accumulatedFinalAuxStates.findIndex(
        aux => aux.id === bucketContentAuxId
      )
      if (existingBucketContentIndex !== -1) {
        accumulatedFinalAuxStates[existingBucketContentIndex] = bucketContentAux
      } else {
        accumulatedFinalAuxStates.push(bucketContentAux)
      }

      bucketOverviewAux.title = `Bucket Overview (Sorting Bucket ${bucketIdx})`
      yield {
        array: [...arr],
        mainArrayLabel: 'Output Array (Building)',
        highlightedIndices: [],
        comparisonIndices: [bucketIdx],
        auxiliaryStructures: [...accumulatedFinalAuxStates],
        message: `Sorting bucket ${bucketIdx} with elements: [${currentBucketContentForMsg.join(', ')}] using Insertion Sort.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [20],
      }

      yield* insertionSortForBucketGenerator(
        buckets[bucketIdx], // The actual bucket array to sort
        direction,
        liveStats,
        [...arr], // For visualization context
        bucketIdx, // bucketActualIndex
        () => {
          // getAllBucketsOverviewAux function
          bucketOverviewAux.data = getCurrentBucketOverviewData(buckets)
          // Title will be updated by insertionSort if needed, or we can set it here
          // bucketOverviewAux.title = `Bucket Overview (During Bucket ${bucketIdx} Sort)`
          return [bucketOverviewAux] // Return as array
        },
        [...accumulatedFinalAuxStates], // Pass a copy of current accumulated states
        bucketContentAuxId // ID for the specific bucket content aux to update
      )

      // After insertion sort, the bucketContentAux in accumulatedFinalAuxStates should have been updated to sorted.
      // And buckets[bucketIdx] itself is now sorted.
      bucketOverviewAux.title = `Bucket Overview (Sorted Bucket ${bucketIdx})`
      yield {
        array: [...arr],
        mainArrayLabel: 'Output Array (Building)',
        comparisonIndices: [bucketIdx],
        auxiliaryStructures: [...accumulatedFinalAuxStates],
        message: `Bucket ${bucketIdx} sorted: [${buckets[bucketIdx].join(', ')}]`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [21],
      }
    }
  }

  bucketOverviewAux.title = 'Bucket Overview (Buckets Sorted)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Output Array (Building)',
    auxiliaryStructures: [...accumulatedFinalAuxStates],
    message: 'All buckets sorted. Preparing to gather elements into the output array.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [23],
  }

  // 5. Concatenate sorted buckets
  let currentIndex = 0
  const outputArray = new Array(n)

  for (let i = 0; i < bucketCount; i++) {
    if (buckets[i].length > 0) {
      // Create and add aux structure for this specific bucket's content
      const bucketContentAuxId = `bucket-content-${i}`
      const bucketContentSlot = `bucket-slot-${i}`
      const bucketContentAux: AuxiliaryStructure = {
        id: bucketContentAuxId,
        title: `Bucket ${i} Content (Sorted)`,
        data: [...buckets[i]],
        displaySlot: bucketContentSlot,
      }
      // Add if not already present (e.g. if replaying steps), or update if present
      const existingBucketContentIndex = accumulatedFinalAuxStates.findIndex(
        aux => aux.id === bucketContentAuxId
      )
      if (existingBucketContentIndex !== -1) {
        accumulatedFinalAuxStates[existingBucketContentIndex] = bucketContentAux
      } else {
        accumulatedFinalAuxStates.push(bucketContentAux)
      }

      const currentBucketAuxAndOverview = [
        ...accumulatedFinalAuxStates.filter(aux => aux.id !== bucketOverviewId),
        bucketOverviewAux,
      ]

      for (const value of buckets[i]) {
        yield {
          array: outputArray,
          mainArrayLabel: 'Output Array (Building)',
          highlightedIndices: [currentIndex],
          auxiliaryStructures: [...currentBucketAuxAndOverview],
          message: `Gathering from bucket ${i}: Processing element ${value}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [25],
        }
        outputArray[currentIndex] = value
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
        yield {
          array: outputArray,
          mainArrayLabel: 'Output Array (Building)',
          highlightedIndices: [currentIndex],
          auxiliaryStructures: [...currentBucketAuxAndOverview],
          message: `Placed ${value} from bucket ${i} into output array at index ${currentIndex}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [26],
        }
        currentIndex++
        yield {
          array: outputArray,
          mainArrayLabel: 'Output Array (Building)',
          // Highlight next insertion point if within bounds
          highlightedIndices: currentIndex < n ? [currentIndex] : [],
          auxiliaryStructures: [...currentBucketAuxAndOverview],
          message: `Incremented output index to ${currentIndex}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: [27],
        }
      }
      // Update the specific bucket aux structure to show it as 'Processed' or 'Empty'
      const processedBucketAuxId = `bucket-content-${i}`
      const processedBucketAuxIndex = accumulatedFinalAuxStates.findIndex(
        aux => aux.id === processedBucketAuxId
      )
      if (processedBucketAuxIndex !== -1) {
        accumulatedFinalAuxStates[processedBucketAuxIndex] = {
          ...accumulatedFinalAuxStates[processedBucketAuxIndex],
          title: `Bucket ${i} Content (Processed)`,
        }
      }
      const processedBucketAuxAndOverview = [
        ...accumulatedFinalAuxStates.filter(aux => aux.id !== bucketOverviewId),
        bucketOverviewAux,
      ]
      yield {
        array: outputArray,
        mainArrayLabel: 'Output Array (Building)',
        auxiliaryStructures: [...processedBucketAuxAndOverview],
        message: `Bucket ${i} gathered.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [28],
      }
    }
  }

  bucketOverviewAux.title = 'Bucket Overview (Completed)'
  yield {
    array: outputArray,
    mainArrayLabel: 'Output Array (Sorted)',
    sortedIndices: [...Array(n).keys()],
    auxiliaryStructures: [...accumulatedFinalAuxStates],
    message: 'All elements gathered into the output array.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [29],
  }

  yield {
    array: outputArray,
    mainArrayLabel: 'Output Array (Sorted)',
    sortedIndices: [...Array(n).keys()],
    auxiliaryStructures: [...accumulatedFinalAuxStates],
    message: 'Bucket Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [32],
  }

  return {
    finalArray: outputArray,
    stats: liveStats as SortStats,
    finalAuxiliaryStructures: [...accumulatedFinalAuxStates],
  }
}
