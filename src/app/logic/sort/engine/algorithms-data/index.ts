'use client'

import type { SortAlgorithm } from '../algorithmRegistry'

// Lightweight Algorithm List (Manually maintain this or generate it)
// This list is used for populating selection UI elements without loading all details.
export const LIGHTWEIGHT_ALGORITHM_LIST: ReadonlyArray<{ id: string; name: string }> = [
  { id: 'bogoSort', name: 'Bogo Sort' },
  { id: 'bubbleSort', name: 'Bubble Sort' },
  { id: 'bucketSort', name: 'Bucket Sort' },
  { id: 'cocktailSort', name: 'Cocktail Shaker Sort' },
  { id: 'combSort', name: 'Comb Sort' },
  { id: 'countingSort', name: 'Counting Sort' },
  { id: 'cycleSort', name: 'Cycle Sort' },
  { id: 'gnomeSort', name: 'Gnome Sort' },
  { id: 'heapSort', name: 'Heap Sort' },
  { id: 'insertionSort', name: 'Insertion Sort' },
  { id: 'mergeSort', name: 'Merge Sort' },
  { id: 'oddEvenSort', name: 'Odd-Even Sort' },
  { id: 'pancakeSort', name: 'Pancake Sort' },
  { id: 'patienceSort', name: 'Patience Sort' },
  { id: 'pigeonholeSort', name: 'Pigeonhole Sort' },
  { id: 'quickSort', name: 'Quick Sort' },
  { id: 'radixSort', name: 'Radix Sort' },
  { id: 'selectionSort', name: 'Selection Sort' },
  { id: 'shellSort', name: 'Shell Sort' },
  { id: 'timSort', name: 'Tim Sort' },
  { id: 'treeSort', name: 'Tree Sort' },
  // Ensure names and IDs match the data files and registry expectations.
].sort((a, b) => a.name.localeCompare(b.name))

// Looser type for the dynamically imported module, allowing other exports
interface AlgorithmDataModule {
  [exportName: string]: unknown // Allows any type of export
}

// The dynamic import functions now return a Promise of this looser type.
const algorithmDataModules: Record<string, () => Promise<AlgorithmDataModule>> = {
  bogoSort: () => import('./bogoSortData'),
  bubbleSort: () => import('./bubbleSortData'),
  bucketSort: () => import('./bucketSortData'),
  cocktailSort: () => import('./cocktailSortData'),
  combSort: () => import('./combSortData'),
  countingSort: () => import('./countingSortData'),
  cycleSort: () => import('./cycleSortData'),
  gnomeSort: () => import('./gnomeSortData'),
  heapSort: () => import('./heapSortData'),
  insertionSort: () => import('./insertionSortData'),
  mergeSort: () => import('./mergeSortData'),
  oddEvenSort: () => import('./oddEvenSortData'),
  pancakeSort: () => import('./pancakeSortData'),
  patienceSort: () => import('./patienceSortData'),
  pigeonholeSort: () => import('./pigeonholeSortData'),
  quickSort: () => import('./quickSortData'),
  radixSort: () => import('./radixSortData'),
  selectionSort: () => import('./selectionSortData'),
  shellSort: () => import('./shellSortData'),
  timSort: () => import('./timSortData'),
  treeSort: () => import('./treeSortData'),
}

/**
 * Dynamically imports and returns the full SortAlgorithm data object for the given algorithm ID.
 * @param algorithmId The ID of the algorithm (e.g., 'bubbleSort').
 * @returns A Promise that resolves to the SortAlgorithm data object, or undefined if not found.
 */
export const getAlgorithmDetails = async (
  algorithmId: string
): Promise<SortAlgorithm | undefined> => {
  const importFn = algorithmDataModules[algorithmId]
  if (!importFn) {
    console.error(`No dynamic import function found for algorithm data: ${algorithmId}`)
    return undefined
  }

  try {
    const dataModule = await importFn()
    const expectedExportName = `${algorithmId}Data` // e.g. bubbleSortData

    const algorithmData = dataModule[expectedExportName]
    // Perform runtime check to ensure it conforms to SortAlgorithm structure
    if (
      algorithmData &&
      typeof algorithmData === 'object' &&
      'id' in algorithmData &&
      (algorithmData as SortAlgorithm).id === algorithmId &&
      'name' in algorithmData &&
      'complexity' in algorithmData
    ) {
      return algorithmData as SortAlgorithm
    }

    console.warn(
      `Export "${expectedExportName}" not found or not a valid SortAlgorithm for ${algorithmId}. Inspect the module.`
    )
    // Fallback only if a different export clearly matches SortAlgorithm structure and ID.
    for (const key in dataModule) {
      if (key === expectedExportName) continue // Already checked
      const potentialData = dataModule[key]
      if (
        potentialData &&
        typeof potentialData === 'object' &&
        'id' in potentialData &&
        (potentialData as SortAlgorithm).id === algorithmId && // Check if ID matches
        'name' in potentialData &&
        'complexity' in potentialData
      ) {
        console.warn(`Used fallback to find algorithm data for ${algorithmId} via key ${key}`)
        return potentialData as SortAlgorithm
      }
    }

    console.error(`Could not find valid SortAlgorithm data in module for ${algorithmId}.`)
    return undefined
  } catch (error) {
    console.error(`Error dynamically importing algorithm data for ${algorithmId}:`, error)
    return undefined
  }
}

// The old SORT_ALGORITHMS is removed. If needed, it would have to be assembled dynamically or fetched on demand.
// For now, we assume components will use LIGHTWEIGHT_ALGORITHM_LIST for selection
// and getAlgorithmDetails for specific data.
// export const SORT_ALGORITHMS: ReadonlyArray<SortAlgorithm> = algorithmsData // This line is removed
