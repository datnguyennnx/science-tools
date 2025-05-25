import React from 'react'
import { cn } from '@/lib/utils'

interface MarkdownErrorProps {
  title: string
  message: string
  details?: string
  className?: string
}

export function MarkdownError({ title, message, details, className }: MarkdownErrorProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-md border',
        'bg-[var(--error-background)] border-[var(--error-border)] text-[var(--error-text)]',
        className
      )}
    >
      <h4 className="font-semibold mb-2 text-[var(--error-text-strong)]">{title}</h4>
      <pre className="whitespace-pre-wrap text-sm break-all">{message}</pre>
      {details && <p className="text-xs mt-2 text-[var(--error-text)]">{details}</p>}
    </div>
  )
}
