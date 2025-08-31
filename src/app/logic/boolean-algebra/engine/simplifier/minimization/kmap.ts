/**
 * Karnaugh Map Minimization for Boolean Expressions
 *
 * This module implements Karnaugh map minimization for expressions with 3-4 variables.
 * K-maps provide a visual method to minimize Boolean expressions by grouping adjacent
 * minterms that can be combined.
 */

import { BooleanExpression } from '../../ast/types'
import { extractVariables } from '../../core/boolean-utils'

/**
 * Truth table entry representing a minterm
 */
export interface Minterm {
  index: number
  variables: string[]
  value: boolean
}

/**
 * K-map cell with position and grouping information
 */
export interface KMapCell {
  row: number
  col: number
  mintermIndex: number | null
  value: boolean
  grouped: boolean
}

/**
 * K-map group representing a simplified term
 */
export interface KMapGroup {
  cells: Array<{ row: number; col: number }>
  variables: Record<string, boolean | null> // null means "don't care"
  size: number
}

/**
 * K-map configuration for different numbers of variables
 */
interface KMapConfig {
  variables: string[]
  rows: number
  cols: number
  grayCodeRows: number[]
  grayCodeCols: number[]
}

/**
 * Generate Gray code sequence for K-map ordering
 */
const generateGrayCode = (n: number): number[] => {
  if (n === 0) return [0]
  const prev = generateGrayCode(n - 1)
  const reflected = [...prev].reverse().map(x => x + (1 << (n - 1)))
  return [...prev, ...reflected]
}

/**
 * Create K-map configuration for given variables
 */
const createKMapConfig = (variables: string[]): KMapConfig | null => {
  const numVars = variables.length

  if (numVars < 3 || numVars > 4) return null

  const rows = numVars <= 3 ? 2 : 4
  const cols = numVars <= 3 ? 4 : 4

  // Generate Gray code for row and column ordering
  const grayRows = generateGrayCode(numVars <= 3 ? 1 : 2)
  const grayCols = generateGrayCode(numVars <= 3 ? 2 : 2)

  return {
    variables,
    rows,
    cols,
    grayCodeRows: grayRows,
    grayCodeCols: grayCols,
  }
}

/**
 * Convert minterm index to K-map position
 */
const mintermToPosition = (
  index: number,
  config: KMapConfig
): { row: number; col: number } | null => {
  const numVars = config.variables.length

  if (numVars === 3) {
    // 3 variables: rows = A, cols = BC (Gray code)
    const a = (index & 4) >> 2
    const b = (index & 2) >> 1
    const c = index & 1

    const row = a
    const col = (b << 1) | c
    return { row, col }
  } else if (numVars === 4) {
    // 4 variables: rows = AB, cols = CD (Gray code)
    const a = (index & 8) >> 3
    const b = (index & 4) >> 2
    const c = (index & 2) >> 1
    const d = index & 1

    const row = (a << 1) | b
    const col = (c << 1) | d
    return { row, col }
  }

  return null
}

/**
 * Create K-map from truth table (minterms where expression is true)
 */
export const createKMap = (expr: BooleanExpression): KMapCell[][] | null => {
  const variables = Array.from(extractVariables(expr)).sort()
  const config = createKMapConfig(variables)

  if (!config) return null

  // Evaluate expression for all possible assignments to get minterms
  const minterms: number[] = []

  for (let i = 0; i < 1 << variables.length; i++) {
    const assignment: Record<string, boolean> = {}
    for (let j = 0; j < variables.length; j++) {
      assignment[variables[j]] = (i & (1 << j)) !== 0
    }

    if (evaluateExpression(expr, assignment)) {
      minterms.push(i)
    }
  }

  // Create K-map grid
  const grid: KMapCell[][] = []
  for (let row = 0; row < config.rows; row++) {
    grid[row] = []
    for (let col = 0; col < config.cols; col++) {
      const mintermIndex = findMintermAtPosition(row, col, config, minterms)
      grid[row][col] = {
        row,
        col,
        mintermIndex,
        value: mintermIndex !== null,
        grouped: false,
      }
    }
  }

  return grid
}

/**
 * Find which minterm corresponds to a K-map position
 */
