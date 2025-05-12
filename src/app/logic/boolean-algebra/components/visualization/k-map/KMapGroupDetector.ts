import { CellPosition, CellStyle, KMapGroup } from './types'
import {
  KMAP_GROUP_COLORS,
  KMAP_CELL_BG_OPACITY,
  KMAP_GROUP_BORDER_STYLE,
  KMAP_GROUP_BORDER_WIDTH,
} from '../utils/colors'

/**
 * Detects groups in a Karnaugh Map with improved performance for large k-maps
 */
export function detectGroups(
  mintermSet: Set<number>,
  kMapOrder: CellPosition[][],
  numVars: number
): KMapGroup[] {
  if (mintermSet.size === 0 || !kMapOrder.length) return []

  const result: KMapGroup[] = []
  const rows = kMapOrder.length
  const cols = kMapOrder[0].length

  // Helper function to check if cell contains a minterm
  const isCellMinterm = (cell: CellPosition) => mintermSet.has(cell.minterm)

  // Helper function to check if a group is valid
  const isValidGroup = (cells: CellPosition[]) => cells.every(isCellMinterm)

  // Track which cells have been assigned to groups
  const assignedCells = new Set<number>()

  // Maximum sizes of groups based on number of variables
  const maxGroups = [
    { size: 8 }, // Octet (8 cells)
    { size: 4 }, // Quad (4 cells)
    { size: 2 }, // Pair (2 cells)
    { size: 1 }, // Single (1 cell)
  ]

  // First, create a map of minterm indices to their positions for faster lookup
  const mintermPositions = new Map<number, CellPosition>()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = kMapOrder[r][c]
      if (mintermSet.has(cell.minterm)) {
        mintermPositions.set(cell.minterm, cell)
      }
    }
  }

  // Find groups of different sizes
  for (const { size } of maxGroups) {
    if (size === 8 && numVars !== 4) continue // Only 4-var K-Maps can have octets

    // Handle size 8 groups (octets) - only for 4-variable K-Maps
    if (size === 8 && numVars === 4) {
      // Try to find octets quickly using pre-defined octet patterns
      const octetPatterns = generateOctetPatterns(rows, cols)

      for (const octetCells of octetPatterns) {
        // Convert pattern cells to actual CellPosition objects
        const octet = octetCells.map(([r, c]) => kMapOrder[r][c])

        // Check if this octet is valid (all cells have minterms) and not already assigned
        if (isValidGroup(octet) && octet.some(cell => !assignedCells.has(cell.minterm))) {
          result.push({ cells: octet, color: KMAP_GROUP_COLORS[8], size })
          octet.forEach(cell => assignedCells.add(cell.minterm))
        }
      }
    }

    // For size 4 groups (quads)
    if (size === 4) {
      // Pre-generate all possible quad patterns
      const quadPatterns = generateQuadPatterns(rows, cols)

      for (const quadCells of quadPatterns) {
        // Convert pattern cells to actual CellPosition objects
        const quad = quadCells.map(([r, c]) => kMapOrder[r][c])

        // Check if this quad is valid and not already assigned
        if (isValidGroup(quad) && quad.some(cell => !assignedCells.has(cell.minterm))) {
          result.push({ cells: quad, color: KMAP_GROUP_COLORS[4], size })
          quad.forEach(cell => assignedCells.add(cell.minterm))
        }
      }
    }

    // For pairs (2 cells), check all adjacent cells including wrapping
    if (size === 2) {
      // Pre-generate all possible pair patterns
      const pairPatterns = generatePairPatterns(rows, cols)

      for (const pairCells of pairPatterns) {
        // Convert pattern cells to actual CellPosition objects
        const pair = pairCells.map(([r, c]) => kMapOrder[r][c])

        // Check if this pair is valid and not already assigned
        if (isValidGroup(pair) && pair.every(cell => !assignedCells.has(cell.minterm))) {
          result.push({ cells: pair, color: KMAP_GROUP_COLORS[2], size })
          pair.forEach(cell => assignedCells.add(cell.minterm))
        }
      }
    }
  }

  // Add remaining single cells that aren't in any group
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = kMapOrder[r][c]
      if (isCellMinterm(cell) && !assignedCells.has(cell.minterm)) {
        result.push({
          cells: [cell],
          color: KMAP_GROUP_COLORS[1],
          size: 1,
        })
        assignedCells.add(cell.minterm)
      }
    }
  }

  return result
}

/**
 * Generate all possible octet (size 8) patterns for a K-map of given dimensions
 * This pre-computes patterns for better performance
 */
function generateOctetPatterns(rows: number, cols: number): Array<Array<[number, number]>> {
  const patterns: Array<Array<[number, number]>> = []

  // Only valid for 4x4 K-maps (4 variables)
  if (rows !== 4 || cols !== 4) return patterns

  // Horizontal strips (2 rows x 4 cols)
  for (let r = 0; r < rows; r += 2) {
    const strip: Array<[number, number]> = []
    for (let c = 0; c < cols; c++) {
      strip.push([r, c], [(r + 1) % rows, c])
    }
    patterns.push(strip)
  }

  // Vertical strips (4 rows x 2 cols)
  for (let c = 0; c < cols; c += 2) {
    const strip: Array<[number, number]> = []
    for (let r = 0; r < rows; r++) {
      strip.push([r, c], [r, (c + 1) % cols])
    }
    patterns.push(strip)
  }

  // 2x4 blocks (wrapping around)
  for (let r = 0; r < rows; r += 2) {
    for (let c = 0; c < cols; c += 2) {
      const block: Array<[number, number]> = []
      for (let dr = 0; dr < 2; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          block.push([(r + dr) % rows, c + dc], [(r + dr) % rows, (c + dc + 2) % cols])
        }
      }
      patterns.push(block)
    }
  }

  // 4x2 blocks (wrapping around)
  for (let r = 0; r < rows; r += 2) {
    for (let c = 0; c < cols; c += 2) {
      const block: Array<[number, number]> = []
      for (let dr = 0; dr < 2; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          block.push([(r + dr) % rows, c + dc], [(r + dr + 2) % rows, c + dc])
        }
      }
      patterns.push(block)
    }
  }

  return patterns
}

