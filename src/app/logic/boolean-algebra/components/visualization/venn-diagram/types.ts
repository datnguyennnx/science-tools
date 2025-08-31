import type { BooleanExpression } from '../../../engine'
import { VennData } from './VennDiagramEngine'

export interface VennDiagramProps {
  expression: string
  className?: string
}

export type VennDiagramResultStatus = 'waiting' | 'error' | 'success'

export type VennDiagramResultWaiting = {
  status: 'waiting'
  message: string
}

export type VennDiagramResultError = {
  status: 'error'
  message: string
  details?: string
  variables?: string[]
}

export interface VennDiagramResultSuccess {
  status: 'success'
  variables: string[]
  expressionTree: BooleanExpression
  vennData: VennData
  numVars: number
  originalExpression: string
}

export type VennDiagramResultType =
  | VennDiagramResultWaiting
  | VennDiagramResultError
  | VennDiagramResultSuccess
