/**
 * Types for Venn Diagram implementation
 */
import { BooleanExpression } from '../../../engine'
import { VennData } from './VennDiagramEngine'

/**
 * Venn Diagram props interface
 */
export interface VennDiagramProps {
  expression: string
  className?: string
  maxVariablesToShow?: number // Maximum variables to show in a single Venn diagram (2-4)
}

/**
 * Venn result type for waiting state
 */
export type VennResultWaiting = {
  status: 'waiting'
  message: string
}

/**
 * Venn result type for error state
 */
export type VennResultError = {
  status: 'error'
  message: string
  details?: string
  variables?: string[]
}

/**
 * Definition of a single Venn diagram within a potential multi-diagram result
 */
export interface VennDiagramDefinition {
  variables: string[]
  vennData: VennData
  title: string
  fixedVariables: Record<string, boolean>
}

/**
 * Venn result type for success state
 */
export type VennResultSuccess = {
  status: 'success'
  allVariables: string[] // All variables in the original expression
  expressionTree: BooleanExpression
  diagrams: VennDiagramDefinition[] // One or more Venn diagrams (multiple for expressions with many variables)
  isMultiDiagram: boolean // Whether this is a multi-diagram result
}

/**
 * Union type for all possible Venn diagram result states
 */
export type VennResult = VennResultWaiting | VennResultError | VennResultSuccess
