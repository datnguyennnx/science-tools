import { DiffResult, DiffStats } from '../types'

export function calculateDiffStats(results: DiffResult[]): DiffStats {
  const stats = {
    additions: 0,
    deletions: 0,
    unchanged: 0,
    totalLines: results.length,
    charAdditions: 0,
    charDeletions: 0,
  }

  results.forEach(result => {
    switch (result.type) {
      case 'added':
        stats.additions++
        if (result.charChanges) {
          result.charChanges.forEach(change => {
            if (change.type === 'added') {
              stats.charAdditions += change.text.length
            }
          })
        }
        break
      case 'removed':
        stats.deletions++
        if (result.charChanges) {
          result.charChanges.forEach(change => {
            if (change.type === 'removed') {
              stats.charDeletions += change.text.length
            }
          })
        }
        break
      case 'modified':
        stats.additions++
        stats.deletions++
        if (result.charChanges) {
          result.charChanges.forEach(change => {
            if (change.type === 'added') {
              stats.charAdditions += change.text.length
            } else if (change.type === 'removed') {
              stats.charDeletions += change.text.length
            }
          })
        }
        break
      case 'unchanged':
        stats.unchanged++
        break
    }
  })

  return stats
}

export function hasDifferences(oldText: string, newText: string): boolean {
  if (!oldText && !newText) return false
  if (!oldText || !newText) return true
  return oldText !== newText
}
