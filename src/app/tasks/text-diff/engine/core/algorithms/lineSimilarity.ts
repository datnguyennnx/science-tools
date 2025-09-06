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

// Simplified similarity functions - keeping only essential ones

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
