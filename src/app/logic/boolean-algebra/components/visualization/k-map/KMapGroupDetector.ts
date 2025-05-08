import { CellPosition, CellStyle, KMapGroup } from './types'

// Colors for different group sizes - matching the reference images
export const GROUP_COLORS = {
  8: '#3b82f6', // Blue for octets
  4: '#ef4444', // Red for quads
  2: '#10b981', // Green for pairs
  1: '#f59e0b', // Yellow for singles
}

// Color names for the legend
export const GROUP_COLOR_NAMES: Record<number, string> = {
  8: 'Octet',
  4: 'Quad',
  2: 'Pair',
  1: 'Single',
}

// Opacity values for cell backgrounds
const CELL_BG_OPACITY = '15' // 15% opacity

// Border styles for groups
const BORDER_STYLE = 'dashed' // Use dashed borders for the groups
const BORDER_WIDTH = '2px' // Border width

/**
 * Detects groups in a Karnaugh Map
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

  // Find groups of different sizes
  for (const { size } of maxGroups) {
    if (size === 8 && numVars !== 4) continue // Only 4-var K-Maps can have octets

    // For 4 variables, octets can be in various forms
    if (size === 8 && numVars === 4) {
      // Horizontal strip across entire map (2 rows x 4 cols)
      for (let r = 0; r < rows; r += 2) {
        const strip: CellPosition[] = []
        for (let c = 0; c < cols; c++) {
          strip.push(kMapOrder[r][c], kMapOrder[(r + 1) % rows][c])
        }
        if (isValidGroup(strip) && strip.some(cell => !assignedCells.has(cell.minterm))) {
          result.push({ cells: strip, color: GROUP_COLORS[8], size })
          strip.forEach(cell => assignedCells.add(cell.minterm))
        }
      }

      // Vertical strip across entire map (4 rows x 2 cols)
      for (let c = 0; c < cols; c += 2) {
        const strip: CellPosition[] = []
        for (let r = 0; r < rows; r++) {
          strip.push(kMapOrder[r][c], kMapOrder[r][(c + 1) % cols])
        }
        if (isValidGroup(strip) && strip.some(cell => !assignedCells.has(cell.minterm))) {
          result.push({ cells: strip, color: GROUP_COLORS[8], size })
          strip.forEach(cell => assignedCells.add(cell.minterm))
        }
      }

      // 2x4 blocks
      for (let r = 0; r < rows; r += 2) {
        for (let c = 0; c < cols; c += 2) {
          const block: CellPosition[] = []
          for (let dr = 0; dr < 2; dr++) {
            for (let dc = 0; dc < 2; dc++) {
              block.push(
                kMapOrder[(r + dr) % rows][c + dc],
                kMapOrder[(r + dr) % rows][(c + dc + 2) % cols]
              )
            }
          }
          if (isValidGroup(block) && block.some(cell => !assignedCells.has(cell.minterm))) {
            result.push({ cells: block, color: GROUP_COLORS[8], size })
            block.forEach(cell => assignedCells.add(cell.minterm))
          }
        }
      }

      // 4x2 blocks
      for (let r = 0; r < rows; r += 2) {
        for (let c = 0; c < cols; c += 2) {
          const block: CellPosition[] = []
          for (let dr = 0; dr < 2; dr++) {
            for (let dc = 0; dc < 2; dc++) {
              block.push(kMapOrder[(r + dr) % rows][c + dc], kMapOrder[(r + dr + 2) % rows][c + dc])
            }
          }
          if (isValidGroup(block) && block.some(cell => !assignedCells.has(cell.minterm))) {
            result.push({ cells: block, color: GROUP_COLORS[8], size })
            block.forEach(cell => assignedCells.add(cell.minterm))
          }
        }
      }
    }

    // For quads (4 cells)
    if (size === 4) {
      // 2x2 quads
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const quad: CellPosition[] = [
            kMapOrder[r][c],
            kMapOrder[r][(c + 1) % cols],
            kMapOrder[(r + 1) % rows][c],
            kMapOrder[(r + 1) % rows][(c + 1) % cols],
          ]

          if (isValidGroup(quad) && quad.some(cell => !assignedCells.has(cell.minterm))) {
            result.push({ cells: quad, color: GROUP_COLORS[4], size })
            quad.forEach(cell => assignedCells.add(cell.minterm))
          }
        }
      }

      // Horizontal 1x4 strips (handling wrap-around)
      for (let r = 0; r < rows; r++) {
        const strip: CellPosition[] = []
        for (let c = 0; c < cols; c++) {
          strip.push(kMapOrder[r][c])
        }
        if (isValidGroup(strip) && strip.some(cell => !assignedCells.has(cell.minterm))) {
          result.push({ cells: strip, color: GROUP_COLORS[4], size })
          strip.forEach(cell => assignedCells.add(cell.minterm))
        }
      }

      // Vertical 4x1 strips (handling wrap-around)
      for (let c = 0; c < cols; c++) {
        const strip: CellPosition[] = []
        for (let r = 0; r < rows; r++) {
          strip.push(kMapOrder[r][c])
        }
        if (isValidGroup(strip) && strip.some(cell => !assignedCells.has(cell.minterm))) {
          result.push({ cells: strip, color: GROUP_COLORS[4], size })
          strip.forEach(cell => assignedCells.add(cell.minterm))
        }
      }
    }

    // For pairs (2 cells), check all adjacent cells including wrapping
    if (size === 2) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const currentCell = kMapOrder[r][c]
          if (!isCellMinterm(currentCell) || assignedCells.has(currentCell.minterm)) continue

          // Check horizontal neighbor (right)
          const rightCol = (c + 1) % cols
          const rightCell = kMapOrder[r][rightCol]
          if (isCellMinterm(rightCell) && !assignedCells.has(rightCell.minterm)) {
            result.push({
              cells: [currentCell, rightCell],
              color: GROUP_COLORS[2],
              size,
            })
            assignedCells.add(currentCell.minterm)
            assignedCells.add(rightCell.minterm)
            continue
          }

          // Check vertical neighbor (down)
          const bottomRow = (r + 1) % rows
          const bottomCell = kMapOrder[bottomRow][c]
          if (isCellMinterm(bottomCell) && !assignedCells.has(bottomCell.minterm)) {
            result.push({
              cells: [currentCell, bottomCell],
              color: GROUP_COLORS[2],
              size,
            })
            assignedCells.add(currentCell.minterm)
            assignedCells.add(bottomCell.minterm)
            continue
          }
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
          color: GROUP_COLORS[1],
          size: 1,
        })
        assignedCells.add(cell.minterm)
      }
    }
  }

  return result
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
      border: `${BORDER_WIDTH} ${BORDER_STYLE} ${color}`,
      backgroundColor: `${color}${CELL_BG_OPACITY}`,
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
    borderTop: borders.top ? `${BORDER_WIDTH} ${BORDER_STYLE} ${color}` : '1px solid transparent',
    borderRight: borders.right
      ? `${BORDER_WIDTH} ${BORDER_STYLE} ${color}`
      : '1px solid transparent',
    borderBottom: borders.bottom
      ? `${BORDER_WIDTH} ${BORDER_STYLE} ${color}`
      : '1px solid transparent',
    borderLeft: borders.left ? `${BORDER_WIDTH} ${BORDER_STYLE} ${color}` : '1px solid transparent',
    backgroundColor: `${color}${CELL_BG_OPACITY}`,
  }
}
