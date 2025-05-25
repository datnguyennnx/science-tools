'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { UploadIcon } from 'lucide-react'

interface FileUploadButtonProps {
  onFileUpload: (fileContent: string) => void
}

export function FileUploadButton({ onFileUpload }: FileUploadButtonProps) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const text = await file.text()
      onFileUpload(text)
    }
  }

  return (
    <Button asChild variant="outline">
      <label htmlFor="file-upload" className="cursor-pointer">
        <UploadIcon className="mr-2 size-4" />
        Upload File
        <input
          id="file-upload"
          type="file"
          accept=".md,.txt"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>
    </Button>
  )
}
