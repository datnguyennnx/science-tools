'use client'

import { SortGenerator, SortStep, AuxiliaryStructure } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer'

// Modified Insertion Sort for buckets to be a generator and update stats
const insertionSortForBucketGenerator = function* (
  bucket: number[],
  direction: 'asc' | 'desc',
  liveStats: Partial<SortStats>,
  mainArrayVisual: ReadonlyArray<number>,
  bucketActualIndex: number,
  visualizeBucketsFunc: (titleSuffix: string) => AuxiliaryStructure[]
): Generator<SortStep, void, void> {
  const bucketLen = bucket.length
  for (let i = 1; i < bucketLen; i++) {
    const key = bucket[i]
    let j = i - 1
    const shouldMove = (k: number, val: number) => (direction === 'asc' ? k > val : k < val)

    // Initial comparison for the loop
    if (j >= 0) {
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      yield {
        array: [...mainArrayVisual],
        mainArrayLabel: 'Output Array (Building)',
        auxiliaryStructures: visualizeBucketsFunc(
          `Sorting Bucket ${bucketActualIndex} (Comparing ${key} with ${bucket[j]})`
        ),
        message: `Bucket ${bucketActualIndex}: Comparing key ${key} with ${bucket[j]}.`,
        currentStats: { ...liveStats },
      }
    }

    while (j >= 0 && shouldMove(bucket[j], key)) {
      // shouldMove was the comparison, already counted if loop entered/continued
      bucket[j + 1] = bucket[j]
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
      yield {
        array: [...mainArrayVisual],
        mainArrayLabel: 'Output Array (Building)',
        auxiliaryStructures: visualizeBucketsFunc(
          `Sorting Bucket ${bucketActualIndex} (Shifted ${bucket[j + 1]})`
        ),
        message: `Bucket ${bucketActualIndex}: Shifted ${bucket[j + 1]} to index ${j + 1} (in bucket).`,
        currentStats: { ...liveStats },
      }
      j--
      // Comparison for next iteration of while loop
      if (j >= 0) {
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
        yield {
          array: [...mainArrayVisual],
          mainArrayLabel: 'Output Array (Building)',
          auxiliaryStructures: visualizeBucketsFunc(
            `Sorting Bucket ${bucketActualIndex} (Next Compare)`
          ),
          message: `Bucket ${bucketActualIndex}: Comparing key ${key} with ${bucket[j]}.`,
          currentStats: { ...liveStats },
        }
      }
    }
    bucket[j + 1] = key
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    yield {
      array: [...mainArrayVisual],
      mainArrayLabel: 'Output Array (Building)',
      auxiliaryStructures: visualizeBucketsFunc(
        `Sorting Bucket ${bucketActualIndex} (Placed ${key})`
      ),
      message: `Bucket ${bucketActualIndex}: Placed key ${key} at index ${j + 1} (in bucket).`,
      currentStats: { ...liveStats },
    }
  }
}

