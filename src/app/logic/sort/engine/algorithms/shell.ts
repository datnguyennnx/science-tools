'use client'

import { SortGenerator, SortStats, SortStep, SortResult } from '../types'

// Comparison function: Checks if a should come AFTER b (for insertion logic)
const shellShouldInsertBefore = (a: number, b: number, direction: 'asc' | 'desc'): boolean => {
  return direction === 'asc' ? a < b : a > b
}

export type ShellSortGapSequence = 'shell' | 'knuth' | 'habermann' | 'sedgewick' | 'pratt' | 'ciura'

// Renamed and made internal, accepts the third parameter
function* createShellSortGeneratorInternal(
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc',
  gapSequenceType: ShellSortGapSequence = 'shell'
): Generator<SortStep, SortResult, void> {
  // Note: Return type explicitly defined here
  const arr = [...initialArray]
  const n = arr.length

  const liveStats: Partial<SortStats> = {
    algorithmName: 'Shell Sort',
    numElements: n,
    comparisons: 0,
    mainArrayWrites: 0,
    auxiliaryArrayWrites: 0,
    swaps: 0,
  }

  if (n <= 1) {
    yield {
      array: [...arr],
      sortedIndices: n === 1 ? [0] : [],
      message: 'Array already sorted or empty.',
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [0, 1, 2], // procedure, n=len, if n<=1
    }
    return { finalArray: arr, stats: liveStats as SortStats }
  }

  let gapSequenceName = 'Shell (n/2)'
  switch (gapSequenceType) {
    case 'knuth':
      gapSequenceName = "Knuth's (3h+1)"
      break
    case 'habermann':
      gapSequenceName = "Habermann's (2^k-1)"
      break
    case 'sedgewick':
      gapSequenceName = "Sedgewick's (4^k + 3*2^(k-1)+1)"
      break
    case 'pratt':
      gapSequenceName = "Pratt's (2^i * 3^j)"
      break
    case 'ciura':
      gapSequenceName = "Ciura's (empirical)"
      break
  }

  yield {
    array: [...arr],
    message: `Starting Shell Sort (${gapSequenceName}).`,
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [0], // procedure shellSort
  }

  let gaps: number[]
  switch (gapSequenceType) {
    case 'knuth':
      gaps = []
      let h = 1
      while (h < n / 3) {
        gaps.unshift(h) // Add to beginning to sort from largest to smallest
        h = 3 * h + 1
      }
      if (gaps.length === 0 && n > 0) gaps.push(1) // Ensure at least one gap
      break
    case 'habermann':
      gaps = []
      for (let k = 1, gapVal = Math.pow(2, k) - 1; gapVal < n; k++, gapVal = Math.pow(2, k) - 1) {
        gaps.unshift(gapVal)
      }
      if (gaps.length === 0 && n > 0) gaps.push(1)
      break
    case 'sedgewick': // Sedgewick 1982: 1, 5, 19, 41, 109, ... (4^k + 3*2^(k-1) + 1) and (9*4^k - 9*2^k + 1)
      // Using the simpler 4^k + 3*2^(k-1) + 1 sequence for larger gaps first
      gaps = []
      for (let k = 0; ; k++) {
        const gapVal = Math.pow(4, k) + 3 * Math.pow(2, k - 1) + 1
        if (gapVal >= n / 2 && k > 0) break // Heuristic to prevent too large gaps
        if (gapVal < n) gaps.unshift(Math.floor(gapVal))
        else break
      }
      // Add smaller gaps from a known good sequence if the generated one is sparse or too large
      const sedgewickKnownGaps = [
        1, 5, 19, 41, 109, 209, 505, 929, 2161, 3905, 8929, 16001, 36289, 64769, 146305, 260609,
      ]
      gaps = [...new Set([...gaps, ...sedgewickKnownGaps.filter(g => g < n)])].sort((a, b) => b - a)
      if (gaps.length === 0 && n > 0) gaps.push(1)
      break
    case 'pratt': // 2^i * 3^j sequence
      gaps = [1]
      let p2 = 2
      while (p2 < n) {
        gaps.push(p2)
        let p3 = p2 * 3
        while (p3 < n) {
          gaps.push(p3)
          p3 *= 3
        }
        p2 *= 2
      }
      gaps = [...new Set(gaps)].sort((a, b) => b - a).filter(g => g < n && g > 0)
      if (gaps.indexOf(1) === -1 && n > 0) gaps.push(1) // Ensure 1 is present
      gaps = [...new Set(gaps)].sort((a, b) => b - a) // Re-sort and unique
      break
    case 'ciura':
      gaps = [701, 301, 132, 57, 23, 10, 4, 1].filter(g => g < n)
      if (gaps.length === 0 && n > 0) gaps.push(1) // if n is very small
      break
    default: // Original Shell's sequence: n/2, n/4, ..., 1
      gaps = []
      for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        gaps.push(gap)
      }
      break
  }
  if (gaps.length === 0 && n > 0) gaps.push(1) // Fallback for any sequence not generating gaps for small N

  // Pseudo-code line 3: for gap = ...
  for (const gap of gaps) {
    yield {
      array: [...arr],
      message: `Starting pass with gap = ${gap}.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [3], // for gap = ...
      highlightedIndices: Array.from({ length: n }, (_, k) => k),
    }

    for (let i = gap; i < n; i++) {
      const temp = arr[i]
      let j = i
      const originalPositionOfTemp = i // Renamed for clarity
      let elementsShiftedCount = 0

      let lastComparisonMadeInWhile = false
      // Store the value that temp is compared against in the while loop for the yield message
      let comparedAgainstValue: number | null = null

      while (j >= gap && shellShouldInsertBefore(temp, arr[j - gap], direction)) {
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
        lastComparisonMadeInWhile = true
        comparedAgainstValue = arr[j - gap] // Capture value before it might be overwritten if j-gap is involved in next shift iteration
        arr[j] = arr[j - gap]
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
        elementsShiftedCount++
        j -= gap
        // No yield inside this shifting loop, consolidation happens after all shifts for `temp`
      }

      // Account for the comparison that makes the while loop condition false
      if (!lastComparisonMadeInWhile && j >= gap) {
        liveStats.comparisons = (liveStats.comparisons || 0) + 1
        comparedAgainstValue = arr[j - gap]
      }

      arr[j] = temp
      if (j !== originalPositionOfTemp) {
        // Count write only if temp actually moved
        liveStats.mainArrayWrites = (liveStats.mainArrayWrites || 0) + 1
      }

      let message: string
      const finalPosOfTemp = j

      if (elementsShiftedCount > 0) {
        message = `Gap ${gap}, for element ${temp} (originally at A[${originalPositionOfTemp}]): Shifted ${elementsShiftedCount} element(s). Placed ${temp} at A[${finalPosOfTemp}].`
        if (comparedAgainstValue !== null) message += ` Last compared with ${comparedAgainstValue}.`
      } else {
        if (finalPosOfTemp === originalPositionOfTemp) {
          message = `Gap ${gap}, for element ${temp} (at A[${originalPositionOfTemp}]): Already in its gapped sorted position.`
          if (comparedAgainstValue !== null) message += ` Compared with ${comparedAgainstValue}.`
        } else {
          // This case should ideally not happen if elementsShiftedCount is 0 and positions differ, implies error or specific edge case.
          // However, if j was changed due to initial placement in an empty part of sequence, it might.
          // For Shell sort, j starts at i. If while loop never runs, j remains i.
          // The only way j !== originalPositionOfTemp AND elementsShiftedCount === 0 is if the initial j setup leads to this logic.
          // Given j = i at start, this specific sub-condition implies j!=i and no shifts, which is contradictory here.
          // Let's simplify: if no shifts, it implies it was compared and found its spot or was already in place.
          message = `Gap ${gap}, for element ${temp} (originally at A[${originalPositionOfTemp}]): No elements shifted. Placed ${temp} at A[${finalPosOfTemp}].`
          if (comparedAgainstValue !== null && originalPositionOfTemp >= gap)
            message += ` Compared with ${arr[originalPositionOfTemp - gap]}.`
          else if (originalPositionOfTemp < gap)
            message += ` It was the first in its sub-sequence for this gap.`
        }
      }

      let comparisonIdxPair: number[] | undefined = undefined
      if (j >= gap) {
        // temp is at arr[j], last compared with arr[j-gap]
        comparisonIdxPair = [j, j + gap] // This should be j (where temp is) and j-gap (element compared to)
      } else if (originalPositionOfTemp >= gap) {
        // temp is at start of sub-sequence, was compared with originalPositionOfTemp-gap
        comparisonIdxPair = [j, originalPositionOfTemp - gap]
      }
      // If comparedAgainstValue is not null, we can use its original index. The actual indices for comparison are more nuanced.
      // Let's use originalPositionOfTemp (where temp was) and the element it would have compared to if loop didn't run / last one if it did.
      // For the yield, we highlight where temp is (finalPosOfTemp) and where it came from (originalPositionOfTemp)
      // And the pair that was last effectively compared: temp vs. arr[finalPosOfTemp - gap] if loop ran and placed, or arr[originalPositionOfTemp-gap] if loop didn't run.
      // The value `comparedAgainstValue` is from `arr[j-gap]` (in while) or `arr[j-gap]` (after while).
      // So the indices are `originalPositionOfTemp` (for temp) and `finalPosOfTemp - gap` (if loop ran, now `j-gap`) or `originalPositionOfTemp - gap` (if loop didn't run).
      // This is tricky. Let's simplify: comparison was between `temp` and an element at `k = j_before_last_decrement - gap` or `original_i - gap`.
      // The indices involved in the *last decision point* for temp's position.
      // If loop ran: temp vs arr[j (after loop) - gap]. If loop didn't run: temp vs arr[i-gap].
      // So, `comparisonIndices` should be `[finalPosOfTemp, finalPosOfTemp - gap]` if `finalPosOfTemp >= gap`.
      // Or, more simply, the element `temp` was compared with `comparedAgainstValue`.
      // The indices are originalPositionOfTemp (for temp) and the index of comparedAgainstValue.
      // Index of comparedAgainstValue: if lastComparisonMadeInWhile, it was at (j_before_last_j_decrement - gap). If !lastComparisonMadeInWhile, it was at (originalPositionOfTemp-gap).
      // This detail might be too much. The message states the compared value. Simpler comparisonIndices might be better.
      if (originalPositionOfTemp >= gap) {
        comparisonIdxPair = [originalPositionOfTemp, originalPositionOfTemp - gap]
      }
      // If temp moved, originalPositionOfTemp is where it was, finalPosOfTemp is where it is now.
      // The elements involved in any shift are between these two, along the gap sequence.

      yield {
        array: [...arr],
        highlightedIndices: [finalPosOfTemp, originalPositionOfTemp],
        comparisonIndices: comparisonIdxPair,
        swappingIndices:
          originalPositionOfTemp !== finalPosOfTemp
            ? [originalPositionOfTemp, finalPosOfTemp]
            : null,
        message: message,
        currentStats: { ...liveStats },
        currentPseudoCodeLine: [4, 5, 6, 7, 8, 9, 10, 11], // Covers the gapped insertion sort logic for element A[i]
      }
    }
    yield {
      array: [...arr],
      message: `Pass with gap = ${gap} complete.`,
      currentStats: { ...liveStats },
      currentPseudoCodeLine: [13], // end for (gap)
    }
  }

  yield {
    array: [...arr],
    sortedIndices: [...Array(n).keys()],
    message: 'Shell Sort Complete!',
    currentStats: { ...liveStats },
    currentPseudoCodeLine: [14, 15], // return list, end procedure
  }

  return { finalArray: arr, stats: liveStats as SortStats }
}

// This is the exported generator that matches the SortGenerator type
export const shellSortGenerator: SortGenerator = (
  initialArray: number[],
  direction: 'asc' | 'desc' = 'asc'
) => {
  return createShellSortGeneratorInternal(initialArray, direction, 'shell')
}

// Export the internal generator for use in variations data if needed, or keep it unexported
// For now, let's assume shellSortData.ts will import it directly if it's in the same module.
// If shellSortData needs to import it, then it should be exported.
// Let's export it to be safe, as shellSortData.ts will need it for variations.
export { createShellSortGeneratorInternal }
