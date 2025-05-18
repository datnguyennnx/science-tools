'use client'

import type { SortAlgorithm } from '../algorithmRegistry'
import { mergeSortGenerator } from '../algorithms'

const rawPlaintextPseudoCode = [
  'procedure mergeSort(list, direction)',
  '  n = length of list',
  '  if n <= 1 then return list',
  '  _mergeSortRecursive(list, 0, n - 1, direction)',
  '  return list',
  'end procedure',
  '',
  'procedure _mergeSortRecursive(list, left, right, direction)',
  '  if left < right then',
  '    middle = left + floor((right - left) / 2)',
  '    _mergeSortRecursive(list, left, middle, direction)',
  '    _mergeSortRecursive(list, middle + 1, right, direction)',
  '    _merge(list, left, middle, right, direction)',
  '  end if',
  'end procedure',
  '',
  'procedure _merge(list, left, middle, right, direction)',
  '  n1 = middle - left + 1',
  '  n2 = right - middle',
  '  create array L of size n1',
  '  create array R of size n2',
  '  for i = 0 to n1 - 1',
  '    L[i] = list[left + i]',
  '  end for',
  '  for j = 0 to n2 - 1',
  '    R[j] = list[middle + 1 + j]',
  '  end for',
  '  i = 0',
  '  j = 0',
  '  k = left',
  '  while i < n1 and j < n2',
  '    if (direction == ASC and L[i] <= R[j]) or (direction == DESC and L[i] >= R[j]) then',
  '      list[k] = L[i]',
  '      i = i + 1',
  '    else',
  '      list[k] = R[j]',
  '      j = j + 1',
  '    end if',
  '    k = k + 1',
  '  end while',
  '  while i < n1',
  '    list[k] = L[i]',
  '    i = i + 1',
  '    k = k + 1',
  '  end while',
  '  while j < n2',
  '    list[k] = R[j]',
  '    j = j + 1',
  '    k = k + 1',
  '  end while',
  'end procedure',
]