export const bucketSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const arr = [...initialArray]
  const n = arr.length

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Bucket Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
    swaps: 0, // Not typical swap based
  }

  if (n <= 1) {
    yield {
      array: [...initialArray],
      sortedIndices: n === 1 ? [0] : [],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
    }
    return { finalArray: initialArray, stats: liveStats as SortStats }
  }

  // 1. Find min and max values
  let minVal = arr[0]
  let maxVal = arr[0]
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    highlightedIndices: [0],
    message: `Finding min/max. Min: ${minVal}, Max: ${maxVal}.`,
    currentStats: { ...liveStats },
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
    }
  }
  if (minVal === maxVal) {
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      sortedIndices: [...Array(n).keys()],
      message: 'All elements are identical. Array is effectively sorted.',
      currentStats: { ...liveStats },
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  // 2. Create buckets
  const bucketCount = n > 0 ? n : 1
  const buckets: number[][] = Array.from({ length: bucketCount }, () => [])
  liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + bucketCount

  const visualizeBuckets = (b: number[][], titleSuffix: string) => [
    {
      id: 'buckets',
      title: `Buckets (${titleSuffix})`,
      data: b.map((content, index) => ({ value: content.length, originalIndex: index })),
    },
  ]

  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    auxiliaryStructures: visualizeBuckets(buckets, 'Initialized'),
    message: `Created ${bucketCount} empty buckets. Range: [${minVal}-${maxVal}].`,
    currentStats: { ...liveStats },
  }

  // 3. Distribute elements into buckets
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal
  for (let i = 0; i < n; i++) {
    const value = arr[i]
    const normalizedValue = (value - minVal) / range
    let bucketIndex = Math.floor(normalizedValue * (bucketCount - 1))
    if (value === maxVal && bucketIndex < bucketCount - 1) bucketIndex = bucketCount - 1 // Ensure maxVal goes to last bucket

    // Ensure bucketIndex is within bounds [0, bucketCount - 1]
    bucketIndex = Math.max(0, Math.min(bucketIndex, bucketCount - 1))

    buckets[bucketIndex].push(value)
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1

    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      comparisonIndices: [bucketIndex],
      auxiliaryStructures: visualizeBuckets(buckets, 'Distributing'),
      message: `Distributing element ${value} (from index ${i}) into bucket ${bucketIndex}.`,
      currentStats: { ...liveStats },
    }
  }

  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array (Before Concatenation)',
    auxiliaryStructures: visualizeBuckets(buckets, 'Before Sorting'),
    message: 'Sorting individual buckets.',
    currentStats: { ...liveStats },
  }

  let currentIndex = 0
  const sortedArr = new Array(n)
  // liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n; // For new Array(n)

  for (let i = 0; i < bucketCount; i++) {
    if (buckets[i].length > 0) {
      const currentBucketContentForMsg = [...buckets[i]] // For message before sort
      yield {
        array: [...sortedArr].map(v => (v === undefined ? NaN : v)),
        mainArrayLabel: 'Output Array (Building)',
        highlightedIndices: [],
        comparisonIndices: [i],
        auxiliaryStructures: visualizeBuckets(buckets, `Sorting Bucket ${i}`),
        message: `Sorting bucket ${i} with elements: [${currentBucketContentForMsg.join(', ')}] using Insertion Sort.`,
        currentStats: { ...liveStats },
      }
      // Pass a snapshot of sortedArr for visualization within insertion sort
      yield* insertionSortForBucketGenerator(
        buckets[i],
        direction,
        liveStats,
        [...sortedArr].map(v => (v === undefined ? NaN : v)),
        i,
        ts => visualizeBuckets(buckets, ts)
      )

      yield {
        array: [...sortedArr].map(v => (v === undefined ? NaN : v)),
        mainArrayLabel: 'Output Array (Building)',
        comparisonIndices: [i],
        auxiliaryStructures: visualizeBuckets(buckets, `Sorted Bucket ${i}`),
        message: `Bucket ${i} sorted: [${buckets[i].join(', ')}]`,
        currentStats: { ...liveStats },
      }

      for (const val of buckets[i]) {
        sortedArr[currentIndex] = val
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
        yield {
          array: [...sortedArr].map(v => (v === undefined ? NaN : v)),
          mainArrayLabel: 'Output Array (Concatenating)',
          highlightedIndices: [currentIndex],
          comparisonIndices: [i],
          auxiliaryStructures: visualizeBuckets(buckets, 'Concatenating'),
          message: `Placing ${val} from sorted bucket ${i} into final array at index ${currentIndex}.`,
          currentStats: { ...liveStats },
        }
        currentIndex++
      }
    }
  }

  yield {
    array: [...sortedArr],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()],
    message: 'Bucket Sort Complete!',
    currentStats: { ...liveStats },
  }

  return { finalArray: sortedArr, stats: liveStats as SortStats }
}
