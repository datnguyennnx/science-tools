'use client'

import { SortGenerator, AuxiliaryStructure } from '../types'
import type { SortStats } from '../../components/AuxiliaryVisualizer' // Import SortStats

export const patienceSortGenerator: SortGenerator = function* (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) {
  const n = initialArray.length
  const arr = [...initialArray]

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Patience Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0, // Primarily for phase 2 when building sortedArray
    auxiliaryArrayWrites: 0, // For operations on piles
  }

  if (n <= 1) {
    yield {
      array: [...initialArray],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 0, // patienceSort(array)
    }
    return { finalArray: initialArray, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: `Starting Patience Sort (${direction === 'asc' ? 'Ascending' : 'Descending'}). Phase 1: Dealing elements into piles.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 0, // patienceSort(array)
  }

  const piles: number[][] = []

  const visualizePiles = (
    currentPiles: number[][],
    titleSuffix: string,
    highlightedPileIndex?: number
  ): AuxiliaryStructure[] => {
    return [
      {
        id: 'patiencePiles',
        title: `Piles (${titleSuffix})`,
        data: currentPiles.map((pile, index) => {
          const topCard = pile.length > 0 ? pile[pile.length - 1] : 'Empty'
          const isHighlighted = index === highlightedPileIndex
          return {
            value: pile.length,
            originalIndex: index,
            label: `P${index}: Top=${topCard}, Size=${pile.length}${isHighlighted ? ' (Focus)' : ''}`,
          }
        }),
      },
    ]
  }

  yield {
    array: [...arr],
    message: 'Initialized empty piles.',
    auxiliaryStructures: visualizePiles(piles, 'Initialized'),
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 1, // piles = []
  }
  yield {
    array: [...arr],
    message: 'Starting Phase 1: Dealing cards into piles.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 2, // // Phase 1: Deal cards into piles
  }

  for (let i = 0; i < n; i++) {
    const currentElement = initialArray[i]
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      message: `Dealing element ${currentElement} (from original index ${i}).`,
      auxiliaryStructures: visualizePiles(piles, 'Searching for Pile'),
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 3, // for each card in array
    }

    let placed = false
    let targetPileIndex = -1

    for (let j = 0; j < piles.length; j++) {
      const pileTop = piles[j][piles[j].length - 1]
      liveStats.comparisons = (liveStats.comparisons || 0) + 1
      const canPlaceOnPile =
        direction === 'asc' ? pileTop >= currentElement : pileTop <= currentElement

      yield {
        array: [...arr],
        mainArrayLabel: 'Input Array',
        highlightedIndices: [i],
        auxiliaryStructures: visualizePiles(piles, `Comparing with Pile ${j} Top (${pileTop})`, j),
        message: `Comparing element ${currentElement} with top of pile ${j} (${pileTop}).`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 4, // pileToPlace = find_pile(...)
      }

      if (canPlaceOnPile) {
        yield {
          array: [...arr],
          mainArrayLabel: 'Input Array',
          highlightedIndices: [i],
          auxiliaryStructures: visualizePiles(piles, `Found Pile ${j}`, j),
          message: `Pile ${j} is suitable.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 5, // if pileToPlace exists
        }
        piles[j].push(currentElement)
        liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
        placed = true
        targetPileIndex = j
        yield {
          array: [...arr],
          mainArrayLabel: 'Input Array',
          highlightedIndices: [i],
          auxiliaryStructures: visualizePiles(piles, `Placed on Pile ${j}`, j),
          message: `Placed ${currentElement} on pile ${j}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 6, // place card on pileToPlace
        }
        break
      }
    }

    if (!placed) {
      yield {
        array: [...arr],
        mainArrayLabel: 'Input Array',
        highlightedIndices: [i],
        auxiliaryStructures: visualizePiles(piles, 'No suitable pile found'),
        message: 'No suitable pile found for current card.',
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 7, // else (no pileToPlace)
      }
      piles.push([currentElement])
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // New pile creation is a form of aux write
      targetPileIndex = piles.length - 1
      yield {
        array: [...arr],
        mainArrayLabel: 'Input Array',
        highlightedIndices: [i],
        auxiliaryStructures: visualizePiles(
          piles,
          `Created New Pile ${targetPileIndex}`,
          targetPileIndex
        ),
        message: `No suitable pile. Created new pile ${targetPileIndex} with ${currentElement}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 8, // create new pile with card
      }
    }
    // Conceptually at line 9, closing brace of if/else for placing card
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      auxiliaryStructures: visualizePiles(piles, 'Card Placed', targetPileIndex),
      message: `Finished processing card ${currentElement}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 9,
    }
  }
  // Conceptually at line 10, closing brace of for each card loop
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: 'Phase 1 complete. All elements dealt. Phase 2: Merging piles.',
    auxiliaryStructures: visualizePiles(piles, 'Final Piles Before Merge'),
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 11, // // Phase 2: Merge piles...
  }

  const sortedArray = new Array<number>(n)

  const outputArrayForYield = () =>
    [...sortedArray].map(val => (val === undefined || val === null ? NaN : val))

  yield {
    array: outputArrayForYield(),
    mainArrayLabel: 'Sorted Output (Building)',
    message: 'Initialized empty sortedArray for merging.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 12, // sortedArray = []
  }
  let sortedCount = 0

  while (sortedCount < n) {
    yield {
      array: outputArrayForYield(),
      mainArrayLabel: 'Sorted Output (Building)',
      auxiliaryStructures: visualizePiles(piles, 'Checking Piles for Merge'),
      message: `Checking while condition for merging: sortedCount (${sortedCount}) < n (${n}).`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 13, // while any pile is not empty
    }
    let bestElementThisIteration: number | null = null
    let pileIndexOfBestElement = -1

    for (let currentPileIdx = 0; currentPileIdx < piles.length; currentPileIdx++) {
      if (piles[currentPileIdx].length > 0) {
        const currentPileTop = piles[currentPileIdx][piles[currentPileIdx].length - 1]
        liveStats.comparisons = (liveStats.comparisons || 0) + 1 // Comparison to find min/max top

        if (bestElementThisIteration === null) {
          bestElementThisIteration = currentPileTop
          pileIndexOfBestElement = currentPileIdx
        } else {
          if (direction === 'asc') {
            if (currentPileTop < bestElementThisIteration) {
              bestElementThisIteration = currentPileTop
              pileIndexOfBestElement = currentPileIdx
            }
          } else {
            if (currentPileTop > bestElementThisIteration) {
              bestElementThisIteration = currentPileTop
              pileIndexOfBestElement = currentPileIdx
            }
          }
        }
        yield {
          array: outputArrayForYield(),
          mainArrayLabel: 'Sorted Output (Building)',
          auxiliaryStructures: visualizePiles(
            piles,
            `Merging: Checked Pile ${currentPileIdx}, Best is ${bestElementThisIteration === null ? 'N/A' : bestElementThisIteration} from P${pileIndexOfBestElement === -1 ? 'N/A' : pileIndexOfBestElement}`,
            pileIndexOfBestElement
          ),
          message: `Merging: Checked P${currentPileIdx} (top ${currentPileTop}). Current ${direction === 'asc' ? 'min' : 'max'} candidate: ${bestElementThisIteration === null ? 'N/A' : bestElementThisIteration} from P${pileIndexOfBestElement === -1 ? 'N/A' : pileIndexOfBestElement}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 14, // smallestTopCardPile = find_pile_with_smallest_top(piles)
        }
      }
    }

    if (bestElementThisIteration !== null && pileIndexOfBestElement !== -1) {
      sortedArray[sortedCount] = bestElementThisIteration
      liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      piles[pileIndexOfBestElement].pop()
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // Pop is an aux op

      yield {
        array: outputArrayForYield(),
        mainArrayLabel: 'Sorted Output (Building)',
        highlightedIndices: [sortedCount],
        auxiliaryStructures: visualizePiles(
          piles,
          `Took ${bestElementThisIteration} from Pile ${pileIndexOfBestElement}`,
          pileIndexOfBestElement
        ),
        message: `Took ${bestElementThisIteration} from pile ${pileIndexOfBestElement}. Added to sorted array at index ${sortedCount}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 16, // add it to sortedArray (after line 15 for remove)
      }
      sortedCount++
    } else {
      if (sortedCount < n) {
        yield {
          array: outputArrayForYield(),
          mainArrayLabel: 'Sorted Output (Building)',
          auxiliaryStructures: visualizePiles(piles, 'Error or Unexpected End'),
          message: `Merge Error: Piles empty but only ${sortedCount}/${n} elements sorted.`,
          currentStats: { ...liveStats },
          // This state is not directly in pseudo, but related to loop condition 13 failing unexpectedly
          currentPseudoCodeLine: 13,
        }
      }
      break
    }
  }
  // Conceptually at line 17, closing brace of while loop for merging
  yield {
    array: outputArrayForYield(),
    mainArrayLabel: 'Sorted Output (Building)',
    auxiliaryStructures: visualizePiles(piles, 'Merge Loop Finished'),
    message: 'Finished merging piles.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 17,
  }

  yield {
    array: [...sortedArray],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()],
    message: 'Patience Sort Complete!',
    auxiliaryStructures: visualizePiles(piles, 'Merge Complete (Piles Should Be Empty)'),
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 18, // return sortedArray
  }

  return { finalArray: sortedArray, stats: liveStats as SortStats } // Corresponds to line 19 (end function)
}
