'use client'

import type { SortAlgorithm } from '../algorithmRegistry'

// Algorithm Data Imports
import { bubbleSortData } from './bubbleSortData'
import { insertionSortData } from './insertionSortData'
import { selectionSortData } from './selectionSortData'
import { mergeSortData } from './mergeSortData'
import { quickSortData } from './quickSortData'
import { heapSortData } from './heapSortData'
import { shellSortData } from './shellSortData'
import { cocktailSortData } from './cocktailSortData'
import { combSortData } from './combSortData'
import { gnomeSortData } from './gnomeSortData'
import { countingSortData } from './countingSortData'
import { radixSortData } from './radixSortData'
import { bucketSortData } from './bucketSortData'
import { pigeonholeSortData } from './pigeonholeSortData'
import { treeSortData } from './treeSortData'
import { pancakeSortData } from './pancakeSortData'
import { oddEvenSortData } from './oddEvenSortData'
import { cycleSortData } from './cycleSortData'
import { timSortData } from './timSortData'
import { patienceSortData } from './patienceSortData'
import { bogoSortData } from './bogoSortData'
// Add other algorithm data imports here as they are created

const algorithmsData: SortAlgorithm[] = [
  bubbleSortData,
  insertionSortData,
  selectionSortData,
  mergeSortData,
  quickSortData,
  heapSortData,
  shellSortData,
  cocktailSortData,
  combSortData,
  gnomeSortData,
  countingSortData,
  radixSortData,
  bucketSortData,
  pigeonholeSortData,
  treeSortData,
  pancakeSortData,
  oddEvenSortData,
  cycleSortData,
  timSortData,
  patienceSortData,
  bogoSortData,
  // Add other algorithm data objects here
]

// Sort the array alphabetically by name before exporting
algorithmsData.sort((a, b) => a.name.localeCompare(b.name))

export const SORT_ALGORITHMS: ReadonlyArray<SortAlgorithm> = algorithmsData
