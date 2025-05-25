import React, { useRef, useId } from 'react'
import { useMarkdownText } from '../engine/hooks'
import { MarkdownError } from './markdownError'
import { cn } from '@/lib/utils'
import { MermaidFullscreen } from './mermaidFullscreen'
import { KatexFormula } from '@/components/KatexFormula'

// Define props interface for the custom code component
interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean
  className?: string
  children?: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node?: any // AST node, structurally expected by react-markdown based libraries
}

export function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const { extractTextFromChildren } = useMarkdownText()
  const uniqueId = useId()
  const mermaidRef = useRef<HTMLDivElement>(null)
  const katexRef = useRef<HTMLDivElement>(null)

  const codeText = extractTextFromChildren(children)

  // For inline code
  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }

  // Handle KaTeX blocks
  if (className && /^language-katex/.test(className.toLowerCase())) {
    try {
      return (
        <div ref={katexRef} className="katex-block">
          <KatexFormula formula={codeText} block={true} />
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

  // Handle Mermaid diagrams
  if (className && /^language-mermaid/.test(className.toLowerCase())) {
    const trimmedCodeText = codeText.trim()

    if (!trimmedCodeText) {
      return (
        <div className="p-4 text-muted-foreground">
          <p>Mermaid diagram content is empty.</p>
        </div>
      )
    }

    // Check if the diagram has a valid type
    const firstLine = trimmedCodeText.split('\n')[0].trim()
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

    if (!hasValidDiagramType) {
      return (
        <MarkdownError
          title="Mermaid Syntax Error:"
          message="Unknown Diagram Type"
          details="Diagram must start with a valid type (e.g., graph, flowchart, sequenceDiagram, classDiagram, etc.)"
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

  // Default rendering for other code blocks
  return (
    <code className={cn(className, 'font-mono text-sm')} {...props}>
      {children}
    </code>
  )
}
