import React, { useEffect, useState, DragEvent } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface MarkdownInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export const MarkdownInput = React.forwardRef<HTMLTextAreaElement, MarkdownInputProps>(
  ({ value, onChange, className, placeholder = 'Type your markdown here...', ...props }, ref) => {
    const [lineCount, setLineCount] = useState(1)
    const [isDragOver, setIsDragOver] = useState(false)

    // Calculate line count
    useEffect(() => {
      const lines = value.split('\n')
      setLineCount(Math.max(lines.length, 1))
    }, [value])

    // Generate line numbers
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)

    // Drag and drop handlers
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isDragOver) {
        setIsDragOver(true)
      }
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      // Only set drag over to false if we're actually leaving the drop zone
      if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return
      }
      setIsDragOver(false)
    }

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length === 0) return

      // Handle only the first file for now
      const file = files[0]

      // Check if it's a text/markdown file
      if (!file.type.startsWith('text/') && !file.name.match(/\.(md|txt|markdown)$/i)) {
        toast.warning('Only markdown and text files are supported for drag and drop')
        return
      }

      try {
        const text = await file.text()
        onChange(text)
        toast.success(`Successfully loaded ${file.name}`)
      } catch (error) {
        toast.error('Failed to read the file. Please try again.')
        console.error('Error reading file:', error)
      }
    }

    return (
      <div
        className={cn(
          'h-full w-full overflow-hidden rounded-lg border bg-card flex flex-col transition-all duration-200',
          isDragOver && 'ring-2 ring-accent border-accent bg-accent/5',
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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

          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-20 flex items-center justify-center drag-drop-overlay rounded-lg">
              <div className="text-center">
                <div className="drag-drop-text text-sm">Drop markdown file here</div>
                <div className="drag-drop-subtext mt-1">Markdown and text files supported</div>
              </div>
            </div>
          )}

          {/* Textarea */}
          <Textarea
            ref={ref}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={isDragOver ? 'Drop markdown file here...' : placeholder}
            className={cn(
              'h-full w-full resize-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4 pl-16',
              'markdown-textarea',
              'border-0 bg-transparent',
              'placeholder:text-muted-foreground/60',
              'scrollbar-json',
              'rounded-none',
              isDragOver && 'pointer-events-none'
            )}
            {...props}
          />
        </div>
      </div>
    )
  }
)

MarkdownInput.displayName = 'MarkdownInput'
