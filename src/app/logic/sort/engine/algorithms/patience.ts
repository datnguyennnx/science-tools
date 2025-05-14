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
    }
    return { finalArray: initialArray, stats: liveStats as SortStats }
  }

  yield {
    array: [...arr],
    message: `Starting Patience Sort (${direction === 'asc' ? 'Ascending' : 'Descending'}). Phase 1: Dealing elements into piles.`,
    currentStats: { ...liveStats },
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

  for (let i = 0; i < n; i++) {
    const currentElement = initialArray[i]
    yield {
      array: [...arr],
      mainArrayLabel: 'Input Array',
      highlightedIndices: [i],
      message: `Dealing element ${currentElement} (from original index ${i}).`,
      auxiliaryStructures: visualizePiles(piles, 'Searching for Pile'),
      currentStats: { ...liveStats },
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
      }

      if (canPlaceOnPile) {
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
        }
        break
      }
    }

    if (!placed) {
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
      }
    }
  }

  yield {
    array: [...arr],
    mainArrayLabel: 'Input Array',
    message: 'Phase 1 complete. All elements dealt. Phase 2: Merging piles.',
    auxiliaryStructures: visualizePiles(piles, 'Final Piles Before Merge'),
    currentStats: { ...liveStats },
  }

  const sortedArray = new Array<number>(n)
  let sortedCount = 0
  const outputArrayForYield = () =>
    [...sortedArray].map(val => (val === undefined || val === null ? NaN : val))

  while (sortedCount < n) {
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
            `Merging: Checked Pile ${currentPileIdx}, Best is ${bestElementThisIteration} from P${pileIndexOfBestElement}`,
            pileIndexOfBestElement
          ),
          message: `Merging: Checked P${currentPileIdx} (top ${currentPileTop}). Current ${direction === 'asc' ? 'min' : 'max'} candidate: ${bestElementThisIteration} from P${pileIndexOfBestElement}.`,
          currentStats: { ...liveStats },
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
        }
      }
      break
    }
  }

  yield {
    array: [...sortedArray],
    mainArrayLabel: 'Sorted Array',
    sortedIndices: [...Array(n).keys()],
    message: 'Patience Sort Complete!',
    auxiliaryStructures: visualizePiles(piles, 'Merge Complete (Piles Should Be Empty)'),
    currentStats: { ...liveStats },
  }

  return { finalArray: sortedArray, stats: liveStats as SortStats }
}
