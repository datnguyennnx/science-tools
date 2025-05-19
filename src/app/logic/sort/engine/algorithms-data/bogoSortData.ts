import type { SortAlgorithm } from '../algorithmRegistry'

const rawPlaintextPseudoCode = [
  'procedure bogoSort(list, direction)',
  '  while not isSorted(list, direction)',
  '    shuffle(list)',
  '  end while',
  'end procedure',
  '',
  'procedure isSorted(list, direction)',
  '  for i = 0 to length of list - 2',
  '    if (direction == ASC and list[i] > list[i + 1]) or (direction == DESC and list[i] < list[i + 1]) then',
  '      return false',
  '    end if',
  '  end for',
  '  return true',
  'end procedure',
  '',
  'procedure shuffle(list)',
  '  for i = length of list - 1 down to 1',
  '    j = random integer from 0 to i inclusive',
  '    swap(list[i], list[j])',
  '  end for',
  'end procedure',
]

export const bogoSortData: SortAlgorithm = {
  id: 'bogoSort',
  name: 'Bogo Sort',
  description:
    "Also known as permutation sort, stupid sort, or slowsort, Bogo Sort is a highly inefficient sorting algorithm based on the generate and test paradigm. It successively generates permutations of its input until it finds one that is sorted. It's primarily used for educational purposes to illustrate the concept of a worst-case algorithm or as a contrast to more effective sorting methods. Its average performance is astronomically poor, O((n+1)!).",
  complexity: {
    time: { best: 'O(n)', average: 'O((n+1)!)', worst: 'O(∞)' },
    space: 'O(1)',
  },
  origin: { name: 'Conceptual / Humorous' },
  img: '',
  pseudoCode: rawPlaintextPseudoCode,
  languageExamples: {
    c: [
      '#include <stdio.h>',
      '#include <stdlib.h>',
      '#include <stdbool.h>',
      '#include <time.h>',
      '',
      'void swap(int* a, int* b) {',
      '    int temp = *a;',
      '    *a = *b;',
      '    *b = temp;',
      '}',
      '',
      'bool isSorted(int arr[], int n, bool ascending) {',
      '    for (int i = 0; i < n - 1; i++) {',
      '        if (ascending) {',
      '            if (arr[i] > arr[i + 1]) return false;',
      '        } else {',
      '            if (arr[i] < arr[i + 1]) return false;',
      '        }',
      '    }',
      '    return true;',
      '}',
      '',
      'void shuffle(int arr[], int n) {',
      '    for (int i = n - 1; i > 0; i--) {',
      '        int j = rand() % (i + 1); ',
      '        swap(&arr[i], &arr[j]);',
      '    }',
      '}',
      '',
      'void bogoSort(int arr[], int n, bool ascending) {',
      '    // Seed random number generator (typically once in main)',
      '    // srand(time(NULL)); ',
      '    while (!isSorted(arr, n, ascending)) {',
      '        shuffle(arr, n);',
      '    }',
      '}',
    ],
    cpp: [
      '#include <vector>',
      '#include <algorithm>',
      '#include <random>',
      '#include <chrono>',
      '',
      'template <typename T>',
      'bool isSorted(const std::vector<T>& arr, bool ascending) {',
      '    for (size_t i = 0; i < arr.size() - 1; ++i) {',
      '        if (ascending) {',
      '            if (arr[i] > arr[i + 1]) return false;',
      '        } else {',
      '            if (arr[i] < arr[i + 1]) return false;',
      '        }',
      '    }',
      '    return true;',
      '}',
      '',
      'template <typename T>',
      'void shuffle(std::vector<T>& arr) {',
      '    unsigned seed = std::chrono::system_clock::now().time_since_epoch().count();',
      '    std::shuffle(arr.begin(), arr.end(), std::default_random_engine(seed));',
      '}',
      '',
      'template <typename T>',
      'void bogoSort(std::vector<T>& arr, bool ascending) {',
      '    while (!isSorted(arr, ascending)) {',
      '        shuffle(arr);',
      '    }',
      '}',
    ],
    python: [
      'import random',
      '',
      'def is_sorted(arr, ascending=True):',
      '    for i in range(len(arr) - 1):',
      '        if ascending:',
      '            if arr[i] > arr[i + 1]:',
      '                return False',
      '        else:',
      '            if arr[i] < arr[i + 1]:',
      '                return False',
      '    return True',
      '',
      'def shuffle(arr):',
      '    random.shuffle(arr)',
      '',
      'def bogo_sort(arr, ascending=True):',
      '    while not is_sorted(arr, ascending):',
      '        shuffle(arr)',
      '    return arr',
    ],
  },
  pseudoCodeMapping: {
    0: { python: [16], cpp: [24], c: [30] }, // procedure bogoSort
    1: { python: [17], cpp: [25], c: [33] }, // while not isSorted
    2: { python: [18], cpp: [26], c: [34] }, // shuffle(list)
    3: { python: [17], cpp: [25], c: [33] }, // end while (implicit loop back)
    4: { python: [19], cpp: [27], c: [35] }, // end procedure bogoSort
    6: { python: [3], cpp: [7], c: [13] }, // procedure isSorted
    7: { python: [4], cpp: [8], c: [14] }, // for i = 0 to length of list - 2
    8: { python: [5, 8], cpp: [9, 11], c: [15, 17] }, // if condition
    9: { python: [7, 10], cpp: [10, 12], c: [16, 18] }, // return false
    10: { python: [5, 8], cpp: [9, 11], c: [15, 17] }, // end if (implicit)
    11: { python: [4], cpp: [8], c: [14] }, // end for
    12: { python: [11], cpp: [14], c: [20] }, // return true
    13: { python: [11], cpp: [14], c: [20] }, // end procedure isSorted
    15: { python: [13], cpp: [18], c: [23] }, // procedure shuffle
    16: { python: [14], cpp: [19, 20], c: [24] }, // for i = length of list - 1 down to 1
    17: { python: [14], cpp: [20], c: [25] }, // j = random integer
    18: { python: [14], cpp: [20], c: [26] }, // swap(list[i], list[j])
    19: { python: [14], cpp: [19], c: [24] }, // end for
    20: { python: [14], cpp: [20], c: [26] }, // end procedure shuffle
  },
  performancePaths: {
    best: [0, 1, 4], // Already sorted: enters bogoSort, isSorted is true, exits
    worst: [0, 1, 2, 3, 4], // Needs shuffles
    average: [0, 1, 2, 3, 4], // Needs shuffles
  },
}
