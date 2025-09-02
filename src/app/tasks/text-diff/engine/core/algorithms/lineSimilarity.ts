import { CharChange } from '../../types'

export const SIMILARITY_THRESHOLD = 0.8

export function calculateLineSimilarity(line1: string, line2: string): number {
  if (line1 === line2) return 1.0
  if (!line1.trim() && !line2.trim()) return 1.0
  if (!line1.trim() || !line2.trim()) return 0.0

  const normalized1 = line1.trim().replace(/\s+/g, ' ')
  const normalized2 = line2.trim().replace(/\s+/g, ' ')

  return jaroWinklerSimilarity(normalized1, normalized2)
}

function jaroWinklerSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0

  const len1 = s1.length
  const len2 = s2.length

  if (len1 === 0 || len2 === 0) return 0.0

  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1
  const s1Matches = new Array(len1).fill(false)
  const s2Matches = new Array(len2).fill(false)

  let matches = 0
  let transpositions = 0

  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow)
    const end = Math.min(i + matchWindow + 1, len2)

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue
      s1Matches[i] = true
      s2Matches[j] = true
      matches++
      break
    }
  }

  if (matches === 0) return 0.0

  // Count transpositions
  let k = 0
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue
    while (!s2Matches[k]) k++
    if (s1[i] !== s2[k]) transpositions++
    k++
  }

  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3

  // Apply Winkler prefix bonus
  let prefix = 0
  for (let i = 0; i < Math.min(s1.length, s2.length, 4); i++) {
    if (s1[i] === s2[i]) prefix++
    else break
  }

  return jaro + 0.1 * prefix * (1 - jaro)
}

export function areLinesSimilar(line1: string, line2: string): boolean {
  return calculateLineSimilarity(line1, line2) >= SIMILARITY_THRESHOLD
}

export function splitIntoWords(line: string): string[] {
  const parts = line.split(/(\s+)/)
  return parts.filter(part => part.length > 0)
}

export function findCommonWordSequence(
  words1: string[],
  words2: string[]
): Array<{ index1: number; index2: number; word: string }> {
  const common: Array<{ index1: number; index2: number; word: string }> = []

  let i = 0,
    j = 0
  while (i < words1.length && j < words2.length) {
    if (words1[i] === words2[j]) {
      common.push({ index1: i, index2: j, word: words1[i] })
      i++
      j++
    } else {
      let found = false
      for (let k = 1; k <= 3 && !found; k++) {
        if (i + k < words1.length && words1[i + k] === words2[j]) {
          for (let m = 0; m < k; m++) {
            common.push({ index1: i + m, index2: -1, word: words1[i + m] })
          }
          i += k
          found = true
        } else if (j + k < words2.length && words1[i] === words2[j + k]) {
          for (let m = 0; m < k; m++) {
            common.push({ index2: j + m, index1: -1, word: words2[j + m] })
          }
          j += k
          found = true
        }
      }
      if (!found) {
        common.push({ index1: i, index2: -1, word: words1[i] })
        if (j < words2.length) {
          common.push({ index2: j, index1: -1, word: words2[j] })
        }
        i++
        j++
      }
    }
  }

  while (i < words1.length) {
    common.push({ index1: i, index2: -1, word: words1[i] })
    i++
  }
  while (j < words2.length) {
    common.push({ index2: j, index1: -1, word: words2[j] })
    j++
  }

  return common
}

export function performWordLevelDiff(oldLine: string, newLine: string): CharChange[] {
  const words1 = splitIntoWords(oldLine)
  const words2 = splitIntoWords(newLine)

  if (words1.length === 0 && words2.length === 0) {
    return [{ type: 'unchanged', text: '' }]
  }

  const commonWords = findCommonWordSequence(words1, words2)
  const result: CharChange[] = []

  for (const item of commonWords) {
    if (item.index1 !== -1 && item.index2 !== -1) {
      result.push({ type: 'unchanged', text: item.word })
    } else if (item.index1 !== -1) {
      result.push({ type: 'removed', text: item.word })
    } else if (item.index2 !== -1) {
      result.push({ type: 'added', text: item.word })
    }
  }

  return result
}

export function determineChangeType(
  oldLine: string,
  newLine: string
): 'added' | 'removed' | 'modified' | 'unchanged' {
  if (oldLine === newLine) return 'unchanged'
  if (!oldLine) return 'added'
  if (!newLine) return 'removed'

  if (areLinesSimilar(oldLine, newLine)) {
    return 'modified'
  }

  return oldLine ? 'removed' : 'added'
}
