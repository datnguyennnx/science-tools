import type { SortAlgorithm } from '../algorithmRegistry'

const rawPlaintextPseudoCode = [
  'procedure heapSort(list, direction)',
  '  n = length of list',
  '  if n <= 1 then return',
  '',
  '  for i = floor(n / 2) - 1 down to 0',
  '    heapify(list, n, i, direction)',
  '  end for',
  '',
  '  for i = n - 1 down to 1',
  '    swap(list[0], list[i])',
  '    heapify(list, i, 0, direction)',
  '  end for',
  'end procedure',
  '',
  'procedure heapify(list, heapSize, rootIndex, direction)',
  '  extremeElementIndex = rootIndex',
  '  left = 2 * rootIndex + 1',
  '  right = 2 * rootIndex + 2',
  '',
  '  if left < heapSize then',
  '    if (direction == ASC and list[left] > list[extremeElementIndex]) or ',
  '       (direction == DESC and list[left] < list[extremeElementIndex]) then',
  '      extremeElementIndex = left',
  '    end if',
  '  end if',
  '',
  '  if right < heapSize then',
  '    if (direction == ASC and list[right] > list[extremeElementIndex]) or ',
  '       (direction == DESC and list[right] < list[extremeElementIndex]) then',
  '      extremeElementIndex = right',
  '    end if',
  '  end if',
  '',
  '  if extremeElementIndex != rootIndex then',
  '    swap(list[rootIndex], list[extremeElementIndex])',
  '    heapify(list, heapSize, extremeElementIndex, direction)',
  '  end if',
  'end procedure',
]

