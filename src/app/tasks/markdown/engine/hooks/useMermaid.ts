import { useEffect, useState, useCallback } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

interface MermaidError {
  message: string
  details: string
}

export const useMermaid = (markdown: string) => {
  const { theme } = useTheme()
  const [mermaidError, setMermaidError] = useState<MermaidError | null>(null)

  // Initialize mermaid with theme settings
  useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'neutral',
        securityLevel: 'loose',
        deterministicIds: true,
        fontFamily: 'sans-serif',
      })
    } catch {
      // Silent fail - mermaid will be disabled but won't break the app
    }
  }, [theme])

  // Process mermaid diagrams in the document
  useEffect(() => {
    const renderMermaidDiagrams = async () => {
      try {
        const mermaidElements = document.querySelectorAll('.mermaid')
        if (mermaidElements.length === 0) return

        // Process elements one by one to avoid batch failures
        for (const el of mermaidElements) {
          if (!(el instanceof HTMLElement)) continue

          try {
            // Clear any previous content except the text content
            const content = el.textContent || ''

            // Skip empty diagrams
            if (!content.trim()) continue

            // Process individual diagram
            await mermaid.render(
              `mermaid-${Math.random().toString(36).substring(2, 11)}`,
              content,
              el
            )
          } catch {
            // Silently continue with other diagrams
          }
        }
      } catch {
        // Silent fail - individual diagram errors are handled separately
      }
    }

    // Small delay to ensure DOM elements are ready
    const timeoutId = setTimeout(renderMermaidDiagrams, 100)
    return () => clearTimeout(timeoutId)
  }, [markdown, theme])

  // Parse mermaid syntax and handle errors
  const parseMermaid = useCallback((code: string): { isValid: boolean; error?: MermaidError } => {
    if (!code.trim()) {
      return {
        isValid: false,
        error: {
          message: 'Empty diagram',
          details: 'Mermaid diagram content is empty.',
        },
      }
    }

    const trimmedCode = code.trim()

    // Check for valid diagram type at the beginning
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

    const firstLine = trimmedCode.split('\n')[0].trim()
    const hasValidDiagramType = validDiagramTypes.some(
      type => firstLine.startsWith(type) || firstLine.includes(` ${type} `)
    )

    if (!hasValidDiagramType) {
      return {
        isValid: false,
        error: {
          message: 'Unknown Diagram Type',
          details:
            'Diagram must start with a valid type (e.g., flowchart, sequenceDiagram, classDiagram, etc.)',
        },
      }
    }

    try {
      mermaid.parse(trimmedCode)
      return { isValid: true }
    } catch (e: unknown) {
      let errorMessage = 'Mermaid diagram error.'
      let errorDetails =
        'Please verify your Mermaid syntax. The diagram type must be the first line.'

      if (typeof e === 'object' && e !== null) {
        const errorObj = e as { str?: unknown; message?: unknown }

        if (typeof errorObj.str === 'string' && errorObj.str.includes('No diagram type detected')) {
          errorMessage = 'Unknown Diagram Type'
          errorDetails =
            'Ensure the diagram starts with a valid type (e.g., flowchart, sequenceDiagram).'
        } else if (typeof errorObj.str === 'string') {
          errorMessage = errorObj.str
        } else if (typeof errorObj.message === 'string') {
          errorMessage = errorObj.message
        } else if (e instanceof Error) {
          errorMessage = e.message
        }
      }

      const error = { message: errorMessage, details: errorDetails }
      setMermaidError(error)
      return { isValid: false, error }
    }
  }, [])

  return { parseMermaid, mermaidError }
}
