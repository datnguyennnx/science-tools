import React from 'react'
import { CharHighlightRendererProps } from '../../engine/types'

export function CharHighlightRenderer({ charChanges, fallbackText }: CharHighlightRendererProps) {
  // Character diffs used by algorithms but not shown in UI for cleaner display
  void charChanges

  return <span>{fallbackText}</span>
}

export default CharHighlightRenderer
