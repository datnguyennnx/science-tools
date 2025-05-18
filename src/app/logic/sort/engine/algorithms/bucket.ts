'use client'

import { SortGenerator, SortStep, AuxiliaryStructure, SortStats } from '../types'

// Modified Insertion Sort for buckets to be a generator and update stats
const insertionSortForBucketGenerator = function* (
  bucket: number[], // The actual bucket array to sort
  direction: 'asc' | 'desc',
  liveStats: Partial<SortStats>,
  bucketActualIndex: number,
  parentMainArraySnapshot: ReadonlyArray<number> // Snapshot of the main array for yielding context
): Generator<SortStep, void, void> {
  const bucketLen = bucket.length
  const bucketContentAuxId = `bucket-content-${bucketActualIndex}`
  const bucketContentSlot = `bucket-slot-${bucketActualIndex}`

  const createBucketStructure = (statusSuffix: string): AuxiliaryStructure => ({
    id: `${bucketContentAuxId}-${statusSuffix.toLowerCase().replace(/\s+/g, '-')}`,
    title: `Bucket ${bucketActualIndex} Content (${statusSuffix})`,
    data: [...bucket], // Show current state of the bucket being sorted
    displaySlot: bucketContentSlot,
  })

  const yieldSortStep = function* (
    message: string,
    pseudoCodeLines: number[],
    isSortedStatus = false
  ) {
    yield {
      array: [...parentMainArraySnapshot], // Main array context
      mainArrayLabel: 'Output Array (Building) / Main Array (Unchanged)', // Generic label
      currentPassAuxiliaryStructure: createBucketStructure(isSortedStatus ? 'Sorted' : 'Sorting'),
      message: `Bucket ${bucketActualIndex} (Insertion Sort): ${message}`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: pseudoCodeLines,
    }
  }

  if (bucketLen <= 1) {
    yield* yieldSortStep(
      `Bucket has ${bucketLen} element(s), considered sorted.`,
      [35], // PT: "for i = 1 to length of bucket - 1" (vacuously true/false)
      true
    )
    return
  }

  yield* yieldSortStep(`Starting Insertion Sort for this bucket. Length: ${bucketLen}.`, [34]) // PT: sort_bucket_using_insertion_sort

  for (let i = 1; i < bucketLen; i++) {
    const key = bucket[i]
    let j = i - 1
    const keyOriginalPositionInBucket = i
    let shiftsDone = 0

    const shouldMove = (kValue: number, keyValue: number) =>
      direction === 'asc' ? kValue > keyValue : kValue < keyValue

    // Store initial j for message clarity if elements are shifted
    const initialJBeforeShifting = j

    while (j >= 0 && shouldMove(bucket[j], key)) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      bucket[j + 1] = bucket[j]
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // Write to bucket (auxiliary)
      j = j - 1
      shiftsDone++
    }
    // Comparison that exits the loop (or first comparison if loop doesn't run)
    if (j >= 0) {
      // If loop didn't go all the way to -1
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
    }

    const insertionPointInBucket = j + 1
    bucket[insertionPointInBucket] = key
    if (insertionPointInBucket !== keyOriginalPositionInBucket) {
      // Key moved
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // Write to bucket (auxiliary)
    }

    let message = `Processed key ${key} (from bucket index ${keyOriginalPositionInBucket}). `
    if (shiftsDone > 0) {
      message += `Shifted ${shiftsDone} element(s) (from index ${initialJBeforeShifting} down to ${insertionPointInBucket}). Placed key at bucket index ${insertionPointInBucket}.`
    } else {
      message += `It was already in its sorted position relative to elements to its left (at bucket index ${insertionPointInBucket}).`
    }

    // Yield once per key after it has been placed
    yield* yieldSortStep(message, [35, 36, 37, 38, 39, 40, 41, 42]) // PT: Covers inner loop and placement
  }

  yield* yieldSortStep(`Finished Insertion Sort for this bucket.`, [43, 44], true) // PT: end for, (bucket sorted)
}