/**
 * Generate all possible quad (size 4) patterns for a K-map of given dimensions
 * This pre-computes patterns for better performance
 */
function generateQuadPatterns(rows: number, cols: number): Array<Array<[number, number]>> {
  const patterns: Array<Array<[number, number]>> = []

  // 2x2 quads
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      patterns.push([
        [r, c],
        [r, (c + 1) % cols],
        [(r + 1) % rows, c],
        [(r + 1) % rows, (c + 1) % cols],
      ])
    }
  }

  // Horizontal 1x4 strips (handling wrap-around)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c += 4) {
      const remainingCols = Math.min(4, cols - c)
      if (remainingCols === 4) {
        patterns.push([
          [r, c],
          [r, c + 1],
          [r, c + 2],
          [r, c + 3],
        ])
      } else if (cols === 4) {
        // Special handling for 4-column maps where strips wrap around
        patterns.push([
          [r, 0],
          [r, 1],
          [r, 2],
          [r, 3],
        ])
      }
    }
  }

  // Vertical 4x1 strips (handling wrap-around)
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r += 4) {
      const remainingRows = Math.min(4, rows - r)
      if (remainingRows === 4) {
        patterns.push([
          [r, c],
          [r + 1, c],
          [r + 2, c],
          [r + 3, c],
        ])
      } else if (rows === 4) {
        // Special handling for 4-row maps where strips wrap around
        patterns.push([
          [0, c],
          [1, c],
          [2, c],
          [3, c],
        ])
      }
    }
  }

  return patterns
}

/**
 * Generate all possible pair (size 2) patterns for a K-map of given dimensions
 * This pre-computes patterns for better performance
 */
function generatePairPatterns(rows: number, cols: number): Array<Array<[number, number]>> {
  const patterns: Array<Array<[number, number]>> = []

  // Horizontal pairs
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      patterns.push([
        [r, c],
        [r, (c + 1) % cols],
      ])
    }
  }

  // Vertical pairs
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      patterns.push([
        [r, c],
        [(r + 1) % rows, c],
      ])
    }
  }

  return patterns
}

/**
 * Gets the border styles for a cell based on the groups it belongs to
 */
export function getCellBorderStyles(
  rowHeaders: string[],
  colHeaders: string[],
  row: number,
  col: number,
  minterm: number,
  groups: KMapGroup[]
): CellStyle {
  // Find all groups containing this cell
  const cellGroups = groups.filter(g => g.cells.some(c => c.minterm === minterm))

  if (cellGroups.length === 0) {
    return { border: '1px solid #e2e8f0' }
  }

  // Get the first (largest) group containing this cell
  const group = cellGroups[0]
  const color = group.color

  // For a single cell, show all borders
  if (group.size === 1) {
    return {
      border: `${KMAP_GROUP_BORDER_WIDTH} ${KMAP_GROUP_BORDER_STYLE} ${color}`,
      backgroundColor: `${color}${KMAP_CELL_BG_OPACITY}`,
    }
  }

  // For groups, determine which borders to show
  const borders = {
    top: true,
    right: true,
    bottom: true,
    left: true,
  }

  // Check if there are cells in each direction that belong to the same group
  const cellsInGroup = group.cells
  const currentCell = cellsInGroup.find(c => c.minterm === minterm)!

  for (const cell of cellsInGroup) {
    if (cell.minterm === minterm) continue

    // Top border
    if (
      cell.row === (currentCell.row - 1 + rowHeaders.length) % rowHeaders.length &&
      cell.col === currentCell.col
    ) {
      borders.top = false
    }

    // Bottom border
    if (cell.row === (currentCell.row + 1) % rowHeaders.length && cell.col === currentCell.col) {
      borders.bottom = false
    }

    // Left border
    if (
      cell.row === currentCell.row &&
      cell.col === (currentCell.col - 1 + colHeaders.length) % colHeaders.length
    ) {
      borders.left = false
    }

    // Right border
    if (cell.row === currentCell.row && cell.col === (currentCell.col + 1) % colHeaders.length) {
      borders.right = false
    }
  }

  return {
    borderTop: borders.top
      ? `${KMAP_GROUP_BORDER_WIDTH} ${KMAP_GROUP_BORDER_STYLE} ${color}`
      : '1px solid transparent',
    borderRight: borders.right
      ? `${KMAP_GROUP_BORDER_WIDTH} ${KMAP_GROUP_BORDER_STYLE} ${color}`
      : '1px solid transparent',
    borderBottom: borders.bottom
      ? `${KMAP_GROUP_BORDER_WIDTH} ${KMAP_GROUP_BORDER_STYLE} ${color}`
      : '1px solid transparent',
    borderLeft: borders.left
      ? `${KMAP_GROUP_BORDER_WIDTH} ${KMAP_GROUP_BORDER_STYLE} ${color}`
      : '1px solid transparent',
    backgroundColor: `${color}${KMAP_CELL_BG_OPACITY}`,
  }
}