const findMintermAtPosition = (
  row: number,
  col: number,
  config: KMapConfig,
  minterms: number[]
): number | null => {
  for (const minterm of minterms) {
    const pos = mintermToPosition(minterm, config)
    if (pos && pos.row === row && pos.col === col) {
      return minterm
    }
  }
  return null
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
 * Find all possible groups in K-map (powers of 2: 1, 2, 4, 8, 16)
 */
export const findKMapGroups = (grid: KMapCell[][]): KMapGroup[] => {
  const groups: KMapGroup[] = []
  const rows = grid.length
  const cols = grid[0]?.length || 0

  // Mark all cells as not grouped initially
  for (const row of grid) {
    for (const cell of row) {
      cell.grouped = false
    }
  }

  // Try different group sizes in descending order
  const groupSizes = [16, 8, 4, 2, 1]

  for (const size of groupSizes) {
    const possibleGroups = findGroupsOfSize(grid, size, rows, cols)

    for (const group of possibleGroups) {
      // Check if all cells in group are true and not already grouped
      if (isValidGroup(group, grid)) {
        groups.push(group)
        // Mark cells as grouped
        for (const cell of group.cells) {
          grid[cell.row][cell.col].grouped = true
        }
      }
    }
  }

  return groups
}

/**
 * Find all possible groups of a given size
 */
const findGroupsOfSize = (
  grid: KMapCell[][],
  size: number,
  rows: number,
  cols: number
): KMapGroup[] => {
  const groups: KMapGroup[] = []

  // Calculate dimensions for the group
  const dimensions = getGroupDimensions(size, rows, cols)
  if (!dimensions) return groups

  const { height, width } = dimensions

  // Try all possible positions
  for (let startRow = 0; startRow < rows; startRow++) {
    for (let startCol = 0; startCol < cols; startCol++) {
      const cells: Array<{ row: number; col: number }> = []

      // Collect cells for this group (with wrap-around)
      for (let dr = 0; dr < height; dr++) {
        for (let dc = 0; dc < width; dc++) {
          const row = (startRow + dr) % rows
          const col = (startCol + dc) % cols
          cells.push({ row, col })
        }
      }

      if (cells.length === size) {
        groups.push({
          cells,
          variables: {},
          size,
        })
      }
    }
  }

  return groups
}

/**
 * Get dimensions for a group of given size
 */
const getGroupDimensions = (
  size: number,
  rows: number,
  cols: number
): { height: number; width: number } | null => {
  if (size === 1) return { height: 1, width: 1 }
  if (size === 2) return { height: 1, width: 2 }
  if (size === 4) {
    if (rows === 2) return { height: 2, width: 2 }
    if (cols === 4) return { height: 1, width: 4 }
  }
  if (size === 8) return { height: 2, width: 4 }
  if (size === 16) return { height: 4, width: 4 }

  return null
}

/**
 * Check if a group is valid (all cells are true and not already grouped)
 */
const isValidGroup = (group: KMapGroup, grid: KMapCell[][]): boolean => {
  return group.cells.every(cell => {
    const gridCell = grid[cell.row]?.[cell.col]
    return gridCell && gridCell.value && !gridCell.grouped
  })
}

/**
 * Convert K-map groups to simplified Boolean expression
 */
export const groupsToExpression = (
  groups: KMapGroup[],
  variables: string[]
): BooleanExpression | null => {
  if (groups.length === 0) return { type: 'CONSTANT', value: false }

  const terms: BooleanExpression[] = []

  for (const group of groups) {
    const term = groupToTerm(group, variables)
    if (term) terms.push(term)
  }

  if (terms.length === 0) return { type: 'CONSTANT', value: false }
  if (terms.length === 1) return terms[0]

  return terms.reduce((acc, term) => ({ type: 'OR', left: acc, right: term }))
}

/**
 * Convert a single K-map group to a Boolean term
 */
const groupToTerm = (group: KMapGroup, variables: string[]): BooleanExpression | null => {
  // For now, implement a basic version
  // In a full implementation, this would analyze which variables stay constant in the group
  if (group.cells.length === 0) return null

  // Get the first cell's minterm index to determine variable values
  const firstCell = group.cells[0]
  const mintermIndex = firstCell.row * 4 + firstCell.col // Simplified mapping

  const factors: BooleanExpression[] = []

  for (let i = 0; i < variables.length; i++) {
    const varName = variables[i]
    const bitValue = (mintermIndex & (1 << i)) !== 0

    factors.push(
      bitValue
        ? { type: 'VARIABLE', value: varName }
        : { type: 'NOT', left: { type: 'VARIABLE', value: varName } }
    )
  }

  if (factors.length === 1) return factors[0]

  return factors.reduce((acc, factor) => ({ type: 'AND', left: acc, right: factor }))
}

/**
 * Main K-map minimization function
 */
export const minimizeWithKMap = (expr: BooleanExpression): BooleanExpression => {
  const variables = Array.from(extractVariables(expr)).sort()

  // Only apply to 3-4 variable expressions
  if (variables.length < 3 || variables.length > 4) {
    return expr
  }

  const kmap = createKMap(expr)
  if (!kmap) return expr

  const groups = findKMapGroups(kmap)
  const minimized = groupsToExpression(groups, variables)

  return minimized || expr
}
