'use client'

import { SortGenerator } from './types'
import {
  mergeSortGenerator,
  bubbleSortGenerator,
  selectionSortGenerator,
  insertionSortGenerator,
  quickSortGenerator,
  heapSortGenerator,
  countingSortGenerator,
  radixSortGenerator,
  bucketSortGenerator,
  shellSortGenerator,
  cocktailSortGenerator,
  combSortGenerator,
  pancakeSortGenerator,
  timSortGenerator,
  gnomeSortGenerator,
  bitonicSortGenerator,
  pigeonholeSortGenerator,
  cycleSortGenerator,
  treeSortGenerator,
  oddEvenSortGenerator,
  bogoSortGenerator,
  patienceSortGenerator,
} from './algorithms'

export interface AlgorithmComplexity {
  time: {
    best: string
    average: string
    worst: string
  }
  space: string
}

// Complexity Categories for Filtering
export const TimeComplexityCategory = {
  O_N: 'O(n)',
  O_N_LOG_N: 'O(n log n)',
  O_N_PLUS_K_OR_NK: 'O(n+k) / O(nk)',
  O_N_SQUARED: 'O(n^2)',
  O_OTHER_TIME: 'Other Time Complexities',
} as const

export const SpaceComplexityCategory = {
  O_1: 'O(1)',
  O_LOG_N: 'O(log n)',
  O_N_K_ETC: 'O(n) / O(k) / O(n+k)',
  O_OTHER_SPACE: 'Other Space Complexities',
} as const

type TimeCategory = (typeof TimeComplexityCategory)[keyof typeof TimeComplexityCategory]
type SpaceCategory = (typeof SpaceComplexityCategory)[keyof typeof SpaceComplexityCategory]

export function mapComplexityToCategory(complexity: string): {
  time?: TimeCategory
  space?: SpaceCategory
} {
  const s = complexity.trim()

  // --- Time Complexity Mapping ---
  // Order is important: more specific patterns first.

  // O(n)
  if (/^O\(n\)$/.test(s)) return { time: TimeComplexityCategory.O_N }
  // O(n log n) - ensure not to catch O(n log^2 n) here
  if (/^O\(n log n\)$/.test(s)) return { time: TimeComplexityCategory.O_N_LOG_N }
  // O(n^2)
  if (/^O\(n\^2\)$/.test(s)) return { time: TimeComplexityCategory.O_N_SQUARED }
  // O(n+k), O(nk), O(d*(n+k)), O(n+Range), O(n+N)
  if (
    /^O\(\s*n\s*(\+|\*)\s*k\s*\)$/.test(s) || // O(n+k), O(n*k)
    /^O\(n\s*\+\s*(Range|N|b)\)$/.test(s) || // O(n+Range), O(n+N), O(n+b)
    /^O\(d\s*\*\s*\(n\s*\+\s*k\)\)$/.test(s) || // O(d*(n+k))
    s === 'O(n + k)' ||
    s === 'O(nk)' ||
    s === 'O(n + N)'
  ) {
    // Explicit for safety
    return { time: TimeComplexityCategory.O_N_PLUS_K_OR_NK }
  }
  // Other Time Complexities: O(n log^2 n), O(n*n!), O(n^(3/2)), Depends, Unbounded, O(log^2 n) not already O(n log n)
  if (
    s.includes('n log^2 n') ||
    s.includes('n!') ||
    s.includes('n^(3/2)') ||
    s.includes('Depends') ||
    s.includes('Unbounded') ||
    s.includes('∞') ||
    (s.includes('log^2 n') && !s.includes('n log n'))
  ) {
    // Avoid re-matching O(n log n)
    return { time: TimeComplexityCategory.O_OTHER_TIME }
  }

  // --- Space Complexity Mapping ---
  // These are checked if no time complexity was matched above.
  // This ordering implies that if a string like "O(n)" could be time or space,
  // it will be categorized as time by the rules above.

  // O(1)
  if (/^O\(1\)$/.test(s)) return { space: SpaceComplexityCategory.O_1 }
  // O(log n) - ensure not O(log^2 n) if that has a different space category
  if (/^O\(log n\)$/.test(s) && !s.includes('log^2'))
    return { space: SpaceComplexityCategory.O_LOG_N }

  // O(n), O(k), O(N), O(n+k), O(Range), O(n+b) for space
  // Note: If 's' was "O(n)", it would have been matched by the time rule TimeComplexityCategory.O_N.
  // This section for space will only match "O(n)" if the time rule for "O(n)" was removed or made more specific.
  // Thus, direct O(n) space might not be caught here if the string is identical to O(n) time.
  if (
    /^O\(k\)$/.test(s) || // O(k)
    /^O\(N\)$/.test(s) || // O(N) (Pigeonhole space)
    s === 'O(n)' || // Explicit O(n) for space (may be overshadowed by time's O(n))
    s === 'O(n + k)' ||
    s === 'O(n + b)' ||
    s === 'O(Range)'
  ) {
    // O(n+k) etc. for space
    return { space: SpaceComplexityCategory.O_N_K_ETC }
  }
  // O(n log^2 n) for space (e.g., Bitonic Sort)
  if (s.includes('n log^2 n')) {
    // Check again if not caught by 'Other Time'
    return { space: SpaceComplexityCategory.O_OTHER_SPACE }
  }
  // Other log^2 n forms for space if not time.
  if (s.includes('log^2 n') && !s.includes('n')) {
    // e.g. O(log^2 n) space
    return { space: SpaceComplexityCategory.O_OTHER_SPACE }
  }

  return {} // No specific category found
}