export const bucketSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray] // Original array reference for context, not modified by bucket sort directly until final gather
  const n = arr.length

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Bucket Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0, // For final output array construction
    auxiliaryArrayWrites: 0, // For buckets, count array, etc.
    swaps: 0,
  }

  const bucketOverviewId = 'bucket-sort-overview'
  const bucketOverviewSlot = 'bucket-sort-overview-slot'
  const currentBucketOverviewAux: AuxiliaryStructure = {
    id: bucketOverviewId,
    title: 'Bucket Overview (Initial)',
    data: [], // Will show { value: count, originalIndex: bucket_idx }
    displaySlot: bucketOverviewSlot,
  }

  const createBucketContentAux = (
    bucketIndex: number,
    bucketData: readonly number[], // Make it readonly for safety in display
    status: string
  ): AuxiliaryStructure => ({
    id: `bucket-content-${bucketIndex}-${status.toLowerCase().replace(/\s+/g, '-')}`,
    title: `Bucket ${bucketIndex} Content (${status})`,
    data: [...bucketData], // Ensure a copy for the structure
    displaySlot: `bucket-slot-${bucketIndex}`, // Unique slot per bucket for potential side-by-side
  })

  if (n <= 1) {
    currentBucketOverviewAux.data =
      n === 1 ? [{ value: 1, originalIndex: 0, label: 'Single element' }] : []
    currentBucketOverviewAux.title = 'Bucket Overview (Completed - Trivial Case)'
    yield {
      array: [...initialArray], // Use initialArray for the final sorted array here
      sortedIndices: n === 1 ? [0] : [],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1], // PT: procedure, if n<=1
      currentPassAuxiliaryStructure: currentBucketOverviewAux,
    }
    return {
      finalArray: [...initialArray], // Return the original array as it's already sorted
      stats: liveStats as SortStats,
      finalAuxiliaryStructures: [currentBucketOverviewAux],
    }
  }

  yield {
    array: [...arr], // Show original array
    mainArrayLabel: 'Input Array',
    message: 'Starting Bucket Sort.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0], // PT: procedure bucketSort
    currentPassAuxiliaryStructure: currentBucketOverviewAux, // Initial empty overview
  }

  // Phase 1: Find min and max values
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: `Phase 1: Finding min and max values by scanning all elements.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [2, 3], // PT: findMinValue, findMaxValue
    currentPassAuxiliaryStructure: {
      ...currentBucketOverviewAux,
      title: 'Bucket Overview (Finding Min/Max)',
    },
  }
  let minVal = arr[0]
  let maxVal = arr[0]
  for (let i = 1; i < n; i++) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1 // For min
    if (arr[i] < minVal) minVal = arr[i]
    liveStats.comparisons = (liveStats.comparisons || 0) + 1 // For max
    if (arr[i] > maxVal) maxVal = arr[i]
    // No yield inside this loop for consolidation
  }
  currentBucketOverviewAux.title = 'Bucket Overview (Min/Max Found)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: `Phase 1 Complete. Min: ${minVal}, Max: ${maxVal}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [2, 3], // Still relates to finding min/max
    currentPassAuxiliaryStructure: currentBucketOverviewAux,
  }

  if (minVal === maxVal) {
    currentBucketOverviewAux.title = 'Bucket Overview (All Elements Identical)'
    currentBucketOverviewAux.data = [{ value: n, originalIndex: 0, label: 'All same value' }]
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array (Effectively Sorted)',
      sortedIndices: [...Array(n).keys()],
      message: 'All elements are identical. Array is effectively sorted.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [4], // PT: if minVal == maxVal then return list
      currentPassAuxiliaryStructure: currentBucketOverviewAux,
    }
    return {
      finalArray: [...arr],
      stats: liveStats as SortStats,
      finalAuxiliaryStructures: [currentBucketOverviewAux],
    }
  }

  // Phase 2: Create buckets
  const numBucketsSpecified = n // Using n as default numBuckets from PT line 6
  const bucketCount = numBucketsSpecified > 0 ? numBucketsSpecified : 1 // PT line 7
  const buckets: number[][] = Array.from({ length: bucketCount }, () => [])
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + bucketCount // For bucket array structure itself

  const getCurrentBucketOverviewData = (b: number[][]): AuxiliaryStructure['data'] =>
    b.map((content, index) => ({ value: content.length, originalIndex: index, name: `B${index}` }))

  currentBucketOverviewAux.data = getCurrentBucketOverviewData(buckets)
  currentBucketOverviewAux.title = 'Bucket Overview (Initialized Empty)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: `Phase 2: Created ${bucketCount} empty buckets. Range for distribution: [${minVal}-${maxVal}].`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [6, 7, 9, 10], // PT: numBuckets, rangePerBucket, create buckets
    currentPassAuxiliaryStructure: currentBucketOverviewAux,
  }
  const pRangePerBucket = (maxVal - minVal + 1.0) / bucketCount // PT line 10

  // Phase 3: Distribute elements into buckets
  currentBucketOverviewAux.title = 'Bucket Overview (Scattering Elements)'
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: 'Phase 3: Scattering elements into buckets.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [12], // PT: for each element in list (scatter)
    currentPassAuxiliaryStructure: currentBucketOverviewAux, // Show overview before scattering
  }
  for (let i = 0; i < n; i++) {
    const value = arr[i]
    let bucketIndex: number
    if (pRangePerBucket === 0) {
      // Avoid division by zero
      bucketIndex = 0
    } else {
      bucketIndex = Math.floor((value - minVal) / pRangePerBucket)
    }
    if (value === maxVal && bucketCount > 1) {
      // Ensure maxVal lands in the last bucket
      bucketIndex = bucketCount - 1
    }
    bucketIndex = Math.max(0, Math.min(bucketIndex, bucketCount - 1)) // Clamp index

    buckets[bucketIndex].push(value)
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // For pushing to a bucket
    // No yield per element scattered
  }
  currentBucketOverviewAux.data = getCurrentBucketOverviewData(buckets)
  currentBucketOverviewAux.title = 'Bucket Overview (Scattering Complete)'
  yield {
    array: [...arr], // Original array state shown alongside populated buckets
    mainArrayLabel: 'Input Array (Scattering Phase)',
    message: `Phase 3 Complete. All elements scattered into respective buckets.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [17], // PT: end for (scatter)
    currentPassAuxiliaryStructure: currentBucketOverviewAux, // Show overview with counts
  }

  // Phase 4: Sort individual buckets
  const outputArrayForContext = [...arr] // Use a non-mutating copy for main array display during this phase
  let historicalAuxForBucketSorts: AuxiliaryStructure[] = [
    { ...currentBucketOverviewAux, title: 'Bucket Overview (Pre-Sort)' },
  ]

  yield {
    array: [...outputArrayForContext],
    mainArrayLabel: 'Main Array (Unchanged During Bucket Sorts)',
    message: 'Phase 4: Sorting individual buckets (e.g., using Insertion Sort).',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [19], // PT: for each bucket in buckets (sort phase)
    currentPassAuxiliaryStructure: currentBucketOverviewAux, // Show overview before any sort
    historicalAuxiliaryStructures: [],
  }

  for (let bucketIdx = 0; bucketIdx < bucketCount; bucketIdx++) {
    if (buckets[bucketIdx].length > 0) {
      const unsortedBucketDisplay = createBucketContentAux(
        bucketIdx,
        buckets[bucketIdx],
        'Unsorted'
      )

      // Yield before sorting this specific bucket
      yield {
        array: [...outputArrayForContext],
        mainArrayLabel: 'Main Array (Unchanged)',
        message: `Sorting bucket ${bucketIdx}. Contains: [${buckets[bucketIdx].join(', ')}]`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [20], // PT: insertionSort(bucket, direction)
        currentPassAuxiliaryStructure: unsortedBucketDisplay, // Focus on the bucket being sorted
        historicalAuxiliaryStructures: historicalAuxForBucketSorts, // Show overall bucket state
      }

      yield* insertionSortForBucketGenerator(
        buckets[bucketIdx], // Pass mutable bucket
        direction,
        liveStats,
        bucketIdx,
        outputArrayForContext // Pass main array context
      )
      // buckets[bucketIdx] is now sorted in-place by the sub-generator

      const sortedBucketDisplay = createBucketContentAux(bucketIdx, buckets[bucketIdx], 'Sorted')
      currentBucketOverviewAux.data = getCurrentBucketOverviewData(buckets) // Update overview counts
      currentBucketOverviewAux.title = `Bucket Overview (Bucket ${bucketIdx} Sorted)`

      // Yield after sorting this specific bucket
      yield {
        array: [...outputArrayForContext],
        mainArrayLabel: 'Main Array (Unchanged)',
        message: `Bucket ${bucketIdx} sorted. Content: [${buckets[bucketIdx].join(', ')}]`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [20], // Still related to this bucket's sort completion
        currentPassAuxiliaryStructure: sortedBucketDisplay, // Show sorted bucket
        historicalAuxiliaryStructures: [
          { ...currentBucketOverviewAux, id: `${currentBucketOverviewAux.id}-sorted-${bucketIdx}` },
        ], // Show updated overview
      }
      historicalAuxForBucketSorts = [
        { ...currentBucketOverviewAux, id: `${currentBucketOverviewAux.id}-hist-${bucketIdx}` },
      ] // Update for next iteration
    }
  }
  currentBucketOverviewAux.title = 'Bucket Overview (All Buckets Sorted)'
  yield {
    array: [...outputArrayForContext],
    mainArrayLabel: 'Main Array (Unchanged)',
    message: 'Phase 4 Complete. All buckets are sorted individually.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [21], // PT: end for (bucket sorting loop)
    currentPassAuxiliaryStructure: currentBucketOverviewAux, // Show final overview of sorted buckets
    historicalAuxiliaryStructures: [],
  }

  // Phase 5: Concatenate sorted buckets into outputArray
  const outputArray = new Array<number>(n) // Initialize final output array
  let mainArrayWriteIndex = 0
  // const historicalAuxForGather: AuxiliaryStructure[] = [{...currentBucketOverviewAux, title: 'Bucket Overview (Pre-Gather)'}];

  yield {
    array: new Array(n).fill(NaN).map((v, k) => (k < mainArrayWriteIndex ? outputArray[k] : NaN)), // Empty output
    mainArrayLabel: 'Output Array (Building)',
    message: 'Phase 5: Gathering elements from sorted buckets into the final output array.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [23], // PT: index = 0 (for outputArray)
    currentPassAuxiliaryStructure: {
      ...currentBucketOverviewAux,
      title: 'Bucket Overview (Pre-Gather)',
    }, // Show overview
    historicalAuxiliaryStructures: [],
  }

  for (let i = 0; i < bucketCount; i++) {
    // PT line 24
    if (buckets[i].length > 0) {
      const bucketContentToGather = [...buckets[i]] // Snapshot for message and initial display
      // currentBucketOverviewAux.title = `Bucket Overview (Gathering from Bucket ${i})`; // Title updated in historical for clarity

      yield {
        array: [...outputArray].map((v, k) => (k < mainArrayWriteIndex ? v : NaN)),
        mainArrayLabel: 'Output Array (Building)',
        message: `Gathering from bucket ${i} ([${bucketContentToGather.join(', ')}]). Output index: ${mainArrayWriteIndex}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [24, 25], // PT: for each bucket, for each element in bucket
        currentPassAuxiliaryStructure: createBucketContentAux(
          i,
          bucketContentToGather,
          'Gathering From'
        ),
        historicalAuxiliaryStructures: [
          {
            ...currentBucketOverviewAux,
            title: `Bucket Overview (Before Gather B${i})`,
            id: `${currentBucketOverviewAux.id}-pre-gather-b${i}`,
          },
        ],
      }

      for (const value of bucketContentToGather) {
        // Iterate original content of bucket i
        outputArray[mainArrayWriteIndex] = value // PT line 26
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
        mainArrayWriteIndex++ // PT line 27
        // No yield per element gathered
      }
      // buckets[i] conceptually emptied by iterating bucketContentToGather. Update actual buckets[i] for overview.
      const originalBucketSize = buckets[i].length
      buckets[i] = [] // Mark bucket as empty after gathering
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + originalBucketSize // For conceptual emptying or actual clear op

      currentBucketOverviewAux.data = getCurrentBucketOverviewData(buckets)
      currentBucketOverviewAux.title = `Bucket Overview (Bucket ${i} Emptied)`
      yield {
        array: [...outputArray].map((v, k) => (k < mainArrayWriteIndex ? v : NaN)),
        mainArrayLabel: 'Output Array (Building)',
        message: `Finished gathering from bucket ${i}. Output index is now ${mainArrayWriteIndex}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [28], // PT: end for (inner gather loop)
        currentPassAuxiliaryStructure: createBucketContentAux(i, [], 'Emptied & Gathered'),
        historicalAuxiliaryStructures: [
          { ...currentBucketOverviewAux, id: `${currentBucketOverviewAux.id}-post-gather-b${i}` },
        ],
      }
    }
  }
  currentBucketOverviewAux.title = 'Bucket Overview (Gathering Complete)'
  yield {
    array: [...outputArray], // Fully populated output array
    mainArrayLabel: 'Output Array (Sorted)',
    sortedIndices: [...Array(n).keys()],
    message: 'Phase 5 Complete. All elements gathered into the output array.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [29], // PT: end for (outer gather loop)
    currentPassAuxiliaryStructure: currentBucketOverviewAux, // Overview should show all buckets empty
  }

  // Final yield for completion (outputArray is the final sorted array)
  yield {
    array: [...outputArray],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()],
    message: 'Bucket Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [31, 32], // PT: return list, end procedure
    currentPassAuxiliaryStructure: currentBucketOverviewAux,
    // finalAuxiliaryStructures: [currentBucketOverviewAux], // Redundant with currentPassAux, use SortResult for final
  }

  return {
    finalArray: outputArray, // The new array built by gathering
    stats: liveStats as SortStats,
    finalAuxiliaryStructures: [currentBucketOverviewAux],
  }
}
