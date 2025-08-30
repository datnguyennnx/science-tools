import React, { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface MarkdownInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export const MarkdownInput = React.forwardRef<HTMLTextAreaElement, MarkdownInputProps>(
  ({ value, onChange, className, placeholder = 'Type your markdown here...', ...props }, ref) => {
    const [lineCount, setLineCount] = useState(1)

    // Calculate line count
    useEffect(() => {
      const lines = value.split('\n')
      setLineCount(Math.max(lines.length, 1))
    }, [value])

    // Generate line numbers
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)

    return (
      <div
        className={cn(
          'h-full w-full overflow-hidden rounded-lg border bg-card flex flex-col',
          className
        )}
      >
        {/* Textarea Container */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {/* Line numbers */}
          <div className="absolute left-0 top-0 h-full w-12 overflow-hidden bg-muted/20 select-none z-10 rounded-l-lg">
            <div className="markdown-line-numbers pt-4">
              {lineNumbers.map(lineNum => (
                <div key={lineNum} className="markdown-line-number">
                  {lineNum}
                </div>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <Textarea
            ref={ref}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'h-full w-full resize-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4 pl-16',
              'markdown-textarea',
              'border-0 bg-transparent',
              'placeholder:text-muted-foreground/60',
              'scrollbar-json',
              'rounded-none'
            )}
            {...props}
          />
        </div>
      </div>
    )
  }
)

MarkdownInput.displayName = 'MarkdownInput'
