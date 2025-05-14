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
  // Comparison occurs when deciding to go left or right, or if node is null
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
    }
    return newNode
  }

  // valueToInsert < node.value was already counted if node was not null
  if (valueToInsert < node.value) {
    node.left = yield* insertNodeGenerator(
      node.left,
      valueToInsert,
      originalIndex,
      fullArrayRef,
      bstElementsForViz,
      liveStats
    )
  } else {
    node.right = yield* insertNodeGenerator(
      node.right,
      valueToInsert,
      originalIndex,
      fullArrayRef,
      bstElementsForViz,
      liveStats
    )
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
    return
  }

  const traverseLeftFirst = direction === 'asc'

  if (traverseLeftFirst) {
    yield* inOrderTraversalGenerator(
      node.left,
      outputArray,
      outputIndexRef,
      bstElementsForViz,
      direction,
      liveStats
    )
  } else {
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
  }

  if (traverseLeftFirst) {
    yield* inOrderTraversalGenerator(
      node.right,
      outputArray,
      outputIndexRef,
      bstElementsForViz,
      direction,
      liveStats
    )
  } else {
    yield* inOrderTraversalGenerator(
      node.left,
      outputArray,
      outputIndexRef,
      bstElementsForViz,
      direction,
      liveStats
    )
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
  }

  // Build BST
  for (let i = 0; i < n; i++) {
    root = yield* insertNodeGenerator(
      root,
      initialArray[i],
      i,
      initialArray,
      bstElementsForViz,
      liveStats
    )
  }

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
  }

  // In-order traversal to get sorted array
  const sortedArr = new Array(n)
  liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + n // Initialization of sortedArr
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
  }

  return { finalArray: sortedArr, stats: liveStats as SortStats }
}
