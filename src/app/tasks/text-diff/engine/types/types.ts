// Core diff types
export interface CharChange {
  type: 'added' | 'removed' | 'unchanged'
  text: string
}

export interface DiffResult {
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  value: string
  lineNumber?: number
  charChanges?: CharChange[]
  originalValue?: string // For modified lines, store the original value
}

export interface DiffStats {
  additions: number
  deletions: number
  unchanged: number
  totalLines: number
  charAdditions: number
  charDeletions: number
}

// Component prop types
export interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export interface TextPreviewProps {
  diffResults: DiffResult[]
  stats: DiffStats
  className?: string
}

export interface CharHighlightRendererProps {
  charChanges: CharChange[]
  fallbackText?: string
}

export interface DiffStatsDisplayProps {
  stats: DiffStats
  showOnlyChanges: boolean
}

export interface ModeControlsProps {
  previewMode: PreviewMode
  showOnlyChanges: boolean
  onPreviewModeChange: (mode: PreviewMode) => void
  onShowOnlyChangesChange: (show: boolean) => void
}

export interface UnifiedViewProps {
  diffResults: DiffResult[]
  showOnlyChanges: boolean
  currentChangeIndex?: number
  changedLines?: Array<{ result: DiffResult; index: number }>
}

export interface SplitViewProps {
  diffResults: DiffResult[]
  showOnlyChanges: boolean
  currentChangeIndex?: number
  changedLines?: Array<{ result: DiffResult; index: number }>
}

// Algorithm types
export interface LCSResult {
  type: 'unchanged' | 'removed' | 'added'
  text: string
}

// UI state types
export type PreviewMode = 'split' | 'unified'

// Hook return types
export interface UseTextDiffReturn {
  compareTexts: (oldText: string, newText: string) => DiffResult[]
  getDiffStats: (results: DiffResult[]) => DiffStats
  hasDifferences: (oldText: string, newText: string) => boolean
}
