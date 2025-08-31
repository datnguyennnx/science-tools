/**
 * Quine-McCluskey Algorithm for Boolean Expression Minimization
 *
 * This module implements the Quine-McCluskey algorithm for minimizing Boolean
 * expressions with 5 or more variables. It's a tabular method that systematically
 * finds all prime implicants and then selects a minimal set that covers all minterms.
 */

import { BooleanExpression } from '../../ast/types'
import { extractVariables } from '../../core/boolean-utils'

/**
 * Implicant representing a product term in the minimization process
 */
export interface Implicant {
  minterms: number[] // Minterm indices covered by this implicant
  binary: string // Binary representation
  dontCares: boolean[] // Which bits are don't cares
  used: boolean // Whether this implicant has been used in final solution
}

/**
 * Prime implicant chart entry
 */
export interface ChartEntry {
  minterm: number
  implicants: number[] // Indices of implicants that cover this minterm
}

/**
 * Evaluate expression to get minterms where it evaluates to true
 */
const getMinterms = (expr: BooleanExpression, variables: string[]): number[] => {
  const minterms: number[] = []
  const numVars = variables.length

  for (let i = 0; i < 1 << numVars; i++) {
    const assignment: Record<string, boolean> = {}
    for (let j = 0; j < numVars; j++) {
      assignment[variables[j]] = (i & (1 << j)) !== 0
    }

    if (evaluateExpression(expr, assignment)) {
      minterms.push(i)
    }
  }

  return minterms
}

/**
 * Evaluate boolean expression with variable assignments
 */
const evaluateExpression = (
  expr: BooleanExpression,
  assignment: Record<string, boolean>
): boolean => {
  switch (expr.type) {
    case 'CONSTANT':
      return expr.value
    case 'VARIABLE':
      return assignment[expr.value] ?? false
    case 'NOT':
      return expr.left ? !evaluateExpression(expr.left, assignment) : false
    case 'AND':
      return expr.left && expr.right
        ? evaluateExpression(expr.left, assignment) && evaluateExpression(expr.right, assignment)
        : false
    case 'OR':
      return expr.left && expr.right
        ? evaluateExpression(expr.left, assignment) || evaluateExpression(expr.right, assignment)
        : false
    case 'XOR':
      return expr.left && expr.right
        ? evaluateExpression(expr.left, assignment) !== evaluateExpression(expr.right, assignment)
        : false
    case 'XNOR':
      return expr.left && expr.right
        ? evaluateExpression(expr.left, assignment) === evaluateExpression(expr.right, assignment)
        : false
    case 'NAND':
      return expr.left && expr.right
        ? !(evaluateExpression(expr.left, assignment) && evaluateExpression(expr.right, assignment))
        : false
    case 'NOR':
      return expr.left && expr.right
        ? !(evaluateExpression(expr.left, assignment) || evaluateExpression(expr.right, assignment))
        : false
    default:
      return false
  }
}

/**
 * Convert minterm index to binary string
 */
const mintermToBinary = (minterm: number, numVars: number): string => {
  return minterm.toString(2).padStart(numVars, '0')
}

/**
 * Count number of 1s in binary string
 */
const countOnes = (binary: string): number => {
  return binary.split('').filter(bit => bit === '1').length
}

/**
 * Check if two implicants can be combined (differ by exactly one bit)
 */
const canCombine = (imp1: Implicant, imp2: Implicant): boolean => {
  let diffCount = 0

  for (let i = 0; i < imp1.binary.length; i++) {
    if (imp1.binary[i] !== imp2.binary[i]) {
      diffCount++
      if (diffCount > 1) return false
    }
  }

  return diffCount === 1
}

/**
 * Combine two implicants
 */
const combineImplicants = (imp1: Implicant, imp2: Implicant, diffPos: number): Implicant => {
  const newBinary = imp1.binary.split('')
  newBinary[diffPos] = '-'
  const newDontCares = [...imp1.dontCares]
  newDontCares[diffPos] = true

  return {
    minterms: [...new Set([...imp1.minterms, ...imp2.minterms])],
    binary: newBinary.join(''),
    dontCares: newDontCares,
    used: false,
  }
}

/**
 * Generate prime implicants using Quine-McCluskey algorithm
 */
