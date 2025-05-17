'use client'

import type { SortAlgorithm } from '../algorithmRegistry'
import { patienceSortGenerator } from '../algorithms'

export const patienceSortData: SortAlgorithm = {
  id: 'patienceSort',
  name: 'Patience Sort',
  description:
    'Patience Sorting, named by C. L. Mallows (attributed to A.S.C. Ross), simulates playing a game of patience. Elements are dealt one by one onto a set of piles: an element is placed on the leftmost pile whose top card is greater than or equal to its value (for ascending sort), or a new pile is started if no such pile exists. This pile creation phase also inherently finds the length of the longest increasing subsequence of the input. The sorted list is then formed by repeatedly picking the smallest top card from all non-empty piles (often using a min-heap for efficiency in the merge phase) until all cards are collected. Its history is tied to computing the LIS (Hammersley), and it was later recognized as a full sorting algorithm (Ross, Floyd). While elegant, its typical implementation uses O(n) auxiliary space for the piles.',
  generator: patienceSortGenerator,
  complexity: {
    time: { best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(n)',
  },
  origin: { name: 'A.S.C. Ross, C.L. Mallows, J.M. Hammersley', year: 'c. 1960s-1970s' },
  img: '',
  pseudoCodes: {
    plaintext: [
      'procedure patienceSort(list)',
      '  piles = []',
      '',
      '  for each element in list',
      '    targetPileIndex = -1',
      '    for j = 0 to length of piles - 1',
      '      if piles[j].top_card >= element then',
      '        targetPileIndex = j',
      '        break',
      '      end if',
      '    end for',
      '    if targetPileIndex != -1 then',
      '      add element to top of piles[targetPileIndex]',
      '    else',
      '      create a new_pile with element as its only card',
      '      add new_pile to piles',
      '    end if',
      '  end for',
      '',
      '  sortedList = []',
      '  while length of sortedList < length of list',
      '    minTopPileIndex = -1',
      '    minTopCardValue = "infinity"',
      '    for j = 0 to length of piles - 1',
      '      if piles[j] is not empty then',
      '        if piles[j].top_card < minTopCardValue then',
      '          minTopCardValue = piles[j].top_card',
      '          minTopPileIndex = j',
      '        end if',
      '      end if',
      '    end for',
      '    if minTopPileIndex == -1 then break',
      '    add minTopCardValue to sortedList',
      '    remove top_card from piles[minTopPileIndex]',
      '  end while',
      '  return sortedList',
      'end procedure',
    ],
    c: [
      '#include <stdio.h>',
      '#include <stdlib.h>',
      '#include <stdbool.h>',
      '#include <limits.h>',
      '',
      'void patienceSort(int arr[], int n, bool ascending) {',
      '    if (n == 0) return;',
      '    // Full implementation for Patience Sort in C is complex',
      '    // due to dynamic pile management and is omitted for brevity.',
      '    // The C++ and Python versions provide runnable examples.',
      '}',
    ],
    cpp: [
      '#include <vector>',
      '#include <algorithm>',
      '#include <limits>',
      '',
      'void patienceSort(std::vector<int>& arr, bool ascending) {',
      '  if (arr.empty()) return;',
      '  int n = arr.size();',
      '  std::vector<std::vector<int>> piles;',
      '',
      '  for (int x : arr) {',
      '    int targetPileIdx = -1;',
      '    for (size_t j = 0; j < piles.size(); ++j) {',
      '      if (!piles[j].empty()) {',
      '        bool canPlace = ascending ? (piles[j].back() >= x) : (piles[j].back() <= x);',
      '        if (canPlace) {',
      '          targetPileIdx = j;',
      '          break;',
      '        }',
      '      }',
      '    }',
      '    if (targetPileIdx != -1) {',
      '      piles[targetPileIdx].push_back(x);',
      '    } else {',
      '      piles.push_back({x});',
      '    }',
      '  }',
      '',
      '  arr.assign(n, 0);',
      '  for (int i = 0; i < n; ++i) {',
      '    int extremeTopPileIndex = -1;',
      '    int extremeTopCard = ascending ? std::numeric_limits<int>::max() : std::numeric_limits<int>::min();',
      '',
      '    for (size_t j = 0; j < piles.size(); ++j) {',
      '      if (!piles[j].empty()) {',
      '        bool foundNewExtreme = ascending ? (piles[j].back() < extremeTopCard) : (piles[j].back() > extremeTopCard);',
      '        if (foundNewExtreme) {',
      '          extremeTopCard = piles[j].back();',
      '          extremeTopPileIndex = j;',
      '        }',
      '      }',
      '    }',
      '    if (extremeTopPileIndex != -1) {',
      '      arr[i] = extremeTopCard;',
      '      piles[extremeTopPileIndex].pop_back();',
      '    } else {',
      '      break;',
      '    }',
      '  }',
      '}',
    ],
    python: [
      'import heapq',
      '',
      'def patience_sort(arr, ascending=True):',
      '    if not arr:',
      '        return []',
      '    piles = []',
      '',
      '    for x in arr:',
      '        target_pile_idx = -1',
      '        for i, pile in enumerate(piles):',
      '            can_place = (pile[-1] >= x) if ascending else (pile[-1] <= x)',
      '            if can_place:',
      '                target_pile_idx = i',
      '                break',
      '        ',
      '        if target_pile_idx != -1:',
      '            piles[target_pile_idx].append(x)',
      '        else:',
      '            piles.append([x])',
      '',
      '    result = []',
      '    for _ in range(len(arr)):',
      '        extreme_top_pile_idx = -1',
      "        extreme_top_card = float('inf') if ascending else float('-inf')",
      '        ',
      '        for i, pile in enumerate(piles):',
      '            if pile:',
      '                is_new_extreme = (pile[-1] < extreme_top_card) if ascending else (pile[-1] > extreme_top_card)',
      '                if is_new_extreme:',
      '                    extreme_top_card = pile[-1]',
      '                    extreme_top_pile_idx = i',
      '        ',
      '        if extreme_top_pile_idx != -1:',
      '            result.append(extreme_top_card)',
      '            piles[extreme_top_pile_idx].pop()',
      '        else:',
      '            break',
      '    return result',
    ],
  },
  pseudoCodeMapping: {
    // New mapping for 37-line plaintext (0-36)
    // Original PT line references are for guidance during remapping
    0: { c: [5], cpp: [4], python: [2] }, // PT 0: procedure patienceSort(list)
    1: { c: [7], cpp: [7], python: [5] }, // PT 1: piles = []
    // PT 2 is blank
    3: { c: [8], cpp: [9], python: [7] }, // PT 4 -> 3: for each element in list
    4: { cpp: [10], python: [8] }, // PT 5 -> 4: targetPileIndex = -1
    5: { cpp: [11], python: [9] }, // PT 8 -> 5: for j = 0 to length of piles - 1
    6: { cpp: [13], python: [10] }, // PT 9 -> 6: if piles[j].top_card >= element then
    7: { cpp: [14], python: [12] }, // PT 10 -> 7: targetPileIndex = j
    8: { cpp: [15], python: [13] }, // PT 11 -> 8: break
    9: { cpp: [13], python: [10] }, // PT 12 -> 9: end if
    10: { cpp: [11], python: [9] }, // PT 13 -> 10: end for
    11: { cpp: [18], python: [15] }, // PT 14 -> 11: if targetPileIndex != -1
    12: { cpp: [19], python: [16] }, // PT 15 -> 12: add element to top of piles[targetPileIndex]
    13: { cpp: [20], python: [17] }, // PT 16 -> 13: else
    14: { cpp: [21], python: [18] }, // PT 17 -> 14: create a new_pile with element
    15: { cpp: [21], python: [18] }, // PT 18 -> 15: add new_pile to piles
    16: { cpp: [20], python: [17] }, // PT 19 -> 16: end if
    17: { cpp: [9], python: [7] }, // PT 20 -> 17: end for (dealing loop)
    // PT 18 is blank
    19: { cpp: [25], python: [20] }, // PT 24 -> 19: sortedList = []
    20: { cpp: [26], python: [21] }, // PT 25 -> 20: while length of sortedList < length of list
    21: { cpp: [27], python: [22] }, // PT 26 -> 21: minTopPileIndex = -1
    22: { cpp: [28], python: [23] }, // PT 27 -> 22: minTopCardValue = "infinity"
    23: { cpp: [30], python: [25] }, // PT 28 -> 23: for j = 0 to length of piles - 1
    24: { cpp: [31], python: [26] }, // PT 29 -> 24: if piles[j] is not empty
    25: { cpp: [33], python: [28] }, // PT 32 -> 25: if piles[j].top_card < minTopCardValue
    26: { cpp: [34], python: [29] }, // PT 33 -> 26: minTopCardValue = piles[j].top_card
    27: { cpp: [35], python: [30] }, // PT 34 -> 27: minTopPileIndex = j
    28: { cpp: [33], python: [28] }, // PT 35 -> 28: end if (inner condition)
    29: { cpp: [31], python: [26] }, // PT 36 -> 29: end if (piles not empty)
    30: { cpp: [30], python: [25] }, // PT 37 -> 30: end for (find min/max top card loop)
    31: { cpp: [38], python: [35] }, // PT 38 -> 31: if minTopPileIndex == -1 then break
    32: { cpp: [39], python: [36] }, // PT 39 -> 32: add minTopCardValue to sortedList
    33: { cpp: [40], python: [37] }, // PT 40 -> 33: remove top_card from piles[minTopPileIndex]
    34: { cpp: [26], python: [21] }, // PT 41 -> 34: end while (Merge loop)
    35: { cpp: [43], python: [39] }, // PT 42 -> 35: return sortedList
    36: { c: [10], cpp: [43], python: [39] }, // PT 43 -> 36: end procedure
  },
  hasAdvancedAuxiliaryVisuals: true,
}
