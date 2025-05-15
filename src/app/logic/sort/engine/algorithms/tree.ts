'use client'

import { SortGenerator, SortStep } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer' // Import SortStats

interface TreeNode {
  value: number
  left: TreeNode | null
  right: TreeNode | null
  // For visualization: original index or a unique ID if needed, though not strictly for sort logic
  id: number // Let's use a simple counter for unique ID for visualization
}

let nodeIdCounter = 0

const createNode = (value: number): TreeNode => {
  return { value, left: null, right: null, id: nodeIdCounter++ }
}

// Generator for inserting a node into the BST
const insertNodeGenerator = function* (
  node: TreeNode | null,
  valueToInsert: number,
  originalIndex: number,
  fullArrayRef: ReadonlyArray<number>,
  bstElementsForViz: { value: number; id: number }[],
  liveStats: Partial<SortStats> // Added liveStats
): Generator<SortStep, TreeNode, TreeNode | null> {
  if (node !== null) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
  }
  yield {
    array: [...fullArrayRef],
    mainArrayLabel: 'Input Array',
    highlightedIndices: [originalIndex],
    auxiliaryStructures: [
      {
        id: 'bstNodes',
        title: 'BST Nodes (Building)',
        data: [...bstElementsForViz],
      },
    ],
    message: node
      ? `Inserting ${valueToInsert}. Comparing with node ${node.value} (ID: ${node.id}).`
      : `Inserting ${valueToInsert} as new root/leaf.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: node ? 16 : 13, // If node exists, comparing (16). If null, creating (13).
  }

  if (node === null) {
    const newNode = createNode(valueToInsert)
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // For node creation
    bstElementsForViz.push({ value: valueToInsert, id: newNode.id })
    yield {
      array: [...fullArrayRef],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [originalIndex],
      auxiliaryStructures: [
        {
          id: 'bstNodes',
          title: 'BST Nodes (Building)',
          data: [...bstElementsForViz],
        },
      ],
      message: `Inserted ${valueToInsert} as a new node (ID: ${newNode.id}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 14, // return createNode(element)
    }
    return newNode
  }

  // valueToInsert < node.value was already counted if node was not null
  if (valueToInsert < node.value) {
    yield {
      // Before recursive call to left
      array: [...fullArrayRef],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [originalIndex],
      auxiliaryStructures: [
        {
          id: 'bstNodes',
          title: 'BST Nodes (Building)',
          data: [...bstElementsForViz],
        },
      ],
      message: `Going left from node ${node.value}. Calling insert for left child.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 17, // node.left = insert(node.left, element)
    }
    node.left = yield* insertNodeGenerator(
      node.left,
      valueToInsert,
      originalIndex,
      fullArrayRef,
      bstElementsForViz,
      liveStats
    )
  } else {
    yield {
      // Before recursive call to right
      array: [...fullArrayRef],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [originalIndex],
      auxiliaryStructures: [
        {
          id: 'bstNodes',
          title: 'BST Nodes (Building)',
          data: [...bstElementsForViz],
        },
      ],
      message: `Going right from node ${node.value}. Calling insert for right child.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 19, // node.right = insert(node.right, element)
    }
    node.right = yield* insertNodeGenerator(
      node.right,
      valueToInsert,
      originalIndex,
      fullArrayRef,
      bstElementsForViz,
      liveStats
    )
  }
  yield {
    // After recursive calls return, before returning node
    array: [...fullArrayRef],
    mainArrayLabel: 'Input Array',
    highlightedIndices: [originalIndex],
    auxiliaryStructures: [
      {
        id: 'bstNodes',
        title: 'BST Nodes (Building)',
        data: [...bstElementsForViz],
      },
    ],
    message: `Insert call for value ${valueToInsert} at current level (node ${node.value}) is returning.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 21, // return node
  }
  return node // Return the (possibly unchanged) node reference
}

// Generator for in-order traversal of the BST
const inOrderTraversalGenerator = function* (
  node: TreeNode | null,
  outputArray: number[],
  outputIndexRef: { current: number },
  bstElementsForViz: { value: number; id: number }[],
  direction: 'asc' | 'desc',
  liveStats: Partial<SortStats> // Added liveStats
): Generator<SortStep, void, void> {
  if (node === null) {
    yield {
      array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
      mainArrayLabel: 'Output Array (Traversal Check)',
      message: `InOrder: Reached null node, returning.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 24,
    }
    return
  }

  yield {
    array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
    mainArrayLabel: 'Output Array (Traversal Check)',
    message: `InOrder: Processing node ${node.value}. (Condition 'node is not null' is true)`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 24,
  }

  const traverseLeftFirst = direction === 'asc'

  if (traverseLeftFirst) {
    yield {
      array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
      mainArrayLabel: 'Output Array (Recursive Call)',
      message: `InOrder: Traversing left from ${node.value}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 25,
    }
    yield* inOrderTraversalGenerator(
      node.left,
      outputArray,
      outputIndexRef,
      bstElementsForViz,
      direction,
      liveStats
    )
  } else {
    yield {
      array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
      mainArrayLabel: 'Output Array (Recursive Call)',
      message: `InOrder (Desc): Traversing right from ${node.value}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 27, // Conceptually the "other" branch
    }
    yield* inOrderTraversalGenerator(
      node.right,
      outputArray,
      outputIndexRef,
      bstElementsForViz,
      direction,
      liveStats
    )
  }

  // Visit node
  yield {
    array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
    mainArrayLabel: 'Output Array (Traversal)',
    auxiliaryStructures: [
      {
        id: 'bstNodes',
        title: 'BST Nodes (Traversal)',
        data: bstElementsForViz.map(n => ({
          ...n,
          isVisiting: n.id === node.id,
        })),
      },
    ],
    highlightedIndices: [outputIndexRef.current],
    message: `In-order traversal: Visiting node ${node.value} (ID: ${node.id}). Placing at index ${outputIndexRef.current}.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 26,
  }
  outputArray[outputIndexRef.current] = node.value
  liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
  outputIndexRef.current++
  yield {
    array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
    mainArrayLabel: 'Output Array (Placed)',
    auxiliaryStructures: [
      {
        id: 'bstNodes',
        title: 'BST Nodes (Traversal)',
        data: bstElementsForViz,
      },
    ],
    highlightedIndices: [outputIndexRef.current - 1],
    message: `Placed ${node.value} at index ${outputIndexRef.current - 1}. Output array: [${outputArray.slice(0, outputIndexRef.current).join(', ')}]`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 26, // Still relates to adding to sortedArray
  }

  if (traverseLeftFirst) {
    yield {
      array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
      mainArrayLabel: 'Output Array (Recursive Call)',
      message: `InOrder: Traversing right from ${node.value}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 27,
    }
    yield* inOrderTraversalGenerator(
      node.right,
      outputArray,
      outputIndexRef,
      bstElementsForViz,
      direction,
      liveStats
    )
  } else {
    yield {
      array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
      mainArrayLabel: 'Output Array (Recursive Call)',
      message: `InOrder (Desc): Traversing left from ${node.value}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 25, // Conceptually the "other" branch
    }
    yield* inOrderTraversalGenerator(
      node.left,
      outputArray,
      outputIndexRef,
      bstElementsForViz,
      direction,
      liveStats
    )
  }
  yield {
    array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
    mainArrayLabel: 'Output Array (Traversal Return)',
    message: `InOrder: Finished processing node ${node.value} and its subtrees.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 28,
  }
}

