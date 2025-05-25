'use client'

import React, { useState, lazy, Suspense } from 'react'
import { FileUploadButton } from './components/fileUploadButton'
import { FileDownloadButton } from './components/fileDownloadButton'

// Lazy load components
const MarkdownInput = lazy(() => import('./components/markdownInput'))
const MarkdownPreview = lazy(() => import('./components/markdownPreview'))

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

export default function MarkdownPage() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)

  const handleFileUpload = (fileContent: string) => {
    setMarkdown(fileContent)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div className="flex items-center gap-2">
        <FileUploadButton onFileUpload={handleFileUpload} />
        <FileDownloadButton markdownContent={markdown} />
      </div>

      <div className="grid flex-grow grid-cols-1 xl:grid-cols-2 gap-4 w-full">
        <div className="flex w-full h-full flex-col">
          <Suspense fallback={null}>
            <MarkdownInput
              value={markdown}
              onChange={setMarkdown}
              className="h-full w-full border-2"
            />
          </Suspense>
        </div>

        <div className="flex w-full h-full flex-col">
          <Suspense fallback={null}>
            <MarkdownPreview markdown={markdown} className="h-full w-full border-2" />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
