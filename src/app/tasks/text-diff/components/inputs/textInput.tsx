import { useRef, useState, useEffect, DragEvent } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { generateLineNumbers } from '../../engine/utils'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export function TextInput({
  value,
  onChange,
  placeholder = 'Enter text here...',
  label,
  className,
}: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [lineCount, setLineCount] = useState(1)
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    const lines = value.split('\n')
    setLineCount(Math.max(lines.length, 1))
  }, [value])

  const lineNumbers = generateLineNumbers(lineCount)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault()
      textareaRef.current?.select()
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const start = textareaRef.current?.selectionStart || 0
      const end = textareaRef.current?.selectionEnd || 0
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2
          textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

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

    // Check if it's a text file
    if (
      !file.type.startsWith('text/') &&
      !file.name.match(/\.(txt|md|js|ts|jsx|tsx|json|css|html|xml|yml|yaml)$/i)
    ) {
      toast.warning('Only text files are supported for drag and drop')
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
      {label && (
        <div className="flex-shrink-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">{label}</span>
            <span className="font-medium">Lines: {lineCount.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-12 overflow-hidden bg-muted/20 select-none z-10 rounded-l-lg">
          <div className="text-line-numbers pt-4">
            {lineNumbers.map(lineNum => (
              <div
                key={lineNum}
                className="text-line-number hover:text-muted-foreground transition-colors"
              >
                {lineNum}
              </div>
            ))}
          </div>
        </div>

        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-20 flex items-center justify-center drag-drop-overlay rounded-lg">
            <div className="text-center">
              <div className="drag-drop-text text-sm">Drop file here</div>
              <div className="drag-drop-subtext mt-1">Text files supported</div>
            </div>
          </div>
        )}

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isDragOver ? 'Drop file here...' : placeholder}
          className={cn(
            'h-full w-full resize-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4 pl-16',
            'text-textarea',
            'border-0 bg-transparent',
            'placeholder:text-muted-foreground/60',
            'scrollbar-text',
            'rounded-none',
            isDragOver && 'pointer-events-none'
          )}
        />
      </div>
    </div>
  )
}

export default TextInput
