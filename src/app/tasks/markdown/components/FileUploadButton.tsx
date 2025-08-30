import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { UploadIcon } from 'lucide-react'
import type { FileUploadProps } from '../engine/types'

export const FileUploadButton = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ onFileUpload, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        try {
          const text = await file.text()
          onFileUpload(text)
        } catch (error) {
          console.error('Failed to read file:', error)
        }
      }
      // Reset input value to allow selecting the same file again
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }

    return (
      <Button asChild variant="outline">
        <label htmlFor="file-upload" className="cursor-pointer">
          <UploadIcon className="mr-2 size-4" />
          Upload File
          <input
            ref={ref || inputRef}
            id="file-upload"
            type="file"
            accept=".md,.txt"
            className="sr-only"
            onChange={handleFileChange}
            {...props}
          />
        </label>
      </Button>
    )
  }
)

FileUploadButton.displayName = 'FileUploadButton'
