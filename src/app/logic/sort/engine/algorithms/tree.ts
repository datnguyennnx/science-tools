'use client'

import { SortGenerator, SortStep, SortStats, AuxiliaryStructure } from '../types'

interface TreeNode {
  value: number
  left: TreeNode | null
  right: TreeNode | null
  // For visualization: original index or a unique ID if needed, though not strictly for sort logic
  id: number // Let's use a simple counter for unique ID for visualization
}

interface BstVizNode {
  value: number
  id: number
  isHighlighted?: boolean
}

let nodeIdCounter = 0
const mainBstAuxId = 'tree-bst-visualization'

const createNode = (value: number): TreeNode => {
  return { value, left: null, right: null, id: nodeIdCounter++ }
}

// Helper to create the BST AuxiliaryStructure
const getBstAuxStructure = (
  title: string,
  currentBstElements: ReadonlyArray<BstVizNode>,
  highlightedNodeId?: number
): AuxiliaryStructure => {
  return {
    id: mainBstAuxId,
    title,
    data: currentBstElements.map(n => ({
      ...n,
      isHighlighted: n.id === highlightedNodeId, // Chart can use this for styling
    })),
    displaySlot: mainBstAuxId,
  }
}

// Generator for inserting a node into the BST
const insertNodeGenerator = function* (
  node: TreeNode | null,
  valueToInsert: number,
  originalIndex: number,
  fullArrayRef: ReadonlyArray<number>,
  bstElementsForViz: BstVizNode[],
  liveStats: Partial<SortStats>,
  currentDepth: number // For messages
): Generator<SortStep, TreeNode, TreeNode | null> {
  const currentStructTitle = node
    ? `BST Lvl ${currentDepth}: Inserting ${valueToInsert}. Comparing with ${node.value} (ID ${node.id})`
    : `BST Lvl ${currentDepth}: Inserting ${valueToInsert} as new root/leaf.`

  if (node !== null) {
    liveStats.comparisons = (liveStats.comparisons || 0) + 1
  }

  yield {
    array: [...fullArrayRef],
    mainArrayLabel: 'Input Array',
    highlightedIndices: [originalIndex],
    currentPassAuxiliaryStructure: getBstAuxStructure(
      currentStructTitle,
      bstElementsForViz,
      node?.id
    ),
    historicalAuxiliaryStructures: [],
    message: currentStructTitle,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: node ? [14] : [11], // Approx. lines from original pseudocode
  }

  if (node === null) {
    const newNode = createNode(valueToInsert)
    liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
    bstElementsForViz.push({ value: valueToInsert, id: newNode.id })
    const nodeCreatedTitle = `BST Lvl ${currentDepth}: Inserted ${valueToInsert} as new node (ID ${newNode.id})`
    yield {
      array: [...fullArrayRef],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [originalIndex],
      currentPassAuxiliaryStructure: getBstAuxStructure(
        nodeCreatedTitle,
        bstElementsForViz,
        newNode.id
      ),
      historicalAuxiliaryStructures: [],
      message: nodeCreatedTitle,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [12],
    }
    return newNode
  }

  if (valueToInsert < node.value) {
    const goingLeftTitle = `BST Lvl ${currentDepth}: ${valueToInsert} < ${node.value}. Going left.`
    yield {
      array: [...fullArrayRef],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [originalIndex],
      currentPassAuxiliaryStructure: getBstAuxStructure(goingLeftTitle, bstElementsForViz, node.id),
      historicalAuxiliaryStructures: [],
      message: goingLeftTitle,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [15],
    }
    node.left = yield* insertNodeGenerator(
      node.left,
      valueToInsert,
      originalIndex,
      fullArrayRef,
      bstElementsForViz,
      liveStats,
      currentDepth + 1
    )
  } else {
    const goingRightTitle = `BST Lvl ${currentDepth}: ${valueToInsert} >= ${node.value}. Going right.`
    yield {
      array: [...fullArrayRef],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [originalIndex],
      currentPassAuxiliaryStructure: getBstAuxStructure(
        goingRightTitle,
        bstElementsForViz,
        node.id
      ),
      historicalAuxiliaryStructures: [],
      message: goingRightTitle,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [17],
    }
    node.right = yield* insertNodeGenerator(
      node.right,
      valueToInsert,
      originalIndex,
      fullArrayRef,
      bstElementsForViz,
      liveStats,
      currentDepth + 1
    )
  }
  const returnTitle = `BST Lvl ${currentDepth}: Insert for ${valueToInsert} returning from node ${node.value}.`
  yield {
    array: [...fullArrayRef],
    mainArrayLabel: 'Input Array',
    highlightedIndices: [originalIndex],
    currentPassAuxiliaryStructure: getBstAuxStructure(returnTitle, bstElementsForViz, node.id),
    historicalAuxiliaryStructures: [],
    message: returnTitle,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [19],
  }
  return node
}

