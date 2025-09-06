import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DownloadIcon, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileDownloadButtonProps {
  jsonContent: string
  fileName?: string
}

export function FileDownloadButton({
  jsonContent,
  fileName = 'formatted-json.json',
}: FileDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const handleDownload = async () => {
    if (!jsonContent.trim()) {
      return
    }

    try {
      setIsDownloading(true)

      // Try to parse and format the JSON for download
      const parsed = JSON.parse(jsonContent)
      const formatted = JSON.stringify(parsed, null, 2)

      const blob = new Blob([formatted], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Show success feedback
      setDownloadSuccess(true)

      // Reset success state after 2 seconds
      setTimeout(() => setDownloadSuccess(false), 2000)
    } catch (error) {
      console.error('Error formatting JSON for download:', error)

      // Download the raw content if parsing fails
      const blob = new Blob([jsonContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName.replace('.json', '.txt')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={!jsonContent.trim() || isDownloading}
      className={cn(
        'transition-all duration-200 h-8 px-3',
        downloadSuccess && 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
        isDownloading && 'opacity-75 cursor-not-allowed'
      )}
    >
      {isDownloading ? (
        <>
          <div className="mr-1.5 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Downloading...
        </>
      ) : downloadSuccess ? (
        <>
          <CheckCircle2 className="mr-1.5 size-4" />
          Downloaded!
        </>
      ) : (
        <>
          <DownloadIcon className="mr-1.5 size-4" />
          Download
        </>
      )}
    </Button>
  )
}
