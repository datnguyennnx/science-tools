import React from 'react'

export const extractTextFromChildren = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join('')
  if (
    React.isValidElement(children) &&
    (children.props as { children?: React.ReactNode }).children
  ) {
    return extractTextFromChildren((children.props as { children: React.ReactNode }).children)
  }
  return ''
}

export const isMermaidBlock = (className?: string): boolean => {
  return Boolean(className && /^language-mermaid/.test(className.toLowerCase()))
}

export const isKatexBlock = (className?: string): boolean => {
  return Boolean(className && /^language-katex/.test(className.toLowerCase()))
}

export const validateMermaidContent = (content: string) => {
  const trimmedContent = content.trim()
  if (!trimmedContent) return { isValid: false, error: 'Diagram content is empty' }

  const firstLine = trimmedContent.split('\n')[0].trim()
  const validDiagramTypes = [
    'graph',
    'flowchart',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'gantt',
    'pie',
    'er',
    'journey',
    'gitGraph',
  ]

  const hasValidDiagramType = validDiagramTypes.some(
    type => firstLine.startsWith(type) || firstLine.includes(` ${type} `)
  )
  return {
    isValid: hasValidDiagramType,
    error: hasValidDiagramType
      ? null
      : 'Diagram must start with a valid type (e.g., graph, flowchart, sequenceDiagram, etc.)',
  }
}

export const downloadFile = (
  content: string,
  filename: string = 'document.md',
  mimeType: string = 'text/markdown'
) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
