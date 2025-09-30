import React, { useState, useEffect } from 'react'
import { MarkdownInput } from './MarkdownInput'
import { MarkdownPreview } from './MarkdownPreview'
import { FileUploadButton } from './FileUploadButton'
import { FileDownloadButton } from './FileDownloadButton'
import { FocusPreviewButton } from './FocusPreviewButton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MarkdownEditorProps } from '../engine/types'

const DEFAULT_MARKDOWN = `# Markdown Editor

This is a **markdown** preview with support for:

## KaTeX Math

\`\`\`katex
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
\\cdot
\\begin{pmatrix}
x \\\\
y
\\end{pmatrix}
=
\\begin{pmatrix}
ax + by \\\\
cx + dy
\\end{pmatrix}
\`\`\`

## Mermaid Diagrams

\`\`\`mermaid
graph TD
    A[Enter Chart Definition] --> B(Preview)
    B --> C{decide}
    C --> D[Keep]
    C --> E[Edit Definition]
    E --> B
    D --> F[Save Image and Code]
    F --> B
\`\`\`

\`\`\`mermaid
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-->>John: See you later!
\`\`\`

## Tables

| Name | Type | Description | Default |
|------|------|-------------|---------|
| id | string | Unique identifier | auto-generated |
| title | string | Display title | "" |
| isActive | boolean | Whether item is active | false |
| count | number | Number of items | 0 |
| tags | string[] | List of associated tags | [] |

## Code Highlighting

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("world"));
\`\`\`
`

export const MarkdownEditor = React.forwardRef<HTMLDivElement, MarkdownEditorProps>(
  ({ initialValue = DEFAULT_MARKDOWN, onChange, className, ...props }, ref) => {
    const [markdown, setMarkdown] = useState(initialValue)
    const [isFocusMode, setIsFocusMode] = useState(false)
    const [fontSize, setFontSize] = useState('16px')

    const handleMarkdownChange = (value: string) => {
      setMarkdown(value)
      onChange?.(value)
    }

    const handleFileUpload = (fileContent: string) => {
      handleMarkdownChange(fileContent)
    }

    const handleFontSizeChange = (value: string) => {
      setFontSize(value)
    }

    useEffect(() => {
      if (isFocusMode) {
        const handleEsc = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            setIsFocusMode(false)
          }
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
      }
    }, [isFocusMode])

    return (
      <div ref={ref} className={className} {...props}>
        <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
          <div className="flex items-center gap-2">
            <FileUploadButton onFileUpload={handleFileUpload} />
            <FileDownloadButton content={markdown} />
            <FocusPreviewButton onClick={() => setIsFocusMode(true)} />
          </div>

          <div className="grid flex-grow grid-cols-1 xl:grid-cols-2 gap-4 w-full">
            <div className="flex w-full h-full flex-col">
              <React.Suspense fallback={null}>
                <MarkdownInput
                  value={markdown}
                  onChange={handleMarkdownChange}
                  className="h-full w-full border-2"
                />
              </React.Suspense>
            </div>

            <div className="flex w-full h-full flex-col overflow-hidden">
              <React.Suspense fallback={null}>
                <MarkdownPreview content={markdown} className="h-full w-full border-2" />
              </React.Suspense>
            </div>
          </div>
        </div>

        {isFocusMode && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setIsFocusMode(false)}
          >
            <div
              className="relative max-w-[50%] max-h-[90vh] w-full h-full overflow-hidden rounded-lg border bg-background flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex gap-2 p-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="self-center font-medium">Font Size</div>
                <Select value={fontSize} onValueChange={handleFontSizeChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">12px</SelectItem>
                    <SelectItem value="14px">14px</SelectItem>
                    <SelectItem value="16px">16px</SelectItem>
                    <SelectItem value="18px">18px</SelectItem>
                    <SelectItem value="20px">20px</SelectItem>
                    <SelectItem value="22px">22px</SelectItem>
                    <SelectItem value="24px">24px</SelectItem>
                    <SelectItem value="28px">28px</SelectItem>
                    <SelectItem value="32px">32px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Markdown Preview */}
              <div className="flex-1 overflow-auto focus-mode-scroll">
                <MarkdownPreview
                  content={markdown}
                  fontSize={fontSize}
                  noOverflow={true}
                  className="h-full w-full p-4"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

MarkdownEditor.displayName = 'MarkdownEditor'
