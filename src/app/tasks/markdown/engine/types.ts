import React from 'react'

export interface MarkdownEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
  className?: string
}

export interface MarkdownPreviewProps {
  content: string
  className?: string
}

export interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean
  className?: string
  children?: React.ReactNode
  node?: Record<string, unknown> | Element
}

export interface FileUploadProps {
  onFileUpload: (content: string) => void
}

export interface FileDownloadProps {
  content: string
  filename?: string
}

export interface MermaidConfig {
  theme: 'default' | 'dark' | 'base' | 'neutral' | 'forest' | 'null'
  securityLevel: 'loose' | 'strict' | 'antiscript'
  fontFamily: string
}

export interface MarkdownErrorProps {
  title: string
  message: string
  details?: string
  className?: string
}

export interface KaTeXResult {
  isKaTeX: boolean
  content: string
}
