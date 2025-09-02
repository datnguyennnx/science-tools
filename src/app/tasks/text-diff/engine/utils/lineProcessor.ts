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
  const processedResults: DiffResult[] = []
  const lineNumberMapping: {
    [lineNumber: number]: { type: 'original' | 'modified'; actualLineNumber: number }
  } = {}

  let originalLineNumber = 1
  let modifiedLineNumber = 1
  let displayLineNumber = 1

  results.forEach(result => {
    let processedResult: DiffResult
    let mappingType: 'original' | 'modified'
    let actualLineNumber: number

    if (result.type === 'added') {
      processedResult = {
        ...result,
        lineNumber: modifiedLineNumber,
      }
      mappingType = 'modified'
      actualLineNumber = modifiedLineNumber
      modifiedLineNumber++
    } else if (result.type === 'removed') {
      processedResult = {
        ...result,
        lineNumber: originalLineNumber,
      }
      mappingType = 'original'
      actualLineNumber = originalLineNumber
      originalLineNumber++
    } else {
      processedResult = {
        ...result,
        lineNumber: originalLineNumber,
      }
      mappingType = 'original'
      actualLineNumber = originalLineNumber
      originalLineNumber++
      modifiedLineNumber++
    }

    processedResults.push(processedResult)
    lineNumberMapping[displayLineNumber] = { type: mappingType, actualLineNumber }
    displayLineNumber++
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
