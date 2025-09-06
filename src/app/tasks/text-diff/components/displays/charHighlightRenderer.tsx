import React from 'react'
import { CharHighlightRendererProps } from '../../engine/types'

export function CharHighlightRenderer({ fallbackText }: CharHighlightRendererProps) {
  // Simplified: just return the fallback text without complex highlighting
  // This keeps the UI simple and clean like GitHub
  return <span>{fallbackText}</span>
}

export default CharHighlightRenderer
