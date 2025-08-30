import React from 'react'
import { cn } from '@/lib/utils'

interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

export function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  // For inline code
  if (inline) {
    return (
      <code
        className={cn('px-1.5 py-0.5 bg-muted rounded text-sm font-mono', className)}
        {...props}
      >
        {children}
      </code>
    )
  }

  // For block code
  return (
    <pre className={cn('p-4 bg-muted rounded-md overflow-x-auto', className)} {...props}>
      <code className="font-mono text-sm leading-relaxed">{children}</code>
    </pre>
  )
}