export interface AlgorithmOrigin {
  name: string
  year?: string | number
}

export interface SortAlgorithm {
  id: string
  name: string
  description: string
  generator: SortGenerator
  complexity: AlgorithmComplexity
  origin?: AlgorithmOrigin
  img?: string
}

// Define the initial unsorted array first
const algorithms: SortAlgorithm[] = [
  // --- Comparison sorts ---
  {
    id: 'bubbleSort',
    name: 'Bubble Sort',
    description:
      'One of the simplest sorting algorithms, Bubble Sort works by repeatedly stepping through the list and comparing adjacent elements, swapping them if they are in the wrong order. The process is repeated until the list is sorted. Its name comes from the way larger elements "bubble up" to the end of the list. While highly inefficient for large lists, its simplicity makes it a common teaching tool to introduce the concept of sorting.',
    generator: bubbleSortGenerator,
    complexity: { time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    origin: { name: 'Fundamental/Early', year: 'Popularized ~1962' },
    img: '',
  },
  {
    id: 'insertionSort',
    name: 'Insertion Sort',
    description:
      "Much like sorting a hand of playing cards, Insertion Sort builds the final sorted array one item at a time. It takes each element from the input and inserts it into the correct position within the already sorted portion of the array. It's simple to implement and efficient for small datasets or nearly sorted data, as it only requires shifting elements to make space for the new insertion.",
    generator: insertionSortGenerator,
    complexity: { time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    origin: { name: 'Fundamental/Early' },
    img: '',
  },
  {
    id: 'selectionSort',
    name: 'Selection Sort',
    description:
      'Selection Sort divides the input list into two parts: a sorted sublist built from left to right and the remaining unsorted sublist. The algorithm repeatedly finds the minimum element from the unsorted sublist and swaps it with the leftmost element of the unsorted sublist, effectively expanding the sorted portion. While straightforward, its O(n^2) complexity in all cases makes it less suitable for large datasets compared to more advanced algorithms.',
    generator: selectionSortGenerator,
    complexity: { time: { best: 'O(n^2)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    origin: { name: 'Fundamental/Early' },
    img: '',
  },
  {
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
    img: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/JohnvonNeumann-LosAlamos.gif',
  },
  {
    id: 'quickSort',
    name: 'Quick Sort',
    description:
      'Developed by Tony Hoare in 1959 while working on machine translation, Quick Sort is a highly efficient, widely used sorting algorithm that also follows the divide-and-conquer paradigm. It selects a "pivot" element from the array and partitions the other elements into two sub-arrays, according to whether they are less than or greater than the pivot. The sub-arrays are then sorted recursively. Hoare famously conceived the algorithm during a lunch break, initially struggling with the details but recognizing its potential for speed.',
    generator: quickSortGenerator,
    complexity: {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n^2)' },
      space: 'O(log n)',
    },
    origin: { name: 'Tony Hoare', year: 1959 },
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Sir_Tony_Hoare_IMG_5125.jpg/1200px-Sir_Tony_Hoare_IMG_5125.jpg',
  },
  {
    id: 'heapSort',
    name: 'Heap Sort',
    description:
      'Invented by J. W. J. Williams in 1964, Heap Sort is a comparison-based sorting algorithm that leverages the heap data structure. It first builds a max-heap from the input array, where the largest element is at the root. Then, it repeatedly extracts the maximum element from the heap and places it at the end of the array, rebuilding the heap with the remaining elements. This process continues until the array is sorted. A key advantage is its O(1) space complexity, performing the sort in-place.',
    generator: heapSortGenerator,
    complexity: {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(1)',
    },
    origin: { name: 'J. W. J. Williams', year: 1964 },
    img: 'https://ottawacitizen.remembering.ca/_next/image?url=https%3A%2F%2Fd1q40j6jx1d8h6.cloudfront.net%2FObituaries%2F41508162%2FThumbnail_1.jpg&w=3840&q=75',
  },
  {
    id: 'shellSort',
    name: 'Shell Sort',
    description:
      'Proposed by Donald L. Shell in 1959, Shell Sort is an optimization of Insertion Sort. It improves performance by allowing the comparison and swapping of elements that are far apart, thus quickly moving elements to their general vicinity. It works by sorting elements at decreasing intervals (gaps), with the final pass being a standard Insertion Sort with a gap of 1. This pre-sorting with larger gaps significantly reduces the number of shifts required in the final insertion sort step.',
    generator: shellSortGenerator,
    complexity: {
      time: { best: 'O(n log n)', average: 'Depends', worst: 'O(n^2)' },
      space: 'O(1)',
    },
    origin: { name: 'Donald L. Shell', year: 1959 },
    img: 'https://upload.wikimedia.org/wikipedia/commons/0/05/DonShell-1.jpg',
  },
  {
    id: 'cocktailSort',
    name: 'Cocktail Shaker Sort',
    description:
      'Cocktail Shaker Sort is a variation of Bubble Sort that sorts in both directions on each pass through the list. It alternates between bubbling elements up from the bottom and bubbling elements down from the top. While it can be slightly faster than the standard Bubble Sort, especially on nearly sorted lists, it still retains the O(n^2) worst-case and average complexity, making it generally inefficient for large datasets. Its name is inspired by the back-and-forth motion akin to shaking a cocktail.',
    generator: cocktailSortGenerator,
    complexity: { time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    origin: { name: 'Fundamental/Early' },
    img: '',
  },
  {
    id: 'combSort',
    name: 'Comb Sort',
    description:
      'Comb Sort is an improvement on Bubble Sort that addresses the "turtle" problem – small values near the end of the list that slow down Bubble Sort. It does this by using a gap larger than 1 for comparisons and swaps, similar to Shell Sort, but with a shrinking gap size on each pass. The gap is typically shrunk by a factor (commonly 1.3) until it reaches 1, at which point it becomes a standard Bubble Sort. This allows elements to move larger distances initially, leading to faster sorting on average.',
    generator: combSortGenerator,
    complexity: { time: { best: 'O(n log n)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    origin: { name: 'W. Dobosiewicz / Lacey & Box', year: '1980/1991' },
    img: '',
  },
  {
    id: 'gnomeSort',
    name: 'Gnome Sort',
    description:
      'Originally called "Stupid Sort," Gnome Sort is a simple sorting algorithm conceived by Hamid Sarbazi-Azad and later described and named "Gnome Sort" by Dick Grune. It is similar to Insertion Sort but instead of using nested loops to find the insertion position, it repeatedly compares adjacent elements and swaps them if they are in the wrong order, moving back only when a swap occurs. Its known for its simplicity and is often used as an educational example.',
    generator: gnomeSortGenerator,
    complexity: { time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    origin: { name: 'Hamid Sarbazi-Azad / Dick Grune', year: 2000 },
    img: 'https://sharif.edu/~azad/Works_files/image003.jpg',
  },
  // --- Non-comparison sorts ---
  {
    id: 'countingSort',
    name: 'Counting Sort',
    description:
      'Invented by Harold H. Seward in 1954, Counting Sort is a non-comparison sorting algorithm that is effective for sorting a collection of objects according to their keys that are small integers. It works by counting the number of occurrences of each unique key value, then using those counts to determine the positions of each key value in the output sequence. It is often used as a subroutine in other sorting algorithms like Radix Sort and can achieve linear time complexity O(n + k) where k is the range of input values.',
    generator: countingSortGenerator,
    complexity: {
      time: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n + k)' },
      space: 'O(k)',
    },
    origin: { name: 'Harold H. Seward', year: 1954 },
    img: 'https://currentobitwebstorage.blob.core.windows.net/067/06822c877d864c47b0b15c7005b30790.jpg',
  },
  {
    id: 'radixSort',
    name: 'Radix Sort',
    description:
      'Dating back to the work of Herman Hollerith in 1887 for tabulating machines, Radix Sort is a non-comparative sorting algorithm that sorts data with integer keys by grouping keys by individual digits which share the same significant position and value. It processes digits from either the least significant digit (LSD) or most significant digit (MSD). This approach avoids direct comparisons and can be very efficient for certain types of data, particularly when the range of key values is limited.',
    generator: radixSortGenerator,
    complexity: { time: { best: 'O(nk)', average: 'O(nk)', worst: 'O(nk)' }, space: 'O(n + k)' },
    origin: { name: 'Herman Hollerith', year: 1887 },
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Hollerith.jpg/250px-Hollerith.jpg',
  },
  {
    id: 'bucketSort',
    name: 'Bucket Sort',
    description:
      'Bucket Sort, also known as bin sort, is a distribution sort algorithm that divides the input elements into a number of buckets. Each bucket is then sorted independently, either using a different sorting algorithm or by recursively applying the bucket sorting algorithm. It works best when the input data is uniformly distributed over a range. The motivation is to distribute the sorting effort across multiple smaller sorting problems, which can lead to better average-case performance than comparison sorts for certain data distributions.',
    generator: bucketSortGenerator,
    complexity: {
      time: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n^2)' },
      space: 'O(n + k)',
    },
    origin: { name: 'Distribution-based / Early' },
    img: '',
  },
  {
    id: 'pigeonholeSort',
    name: 'Pigeonhole Sort',
    description:
      'Pigeonhole Sort is a sorting algorithm that is effective when the number of items and the range of possible key values are approximately the same. It works by creating an array of "pigeonholes," one for each key value in the range. The input elements are then placed into the corresponding pigeonholes. Finally, the sorted list is obtained by collecting the elements from the pigeonholes in order. It is similar to Counting Sort but directly places elements into the auxiliary array rather than just counting them.',
    generator: pigeonholeSortGenerator,
    complexity: {
      time: { best: 'O(n + N)', average: 'O(n + N)', worst: 'O(n + N)' },
      space: 'O(N)',
    },
    origin: { name: 'E. J. Isaac & R. C. Singleton', year: 1956 },
    img: '',
  },
  {
    id: 'treeSort',
    name: 'Tree Sort',
    description:
      'Tree Sort utilizes a Binary Search Tree (BST) to sort elements. It works by inserting all elements from the input array into a BST. Due to the properties of a BST, an in-order traversal of the tree will visit the elements in sorted order. The motivation is to leverage the efficient insertion and ordering properties of a BST to achieve sorting. While the average time complexity is O(n log n), the worst-case can degrade to O(n^2) if the input data is already sorted or reverse-sorted, leading to a skewed tree.',
    generator: treeSortGenerator,
    complexity: {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n^2)' },
      space: 'O(n)',
    },
    origin: { name: 'Binary Search Tree Concept', year: '~1960s' },
    img: '',
  },
  {
    id: 'pancakeSort',
    name: 'Pancake Sort',
    description:
      'Pancake Sort is a whimsical sorting problem and algorithm where the only allowed operation is to reverse the order of the top k elements of a stack (a "spatula flip"). The goal is to sort a stack of pancakes (elements of an array) by size using the minimum number of flips. First seriously studied by computer scientist and mathematician Jacob E. Goodman (under the pseudonym "Harry Dweighter"), it gained further recognition when Bill Gates co-authored a paper on it. The algorithm focuses on minimizing flips rather than comparisons.',
    generator: pancakeSortGenerator,
    complexity: { time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    origin: { name: 'Jacob E. Goodman', year: 1975 },
    img: 'https://www.navonarecords.com/nv/wp-content/uploads/2022/01/Jacob-Goodman.jpg',
  },
  {
    id: 'bitonicSort',
    name: 'Bitonic Sort',
    description:
      'Developed by Kenneth E. Batcher in 1968, Bitonic Sort is a parallel sorting algorithm that uses bitonic sequences and sorting networks. A bitonic sequence is a sequence that first monotonically increases and then monotonically decreases, or vice versa. The algorithm repeatedly merges bitonic sequences to create larger bitonic sequences until the entire sequence is sorted. It is particularly well-suited for implementation on parallel hardware due to its regular comparison structure.',
    generator: bitonicSortGenerator,
    complexity: {
      time: { best: 'O(n log^2 n)', average: 'O(n log^2 n)', worst: 'O(n log^2 n)' },
      space: 'O(n log^2 n)',
    },
    origin: { name: 'Kenneth E. Batcher', year: 1968 },
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEz0wn7EMxQ-yxtoeDEINcGtldHaIDfRCRWw&s',
  },
  {
    id: 'oddEvenSort',
    name: 'Odd-Even Sort',
    description:
      'Odd-Even Sort, also known as brick sort, is a simple sorting algorithm that is a variation of Bubble Sort. It is primarily designed for use on parallel processors. The algorithm repeatedly performs two phases: an odd phase where odd-indexed pairs of adjacent elements are compared and swapped if out of order, and an even phase where even-indexed pairs are compared and swapped. This alternating comparison and swapping process continues until the list is sorted.',
    generator: oddEvenSortGenerator,
    complexity: { time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    origin: { name: 'N. Habermann', year: 1972 },
    img: '',
  },
  {
    id: 'cycleSort',
    name: 'Cycle Sort',
    description:
      'Cycle Sort is an in-place sorting algorithm that is optimal in terms of the number of writes to the original array. It is based on the idea of permutations and cycles. For each element, it finds its correct position in the sorted array and rotates the elements that are in the way to complete a cycle. This minimizes writes because each element is written at most once to its final sorted position. While it has a worst-case time complexity of O(n^2), its focus on minimizing writes makes it suitable for scenarios where writes are significantly more expensive than reads.',
    generator: cycleSortGenerator,
    complexity: { time: { best: 'O(n^2)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    origin: { name: 'Concept: Permutation Cycles', year: 'Paper: 1990' },
    img: '',
  },
  {
    id: 'timSort',
    name: 'Tim Sort',
    description:
      'Created by Tim Peters in 2002 for the Python programming language, Tim Sort is a highly optimized hybrid stable sorting algorithm derived from Merge Sort and Insertion Sort. It is designed to perform well on many kinds of real-world data by taking advantage of naturally occurring runs (already sorted subsequences) within the data. It identifies these runs and merges them efficiently using a modified merge process. Tim Sort is the standard sorting algorithm in Python, Java, and other languages due to its excellent performance on typical datasets.',
    generator: timSortGenerator,
    complexity: {
      time: { best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
    },
    origin: { name: 'Tim Peters', year: 2002 },
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzFnR9nKrRMRga3k5z444lnItT-GYEIkO2ow&s',
  },
  {
    id: 'patienceSort',
    name: 'Patience Sort',
    description:
      'Patience sorting was named by C. L. Mallows, who attributed its invention to A.S.C. Ross in the early 1960s. According to Aldous and Diaconis,patience sorting was first recognized as an algorithm to compute the longest increasing subsequence length by Hammersley. A.S.C. Ross and independently Robert W. Floyd recognized it as a sorting algorithm. Initial analysis was done by Mallows. Floyds game was developed by Floyd in correspondence with Donald Knuth.',
    generator: patienceSortGenerator,
    complexity: {
      time: { best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
    },
    origin: { name: 'C.L. Mallows', year: 1959 },
    img: '',
  },
  {
    id: 'bogoSort',
    name: 'Bogo Sort',
    description:
      'Often referred to as "Stupid Sort" or "Permutation Sort," Bogo Sort is a deliberately inefficient sorting algorithm purely for educational or حتى-joking purposes. It works by repeatedly shuffling the list randomly and checking if it is sorted after each shuffle. The sorting is successful purely by chance, and the expected time complexity is extremely high, making it impractical for any real-world use case. Its origin is often cited as a fictitious contest to find the worst possible sorting algorithm.',
    generator: bogoSortGenerator,
    complexity: { time: { best: 'O(n)', average: 'O(n * n!)', worst: 'Unbounded' }, space: 'O(1)' },
    origin: { name: 'Educational/Joke Algorithm' },
    img: '',
  },
  // {
  //   id: 'smoothSort',
  //   name: 'Smooth Sort',
  //   description:
  //     'Smoothsort is an adaptive, in-place comparison sort invented by Edsger W. Dijkstra in 1981. It builds on heapsort but organizes data into a sequence of heap-ordered trees whose sizes follow Leonardo numbers. It achieves O(n log n) worst-case time while adapting to nearly-sorted input to approach O(n) in the best case via "trinkle" operations on heap "stretches".',
  //   generator: smoothSortGenerator,
  //   complexity: {
  //     time: { best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)' },
  //     space: 'O(1)',
  //   },
  //   origin: { name: 'Edsger W. Dijkstra', year: 1981 },
  //   img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Edsger_Wybe_Dijkstra.jpg/250px-Edsger_Wybe_Dijkstra.jpg',
  // },
]

// Sort the array alphabetically by name before exporting
algorithms.sort((a, b) => a.name.localeCompare(b.name))

export const SORT_ALGORITHMS: ReadonlyArray<SortAlgorithm> = algorithms
