import React, { memo } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface MarkdownInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export const MarkdownInput = memo(function MarkdownInput({
  value,
  onChange,
  className,
}: MarkdownInputProps) {
  return (
    <Textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Type your markdown here..."
      className={cn(
        'h-full w-full resize-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4',
        className
      )}
    />
  )
})

// Also export as default for dynamic import
export default MarkdownInput
