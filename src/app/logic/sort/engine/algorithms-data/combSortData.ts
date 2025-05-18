'use client'

import type { SortAlgorithm } from '../algorithmRegistry'
import { combSortGenerator } from '../algorithms'

const rawPlaintextPseudoCode = [
  'procedure combSort(list, direction)',
  '  n = length of list',
  '  gap = n',
  '  shrinkFactor = 1.3',
  '  swapped = true',
  '',
  '  while gap > 1 or swapped',
  '    gap = floor(gap / shrinkFactor)',
  '    if gap < 1 then',
  '      gap = 1',
  '    end if',
  '',
  '    swapped = false',
  '    for i = 0 to n - 1 - gap',
  '      if (direction == ASC and list[i] > list[i + gap]) or (direction == DESC and list[i] < list[i + gap]) then',
  '        swap(list[i], list[i + gap])',
  '        swapped = true',
  '      end if',
  '    end for',
  '',
  '    if gap == 1 and not swapped then',
  '      break',
  '    end if',
  '  end while',
  'end procedure',
]

export const combSortData: SortAlgorithm = {
  id: 'combSort',
  name: 'Comb Sort',
  description:
    'Comb Sort is an improvement over Bubble Sort. It eliminates "turtles" (small values near the end of the list that significantly slow down Bubble Sort) by using an initial large gap between compared elements. The gap shrinks with each pass using a "shrink factor" (typically 1.3). The process continues until the gap is 1, at which point Comb Sort effectively becomes a Bubble Sort to clean up remaining inversions. The algorithm terminates when a pass with gap 1 completes without any swaps.',
  generator: combSortGenerator,
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n^2)' },
    space: 'O(1)',
  },
  origin: {
    name: 'Włodzimierz Dobosiewicz (1980), popularized by Stephen Lacey and Richard Box',
    year: 1991,
  },
  pseudoCode: rawPlaintextPseudoCode,
  languageExamples: {
    c: [
      '#include <stdbool.h>',
      '#include <math.h>',
      '#include <stdio.h>',
      '',
      'void swapComb(int* a, int* b) {',
      '    int temp = *a;',
      '    *a = *b;',
      '    *b = temp;',
      '}',
      '',
      'int getNextGap(int gap) {',
      '    gap = floor(gap / 1.3);',
      '    if (gap < 1) {',
      '        return 1;',
      '    }',
      '    return gap;',
      '}',
      '',
      'void combSort(int arr[], int n, bool ascending) {',
      '    if (n == 0) return;',
      '    int gap = n;',
      '    bool swapped = true;',
      '',
      '    while (gap != 1 || swapped == true) {',
      '        gap = getNextGap(gap);',
      '        swapped = false;',
      '        for (int i = 0; i < n - gap; i++) {',
      '            bool should_swap_val;',
      '            if (ascending) {',
      '                should_swap_val = (arr[i] > arr[i + gap]);',
      '            } else {',
      '                should_swap_val = (arr[i] < arr[i + gap]);',
      '            }',
      '            if (should_swap_val) {',
      '                swapComb(&arr[i], &arr[i + gap]);',
      '                swapped = true;',
      '            }',
      '        }',
      '    }',
      '}',
    ],
    cpp: [
      '#include <vector>',
      '#include <utility>',
      '#include <cmath>',
      '#include <iostream>',
      '',
      'template <typename T>',
      'int getNextGap(int gap) {',
      '    gap = static_cast<int>(std::floor(gap / 1.3));',
      '    if (gap < 1) {',
      '        return 1;',
      '    }',
      '    return gap;',
      '}',
      '',
      'template <typename T>',
      'void combSort(std::vector<T>& arr, bool ascending) {',
      '    int n = arr.size();',
      '    if (n == 0) return;',
      '    int gap = n;',
      '    bool swapped = true;',
      '',
      '    while (gap != 1 || swapped) {',
      '        gap = getNextGap(gap);',
      '        swapped = false;',
      '        for (int i = 0; i < n - gap; i++) {',
      '            bool should_swap_val;',
      '            if (ascending) {',
      '                should_swap_val = (arr[i] > arr[i + gap]);',
      '            } else {',
      '                should_swap_val = (arr[i] < arr[i + gap]);',
      '            }',
      '            if (should_swap_val) {',
      '                std::swap(arr[i], arr[i + gap]);',
      '                swapped = true;',
      '            }',
      '        }',
      '    }',
      '}',
    ],
    python: [
      'import math',
      '',
      'def getNextGap(gap):',
      '    gap = math.floor(gap / 1.3)',
      '    if gap < 1:',
      '        return 1',
      '    return int(gap)',
      '',
      'def combSort(arr, ascending=True):',
      '    n = len(arr)',
      '    if n == 0:',
      '        return arr',
      '    gap = n',
      '    swapped = True',
      '    while gap != 1 or swapped:',
      '        gap = getNextGap(gap)',
      '        swapped = False',
      '        for i in range(n - gap):',
      '            should_swap_val = False',
      '            if ascending:',
      '                if arr[i] > arr[i + gap]:',
      '                    should_swap_val = True',
      '            else:',
      '                if arr[i] < arr[i + gap]:',
      '                    should_swap_val = True',
      '            if should_swap_val:',
      '                arr[i], arr[i + gap] = arr[i + gap], arr[i]',
      '                swapped = True',
      '    return arr',
    ],
  },
  pseudoCodeMapping: {
    0: { c: [18], cpp: [15], python: [9] }, // procedure combSort
    1: { c: [19], cpp: [16], python: [10] }, // n = length
    2: { c: [20], cpp: [18], python: [13] }, // gap = n
    3: {}, // shrinkFactor = 1.3 (constant, not a line)
    4: { c: [21], cpp: [19], python: [14] }, // swapped = true
    // 5 is blank
    6: { c: [23], cpp: [21], python: [15] }, // while gap > 1 or swapped
    7: { c: [24, 11], cpp: [22, 7], python: [16, 3] }, // gap = floor(gap / shrinkFactor) (calls getNextGap)
    8: { c: [12], cpp: [8], python: [4] }, //   if gap < 1 then (inside getNextGap)
    9: { c: [13], cpp: [9], python: [5] }, //     gap = 1 (inside getNextGap)
    10: { c: [14], cpp: [10], python: [6] }, //   end if (inside getNextGap, return from helper)
    // 11 is blank
    12: { c: [25], cpp: [23], python: [17] }, // swapped = false
    13: { c: [26], cpp: [24], python: [18] }, // for i = 0 to n - 1 - gap
    14: { c: [27, 31], cpp: [25, 29], python: [19, 23] }, // if (condition for swap)
    15: { c: [33], cpp: [31], python: [26] }, //   swap(list[i], list[i + gap])
    16: { c: [34], cpp: [32], python: [27] }, //   swapped = true
    17: { c: [35], cpp: [33], python: [27] }, // end if (after swap)
    18: { c: [36], cpp: [34], python: [27] }, // end for
    // 19 is blank
    20: { c: [23], cpp: [21], python: [15] }, // if gap == 1 and not swapped (part of while condition check)
    21: { c: [23], cpp: [21], python: [15] }, //   break (implicit in while logic for termination)
    22: { c: [23], cpp: [21], python: [15] }, // end if (for break)
    23: { c: [37], cpp: [35], python: [27] }, // end while
    24: { c: [38], cpp: [36], python: [28] }, // end procedure
  },
  performancePaths: {
    best: [0, 1, 2, 4, 6, 7, 8, 9, 10, 12, 13, 14, 17, 18, 20, 21, 23, 24],
    average: [0, 1, 2, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 20, 23, 24],
    worst: [0, 1, 2, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 20, 23, 24],
  },
  hasAdvancedAuxiliaryVisuals: false,
}
