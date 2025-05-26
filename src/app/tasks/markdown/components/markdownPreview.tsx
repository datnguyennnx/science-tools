import React, { ErrorInfo, Component, useEffect, useState, memo, lazy } from 'react'
import { MarkdownPreviewProps } from '@uiw/react-markdown-preview'
import 'katex/dist/katex.min.css'
import './markdownPreview.css'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { CodeBlock } from './codeBlock'
import mermaid from 'mermaid'

const UiwMarkdownPreview = lazy(() => import('@uiw/react-markdown-preview'))
const MarkdownError = lazy(() =>
  import('./markdownError').then(module => ({ default: module.MarkdownError }))
)

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
        await mermaid
          .run({
            querySelector: '.mermaid',
          })
          .catch(() => {})
      } catch {}
    }

    // Small delay to ensure DOM elements are ready
    const timeoutId = setTimeout(renderMermaidDiagrams, 100)
    return () => clearTimeout(timeoutId)
  }, [markdown, themeState])

  // Configure components for the markdown preview
  const componentsOverride = React.useMemo<MarkdownPreviewProps['components']>(
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
