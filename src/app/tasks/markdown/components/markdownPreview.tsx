'use client'

import React, { ErrorInfo, Component, useEffect, useState, memo } from 'react'
import UiwMarkdownPreview, {
  MarkdownPreviewProps as UiwMarkdownPreviewProps,
} from '@uiw/react-markdown-preview'
import 'katex/dist/katex.css'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { CodeBlock } from './codeBlock'
import { MarkdownError } from './markdownError'
import mermaid from 'mermaid'

interface CustomMarkdownPreviewPageProps {
  markdown: string
  className?: string
}

// Error boundary to catch rendering errors
class MarkdownErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Markdown rendering error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <MarkdownError
          title="Rendering Error"
          message={this.state.error?.message || 'An error occurred while rendering the markdown'}
          details="There was a problem rendering this content. Please check your markdown syntax."
        />
      )
    }

    return this.props.children
  }
}

// Main component
export const MarkdownPreview = memo(function MarkdownPreview({
  markdown,
  className,
}: CustomMarkdownPreviewPageProps) {
  const { theme, systemTheme } = useTheme()
  // Use a consistent theme value for both server and client rendering
  const currentTheme = theme === 'system' ? systemTheme : theme
  // Use state to trigger re-renders on theme change
  const [themeState, setThemeState] = useState(currentTheme)

  // Update state when theme changes
  useEffect(() => {
    setThemeState(currentTheme)
  }, [currentTheme])

  // Add custom styles for Mermaid and KaTeX
  useEffect(() => {
    // Add custom CSS for centering mermaid diagrams
    const style = document.createElement('style')
    style.textContent = `
      .mermaid {
        display: flex !important;
        justify-content: center !important;
        margin: 1.5rem auto !important;
        background-color: var(--color-muted);
        padding: 1rem;
        border-radius: var(--radius);
        overflow: auto;
        height: 100%;

      }
      .mermaid svg {
        max-width: 100%;
        max-height: 100%;
        height: auto;
      }
      .mermaid-fullscreen {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      .mermaid-fullscreen svg {
        max-width: 100%;
        max-height: 100%;
        height: auto;
      }
      .katex-block {
        display: flex;
        justify-content: center;
        margin: 1.5rem auto;
        overflow-x: auto;
        max-width: 100%;
        padding: 0.5rem;
        background-color: var(--color-muted);
        border-radius: var(--radius);
      }
      .katex-display {
        margin: 0 !important;
        max-width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
      }
      .katex {
        font-size: 1.1em;
        max-width: 100%;
      }
      .katex-error {
        display: block;
        padding: 0.5rem;
        margin: 0.5rem 0;
        color: var(--error-text);
        background-color: var(--error-background);
        border: 1px solid var(--error-border);
        border-radius: var(--radius);
      }
      .wmde-markdown {
        font-family: var(--font-sans);
      }
      .wmde-markdown pre {
        background-color: var(--color-muted);
        border-radius: var(--radius);
      }
      .wmde-markdown code {
        font-family: var(--font-mono);
      }
      .wmde-markdown h1,
      .wmde-markdown h2,
      .wmde-markdown h3,
      .wmde-markdown h4,
      .wmde-markdown h5,
      .wmde-markdown h6 {
        color: var(--color-primary);
      }
      .wmde-markdown blockquote {
        border-left-color: var(--color-border);
        background-color: var(--color-muted);
      }
      .wmde-markdown table {
        border-color: var(--color-border);
        border-collapse: collapse;
        margin: 1.5rem 0;
        width: 100%;
        overflow-x: auto;
        display: block;
      }
      .wmde-markdown th {
        background-color: var(--color-muted);
        padding: 0.75rem;
        border: 1px solid var(--color-border);
        font-weight: 600;
      }
      .wmde-markdown td {
        padding: 0.75rem;
        border: 1px solid var(--color-border);
      }
      .wmde-markdown tr:nth-child(even) {
        background-color: var(--color-muted-light, rgba(0,0,0,0.03));
      }
      .wmde-markdown hr {
        border-color: var(--color-border);
      }
      .wmde-markdown a {
        color: var(--color-primary);
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Initialize mermaid with theme settings
  useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: true,
        theme: themeState === 'dark' ? 'dark' : 'neutral',
        securityLevel: 'loose',
        fontFamily: 'var(--font-sans)',
      })
    } catch {
      // Silent fail - mermaid will be disabled but won't break the app
    }
  }, [themeState])

  // Process mermaid diagrams after the component mounts or theme changes
  useEffect(() => {
    const renderMermaidDiagrams = async () => {
      try {
        // Use the mermaid API to find and render all mermaid diagrams
        await mermaid
          .run({
            querySelector: '.mermaid',
          })
          .catch(() => {
            // Silent fail
          })
      } catch {
        // Silent fail
      }
    }

    // Small delay to ensure DOM elements are ready
    const timeoutId = setTimeout(renderMermaidDiagrams, 100)
    return () => clearTimeout(timeoutId)
  }, [markdown, themeState])

  // Configure components for the markdown preview
  const componentsOverride = React.useMemo<UiwMarkdownPreviewProps['components']>(
    () => ({
      code: CodeBlock,
    }),
    []
  )

  return (
    <div className={cn('h-full w-full overflow-auto rounded-md border p-8', className)}>
      <MarkdownErrorBoundary>
        <div key={`markdown-preview-${themeState}`} suppressHydrationWarning>
          <UiwMarkdownPreview
            source={markdown}
            components={componentsOverride}
            wrapperElement={{
              'data-color-mode': themeState === 'dark' ? 'dark' : 'light',
            }}
            skipHtml={false}
          />
        </div>
      </MarkdownErrorBoundary>
    </div>
  )
})

// Also export as default for dynamic import
export default MarkdownPreview
