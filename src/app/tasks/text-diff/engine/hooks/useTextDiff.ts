import { DiffResult, DiffStats, UseTextDiffReturn } from '../types'
import { computeLineDiff } from '../core/algorithms/lineDiffAlgorithm'
import { calculateDiffStats, hasDifferences } from '../core/diffStats'

export function useTextDiff(): UseTextDiffReturn {
  function compareTexts(oldText: string, newText: string): DiffResult[] {
    if (!oldText && !newText) {
      return []
    }

    if (!oldText) {
      return newText.split('\n').map((line, index) => ({
        type: 'added' as const,
        value: line,
        lineNumber: index + 1,
      }))
    }

    if (!newText) {
      return oldText.split('\n').map((line, index) => ({
        type: 'removed' as const,
        value: line,
        lineNumber: index + 1,
      }))
    }

    return computeLineDiff(oldText, newText)
  }

  function getDiffStats(results: DiffResult[]): DiffStats {
    return calculateDiffStats(results)
  }

  return {
    compareTexts,
    getDiffStats,
    hasDifferences,
  }
}
