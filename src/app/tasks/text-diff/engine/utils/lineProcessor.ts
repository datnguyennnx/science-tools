import { DiffResult } from '../types'

export interface LineMap {
  [displayLineNumber: number]: {
    original?: DiffResult
    modified?: DiffResult
  }
}

export interface LineStats {
  originalLines: number
  modifiedLines: number
}

export interface UnifiedViewResult {
  results: DiffResult[]
  lineNumberMapping: {
    [lineNumber: number]: { type: 'original' | 'modified'; actualLineNumber: number }
  }
}

export interface SplitViewResult {
  lineMap: LineMap
  lineNumbers: number[]
  lineStats: LineStats
}

export function processForSplitView(results: DiffResult[]): SplitViewResult {
  const lineMap: LineMap = {}
  let originalLineNumber = 1
  let modifiedLineNumber = 1
  let displayLineNumber = 1

  results.forEach(result => {
    if (!lineMap[displayLineNumber]) {
      lineMap[displayLineNumber] = {}
    }

    if (result.type === 'added') {
      lineMap[displayLineNumber].modified = {
        ...result,
        lineNumber: modifiedLineNumber,
      }
      modifiedLineNumber++
    } else if (result.type === 'removed') {
      lineMap[displayLineNumber].original = {
        ...result,
        lineNumber: originalLineNumber,
      }
      originalLineNumber++
    } else {
      lineMap[displayLineNumber].original = {
        ...result,
        value: result.originalValue || result.value,
        lineNumber: originalLineNumber,
        type: 'unchanged',
      }
      lineMap[displayLineNumber].modified = {
        ...result,
        lineNumber: modifiedLineNumber,
      }

      originalLineNumber++
      modifiedLineNumber++
    }

    displayLineNumber++
  })

  const lineNumbers = Object.keys(lineMap)
    .map(Number)
    .sort((a, b) => a - b)

  return {
    lineMap,
    lineNumbers,
    lineStats: {
      originalLines: originalLineNumber - 1,
      modifiedLines: modifiedLineNumber - 1,
    },
  }
}

export function processForUnifiedView(results: DiffResult[]): UnifiedViewResult {
  // GitHub-style unified view with context lines
  const processedResults: DiffResult[] = []
  const lineNumberMapping: {
    [lineNumber: number]: { type: 'original' | 'modified'; actualLineNumber: number }
  } = {}

  const CONTEXT_LINES = 3 // Number of context lines to show before/after changes

  // Find groups of consecutive changes
  const changeGroups: Array<{ start: number; end: number }> = []
  let currentGroup: { start: number; end: number } | null = null

  results.forEach((result, index) => {
    if (result.type !== 'unchanged') {
      if (!currentGroup) {
        currentGroup = { start: index, end: index }
      } else {
        currentGroup.end = index
      }
    } else {
      if (currentGroup) {
        changeGroups.push(currentGroup)
        currentGroup = null
      }
    }
  })

  if (currentGroup) {
    changeGroups.push(currentGroup)
  }

  let displayLineNumber = 1
  let lastProcessedIndex = -1

  changeGroups.forEach((group, groupIndex) => {
    // Add separator between groups (except for the first group)
    if (groupIndex > 0) {
      processedResults.push({
        type: 'unchanged',
        value: '---',
        lineNumber: displayLineNumber,
      })
      lineNumberMapping[displayLineNumber] = {
        type: 'original',
        actualLineNumber: displayLineNumber,
      }
      displayLineNumber++
    }

    // Add context lines before the change group (avoid overlap with previous group)
    const contextStart = Math.max(lastProcessedIndex + 1, group.start - CONTEXT_LINES)
    for (let i = contextStart; i < group.start; i++) {
      const originalResult = results[i]
      if (originalResult.type === 'unchanged') {
        processedResults.push({
          ...originalResult,
          lineNumber: displayLineNumber,
        })
        lineNumberMapping[displayLineNumber] = {
          type: 'original',
          actualLineNumber: originalResult.lineNumber || displayLineNumber,
        }
        displayLineNumber++
        lastProcessedIndex = i
      }
    }

    // Add the change lines
    for (let i = group.start; i <= group.end; i++) {
      const originalResult = results[i]
      processedResults.push({
        ...originalResult,
        lineNumber: displayLineNumber,
      })
      lineNumberMapping[displayLineNumber] = {
        type: originalResult.type === 'added' ? 'modified' : 'original',
        actualLineNumber: originalResult.lineNumber || displayLineNumber,
      }
      displayLineNumber++
      lastProcessedIndex = i
    }

    // Add context lines after the change group
    const contextEnd = Math.min(results.length, group.end + 1 + CONTEXT_LINES)
    for (let i = group.end + 1; i < contextEnd; i++) {
      const originalResult = results[i]
      if (originalResult.type === 'unchanged') {
        processedResults.push({
          ...originalResult,
          lineNumber: displayLineNumber,
        })
        lineNumberMapping[displayLineNumber] = {
          type: 'original',
          actualLineNumber: originalResult.lineNumber || displayLineNumber,
        }
        displayLineNumber++
        lastProcessedIndex = i
      }
    }
  })

  return {
    results: processedResults,
    lineNumberMapping,
  }
}

export function filterDiffResults(results: DiffResult[], showOnlyChanges: boolean): DiffResult[] {
  return showOnlyChanges ? results.filter(result => result.type !== 'unchanged') : results
}

export function getDiffStats(results: DiffResult[]): { totalLines: number; changes: number } {
  const totalLines = results.length
  const changes = results.filter(result => result.type !== 'unchanged').length
  return { totalLines, changes }
}
