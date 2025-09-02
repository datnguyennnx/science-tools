'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { FileUploadButton } from './components/fileUploadButton'
import { FileDownloadButton } from './components/fileDownloadButton'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
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

function getRandomJson(): string {
  const samples = [
    { id: 1, title: 'Todo', completed: false, tags: ['home', 'urgent'] },
    { user: { id: 42, name: 'Alice' }, roles: ['admin', 'editor'], active: true },
    [1, 2, 3, { nested: true, values: [null, false, 3.14] }],
    {
      products: [
        { sku: 'A1', price: 12.5 },
        { sku: 'B2', price: 7.0 },
      ],
      currency: 'USD',
    },
  ]
  const pick = samples[Math.floor(Math.random() * samples.length)]
  return JSON.stringify(pick, null, 2)
}

export default function JsonFormatterPage() {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON)
  const [formatOptions, setFormatOptions] = useState({
    indentSize: 2,
    compact: false,
    sortKeys: false,
    removeComments: true,
  })

  // Optimized event handlers with useCallback for better performance
  const handleFileUpload = useCallback((fileContent: string) => {
    setJsonInput(fileContent)
  }, [])

  const handleFormatOptionsChange = useCallback((newOptions: typeof formatOptions) => {
    setFormatOptions(newOptions)
  }, [])

  const handleRandom = useCallback(() => {
    setJsonInput(getRandomJson())
  }, [])

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
    <>
      {/* Add HowTo structured data for JSON formatting guide */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Format JSON Online',
            description:
              'Learn how to format, validate, and beautify JSON data with our online tool',
            totalTime: 'PT5M',
            supply: [
              {
                '@type': 'HowToSupply',
                name: 'JSON data',
              },
            ],
            tool: [
              {
                '@type': 'HowToTool',
                name: 'JSON Formatter Online Tool',
              },
            ],
            step: [
              {
                '@type': 'HowToStep',
                name: 'Paste or upload JSON',
                text: 'Paste your JSON data into the input editor or upload a JSON file',
                position: 1,
              },
              {
                '@type': 'HowToStep',
                name: 'Configure formatting options',
                text: 'Choose indentation size, enable key sorting, and select formatting preferences',
                position: 2,
              },
              {
                '@type': 'HowToStep',
                name: 'Format and validate',
                text: 'Click format to beautify your JSON or validate to check for errors',
                position: 3,
              },
              {
                '@type': 'HowToStep',
                name: 'Download results',
                text: 'Download the formatted JSON or copy it to your clipboard',
                position: 4,
              },
            ],
            mainEntity: {
              '@type': 'WebPage',
              url: 'https://data-science.hallucinationguys.com/tasks/json-formatter',
            },
          }),
        }}
      />

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
              onClick={handleRandom}
              aria-label="Generate random JSON sample"
              title="Generate a random JSON example"
            >
              <Sparkles className="mr-1.5 h-3 w-3" aria-hidden="true" />
              Random JSON
            </Button>
            <FileUploadButton onFileUpload={handleFileUpload} />
            <FileDownloadButton jsonContent={jsonInput} />
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
                value={jsonInput}
                onChange={setJsonInput}
                formatOptions={formatOptions}
                onFormatOptionsChange={handleFormatOptionsChange}
                className="h-full w-full"
              />
            </div>
          </section>

          {/* Preview Panel - Enhanced with semantic HTML */}
          <section
            className="flex flex-col h-full min-h-0"
            aria-labelledby="preview-section-heading"
          >
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
      </main>
    </>
  )
}
