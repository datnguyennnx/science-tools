'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Re-add SupportedLanguages type
export type SupportedLanguages = 'c' | 'cpp' | 'python' | 'plaintext'

interface PseudoCodeDisplayProps {
  algorithmName?: string // Reverted prop
  pseudoCode?: string[] // Reverted prop
  activeLine?: number // 0-indexed
  language: SupportedLanguages // Now controlled by parent for Select
  onLanguageChange: (newLanguage: SupportedLanguages) => void // Callback for language change
}

const languageOptions: Array<{ value: SupportedLanguages; label: string }> = [
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'python', label: 'Python' },
  { value: 'plaintext', label: 'Plain Text' },
]

export function PseudoCodeDisplay({
  algorithmName,
  pseudoCode,
  activeLine,
  language, // Removed default, parent controls this
  onLanguageChange,
}: PseudoCodeDisplayProps): React.JSX.Element {
  if (!pseudoCode || !Array.isArray(pseudoCode) || pseudoCode.length === 0) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardHeader>
          <CardTitle>Algorithm Pseudo-code</CardTitle> {/* Reverted Title */}
          <CardDescription>
            {algorithmName
              ? `Pseudo-code for ${algorithmName}`
              : 'No algorithm selected or pseudo-code available.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">
            {algorithmName
              ? 'Pseudo-code not available for this algorithm.'
              : 'Select an algorithm to view its pseudo-code.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const codeString = pseudoCode.join('\n')
  // Reverted highlighterLanguage logic
  const highlighterLanguage = language === 'plaintext' ? 'text' : language

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <CardTitle>Algorithm Pseudo-code</CardTitle>
          <Select
            value={language}
            onValueChange={value => onLanguageChange(value as SupportedLanguages)}
          >
            <SelectTrigger className="w-fit space-x-2">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          {`Step-by-step logic for ${algorithmName || 'the selected algorithm'}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto text-sm no-scrollbar">
        <SyntaxHighlighter
          language={highlighterLanguage}
          style={oneDark}
          showLineNumbers
          wrapLines={true}
          lineNumberStyle={{
            minWidth: '3.25em',
            paddingRight: '1em',
            textAlign: 'right',
            color: '#777',
          }}
          lineProps={lineNumber => {
            const style: React.CSSProperties = { display: 'block', width: '100%' }
            if (activeLine !== undefined && lineNumber === activeLine + 1) {
              style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              style.fontWeight = 'bold'
            }
            return { style }
          }}
          customStyle={{
            margin: 0,
            padding: '1rem',
            borderRadius: '0.375rem',
            backgroundColor: 'var(--syntax-bg, #282c34)',
            fontSize: '0.75rem',
            lineHeight: '1.625',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-mono)',
            },
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </CardContent>
    </Card>
  )
}
