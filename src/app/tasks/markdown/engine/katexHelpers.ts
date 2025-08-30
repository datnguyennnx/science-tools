import katex from 'katex'
import type { KaTeXResult } from './index'

export const renderKatex = (content: string, displayMode = true): string => {
  try {
    const cleanContent = content.trim()
    if (!cleanContent) return '<span class="katex-error">Empty LaTeX expression</span>'

    return katex.renderToString(cleanContent, {
      throwOnError: false,
      displayMode,
      output: 'html',
      trust: true,
      strict: false,
      macros: {
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
}

export const extractKatexContent = (content: string): KaTeXResult => {
  const normalizedContent = content.replace(/\r?\n/g, ' ').trim()

  const blockMatch = normalizedContent.match(/^\s*\$\$([\s\S]+?)\$\$\s*$/)
  if (blockMatch && blockMatch[1]) return { isKaTeX: true, content: blockMatch[1].trim() }

  const inlineMatch = normalizedContent.match(/^\s*\$([\s\S]+?)\$\s*$/)
  if (inlineMatch && inlineMatch[1]) return { isKaTeX: true, content: inlineMatch[1].trim() }

  return { isKaTeX: false, content }
}
