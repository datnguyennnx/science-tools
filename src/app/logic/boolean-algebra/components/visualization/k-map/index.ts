// Main component
export { KarnaughMap } from './KarnaughMap'

// Hooks
export { useKMapGeneration } from '../../hooks/useKMapGeneration'
export { useFullscreen } from '../../hooks/useFullscreen'

// Sub-components
export { KMapHeader } from './KMapHeader'
export { KMapContent } from './KMapContent'
export { KMapWaiting } from './KMapWaiting'
export { KMapError } from './KMapError'
export { KMapSuccess } from './KMapSuccess'

// Existing exports
export { KMapGrid } from './KMapGrid'
export { KMapCell } from './KMapCell'
export { KMapLegend } from './KMapLegend'
export { detectGroups, getCellBorderStyles } from './KMapGroupDetector'
export { createKMapConfig, generateMultiKMaps, calculateOptimalGroups } from './KMapEngine'

// Types
export type * from './types'
