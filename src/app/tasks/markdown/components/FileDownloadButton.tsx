import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DownloadIcon } from 'lucide-react'
import { downloadFile } from '../engine/markdownHelpers'
import type { FileDownloadProps } from '../engine/types'

export const FileDownloadButton = React.forwardRef<HTMLButtonElement, FileDownloadProps>(
  ({ content, filename = 'document.md', ...props }, ref) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [customFilename, setCustomFilename] = useState(filename)

    const handleDownload = () => {
      downloadFile(content, customFilename)
      setIsDialogOpen(false)
    }

    const handleOpenDialog = () => {
      setCustomFilename(filename) // Reset to default filename when opening
      setIsDialogOpen(true)
    }

    return (
      <>
        <Button ref={ref} variant="outline" onClick={handleOpenDialog} {...props}>
          <DownloadIcon className="mr-2 size-4" />
          Download
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Download File</DialogTitle>
              <DialogDescription>
                Choose a filename for your markdown file. The file will be downloaded as a .md file.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="filename" className="text-right">
                  Filename
                </Label>
                <Input
                  id="filename"
                  value={customFilename}
                  onChange={e => setCustomFilename(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter filename"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleDownload()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDownload} disabled={!customFilename.trim()}>
                <DownloadIcon className="mr-2 size-4" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }
)

FileDownloadButton.displayName = 'FileDownloadButton'
