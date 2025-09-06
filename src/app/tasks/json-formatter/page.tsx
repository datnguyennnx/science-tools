'use client'

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { FileUploadButton } from './components/fileUploadButton'
import { FileDownloadButton } from './components/fileDownloadButton'
import { AIPromptModal } from '@/components/aiPromptModal'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { useAIGeneratedJson } from './engine/hooks'
import './styles.css'

// Dynamic imports with SSR disabled for better performance and SEO
const JsonInput = dynamic(() => import('./components/jsonInput'), {
  loading: () => null,
  ssr: false,
})

const JsonPreview = dynamic(() => import('./components/jsonPreview'), {
  loading: () => null,
  ssr: false,
})

const DEFAULT_JSON = `{
  "name": "John Doe",
  "age": 30,
  "isActive": true,
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "zipCode": "12345"
  },
  "hobbies": [
    "reading",
    "swimming",
    "coding"
  ],
  "metadata": {
    "createdAt": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "tags": ["user", "active"]
  }
}`

export default function JsonFormatterPage() {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON)
  const [formatOptions, setFormatOptions] = useState({
    indentSize: 2,
    compact: false,
    sortKeys: false,
    removeComments: true,
  })
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)

  // AI-powered JSON generation
  const { generateJsonFromPrompt, isGenerating, error } = useAIGeneratedJson(result => {
    setJsonInput(result.json)
    // Focus on the JsonInput component after generation
    setTimeout(() => {
      jsonInputRef.current?.focus()
    }, 100)
  })

  const jsonInputRef = useRef<{ focus: () => void }>(null)

  // Event handlers
  const handleFileUpload = (fileContent: string) => {
    setJsonInput(fileContent)
  }

  const handleFormatOptionsChange = (newOptions: typeof formatOptions) => {
    setFormatOptions(newOptions)
  }

  const handleOpenAIModal = () => {
    setIsAIModalOpen(true)
  }

  const handleGenerateFromPrompt = (prompt: string, model: string, provider?: string) => {
    generateJsonFromPrompt(
      prompt,
      model,
      (provider as 'openai' | 'anthropic' | 'google' | 'x-grok' | 'openrouter') || 'openrouter'
    )
  }

  // Add keyboard navigation support
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus management for accessibility
      if (event.key === 'Escape') {
        containerRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <main
      ref={containerRef}
      className="flex h-[calc(100vh-8rem)] flex-col focus:outline-none"
      role="main"
      aria-label="JSON Formatter and Validator Tool"
      tabIndex={-1}
    >
      {/* Enhanced Header with better accessibility */}
      <header
        className="flex items-center justify-between p-4 pb-3 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/30"
        role="banner"
        aria-label="JSON Formatter Toolbar"
      >
        <nav
          className="flex items-center gap-2"
          role="navigation"
          aria-label="JSON Formatter Actions"
        >
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            onClick={handleOpenAIModal}
            disabled={isGenerating}
            aria-label="Generate JSON using AI"
            title="Generate JSON using AI"
          >
            {isGenerating ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="mr-1.5 h-3 w-3" aria-hidden="true" />
            )}
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>

          <FileUploadButton onFileUpload={handleFileUpload} />
          <FileDownloadButton jsonContent={jsonInput} />

          {/* Error display for AI generation */}
          {error && (
            <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border">
              AI Error: {error}
            </div>
          )}
        </nav>
      </header>

      {/* Main Content - Enhanced semantic structure */}
      <div
        className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 pt-3 min-h-0"
        role="region"
        aria-label="JSON Editor and Preview Workspace"
      >
        {/* Input Panel - Enhanced with semantic HTML */}
        <section className="flex flex-col h-full min-h-0" aria-labelledby="input-section-heading">
          <h2 id="input-section-heading" className="sr-only">
            JSON Input Editor
          </h2>
          <div className="flex-1 min-h-0">
            <JsonInput
              ref={jsonInputRef}
              value={jsonInput}
              onChange={setJsonInput}
              formatOptions={formatOptions}
              onFormatOptionsChange={handleFormatOptionsChange}
              className="h-full w-full"
            />
          </div>
        </section>

        {/* Preview Panel - Enhanced with semantic HTML */}
        <section className="flex flex-col h-full min-h-0" aria-labelledby="preview-section-heading">
          <h2 id="preview-section-heading" className="sr-only">
            JSON Output Preview
          </h2>
          <div className="flex-1 min-h-0">
            <JsonPreview
              jsonInput={jsonInput}
              formatOptions={formatOptions}
              className="h-full w-full"
            />
          </div>
        </section>
      </div>

      {/* AI Prompt Modal */}
      <AIPromptModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerate={handleGenerateFromPrompt}
      />
    </main>
  )
}
