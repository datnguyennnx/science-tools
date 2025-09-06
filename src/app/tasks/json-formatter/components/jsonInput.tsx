import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  DragEvent,
} from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useJsonValidator } from '../engine/hooks/useJsonValidator'
import { useSyntaxHighlight } from '../engine/hooks/useSyntaxHighlight'
import { FormatOptions } from './formatOptions'
import { FormatOptions as FormatOptionsType } from '../engine/hooks/useJsonFormatter'

interface JsonInputProps {
  value: string
  onChange: (value: string) => void
  formatOptions: FormatOptionsType
  onFormatOptionsChange: (options: FormatOptionsType) => void
  className?: string
}

export interface JsonInputRef {
  focus: () => void
}

export const JsonInput = forwardRef<JsonInputRef, JsonInputProps>(
  ({ value, onChange, formatOptions, onFormatOptionsChange, className }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [lineCount, setLineCount] = useState(1)
    const [isDragOver, setIsDragOver] = useState(false)
    const { validateJson, groupErrorsByLine } = useJsonValidator()
    const { getErrorLineStyles } = useSyntaxHighlight()

    // Expose focus method to parent component
    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus()
      },
    }))

    // Calculate line count
    useEffect(() => {
      const lines = value.split('\n')
      setLineCount(Math.max(lines.length, 1))
    }, [value])

    // Validation results
    const validationResult = validateJson(value)
    const groupedErrors = groupErrorsByLine(value)

    // Generate line numbers
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl/Cmd + A: Select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        textareaRef.current?.select()
      }

      // Tab: Insert 2 spaces
      if (e.key === 'Tab') {
        e.preventDefault()
        const start = textareaRef.current?.selectionStart || 0
        const end = textareaRef.current?.selectionEnd || 0
        const newValue = value.substring(0, start) + '  ' + value.substring(end)
        onChange(newValue)

        // Set cursor position after the inserted spaces
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 2
            textareaRef.current.selectionEnd = start + 2
          }
        }, 0)
      }
    }

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

      // Check if it's a text/JSON file
      if (!file.type.includes('json') && !file.name.match(/\.(json)$/i)) {
        toast.warning('Only JSON files are supported for drag and drop')
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
        {/* Clean Header with Format Options */}
        <div className="flex-shrink-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium">Input JSON</span>
              <span className="font-medium">Lines: {lineCount.toLocaleString()}</span>
              {validationResult.errors.length > 0 && (
                <span className="font-medium text-red-600">
                  Errors: {validationResult.errors.length}
                </span>
              )}
            </div>

            <FormatOptions options={formatOptions} onChange={onFormatOptionsChange} />
          </div>
        </div>

        {/* Textarea Container */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {/* Line numbers */}
          <div className="absolute left-0 top-0 h-full w-12 overflow-hidden bg-muted/20 select-none z-10 rounded-l-lg">
            <div className="json-line-numbers pt-4">
              {lineNumbers.map(lineNum => (
                <div key={lineNum} className="json-line-number">
                  {lineNum}
                </div>
              ))}
            </div>
          </div>

          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-20 flex items-center justify-center drag-drop-overlay rounded-lg">
              <div className="text-center">
                <div className="drag-drop-text text-sm">Drop JSON file here</div>
                <div className="drag-drop-subtext mt-1">JSON and text files supported</div>
              </div>
            </div>
          )}

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isDragOver
                ? 'Drop JSON file here...'
                : 'Paste your JSON here or drag & drop a file...'
            }
            className={cn(
              'h-full w-full resize-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4 pl-16',
              'json-textarea',
              'border-0 bg-transparent',
              'placeholder:text-muted-foreground/60',
              'scrollbar-json',
              'rounded-none',
              isDragOver && 'pointer-events-none'
            )}
          />

          {/* Error line highlighting overlay (grouped by line) */}
          {validationResult.errors.length > 0 && (
            <div className="absolute left-12 top-0 h-full w-full pointer-events-none">
              {lineNumbers.map(lineNum => {
                const errorsAtLine = groupedErrors[lineNum]
                if (!errorsAtLine || errorsAtLine.length === 0) return null

                return (
                  <div
                    key={lineNum}
                    className="absolute w-full h-6"
                    style={{
                      top: `${(lineNum - 1) * 24 + 16}px`,
                      ...getErrorLineStyles(lineNum, lineNum),
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }
)

JsonInput.displayName = 'JsonInput'

export default JsonInput
