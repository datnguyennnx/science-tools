/**
 * Types for Karnaugh Map implementation
 */

/**
 * Cell position interface for K-Map
 */
export interface CellPosition {
  row: number
  col: number
  minterm: number
}

/**
 * Represents a group of cells in a K-Map
 */
export interface KMapGroup {
  cells: CellPosition[]
  color: string
  size: number // 1, 2, 4, 8, 16
  term?: string // Optional simplified term for this group
}

/**
 * K-Map grid configuration based on variable count
 */
export interface KMapConfig {
  rowHeaders: string[]
  colHeaders: string[]
  rowVarLabel: string
  colVarLabel: string
  kMapOrder: CellPosition[][]
}

/**
 * Represents the cell styling information
 */
export interface CellStyle {
  border?: string
  borderTop?: string
  borderRight?: string
  borderBottom?: string
  borderLeft?: string
  backgroundColor?: string
}

/**
 * Karnaugh Map props interface
 */
export interface KarnaughMapProps {
  expression: string
  className?: string
}
