import React, { useRef, useId, useEffect } from 'react'
import { KatexFormula } from '@/components/KatexFormula'
import { MarkdownError } from './MarkdownError'
import { MermaidFullscreen } from './MermaidFullscreen'
import {
  extractTextFromChildren,
  isMermaidBlock,
  isKatexBlock,
  validateMermaidContent,
} from '../engine/markdownHelpers'
import { cn } from '@/lib/utils'
import type { CodeBlockProps } from '../engine/types'

export const CodeBlock = React.forwardRef<HTMLElement, CodeBlockProps>(
  ({ inline, className, children, ...props }, ref) => {
    const mermaidRef = useRef<HTMLDivElement>(null)
    const katexRef = useRef<HTMLDivElement>(null)
    const uniqueId = useId()
    const codeText = extractTextFromChildren(children)

    useEffect(() => {
      if (isMermaidBlock(className) && mermaidRef.current) {
        const timer = setTimeout(() => {
          try {
            window.dispatchEvent(new CustomEvent('mermaid-render-request'))
          } catch (error) {
            console.warn('Failed to trigger mermaid rendering:', error)
          }
        }, 50)
        return () => clearTimeout(timer)
      }
    }, [className])

    if (inline) {
      return (
        <code ref={ref} className={className} {...props}>
          {children}
        </code>
      )
    }

    if (isKatexBlock(className)) {
      try {
        return (
          <div ref={katexRef} className="katex-block">
            <KatexFormula formula={codeText} block />
          </div>
        )
      } catch (error) {
        return (
          <MarkdownError
            title="KaTeX Error:"
            message={(error as Error).message || 'Failed to render LaTeX formula'}
            details="Check your LaTeX syntax and try again."
            className="katex-error-container"
          />
        )
      }
    }

    if (isMermaidBlock(className)) {
      const trimmedCodeText = codeText.trim()
      const validation = validateMermaidContent(trimmedCodeText)

      if (!validation.isValid) {
        return (
          <MarkdownError
            title="Mermaid Syntax Error:"
            message="Unknown Diagram Type"
            details={validation.error || 'Diagram must start with a valid type'}
            className="mermaid-error-container"
          />
        )
      }

      const mermaidId = `mermaid-${uniqueId}`
      return (
        <div className="relative">
          <div ref={mermaidRef} id={mermaidId} className="mermaid" suppressHydrationWarning>
            {trimmedCodeText}
          </div>
          <MermaidFullscreen diagramId={mermaidId} />
        </div>
      )
    }

    return (
      <code ref={ref} className={cn(className, 'font-mono text-sm')} {...props}>
        {children}
      </code>
    )
  }
)

CodeBlock.displayName = 'CodeBlock'
