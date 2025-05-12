/**
 * Types for Karnaugh Map implementation
 */
import { BooleanExpression } from '../../../engine'

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
  maxVariablesToShow?: number // Maximum variables to show in a single K-Map (2-6)
}

/**
 * KMap result type for waiting state
 */
export type KMapResultWaiting = {
  status: 'waiting'
  message: string
}

/**
 * KMap result type for error state
 */
export type KMapResultError = {
  status: 'error'
  message: string
  details?: string
  variables?: string[]
}

/**
 * Definition of a single K-Map within a potential multi-map result
 */
export interface KMapDefinition {
  variables: string[]
  mintermSet: Set<number>
  kMapConfig: KMapConfig
  groups: KMapGroup[]
  title: string
  fixedVariables: Record<string, boolean>
}

/**
 * KMap result type for success state
 */
export type KMapResultSuccess = {
  status: 'success'
  allVariables: string[] // All variables in the original expression
  expressionTree: BooleanExpression
  maps: KMapDefinition[] // One or more K-Maps (multiple for expressions with many variables)
  isMultiMap: boolean // Whether this is a multi-map result
}

/**
 * Union type for all possible KMap result states
 */
export type KMapResult = KMapResultWaiting | KMapResultError | KMapResultSuccess
