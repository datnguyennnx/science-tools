import { DiffResult } from '../../types'

export function computeLineDiff(oldText: string, newText: string): DiffResult[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')

  const operations = computeMyersDiff(oldLines, newLines)
  return convertToDiffResults(operations)
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

function convertToDiffResults(operations: DiffOperation[]): DiffResult[] {
  const results: DiffResult[] = []
  let currentLineNumber = 1

  for (const op of operations) {
    if (op.type === 'keep') {
      results.push({
        type: 'unchanged',
        value: op.line,
        lineNumber: currentLineNumber++,
      })
    } else if (op.type === 'remove') {
      results.push({
        type: 'removed',
        value: op.line,
        lineNumber: currentLineNumber++,
      })
    } else if (op.type === 'add') {
      results.push({
        type: 'added',
        value: op.line,
        lineNumber: currentLineNumber++,
      })
    }
  }

  return results
}
