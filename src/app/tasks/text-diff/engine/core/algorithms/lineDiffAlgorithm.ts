import { DiffResult } from '../../types'
import { computeCharDiff } from './charDiffAlgorithm'
import {
  calculateLineSimilarity,
  performWordLevelDiff,
  SIMILARITY_THRESHOLD,
} from './lineSimilarity'

export function computeLineDiff(oldText: string, newText: string): DiffResult[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')

  const basicDiff = computeMyersDiff(oldLines, newLines)
  return enhanceWithSimilarity(basicDiff)
}

interface DiffOperation {
  type: 'add' | 'remove' | 'keep'
  oldIndex?: number
  newIndex?: number
  line: string
}

function computeMyersDiff(oldLines: string[], newLines: string[]): DiffOperation[] {
  const n = oldLines.length
  const m = newLines.length
  const max = n + m

  const v: { [k: number]: number } = {}
  const trace: { [k: number]: number }[] = []

  v[1] = 0

  for (let d = 0; d <= max; d++) {
    trace[d] = { ...v }

    for (let k = -d; k <= d; k += 2) {
      let x: number

      if (k === -d || (k !== d && v[k - 1] < v[k + 1])) {
        x = v[k + 1]
      } else {
        x = v[k - 1] + 1
      }

      let y = x - k

      while (x < n && y < m && oldLines[x] === newLines[y]) {
        x++
        y++
      }

      v[k] = x

      if (x >= n && y >= m) {
        return backtrack(oldLines, newLines, trace, d)
      }
    }
  }

  return []
}

function backtrack(
  oldLines: string[],
  newLines: string[],
  trace: { [k: number]: number }[],
  d: number
): DiffOperation[] {
  const operations: DiffOperation[] = []
  let x = oldLines.length
  let y = newLines.length

  for (let depth = d; depth >= 0; depth--) {
    const v = trace[depth]
    const k = x - y

    let prevK: number
    if (k === -depth || (k !== depth && v[k - 1] < v[k + 1])) {
      prevK = k + 1
    } else {
      prevK = k - 1
    }

    const prevX = v[prevK]
    const prevY = prevX - prevK

    while (x > prevX && y > prevY) {
      operations.unshift({
        type: 'keep',
        oldIndex: x - 1,
        newIndex: y - 1,
        line: oldLines[x - 1],
      })
      x--
      y--
    }

    if (depth > 0) {
      if (x > prevX) {
        operations.unshift({
          type: 'remove',
          oldIndex: x - 1,
          line: oldLines[x - 1],
        })
        x--
      } else {
        operations.unshift({
          type: 'add',
          newIndex: y - 1,
          line: newLines[y - 1],
        })
        y--
      }
    }
  }

  return operations
}

function enhanceWithSimilarity(operations: DiffOperation[]): DiffResult[] {
  const results: DiffResult[] = []
  let currentLineNumber = 1

  const grouped = groupOperations(operations)

  for (const group of grouped) {
    if (group.type === 'keep' && group.operations) {
      results.push({
        type: 'unchanged',
        value: group.operations[0].line,
        lineNumber: currentLineNumber++,
      })
    } else if (group.type === 'modification' && group.removed && group.added) {
      const pairs = findSimilarPairs(group.removed, group.added)

      for (const pair of pairs.similar) {
        const oldLine = pair.removed.line
        const newLine = pair.added.line
        const charChanges = performWordLevelDiff(oldLine, newLine)

        results.push({
          type: 'modified',
          value: newLine,
          originalValue: oldLine,
          lineNumber: currentLineNumber++,
          charChanges,
        })
      }

      for (const op of pairs.remaining.removed) {
        const charChanges = computeCharDiff(op.line, '')
        results.push({
          type: 'removed',
          value: op.line,
          lineNumber: currentLineNumber++,
          charChanges,
        })
      }

      for (const op of pairs.remaining.added) {
        const charChanges = computeCharDiff('', op.line)
        results.push({
          type: 'added',
          value: op.line,
          lineNumber: currentLineNumber++,
          charChanges,
        })
      }
    }
  }

  return results
}

interface GroupedOperations {
  type: 'keep' | 'modification'
  operations?: DiffOperation[]
  removed?: DiffOperation[]
  added?: DiffOperation[]
}

function groupOperations(operations: DiffOperation[]): GroupedOperations[] {
  const groups: GroupedOperations[] = []
  let currentGroup: GroupedOperations | null = null

  for (const op of operations) {
    if (op.type === 'keep') {
      if (currentGroup) {
        groups.push(currentGroup)
        currentGroup = null
      }
      groups.push({ type: 'keep', operations: [op] })
    } else {
      if (!currentGroup) {
        currentGroup = { type: 'modification', removed: [], added: [] }
      }

      if (op.type === 'remove') {
        currentGroup.removed!.push(op)
      } else {
        currentGroup.added!.push(op)
      }
    }
  }

  if (currentGroup) {
    groups.push(currentGroup)
  }

  return groups
}

function findSimilarPairs(
  removed: DiffOperation[],
  added: DiffOperation[]
): {
  similar: Array<{ removed: DiffOperation; added: DiffOperation }>
  remaining: { removed: DiffOperation[]; added: DiffOperation[] }
} {
  const similar: Array<{ removed: DiffOperation; added: DiffOperation }> = []
  const usedRemoved = new Set<number>()
  const usedAdded = new Set<number>()

  const similarities: Array<{
    removedIdx: number
    addedIdx: number
    similarity: number
  }> = []

  for (let i = 0; i < removed.length; i++) {
    for (let j = 0; j < added.length; j++) {
      const similarity = calculateLineSimilarity(removed[i].line, added[j].line)
      if (similarity >= SIMILARITY_THRESHOLD) {
        similarities.push({ removedIdx: i, addedIdx: j, similarity })
      }
    }
  }

  similarities
    .sort((a, b) => b.similarity - a.similarity)
    .forEach(match => {
      if (!usedRemoved.has(match.removedIdx) && !usedAdded.has(match.addedIdx)) {
        similar.push({
          removed: removed[match.removedIdx],
          added: added[match.addedIdx],
        })
        usedRemoved.add(match.removedIdx)
        usedAdded.add(match.addedIdx)
      }
    })

  const remainingRemoved = removed.filter((_, i) => !usedRemoved.has(i))
  const remainingAdded = added.filter((_, i) => !usedAdded.has(i))

  return {
    similar,
    remaining: { removed: remainingRemoved, added: remainingAdded },
  }
}