// Generator for in-order traversal of the BST
const inOrderTraversalGenerator = function* (
  node: TreeNode | null,
  outputArray: number[],
  outputIndexRef: { current: number },
  bstElementsForViz: ReadonlyArray<BstVizNode>,
  direction: 'asc' | 'desc',
  liveStats: Partial<SortStats>,
  currentDepth: number // For messages
): Generator<SortStep, void, void> {
  if (node === null) {
    // Optional: yield step for reaching null if very granular detail is needed
    // For now, matching original behavior of only yielding if node is not null initially.
    return
  }

  const baseTraversalTitle = `BST Lvl ${currentDepth} In-Order: Node ${node.value} (ID ${node.id})`
  yield {
    array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
    mainArrayLabel: 'Output Array (Building)',
    currentPassAuxiliaryStructure: getBstAuxStructure(
      baseTraversalTitle,
      bstElementsForViz,
      node.id
    ),
    historicalAuxiliaryStructures: [],
    message: `${baseTraversalTitle} - Processing.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [23],
  }

  const traverseLeftFirst = direction === 'asc'

  if (traverseLeftFirst) {
    const goLeftTitle = `${baseTraversalTitle} - Traversing Left`
    yield {
      array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
      mainArrayLabel: 'Output Array (Building)',
      currentPassAuxiliaryStructure: getBstAuxStructure(
        goLeftTitle,
        bstElementsForViz,
        node.left?.id
      ),
      historicalAuxiliaryStructures: [],
      message: goLeftTitle,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [25],
    }
    yield* inOrderTraversalGenerator(
      node.left,
      outputArray,
      outputIndexRef,
      bstElementsForViz,
      direction,
      liveStats,
      currentDepth + 1
    )
  } else {
    // Descending: traverse right first
    const goRightTitle = `${baseTraversalTitle} - Traversing Right (Desc)`
    yield {
      array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
      mainArrayLabel: 'Output Array (Building)',
      currentPassAuxiliaryStructure: getBstAuxStructure(
        goRightTitle,
        bstElementsForViz,
        node.right?.id
      ),
      historicalAuxiliaryStructures: [],
      message: goRightTitle,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [29], // Adjusted for descending right traversal
    }
    yield* inOrderTraversalGenerator(
      node.right,
      outputArray,
      outputIndexRef,
      bstElementsForViz,
      direction,
      liveStats,
      currentDepth + 1
    )
  }

  // Visit current node (place into outputArray)
  const visitNodeTitle = `${baseTraversalTitle} - Visiting & Outputting ${node.value}`
  outputArray[outputIndexRef.current] = node.value
  liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
  const currentOutputIdx = outputIndexRef.current
  outputIndexRef.current++

  yield {
    array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
    mainArrayLabel: 'Output Array (Building)',
    highlightedIndices: [currentOutputIdx], // Highlight where value was placed
    currentPassAuxiliaryStructure: getBstAuxStructure(visitNodeTitle, bstElementsForViz, node.id),
    historicalAuxiliaryStructures: [],
    message: `${visitNodeTitle} to Output[${currentOutputIdx}].`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [26], // visit node
  }

  if (traverseLeftFirst) {
    // Ascending: traverse right second
    const goRightTitle = `${baseTraversalTitle} - Traversing Right`
    yield {
      array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
      mainArrayLabel: 'Output Array (Building)',
      currentPassAuxiliaryStructure: getBstAuxStructure(
        goRightTitle,
        bstElementsForViz,
        node.right?.id
      ),
      historicalAuxiliaryStructures: [],
      message: goRightTitle,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [27], // Adjusted for ascending right traversal
    }
    yield* inOrderTraversalGenerator(
      node.right,
      outputArray,
      outputIndexRef,
      bstElementsForViz,
      direction,
      liveStats,
      currentDepth + 1
    )
  } else {
    // Descending: traverse left second
    const goLeftTitle = `${baseTraversalTitle} - Traversing Left (Desc)`
    yield {
      array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
      mainArrayLabel: 'Output Array (Building)',
      currentPassAuxiliaryStructure: getBstAuxStructure(
        goLeftTitle,
        bstElementsForViz,
        node.left?.id
      ),
      historicalAuxiliaryStructures: [],
      message: goLeftTitle,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [25], // Reusing for descending left traversal
    }
    yield* inOrderTraversalGenerator(
      node.left,
      outputArray,
      outputIndexRef,
      bstElementsForViz,
      direction,
      liveStats,
      currentDepth + 1
    )
  }
  const returnFromNodeTitle = `${baseTraversalTitle} - Traversal from this node complete.`
  yield {
    array: [...outputArray].map((v, i) => (i < outputIndexRef.current ? v : NaN)),
    mainArrayLabel: 'Output Array (Building)',
    currentPassAuxiliaryStructure: getBstAuxStructure(
      returnFromNodeTitle,
      bstElementsForViz,
      node.id
    ),
    historicalAuxiliaryStructures: [],
    message: returnFromNodeTitle,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [28], // end if node is not null
  }
}

export const treeSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const n = initialArray.length
  let root: TreeNode | null = null
  const bstElementsForViz: BstVizNode[] = [] // Stores {value, id} for visualization
  nodeIdCounter = 0 // Reset node ID counter for each sort run

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Tree Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0, // For writing to the final sorted array during traversal
    auxiliaryArrayWrites: 0, // For creating tree nodes
    swaps: 0, // Tree sort doesn't swap in the typical sense
  }

  if (n <= 1) {
    const finalMessage = 'Array already sorted or empty.'
    if (n === 1) {
      // If array has one element, create a root node for visualization
      const singleNode = createNode(initialArray[0])
      bstElementsForViz.push({ value: singleNode.value, id: singleNode.id })
    }
    yield {
      array: [...initialArray],
      sortedIndices: [...Array(n).keys()],
      message: finalMessage,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1],
      currentPassAuxiliaryStructure: getBstAuxStructure('BST (Initial/Empty)', bstElementsForViz),
      historicalAuxiliaryStructures: [],
    }
    return {
      finalArray: [...initialArray],
      stats: liveStats as SortStats,
      finalAuxiliaryStructures: getBstAuxStructure('BST (Final State)', bstElementsForViz),
    }
  }

  yield {
    array: [...initialArray],
    mainArrayLabel: 'Input Array',
    message: 'Starting Tree Sort: Building BST.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [3],
    currentPassAuxiliaryStructure: getBstAuxStructure(
      'BST (Initial - Building)',
      bstElementsForViz
    ),
    historicalAuxiliaryStructures: [],
  }

  for (let i = 0; i < n; i++) {
    const valueToInsert = initialArray[i]
    const insertPhaseTitle = `BST Build: Inserting ${valueToInsert} (from input index ${i})`
    yield {
      // Yield before diving into insertNodeGenerator for this element
      array: [...initialArray],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      currentPassAuxiliaryStructure: getBstAuxStructure(insertPhaseTitle, bstElementsForViz),
      historicalAuxiliaryStructures: [],
      message: insertPhaseTitle,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [4, 5], // Corresponds to loop and call to insert
    }
    root = yield* insertNodeGenerator(
      root,
      valueToInsert,
      i,
      initialArray,
      bstElementsForViz,
      liveStats,
      0
    )
  }

  const bstBuildCompleteTitle = 'BST Build Complete.'
  const finalTreeStructureAfterBuild = getBstAuxStructure(bstBuildCompleteTitle, bstElementsForViz)
  yield {
    array: [...initialArray], // Show original array state after BST build
    mainArrayLabel: 'Input Array (BST Built)',
    message: bstBuildCompleteTitle,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [6], // End of insertion loop
    currentPassAuxiliaryStructure: finalTreeStructureAfterBuild,
    historicalAuxiliaryStructures: [],
  }

  const outputArray = new Array<number>(n).fill(NaN) // For visualization, fill with NaN initially
  const outputIndexRef = { current: 0 }

  const traversalStartTitle = `Starting In-Order Traversal (${direction === 'asc' ? 'Ascending' : 'Descending'}).`
  yield {
    array: [...outputArray],
    mainArrayLabel: 'Output Array (Preparing Traversal)',
    message: traversalStartTitle,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [8], // call inOrderTraversal
    currentPassAuxiliaryStructure: finalTreeStructureAfterBuild, // Show the tree that will be traversed
    historicalAuxiliaryStructures: [], // Or could be an earlier snapshot if needed
  }

  yield* inOrderTraversalGenerator(
    root,
    outputArray,
    outputIndexRef,
    bstElementsForViz,
    direction,
    liveStats,
    0
  )

  const traversalCompleteTitle = 'In-Order Traversal Complete. Array is sorted.'
  yield {
    array: [...outputArray],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()],
    message: traversalCompleteTitle,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [9], // after traversal
    currentPassAuxiliaryStructure: getBstAuxStructure(
      'BST (Traversal Complete)',
      bstElementsForViz
    ),
    historicalAuxiliaryStructures: [],
  }

  return {
    finalArray: outputArray,
    stats: liveStats as SortStats,
    finalAuxiliaryStructures: getBstAuxStructure('BST (Final State)', bstElementsForViz),
  }
}
