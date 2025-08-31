// Main component
export { VennDiagram } from './VennDiagram'

// Hooks
export { useVennDiagramGeneration } from '../../hooks/useVennDiagramGeneration'

// Sub-components
export { VennLegend } from './VennLegend'
export { VennDiagramContent } from './VennDiagramContent'

// Existing exports
export { VennDiagramSVG } from './VennDiagramSVG'
export {
  evaluate2VarVenn,
  evaluate3VarVenn,
  evaluate4VarVenn,
  evaluate5VarVenn,
} from './VennDiagramEngine'

// Types
export type * from './types'
export type {
  VennData,
  VennData2Vars,
  VennData3Vars,
  VennData4Vars,
  VennData5Vars,
} from './VennDiagramEngine'
