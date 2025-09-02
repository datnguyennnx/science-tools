'use client'

import { useState, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UrlInputProps {
  onSubmit: (url: string) => void
  isLoading: boolean
  onClear: () => void
}

export function UrlInput({ onSubmit, isLoading, onClear }: UrlInputProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = () => {
    if (url.trim() && !isLoading) {
      onSubmit(url.trim())
    }
  }

  const handleClearInput = () => {
    setUrl('')
    onClear()
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="relative max-w-md mx-auto">
      <Input
        type="url"
        placeholder="Enter URL and press Enter..."
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyPress={handleKeyPress}
        className="h-12 text-lg pr-12"
        disabled={isLoading}
        autoFocus
      />
      <div className="absolute right-1 top-1 h-10 flex items-center">
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin text-muted-foreground" />
        ) : (
          url && (
            <Button size="sm" variant="ghost" onClick={handleClearInput} className="h-10 w-10 p-0">
              <X className="w-4 h-4" />
            </Button>
          )
        )}
      </div>
    </div>
  )
}
