import { useCallback } from 'react'
import katex from 'katex'

export const useKatex = () => {
  // Render KaTeX from string
  const renderKatex = useCallback((content: string, displayMode = true): string => {
    try {
      // Clean up the content by trimming whitespace
      const cleanContent = content.trim()

      if (!cleanContent) {
        return '<span class="katex-error">Empty LaTeX expression</span>'
      }

      // Render the KaTeX content
      return katex.renderToString(cleanContent, {
        throwOnError: false,
        displayMode,
        output: 'html',
        trust: true,
        strict: false,
        macros: {
          // Common math macros
          '\\R': '\\mathbb{R}',
          '\\N': '\\mathbb{N}',
          '\\Z': '\\mathbb{Z}',
          '\\Q': '\\mathbb{Q}',
          '\\C': '\\mathbb{C}',
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return `<span class="katex-error p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
        Error rendering LaTeX: ${errorMessage}
      </span>`
    }
  }, [])

  // Check if content is wrapped in $$ delimiters and extract the content
  const extractKatexContent = useCallback(
    (content: string): { isKatex: boolean; content: string } => {
      // Normalize line endings and whitespace
      const normalizedContent = content.replace(/\r?\n/g, ' ').trim()

      // Check for block math with $$ delimiters
      const blockMatch = normalizedContent.match(/^\s*\$\$([\s\S]+?)\$\$\s*$/)
      if (blockMatch && blockMatch[1]) {
        return { isKatex: true, content: blockMatch[1].trim() }
      }

      // Check for inline math with $ delimiters (not implemented by default)
      const inlineMatch = normalizedContent.match(/^\s*\$([\s\S]+?)\$\s*$/)
      if (inlineMatch && inlineMatch[1]) {
        return { isKatex: true, content: inlineMatch[1].trim() }
      }

      return { isKatex: false, content }
    },
    []
  )

  return {
    renderKatex,
    extractKatexContent,
  }
}
