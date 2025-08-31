// Main component
export { StepByStepSimplification } from './StepByStepSimplification'

// Hook
export { useExpressionSimplification } from '../hooks/useExpressionSimplification'
export type {
  SimplificationStep,
  SimplificationResult as SimplificationResultType,
  SimplificationState,
} from '../hooks/useExpressionSimplification'

// Sub-components
export { SimplificationLoading } from './SimplificationLoading'
export { SimplificationError } from './SimplificationError'
export { SimplificationSteps } from './SimplificationSteps'
export { SimplificationResult } from './SimplificationResult'
export { SimplificationNoSteps } from './SimplificationNoSteps'
