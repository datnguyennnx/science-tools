import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UploadIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FileUploadButtonProps {
  onFileUpload: (fileContent: string) => void
}

export function FileUploadButton({ onFileUpload }: FileUploadButtonProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const processFile = async (file: File) => {
    try {
      setIsUploading(true)

      // Validate file type
      if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
        toast.error('Please select a .json or .txt file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      const text = await file.text()

      // Basic JSON validation
      try {
        JSON.parse(text)
        onFileUpload(text)
        toast.success(`Loaded ${file.name}`)
      } catch {
        toast.error('Invalid JSON file')
      }
    } catch (error) {
      toast.error('Error reading file')
      console.error('Error reading file:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)

    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      await processFile(file)
    }
  }

  return (
    <Button
      asChild
      variant={isDragOver ? 'default' : 'outline'}
      size="sm"
      className={cn(
        'relative transition-all duration-200 h-8 px-3',
        isDragOver && 'scale-105 shadow-lg',
        isUploading && 'opacity-75 cursor-not-allowed'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      disabled={isUploading}
    >
      <label htmlFor="json-file-upload" className="cursor-pointer">
        <UploadIcon className="mr-1.5 size-4" />
        {isUploading ? 'Uploading...' : 'Upload JSON'}
        <input
          id="json-file-upload"
          type="file"
          accept=".json,.txt"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>
    </Button>
  )
}