export const mergeSortData: SortAlgorithm = {
  id: 'mergeSort',
  name: 'Merge Sort',
  description:
    'Invented by John von Neumann in 1945, Merge Sort is a classic example of a divide-and-conquer algorithm. It works by recursively dividing the unsorted list into n sublists, each containing one element (a list of one element is considered sorted). Then, it repeatedly merges sublists to produce new sorted sublists until there is only one sublist remaining, which is the sorted list. Its guaranteed O(n log n) time complexity makes it a stable and efficient choice for sorting large datasets.',
  generator: mergeSortGenerator,
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(n)',
  },
  origin: { name: 'John von Neumann', year: 1945 },
  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/JohnvonNeumann-LOSAL.gif/220px-JohnvonNeumann-LOSAL.gif',
  pseudoCode: rawPlaintextPseudoCode,
  languageExamples: {
    c: [
      '#include <stdio.h>',
      '#include <stdlib.h>',
      '#include <stdbool.h>',
      '',
      'void merge(int arr[], int l, int m, int r, bool ascending) {',
      '    int i, j, k;',
      '    int n1 = m - l + 1;',
      '    int n2 = r - m;',
      '    int* L = (int*)malloc(n1 * sizeof(int));',
      '    int* R = (int*)malloc(n2 * sizeof(int));',
      '    if (!L || !R) { if(L) free(L); if(R) free(R); return; }',
      '    for (i = 0; i < n1; i++) L[i] = arr[l + i];',
      '    for (j = 0; j < n2; j++) R[j] = arr[m + 1 + j];',
      '    i = 0; j = 0; k = l;',
      '    while (i < n1 && j < n2) {',
      '        bool takeLeft;',
      '        if (ascending) {',
      '            takeLeft = (L[i] <= R[j]);',
      '        } else {',
      '            takeLeft = (L[i] >= R[j]);',
      '        }',
      '        if (takeLeft) {',
      '            arr[k] = L[i];',
      '            i++;',
      '        } else {',
      '            arr[k] = R[j];',
      '            j++;',
      '        }',
      '        k++;',
      '    }',
      '',
      '    while (i < n1) {',
      '        arr[k] = L[i];',
      '        i++;',
      '        k++;',
      '    }',
      '    while (j < n2) {',
      '        arr[k] = R[j];',
      '        j++;',
      '        k++;',
      '    }',
      '    free(L);',
      '    free(R);',
      '}',
      '',
      'void mergeSortRecursive(int arr[], int l, int r, bool ascending) {',
      '    if (l < r) {',
      '        int m = l + (r - l) / 2;',
      '        mergeSortRecursive(arr, l, m, ascending);',
      '        mergeSortRecursive(arr, m + 1, r, ascending);',
      '        merge(arr, l, m, r, ascending);',
      '    }',
      '}',
      '',
      'void mergeSort(int arr[], int n, bool ascending) {',
      '    if (n <= 1) return;',
      '    mergeSortRecursive(arr, 0, n - 1, ascending);',
      '}',
    ],
    cpp: [
      '#include <vector>',
      '#include <stdbool.h>',
      '',
      'template <typename T>',
      'void merge(std::vector<T>& arr, int l, int m, int r, bool ascending) {',
      '    int n1 = m - l + 1;',
      '    int n2 = r - m;',
      '    std::vector<T> L(n1), R(n2);',
      '    for (int i = 0; i < n1; i++) L[i] = arr[l + i];',
      '    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];',
      '    int i = 0, j = 0, k = l;',
      '    while (i < n1 && j < n2) {',
      '        bool takeLeft;',
      '        if (ascending) {',
      '            takeLeft = (L[i] <= R[j]);',
      '        } else {',
      '            takeLeft = (L[i] >= R[j]);',
      '        }',
      '        if (takeLeft) {',
      '            arr[k++] = L[i++];',
      '        } else {',
      '            arr[k++] = R[j++];',
      '        }',
      '    }',
      '',
      '    while (i < n1) arr[k++] = L[i++];',
      '    while (j < n2) arr[k++] = R[j++];',
      '}',
      '',
      'template <typename T>',
      'void mergeSortRecursive(std::vector<T>& arr, int l, int r, bool ascending) {',
      '    if (l < r) {',
      '        int m = l + (r - l) / 2;',
      '        mergeSortRecursive(arr, l, m, ascending);',
      '        mergeSortRecursive(arr, m + 1, r, ascending);',
      '        merge(arr, l, m, r, ascending);',
      '    }',
      '}',
      '',
      'template <typename T>',
      'void mergeSort(std::vector<T>& arr, bool ascending) {',
      '    if (arr.size() <= 1) return;',
      '    mergeSortRecursive(arr, 0, arr.size() - 1, ascending);',
      '}',
    ],
    python: [
      'def mergeSort(arr, ascending=True):',
      '    n = len(arr)',
      '    if n > 1:',
      '        mid = n // 2',
      '        L = arr[:mid]',
      '        R = arr[mid:]',
      '',
      '        mergeSort(L, ascending)',
      '        mergeSort(R, ascending)',
      '',
      '        i = j = k = 0',
      '        while i < len(L) and j < len(R):',
      '            take_left = False',
      '            if ascending:',
      '                if L[i] <= R[j]:',
      '                    take_left = True',
      '            else:',
      '                if L[i] >= R[j]:',
      '                    take_left = True',
      '            ',
      '            if take_left:',
      '                arr[k] = L[i]',
      '                i += 1',
      '            else:',
      '                arr[k] = R[j]',
      '                j += 1',
      '            k += 1',
      '',
      '        while i < len(L):',
      '            arr[k] = L[i]',
      '            i += 1',
      '            k += 1',
      '',
      '        while j < len(R):',
      '            arr[k] = R[j]',
      '            j += 1',
      '            k += 1',
      '    return arr',
    ],
  },
  pseudoCodeMapping: {
    0: { c: [50], cpp: [45], python: [1] }, // procedure mergeSort(list, direction)
    1: { c: [51], cpp: [46], python: [2] }, // n = length of list
    2: { c: [51], cpp: [46], python: [3] }, // if n <= 1 then return list (Python if n > 1)
    3: { c: [52], cpp: [47], python: [8, 9] }, // _mergeSortRecursive(list, 0, n - 1, direction) -> Python recursive calls
    4: { c: [52], cpp: [47], python: [35] }, // return list (end of main func for C/C++, Python return is at end)
    5: { c: [53], cpp: [48], python: [35] }, // end procedure mergeSort

    7: { c: [42], cpp: [37], python: [1] }, // procedure _mergeSortRecursive (maps to Python's mergeSort start)
    8: { c: [43], cpp: [38], python: [3] }, // if left < right (Python if n > 1)
    9: { c: [44], cpp: [39], python: [4] }, // middle = ...
    10: { c: [45], cpp: [40], python: [8] }, // _mergeSortRecursive(list, left, middle, direction)
    11: { c: [46], cpp: [41], python: [9] }, // _mergeSortRecursive(list, middle + 1, right, direction)
    12: { c: [47], cpp: [42], python: [11, 34] }, // _merge(list, left, middle, right, direction) (Python merge logic span)
    13: { c: [48], cpp: [43], python: [34] }, // end if (after merge logic in Python)
    14: { c: [49], cpp: [44], python: [35] }, // end procedure _mergeSortRecursive (end of Python func)

    16: { c: [5], cpp: [5], python: [11, 34] }, // procedure _merge (maps to Python's inline merge logic)
    17: { c: [7], cpp: [6], python: [5] }, // n1 = ... (Python L = arr[:mid])
    18: { c: [8], cpp: [7], python: [6] }, // n2 = ... (Python R = arr[mid:])
    19: { c: [10], cpp: [9], python: [5] }, // create array L (Python L = arr[:mid])
    20: { c: [11], cpp: [9], python: [6] }, // create array R (Python R = arr[mid:])
    21: { c: [13], cpp: [11], python: [5] }, // for i = 0 to n1-1 L[i]= (covered by slice)
    22: { c: [13], cpp: [11], python: [5] }, // L[i] = list[left+i]
    23: { c: [13], cpp: [11], python: [5] }, // end for (L copy)
    24: { c: [14], cpp: [12], python: [6] }, // for j = 0 to n2-1 R[j]= (covered by slice)
    25: { c: [14], cpp: [12], python: [6] }, // R[j] = list[middle+1+j]
    26: { c: [14], cpp: [12], python: [6] }, // end for (R copy)
    27: { c: [16], cpp: [14], python: [11] }, // i = 0
    28: { c: [16], cpp: [14], python: [11] }, // j = 0
    29: { c: [16], cpp: [14], python: [11] }, // k = left (Python k = 0 for current sub-array)
    30: { c: [17], cpp: [15], python: [13] }, // while i < n1 and j < n2
    31: { c: [18, 23], cpp: [16, 21], python: [14, 20] }, // if (condition)
    32: { c: [24], cpp: [22], python: [22] }, //   list[k] = L[i]
    33: { c: [25], cpp: [22], python: [23] }, //   i = i + 1
    34: {}, // else (implicit in Python structure)
    35: { c: [27], cpp: [24], python: [25] }, //   list[k] = R[j]
    36: { c: [28], cpp: [24], python: [26] }, //   j = j + 1
    37: { c: [29], cpp: [25], python: [26] }, // end if
    38: { c: [30], cpp: [25], python: [27] }, // k = k + 1
    39: { c: [31], cpp: [26], python: [27] }, // end while (main merge loop)
    40: { c: [33], cpp: [28], python: [29] }, // while i < n1 (copy remaining L)
    41: { c: [34], cpp: [28], python: [30] }, //   list[k] = L[i]
    42: { c: [35], cpp: [28], python: [31] }, //   i = i + 1
    43: { c: [36], cpp: [28], python: [32] }, //   k = k + 1
    44: { c: [37], cpp: [28], python: [32] }, // end while (copy L)
    45: { c: [38], cpp: [29], python: [33] }, // while j < n2 (copy remaining R)
    46: { c: [39], cpp: [29], python: [34] }, //   list[k] = R[j]
    47: { c: [40], cpp: [29], python: [35] }, //   j = j + 1
    48: { c: [41], cpp: [29], python: [36] }, //   k = k + 1
    49: { c: [42], cpp: [29], python: [36] }, // end while (copy R)
    50: { c: [43, 44], cpp: [30], python: [34] }, // end procedure _merge
  },
  performancePaths: {
    best: [
      0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
      28, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
    ],
    average: [
      0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
      28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
    ],
    worst: [
      0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
      28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
    ],
  },
  hasAdvancedAuxiliaryVisuals: true,
}