export const treeSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const n = initialArray.length
  const liveStats: Partial<SortStats> = {
    algorithmName: 'Tree Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0, // For BST node creations
    swaps: 0, // Tree sort doesn't swap in the array
  }

  if (n <= 1) {
    yield {
      array: [...initialArray],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 0, // treeSort(array)
    }
    return { finalArray: initialArray, stats: liveStats as SortStats }
  }

  nodeIdCounter = 0
  let root: TreeNode | null = null
  const bstElementsForViz: { value: number; id: number }[] = []

  yield {
    array: [...initialArray],
    mainArrayLabel: 'Input Array',
    message: 'Starting Tree Sort: Building BST.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 1, // // 1. Create an empty Binary Search Tree (BST)
  }

  // Build BST (Pseudo line 3 comment)
  yield {
    // Signify start of BST build loop section
    array: [...initialArray],
    mainArrayLabel: 'Input Array',
    message: 'Beginning to insert elements into BST.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 3, // // 2. Insert all elements...
  }
  for (let i = 0; i < n; i++) {
    yield {
      array: [...initialArray],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      message: `Inserting element ${initialArray[i]} (from index ${i}) into BST.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 4, // for each element in array {
    }
    root = yield* insertNodeGenerator(
      root,
      initialArray[i],
      i,
      initialArray,
      bstElementsForViz,
      liveStats
    )
    yield {
      array: [...initialArray],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      auxiliaryStructures: [
        {
          id: 'bstNodes',
          title: 'BST Nodes (Building)',
          data: [...bstElementsForViz],
        },
      ],
      message: `Element ${initialArray[i]} inserted. Root is now ${root ? root.value : 'null'}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 5, // root = insert(root, element)
    }
  }
  // Pseudo line 6 is closing brace of insert loop
  yield {
    array: [...initialArray],
    mainArrayLabel: 'Input Array (BST Built)',
    auxiliaryStructures: [
      {
        id: 'bstNodes',
        title: 'BST Nodes (Final Structure)',
        data: [...bstElementsForViz],
      },
    ],
    message: 'BST construction complete. Starting in-order traversal.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 7, // // 3. Perform an in-order traversal...
  }

  // In-order traversal to get sorted array
  const sortedArr = new Array(n)
  liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n // Initialization of sortedArr
  yield {
    // Before starting traversal
    array: [...sortedArr].map(v => (v === undefined ? NaN : v)),
    mainArrayLabel: 'Output Array (Initializing)',
    message: 'Initialized empty array for sorted output.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 8, // sortedArray = []
  }

  const outputIndexRef = { current: 0 }
  yield* inOrderTraversalGenerator(
    root,
    sortedArr,
    outputIndexRef,
    bstElementsForViz,
    direction,
    liveStats
  )

  // Final state confirmation
  yield {
    array: [...sortedArr],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()],
    message: 'Tree Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 10, // return sortedArray (after traversal, which is line 9)
  }

  return { finalArray: sortedArr, stats: liveStats as SortStats }
}
