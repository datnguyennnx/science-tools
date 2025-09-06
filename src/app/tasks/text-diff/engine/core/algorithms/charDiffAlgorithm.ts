import { CharChange, LCSResult } from '../../types'

export function computeCharDiff(oldLine: string, newLine: string): CharChange[] {
  if (oldLine === newLine) {
    return [{ type: 'unchanged', text: oldLine }]
  }

  if (!oldLine) {
    return [{ type: 'added', text: newLine }]
  }

  if (!newLine) {
    return [{ type: 'removed', text: oldLine }]
  }

  const oldChars = oldLine.split('')
  const newChars = newLine.split('')
  const lcs = computeLCS(oldChars, newChars)

  const result: CharChange[] = []
  let oldIndex = 0
  let newIndex = 0

  for (const segment of lcs) {
    if (segment.type === 'unchanged') {
      result.push({ type: 'unchanged', text: segment.text })
      oldIndex += segment.text.length
      newIndex += segment.text.length
    } else if (segment.type === 'removed') {
      result.push({ type: 'removed', text: segment.text })
      oldIndex += segment.text.length
    } else if (segment.type === 'added') {
      result.push({ type: 'added', text: segment.text })
      newIndex += segment.text.length
    }
  }

  // Handle remaining characters
  if (oldIndex < oldChars.length) {
    const remaining = oldChars.slice(oldIndex).join('')
    if (remaining) {
      result.push({ type: 'removed', text: remaining })
    }
  }

  if (newIndex < newChars.length) {
    const remaining = newChars.slice(newIndex).join('')
    if (remaining) {
      result.push({ type: 'added', text: remaining })
    }
  }

  return result
}

function computeLCS(oldChars: string[], newChars: string[]): LCSResult[] {
  const m = oldChars.length
  const n = newChars.length

  const lcs: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldChars[i - 1] === newChars[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1])
      }
    }
  }

  const segments: LCSResult[] = []
  let i = m
  let j = n

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldChars[i - 1] === newChars[j - 1]) {
      let common = ''
      while (i > 0 && j > 0 && oldChars[i - 1] === newChars[j - 1]) {
        common = oldChars[i - 1] + common
        i--
        j--
      }
      segments.unshift({ type: 'unchanged', text: common })
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      segments.unshift({ type: 'added', text: newChars[j - 1] })
      j--
    } else if (i > 0 && (j === 0 || lcs[i][j - 1] < lcs[i - 1][j])) {
      segments.unshift({ type: 'removed', text: oldChars[i - 1] })
      i--
    } else {
      break
    }
  }

  return segments
}