const findPrimeImplicants = (minterms: number[], numVars: number): Implicant[] => {
  // Initialize first group
  let groups: Implicant[][] = Array.from({ length: numVars + 1 }, () => [])

  // Create initial implicants
  for (const minterm of minterms) {
    const binary = mintermToBinary(minterm, numVars)
    const implicant: Implicant = {
      minterms: [minterm],
      binary,
      dontCares: new Array(numVars).fill(false),
      used: false,
    }
    groups[countOnes(binary)].push(implicant)
  }

  const primeImplicants: Implicant[] = []
  const used = new Set<string>()

  while (true) {
    const newGroups: Implicant[][] = Array.from({ length: numVars + 1 }, () => [])
    const combined = new Set<string>()

    // Try to combine implicants from adjacent groups
    for (let i = 0; i < groups.length - 1; i++) {
      for (const imp1 of groups[i]) {
        for (const imp2 of groups[i + 1]) {
          if (canCombine(imp1, imp2)) {
            // Find the differing position
            let diffPos = -1
            for (let j = 0; j < imp1.binary.length; j++) {
              if (imp1.binary[j] !== imp2.binary[j]) {
                diffPos = j
                break
              }
            }

            const combinedImp = combineImplicants(imp1, imp2, diffPos)
            const key = combinedImp.binary

            if (!combined.has(key)) {
              combined.add(key)
              newGroups[countOnes(combinedImp.binary.replace(/-/g, '0'))].push(combinedImp)
            }

            // Mark original implicants as used
            used.add(imp1.binary)
            used.add(imp2.binary)
          }
        }
      }
    }

    // Add unused implicants to prime implicants
    for (const group of groups) {
      for (const imp of group) {
        if (!used.has(imp.binary)) {
          primeImplicants.push(imp)
        }
      }
    }

    // If no new combinations were made, we're done
    if (combined.size === 0) break

    groups = newGroups
  }

  // Add remaining implicants from final groups
  for (const group of groups) {
    for (const imp of group) {
      if (!used.has(imp.binary)) {
        primeImplicants.push(imp)
      }
    }
  }

  return primeImplicants
}

/**
 * Create prime implicant chart
 */
const createChart = (minterms: number[], primeImplicants: Implicant[]): ChartEntry[] => {
  const chart: ChartEntry[] = minterms.map(minterm => ({
    minterm,
    implicants: [],
  }))

  for (let i = 0; i < primeImplicants.length; i++) {
    const implicant = primeImplicants[i]
    for (const minterm of implicant.minterms) {
      const entry = chart.find(e => e.minterm === minterm)
      if (entry) {
        entry.implicants.push(i)
      }
    }
  }

  return chart
}

/**
 * Find essential prime implicants
 */
const findEssentialImplicants = (chart: ChartEntry[]): number[] => {
  const essential: number[] = []

  for (const entry of chart) {
    if (entry.implicants.length === 1) {
      const implicantIdx = entry.implicants[0]
      if (!essential.includes(implicantIdx)) {
        essential.push(implicantIdx)
      }
    }
  }

  return essential
}

/**
 * Select minimal set of prime implicants to cover all minterms
 */
const selectMinimalCover = (chart: ChartEntry[], primeImplicants: Implicant[]): number[] => {
  const essential = findEssentialImplicants(chart)
  const remainingMinterms = chart.filter(
    entry => !essential.some(impIdx => primeImplicants[impIdx].minterms.includes(entry.minterm))
  )

  // For now, use a simple greedy approach
  // A full implementation would use more sophisticated methods
  const selected = [...essential]

  for (const entry of remainingMinterms) {
    if (entry.implicants.length > 0) {
      // Pick the first available implicant
      const implicantIdx = entry.implicants[0]
      if (!selected.includes(implicantIdx)) {
        selected.push(implicantIdx)
      }
    }
  }

  return selected
}

/**
 * Convert implicant to Boolean expression term
 */
const implicantToTerm = (implicant: Implicant, variables: string[]): BooleanExpression | null => {
  const factors: BooleanExpression[] = []

  for (let i = 0; i < implicant.binary.length; i++) {
    if (implicant.dontCares[i]) continue // Skip don't care positions

    const varName = variables[i]
    const isTrue = implicant.binary[i] === '1'

    factors.push(
      isTrue
        ? { type: 'VARIABLE', value: varName }
        : { type: 'NOT', left: { type: 'VARIABLE', value: varName } }
    )
  }

  if (factors.length === 0) return { type: 'CONSTANT', value: true }
  if (factors.length === 1) return factors[0]

  return factors.reduce((acc, factor) => ({ type: 'AND', left: acc, right: factor }))
}

/**
 * Convert selected implicants to minimized Boolean expression
 */
const implicantsToExpression = (
  selectedIndices: number[],
  primeImplicants: Implicant[],
  variables: string[]
): BooleanExpression => {
  const terms: BooleanExpression[] = []

  for (const idx of selectedIndices) {
    const term = implicantToTerm(primeImplicants[idx], variables)
    if (term) terms.push(term)
  }

  if (terms.length === 0) return { type: 'CONSTANT', value: false }
  if (terms.length === 1) return terms[0]

  return terms.reduce((acc, term) => ({ type: 'OR', left: acc, right: term }))
}

/**
 * Main Quine-McCluskey minimization function
 */
export const minimizeWithQuineMcCluskey = (expr: BooleanExpression): BooleanExpression => {
  const variables = Array.from(extractVariables(expr)).sort()

  // Only apply to expressions with 5 or more variables
  if (variables.length < 5) {
    return expr
  }

  const minterms = getMinterms(expr, variables)
  if (minterms.length === 0) return { type: 'CONSTANT', value: false }

  const primeImplicants = findPrimeImplicants(minterms, variables.length)
  const chart = createChart(minterms, primeImplicants)
  const selectedIndices = selectMinimalCover(chart, primeImplicants)

  return implicantsToExpression(selectedIndices, primeImplicants, variables)
}
