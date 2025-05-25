'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { DownloadIcon } from 'lucide-react'

interface FileDownloadButtonProps {
  markdownContent: string
  fileName?: string
}

export function FileDownloadButton({
  markdownContent,
  fileName = 'markdown-export.md',
}: FileDownloadButtonProps) {
  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={!markdownContent}>
      <DownloadIcon className="mr-2 size-4" />
      Download File
    </Button>
  )
}
