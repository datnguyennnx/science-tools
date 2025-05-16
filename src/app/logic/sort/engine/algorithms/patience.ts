'use client'

import { SortGenerator, AuxiliaryStructure, SortStats } from '../types'

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

  const pilesAuxId = 'patience-piles'
  const pilesDisplaySlot = 'patience-piles-display'
  //This main aux structure will be mutated and yielded.
  const pilesAuxStructure: AuxiliaryStructure = {
    id: pilesAuxId,
    title: 'Piles (Initial)',
    data: [], // Data will be an array of objects representing piles
    displaySlot: pilesDisplaySlot,
  }

  if (n <= 1) {
    pilesAuxStructure.data = n === 1 ? [{ value: 1, originalIndex: 0, label: 'P0: Top=...' }] : []
    pilesAuxStructure.title = 'Piles (Completed)'
    yield {
      array: [...initialArray],
      sortedIndices: [...Array(n).keys()],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 0, // patienceSort(array)
      auxiliaryStructures: [pilesAuxStructure],
    }
    return {
      finalArray: initialArray,
      stats: liveStats as SortStats,
      finalAuxiliaryStructures: [pilesAuxStructure],
    }
  }

  yield {
    array: [...arr],
    message: `Starting Patience Sort (${direction === 'asc' ? 'Ascending' : 'Descending'}). Phase 1: Dealing elements into piles.`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 0, // patienceSort(array)
    auxiliaryStructures: [pilesAuxStructure],
  }

  const piles: number[][] = []

  const updatePilesAuxStructure = (
    currentPiles: number[][],
    titleSuffix: string,
    highlightedPileIndex?: number
  ) => {
    pilesAuxStructure.data = currentPiles.map((pile, index) => {
      const topCard = pile.length > 0 ? pile[pile.length - 1] : 'Empty'
      const isHighlighted = index === highlightedPileIndex
      return {
        value: pile.length,
        originalIndex: index,
        label: `P${index}: Top=${topCard}, Size=${pile.length}${isHighlighted ? ' (Focus)' : ''}`,
      }
    })
    pilesAuxStructure.title = `Piles (${titleSuffix})`
  }

  updatePilesAuxStructure(piles, 'Initialized')
  yield {
    array: [...arr],
    message: 'Initialized empty piles.',
    auxiliaryStructures: [pilesAuxStructure],
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 1, // piles = []
  }
  yield {
    array: [...arr],
    message: 'Starting Phase 1: Dealing cards into piles.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 2, // // Phase 1: Deal cards into piles
    auxiliaryStructures: [pilesAuxStructure],
  }

  for (let i = 0; i < n; i++) {
    const currentElement = initialArray[i]
    updatePilesAuxStructure(piles, 'Searching for Pile')
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      message: `Dealing element ${currentElement} (from original index ${i}).`,
      auxiliaryStructures: [pilesAuxStructure],
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

      updatePilesAuxStructure(piles, `Comparing with Pile ${j} Top (${pileTop})`, j)
      yield {
        array: [...arr],
        mainArrayLabel: 'Input Array',
        highlightedIndices: [i],
        auxiliaryStructures: [pilesAuxStructure],
        message: `Comparing element ${currentElement} with top of pile ${j} (${pileTop}).`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 4, // pileToPlace = find_pile(...)
      }

      if (canPlaceOnPile) {
        updatePilesAuxStructure(piles, `Found Pile ${j}`, j)
        yield {
          array: [...arr],
          mainArrayLabel: 'Input Array',
          highlightedIndices: [i],
          auxiliaryStructures: [pilesAuxStructure],
          message: `Pile ${j} is suitable.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 5, // if pileToPlace exists
        }
        piles[j].push(currentElement)
        liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1
        placed = true
        targetPileIndex = j
        updatePilesAuxStructure(piles, `Placed on Pile ${j}`, j)
        yield {
          array: [...arr],
          mainArrayLabel: 'Input Array',
          highlightedIndices: [i],
          auxiliaryStructures: [pilesAuxStructure],
          message: `Placed ${currentElement} on pile ${j}.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 6, // place card on pileToPlace
        }
        break
      }
    }

    if (!placed) {
      updatePilesAuxStructure(piles, 'No suitable pile found')
      yield {
        array: [...arr],
        mainArrayLabel: 'Input Array',
        highlightedIndices: [i],
        auxiliaryStructures: [pilesAuxStructure],
        message: 'No suitable pile found for current card.',
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 7, // else (no pileToPlace)
      }
      piles.push([currentElement])
      liveStats.auxiliaryArrayWrites = (liveStats.auxiliaryArrayWrites || 0) + 1 // New pile creation is a form of aux write
      targetPileIndex = piles.length - 1
      updatePilesAuxStructure(piles, `Created New Pile ${targetPileIndex}`, targetPileIndex)
      yield {
        array: [...arr],
        mainArrayLabel: 'Input Array',
        highlightedIndices: [i],
        auxiliaryStructures: [pilesAuxStructure],
        message: `No suitable pile. Created new pile ${targetPileIndex} with ${currentElement}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 8, // create new pile with card
      }
    }
    updatePilesAuxStructure(piles, 'Card Placed', targetPileIndex)
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      auxiliaryStructures: [pilesAuxStructure],
      message: `Finished processing card ${currentElement}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: 9,
    }
  }
  updatePilesAuxStructure(piles, 'Final Piles Before Merge')
  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: 'Phase 1 complete. All elements dealt. Phase 2: Merging piles.',
    auxiliaryStructures: [pilesAuxStructure],
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 11, // // Phase 2: Merge piles...
  }

  const sortedArray = new Array<number>(n)

  const outputArrayForYield = () =>
    [...sortedArray].map(val => (val === undefined || val === null ? NaN : val))

  updatePilesAuxStructure(piles, 'Ready for Merge') // Initial state for merge phase
  yield {
    array: outputArrayForYield(),
    mainArrayLabel: 'Sorted Output (Building)',
    message: 'Initialized empty sortedArray for merging.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 12, // sortedArray = []
    auxiliaryStructures: [pilesAuxStructure],
  }
  let sortedCount = 0

  while (sortedCount < n) {
    updatePilesAuxStructure(piles, 'Checking Piles for Merge')
    yield {
      array: outputArrayForYield(),
      mainArrayLabel: 'Sorted Output (Building)',
      auxiliaryStructures: [pilesAuxStructure],
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
        updatePilesAuxStructure(
          piles,
          `Merging: Checked Pile ${currentPileIdx}, Best is ${bestElementThisIteration === null ? 'N/A' : bestElementThisIteration} from P${pileIndexOfBestElement === -1 ? 'N/A' : pileIndexOfBestElement}`,
          pileIndexOfBestElement
        )
        yield {
          array: outputArrayForYield(),
          mainArrayLabel: 'Sorted Output (Building)',
          auxiliaryStructures: [pilesAuxStructure],
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

      updatePilesAuxStructure(
        piles,
        `Took ${bestElementThisIteration} from Pile ${pileIndexOfBestElement}`,
        pileIndexOfBestElement
      )
      yield {
        array: outputArrayForYield(),
        mainArrayLabel: 'Sorted Output (Building)',
        highlightedIndices: [sortedCount],
        auxiliaryStructures: [pilesAuxStructure],
        message: `Took ${bestElementThisIteration} from pile ${pileIndexOfBestElement}. Added to sorted array at index ${sortedCount}.`,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: 16, // add it to sortedArray (after line 15 for remove)
      }
      sortedCount++
    } else {
      if (sortedCount < n) {
        updatePilesAuxStructure(piles, 'Error or Unexpected End')
        yield {
          array: outputArrayForYield(),
          mainArrayLabel: 'Sorted Output (Building)',
          auxiliaryStructures: [pilesAuxStructure],
          message: `Merge Error: Piles empty but only ${sortedCount}/${n} elements sorted.`,
          currentStats: { ...liveStats },
          currentPseudoCodeLine: 13,
        }
      }
      break
    }
  }
  updatePilesAuxStructure(piles, 'Merge Loop Finished')
  yield {
    array: outputArrayForYield(),
    mainArrayLabel: 'Sorted Output (Building)',
    auxiliaryStructures: [pilesAuxStructure],
    message: 'Finished merging piles.',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 17,
  }

  updatePilesAuxStructure(piles, 'Merge Complete (Piles Should Be Empty)')
  yield {
    array: [...sortedArray],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()],
    message: 'Patience Sort Complete!',
    auxiliaryStructures: [pilesAuxStructure],
    currentStats: { ...liveStats },
    currentPseudoCodeLine: 18, // return sortedArray
  }

  return {
    finalArray: sortedArray,
    stats: liveStats as SortStats,
    finalAuxiliaryStructures: [pilesAuxStructure],
  }
}
