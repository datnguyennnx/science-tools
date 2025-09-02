import React, { useRef, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
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

  React.useEffect(() => {
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

  return (
    <div
      className={cn(
        'h-full w-full overflow-hidden rounded-lg border bg-card flex flex-col',
        className
      )}
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

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'h-full w-full resize-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4 pl-16',
            'text-textarea',
            'border-0 bg-transparent',
            'placeholder:text-muted-foreground/60',
            'scrollbar-text',
            'rounded-none'
          )}
        />
      </div>
    </div>
  )
}

export default TextInput