export const heapSortData: SortAlgorithm = {
  id: 'heapSort',
  name: 'Heap Sort',
  description:
    'Invented by J. W. J. Williams in 1964, Heap Sort is a comparison-based sorting algorithm that leverages the heap data structure. It first builds a max-heap (for ascending sort; a min-heap for descending sort) from the input array, where the largest (or smallest) element is at the root. Then, it repeatedly extracts the maximum (or minimum) element from the heap and places it at the end (or beginning for some descending variations) of the array, rebuilding the heap with the remaining elements. This process continues until the array is sorted. A key advantage is its O(1) space complexity for typical implementations, performing the sort in-place.',
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(1)',
  },
  origin: { name: 'J. W. J. Williams', year: 1964 },
  img: 'https://ottawacitizen.remembering.ca/_next/image?url=https%3A%2F%2Fd1q40j6jx1d8h6.cloudfront.net%2FObituaries%2F41508162%2FThumbnail_1.jpg&w=3840&q=75',
  pseudoCode: rawPlaintextPseudoCode,
  languageExamples: {
    c: [
      '#include <stdbool.h>',
      '',
      'void swap(int* a, int* b) {',
      '    int temp = *a;',
      '    *a = *b;',
      '    *b = temp;',
      '}',
      '',
      'void heapify(int arr[], int n, int i, bool ascending) {',
      '    int largestOrSmallest = i;',
      '    int left = 2 * i + 1;',
      '    int right = 2 * i + 2;',
      '    if (ascending) { // Max-heap',
      '        if (left < n && arr[left] > arr[largestOrSmallest])',
      '            largestOrSmallest = left;',
      '        if (right < n && arr[right] > arr[largestOrSmallest])',
      '            largestOrSmallest = right;',
      '    } else { // Min-heap',
      '        if (left < n && arr[left] < arr[largestOrSmallest])',
      '            largestOrSmallest = left;',
      '        if (right < n && arr[right] < arr[largestOrSmallest])',
      '            largestOrSmallest = right;',
      '    }',
      '    if (largestOrSmallest != i) {',
      '        swap(&arr[i], &arr[largestOrSmallest]);',
      '        heapify(arr, n, largestOrSmallest, ascending);',
      '    }',
      '}',
      '',
      'void heapSort(int arr[], int n, bool ascending) {',
      '    if (n <= 1) return;',
      '',
      '    for (int i = n / 2 - 1; i >= 0; i--)',
      '        heapify(arr, n, i, ascending);',
      '',
      '    for (int i = n - 1; i > 0; i--) {',
      '        swap(&arr[0], &arr[i]);',
      '        heapify(arr, i, 0, ascending);',
      '    }',
      '}',
    ],
    cpp: [
      '#include <vector>',
      '#include <utility> // For std::swap',
      '#include <stdbool.h>',
      '',
      'template <typename T>',
      'void heapify(std::vector<T>& arr, int n, int i, bool ascending) {',
      '    int largestOrSmallest = i;',
      '    int left = 2 * i + 1;',
      '    int right = 2 * i + 2;',
      '    if (ascending) { // Max-heap',
      '        if (left < n && arr[left] > arr[largestOrSmallest])',
      '            largestOrSmallest = left;',
      '        if (right < n && arr[right] > arr[largestOrSmallest])',
      '            largestOrSmallest = right;',
      '    } else { // Min-heap',
      '        if (left < n && arr[left] < arr[largestOrSmallest])',
      '            largestOrSmallest = left;',
      '        if (right < n && arr[right] < arr[largestOrSmallest])',
      '            largestOrSmallest = right;',
      '    }',
      '    if (largestOrSmallest != i) {',
      '        std::swap(arr[i], arr[largestOrSmallest]);',
      '        heapify(arr, n, largestOrSmallest, ascending);',
      '    }',
      '}',
      '',
      'template <typename T>',
      'void heapSort(std::vector<T>& arr, bool ascending) {',
      '    int n = arr.size();',
      '    if (n <= 1) return;',
      '',
      '    for (int i = n / 2 - 1; i >= 0; i--)',
      '        heapify(arr, n, i, ascending);',
      '',
      '    for (int i = n - 1; i > 0; i--) {',
      '        std::swap(arr[0], arr[i]);',
      '        heapify(arr, i, 0, ascending);',
      '    }',
      '}',
    ],
    python: [
      'def heapify(arr, n, i, ascending=True):',
      '    largest_or_smallest = i',
      '    left = 2 * i + 1',
      '    right = 2 * i + 2',
      '    if ascending: # Max-heap for ascending sort',
      '        if left < n and arr[left] > arr[largest_or_smallest]:',
      '            largest_or_smallest = left',
      '        if right < n and arr[right] > arr[largest_or_smallest]:',
      '            largest_or_smallest = right',
      '    else: # Min-heap for descending sort',
      '        if left < n and arr[left] < arr[largest_or_smallest]:',
      '            largest_or_smallest = left',
      '        if right < n and arr[right] < arr[largest_or_smallest]:',
      '            largest_or_smallest = right',
      '    if largest_or_smallest != i:',
      '        arr[i], arr[largest_or_smallest] = arr[largest_or_smallest], arr[i]',
      '        heapify(arr, n, largest_or_smallest, ascending)',
      '',
      'def heap_sort(arr, ascending=True):',
      '    n = len(arr)',
      '    if n <= 1:',
      '        return arr',
      '',
      '    # Build heap (rearrange array)',
      '    for i in range(n // 2 - 1, -1, -1):',
      '        heapify(arr, n, i, ascending)',
      '',
      '    # One by one extract elements',
      '    for i in range(n - 1, 0, -1):',
      '        arr[i], arr[0] = arr[0], arr[i] # swap',
      '        heapify(arr, i, 0, ascending)',
      '    return arr',
    ],
  },
  pseudoCodeMapping: {
    // heapSort procedure
    0: { c: [33], cpp: [29], python: [21] }, // procedure heapSort
    1: { c: [34], cpp: [30], python: [22] }, // n = length of list
    2: { c: [34], cpp: [31], python: [23, 24] }, // if n <= 1 then return
    // Build heap loop
    4: { c: [36], cpp: [33], python: [27] }, // for i = floor(n / 2) - 1 down to 0
    5: { c: [37], cpp: [34], python: [28] }, //   heapify(list, n, i, direction)
    6: { c: [37], cpp: [34], python: [28] }, // end for (build heap)
    // Extract elements loop
    8: { c: [39], cpp: [36], python: [31] }, // for i = n - 1 down to 1
    9: { c: [40], cpp: [37], python: [32] }, //   swap(list[0], list[i])
    10: { c: [41], cpp: [38], python: [33] }, //   heapify(list, i, 0, direction)
    11: { c: [41], cpp: [38], python: [33] }, // end for (extract)
    12: { c: [43], cpp: [40], python: [34] }, // end procedure heapSort

    // heapify procedure
    14: { c: [9], cpp: [6], python: [1] }, // procedure heapify
    15: { c: [10], cpp: [7], python: [2] }, // extremeElementIndex = rootIndex
    16: { c: [11], cpp: [8], python: [3] }, // left = 2 * rootIndex + 1
    17: { c: [12], cpp: [9], python: [4] }, // right = 2 * rootIndex + 2
    // Left child check
    19: { c: [15], cpp: [12], python: [7] }, // if left < heapSize
    20: { c: [15, 16, 20, 21], cpp: [12, 13, 17, 18], python: [7, 8, 12, 13] }, // if (direction ... list[left] ... extremeElementIndex)
    21: { c: [16, 21], cpp: [13, 18], python: [8, 13] }, // extremeElementIndex = left
    22: { c: [16, 21], cpp: [13, 18], python: [8, 13] }, // end if (left child comparison)
    23: { c: [15], cpp: [12], python: [7] }, // end if (left < heapSize)
    // Right child check
    25: { c: [17], cpp: [14], python: [9] }, // if right < heapSize
    26: { c: [17, 18, 22, 23], cpp: [14, 15, 19, 20], python: [9, 10, 14, 15] }, // if (direction ... list[right] ... extremeElementIndex)
    27: { c: [18, 23], cpp: [15, 20], python: [10, 15] }, // extremeElementIndex = right
    28: { c: [18, 23], cpp: [15, 20], python: [10, 15] }, // end if (right child comparison)
    29: { c: [17], cpp: [14], python: [9] }, // end if (right < heapSize)
    // Swap and recurse if needed
    31: { c: [26], cpp: [23], python: [17] }, // if extremeElementIndex != rootIndex
    32: { c: [27], cpp: [24], python: [18] }, //   swap(list[rootIndex], list[extremeElementIndex])
    33: { c: [28], cpp: [25], python: [19] }, //   heapify(list, heapSize, extremeElementIndex, direction)
    34: { c: [29], cpp: [26], python: [19] }, // end if (extremeElementIndex != rootIndex)
    35: { c: [30], cpp: [27], python: [19] }, // end procedure heapify
  },
  performancePaths: {
    best: [
      0, 1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15, 16, 17, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29,
      31, 32, 33, 34, 35,
    ],
    average: [
      0, 1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15, 16, 17, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29,
      31, 32, 33, 34, 35,
    ],
    worst: [
      0, 1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15, 16, 17, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29,
      31, 32, 33, 34, 35,
    ],
  },
}
