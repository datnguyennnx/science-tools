import React, { useEffect, useState, useRef } from 'react'
import { MarkdownPreviewProps as UiwMarkdownPreviewProps } from '@uiw/react-markdown-preview'
import 'katex/dist/katex.min.css'
import '../styles.css'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { CodeBlock } from './CodeBlock'
import { initializeMermaid, renderMermaidDiagrams } from '../engine/mermaidConfig'
import type { MarkdownPreviewProps } from '../engine/types'

const UiwMarkdownPreview = React.lazy(() =>
  import('@uiw/react-markdown-preview').then(module => ({ default: module.default }))
)

export const MarkdownPreview = React.forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  ({ content, className, ...props }, ref) => {
    const { theme, systemTheme } = useTheme()
    const currentTheme = theme === 'system' ? systemTheme : theme
    const [themeState, setThemeState] = useState(currentTheme)
    const handleMermaidRenderingRef = useRef<() => Promise<void> | null>(null)

    useEffect(() => {
      setThemeState(currentTheme)
    }, [currentTheme])

    useEffect(() => {
      initializeMermaid({
        theme: themeState === 'dark' ? 'dark' : 'default',
      })
    }, [themeState])

    const handleMermaidRendering = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 200))
        await renderMermaidDiagrams()
        setTimeout(async () => {
          try {
            await renderMermaidDiagrams()
          } catch (error) {
            console.warn('Second mermaid rendering attempt failed:', error)
          }
        }, 500)
      } catch (error) {
        console.warn('Failed to render Mermaid diagrams:', error)
      }
    }

    handleMermaidRenderingRef.current = handleMermaidRendering

    useEffect(() => {
      if (content && handleMermaidRenderingRef.current) {
        handleMermaidRenderingRef.current()
      }
    }, [content, themeState])

    useEffect(() => {
      const handleMermaidRequest = () => {
        if (handleMermaidRenderingRef.current) {
          handleMermaidRenderingRef.current()
        }
      }

      window.addEventListener('mermaid-render-request', handleMermaidRequest)
      return () => window.removeEventListener('mermaid-render-request', handleMermaidRequest)
    }, [])

    const components: UiwMarkdownPreviewProps['components'] = {
      code: CodeBlock as unknown as React.ComponentType<React.HTMLAttributes<HTMLElement>>,
    }

    return (
      <div
        ref={ref}
        className={cn('h-full w-full overflow-auto rounded-md border p-4', className)}
        {...props}
      >
        <div key={`markdown-preview-${themeState}`} suppressHydrationWarning>
          <React.Suspense fallback={null}>
            <UiwMarkdownPreview
              source={content}
              components={components}
              wrapperElement={{
                'data-color-mode': themeState === 'dark' ? 'dark' : 'light',
              }}
              skipHtml={false}
              style={{
                backgroundColor: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                fontFamily: 'var(--font-sans)',
                lineHeight: '1.6',
                padding: '1rem',
                margin: 0,
                border: 'none',
                borderRadius: '0',
                boxShadow: 'none',
              }}
            />
          </React.Suspense>
        </div>
      </div>
    )
  }
)

MarkdownPreview.displayName = 'MarkdownPreview'
