/**
 * @file Centralized registry for sort algorithm generator functions.
 * This ensures that the worker only bundles the necessary generator functions
 * and not the extensive metadata associated with each algorithm.
 */
'use client'

import type { SortGenerator } from './types'

const algorithmFileMap: Record<string, () => Promise<{ [key: string]: SortGenerator }>> = {
  bogoSort: () => import('./algorithms/bogo'),
  bubbleSort: () => import('./algorithms/bubble'),
  bucketSort: () => import('./algorithms/bucket'),
  cocktailSort: () => import('./algorithms/cocktail'),
  combSort: () => import('./algorithms/comb'),
  countingSort: () => import('./algorithms/counting'),
  cycleSort: () => import('./algorithms/cycle'),
  gnomeSort: () => import('./algorithms/gnome'),
  heapSort: () => import('./algorithms/heap'),
  insertionSort: () => import('./algorithms/insertion'),
  mergeSort: () => import('./algorithms/merge'),
  oddEvenSort: () => import('./algorithms/oddEven'),
  pancakeSort: () => import('./algorithms/pancake'),
  patienceSort: () => import('./algorithms/patience'),
  pigeonholeSort: () => import('./algorithms/pigeonhole'),
  quickSort: () => import('./algorithms/quick'),
  radixSort: () => import('./algorithms/radix'),
  selectionSort: () => import('./algorithms/selection'),
  shellSort: () => import('./algorithms/shell'),
  timSort: () => import('./algorithms/tim'),
  treeSort: () => import('./algorithms/tree'),
}

/**
 * Dynamically imports and returns the sort generator function for the given algorithm ID.
 * @param algorithmId The ID of the algorithm (e.g., 'bubbleSort').
 * @returns A Promise that resolves to the SortGenerator function, or undefined if not found.
 */
export const getSortGenerator = async (algorithmId: string): Promise<SortGenerator | undefined> => {
  const importFn = algorithmFileMap[algorithmId]
  if (!importFn) {
    console.error(`No dynamic import function found for algorithm ID: ${algorithmId}`)
    return undefined
  }

  try {
    const algorithmModule = await importFn()
    // Assuming the generator function is the camelCase version of the ID + "Generator"
    // e.g., 'bubbleSort' -> 'bubbleSortGenerator'
    // Or if there's a consistent export name like `generator` from each module.
    // For now, let's find the first exported function that looks like a generator.
    // A more robust way would be to ensure each module exports its generator with a consistent name.
    // For example, each `X.ts` exports `xSortGenerator`.
    const expectedExportName = `${algorithmId}Generator` // e.g. bubbleSortGenerator
    if (algorithmModule[expectedExportName]) {
      return algorithmModule[expectedExportName] as SortGenerator
    }
    // Fallback: try to find any exported SortGenerator if the naming convention isn't strict.
    // This is less safe.
    for (const key in algorithmModule) {
      if (typeof algorithmModule[key] === 'function') {
        // This check is weak. A better check would be to see if it's a generator function
        // or has a specific signature, but that's hard without more context.
        // Assuming any function exported could be it for now, if named export fails.
        // This relies on each algorithm file exporting ONLY its generator or having a clear primary export.
        // The safest is to ensure `module[expectedExportName]` is the convention.
        const potentialGenerator = algorithmModule[key]
        // A light check, not foolproof: generator functions have a specific prototype.
        // However, direct type casting might be more pragmatic here if conventions are followed.
        if (Object.getPrototypeOf(potentialGenerator).constructor.name === 'GeneratorFunction') {
          return potentialGenerator as SortGenerator
        }
      }
    }
    console.error(
      `Could not find a suitable generator export in module for ${algorithmId}. Expected ${expectedExportName}.`
    )
    return undefined
  } catch (error) {
    console.error(`Error dynamically importing algorithm ${algorithmId}:`, error)
    return undefined
  }
}
