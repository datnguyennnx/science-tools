'use client'

import { SortGenerator, AuxiliaryStructure, SortStats } from '../types'

export const patienceSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const n = initialArray.length
  // arr is not directly modified for sorting, initialArray is the source for phase 1
  // and sortedArray is built in phase 2.

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Patience Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0, // Primarily for phase 2 when building sortedArray
    auxiliaryArrayWrites: 0, // For operations on piles (push/pop)
    swaps: 0, // Not applicable
  }

  const pilesAuxId = 'patience-piles'
  const pilesDisplaySlot = 'patience-piles-display'

  const formatPilesForAux = (
    currentPiles: ReadonlyArray<ReadonlyArray<number>>,
    currentTitleSuffix: string,
    highlightedPileIdx?: number,
    elementBeingPlaced?: number | null,
    targetPileForPlacement?: number | null
  ): AuxiliaryStructure => {
    return {
      id: `${pilesAuxId}-${currentTitleSuffix.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      title: `Piles: ${currentTitleSuffix}`,
      displaySlot: pilesDisplaySlot,
      data: currentPiles.map((pile, index) => ({
        value: pile.length > 0 ? pile[pile.length - 1] : NaN,
        originalIndex: index,
        id: `pile-${index}`,
        count: pile.length,
        isHighlighted: index === highlightedPileIdx || index === targetPileForPlacement,
        status:
          index === targetPileForPlacement &&
          elementBeingPlaced !== null &&
          elementBeingPlaced !== undefined
            ? `Placed ${elementBeingPlaced}`
            : index === highlightedPileIdx &&
                elementBeingPlaced !== null &&
                elementBeingPlaced !== undefined
              ? `Considering for ${elementBeingPlaced}`
              : pile.length === 0
                ? 'Empty'
                : `Top: ${pile[pile.length - 1]}`,
      })),
    }
  }

  if (n <= 1) {
    const finalPilesForAux = formatPilesForAux(
      n === 1 ? [[initialArray[0]]] : [],
      n === 1 ? 'Single Element' : 'Empty Input'
    )
    yield {
      array: [...initialArray],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1, 2],
      currentPassAuxiliaryStructure: finalPilesForAux,
    }
    return {
      finalArray: [...initialArray],
      stats: liveStats as SortStats,
      finalAuxiliaryStructures: [finalPilesForAux],
    }
  }

  yield {
    array: [...initialArray],
    mainArrayLabel: 'Input Array',
    message: `Starting Patience Sort (${direction === 'asc' ? 'Ascending' : 'Descending'}). Phase 1: Dealing elements into piles.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0],
    currentPassAuxiliaryStructure: formatPilesForAux([], 'Initial - Empty Piles'),
  }

  const piles: number[][] = []

  // Phase 1: Dealing cards into piles
  yield {
    array: [...initialArray],
    mainArrayLabel: 'Input Array',
    message: 'Phase 1: Dealing cards into piles.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [3], // for element in list
    currentPassAuxiliaryStructure: formatPilesForAux(piles, 'Ready to Deal First Card'),
  }

  for (let i = 0; i < n; i++) {
    const currentElement = initialArray[i]
    let placedToPileIndex = -1
    let bestPileToPlace = -1

    // Find the correct pile for the current element
    for (let j = 0; j < piles.length; j++) {
      const pileTop = piles[j][piles[j].length - 1]
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      const canPlaceOnPile =
        direction === 'asc' ? pileTop >= currentElement : pileTop <= currentElement

      if (canPlaceOnPile) {
        // Found a pile, this is a potential candidate. Patience sort takes the *leftmost*.
        bestPileToPlace = j
        break // Found the leftmost, no need to check further piles for this element
      }
    }

    let message
    if (bestPileToPlace !== -1) {
      piles[bestPileToPlace].push(currentElement)
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
      placedToPileIndex = bestPileToPlace
      message = `Dealt ${currentElement} (from input index ${i}) onto P${placedToPileIndex}.`
    } else {
      // No suitable existing pile found, create a new one
      piles.push([currentElement])
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
      placedToPileIndex = piles.length - 1
      message = `Dealt ${currentElement} (from input index ${i}). No suitable pile found, created new P${placedToPileIndex}.`
    }

    yield {
      array: [...initialArray],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i], // Element being dealt
      message,
      currentStats: { ...liveStats },
      // Pseudo code lines cover: taking element, loop through piles, if/else for placement, break/create new.
      currentPseudoCodeLine: bestPileToPlace !== -1 ? [4, 6, 7, 8, 9, 10] : [4, 6, 12, 13],
      currentPassAuxiliaryStructure: formatPilesForAux(
        piles, // Current state of piles *after* placement
        `Card ${currentElement} placed on P${placedToPileIndex}`,
        undefined, // No specific pile highlighted during general overview after placement
        currentElement,
        placedToPileIndex
      ),
    }
  }

  yield {
    array: [...initialArray],
    mainArrayLabel: 'Input Array (Dealing Complete)',
    message: 'Phase 1 (Dealing) complete. All elements placed into piles.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [15], // end for (dealing)
    currentPassAuxiliaryStructure: formatPilesForAux(piles, 'All Cards Dealt'),
  }

  // Phase 2: Merging piles
  const sortedArray = new Array<number>(n)
  const outputArrayForYield = (currentIndex: number) =>
    [...sortedArray].map((val, k) => (k < currentIndex ? val : NaN))

  yield {
    array: outputArrayForYield(0),
    mainArrayLabel: 'Sorted Output (Building)',
    message: 'Phase 2: Merging piles into sorted array.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [17], // Initialize sorted_list
    currentPassAuxiliaryStructure: formatPilesForAux(piles, 'Ready for Merge'),
  }

  for (let k = 0; k < n; k++) {
    let bestElement: number | null = null
    let pileIndexOfBest = -1

    // Find the pile with the smallest (or largest for desc) top card
    // This loop just finds the best, doesn't yield per comparison to keep yields consolidated.
    for (let pileIdx = 0; pileIdx < piles.length; pileIdx++) {
      if (piles[pileIdx].length > 0) {
        const currentPileTop = piles[pileIdx][piles[pileIdx].length - 1]
        if (bestElement === null) {
          bestElement = currentPileTop
          pileIndexOfBest = pileIdx
          liveStats.comparisons = (liveStats.comparisons || 0) + 1 // Counted as one comparison to establish initial best
        } else {
          liveStats.comparisons = (liveStats.comparisons || 0) + 1
          if (direction === 'asc') {
            if (currentPileTop < bestElement) {
              bestElement = currentPileTop
              pileIndexOfBest = pileIdx
            }
          } else {
            // direction === 'desc'
            if (currentPileTop > bestElement) {
              bestElement = currentPileTop
              pileIndexOfBest = pileIdx
            }
          }
        }
      }
    }

    let message
    if (bestElement !== null && pileIndexOfBest !== -1) {
      sortedArray[k] = bestElement
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      piles[pileIndexOfBest].pop()
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
      message = `Merge iteration ${k + 1}/${n}: Took ${bestElement} from P${pileIndexOfBest}. Placed at Sorted[${k}].`
    } else {
      // Should ideally not happen if algorithm is correct and n elements are to be sorted
      message = `Merge Error: Could not find next element to merge at iteration ${k + 1}/${n}. Piles may be unexpectedly empty.`
      // Yield an error state and break or return early if this case is critical
      yield {
        array: outputArrayForYield(k),
        mainArrayLabel: 'Sorted Output (Error)',
        message,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [18, 19], // Point to the loop and find operation
        currentPassAuxiliaryStructure: formatPilesForAux(piles, 'Error - No Best Element Found'),
      }
      break // Safety break from the main merge loop
    }

    yield {
      array: outputArrayForYield(k + 1),
      mainArrayLabel: 'Sorted Output (Building)',
      highlightedIndices: [k],
      message,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [18, 19, 20, 21, 22, 23, 24], // Covers loop, find, add to sorted, remove from pile
      currentPassAuxiliaryStructure: formatPilesForAux(
        piles, // Piles *after* popping
        `Took ${bestElement} from P${pileIndexOfBest}, Placed Sorted[${k}]`,
        pileIndexOfBest, // Highlight the pile from which element was taken
        bestElement, // Element that was taken
        null // Not placing on a pile, but taken from one
      ),
    }
  }

  yield {
    array: [...sortedArray], // Final sorted array
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()],
    message: 'Phase 2 (Merging) complete. Patience Sort finished.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [25], // end repeat
    currentPassAuxiliaryStructure: formatPilesForAux(piles, 'All Piles Emptied'), // Piles should be empty
  }

  return {
    finalArray: sortedArray,
    stats: liveStats as SortStats,
    finalAuxiliaryStructures: [formatPilesForAux(piles, 'Final State (Piles Empty)')],
  }
}
