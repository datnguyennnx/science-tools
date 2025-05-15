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
import type { SortStats } from '../engine/types'
import { SortStatisticsDisplay } from './SortStatisticsDisplay'

// Re-add SupportedLanguages type
export type SupportedLanguages = 'c' | 'cpp' | 'python' | 'plaintext'

interface PseudoCodeDisplayProps {
  algorithmName?: string // Reverted prop
  pseudoCode?: string[] // Reverted prop
  activeLine?: number // 0-indexed
  language: SupportedLanguages // Now controlled by parent for Select
  onLanguageChange: (newLanguage: SupportedLanguages) => void // Callback for language change
  sortStats?: Readonly<SortStats> // Added prop for sort statistics
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
  sortStats, // Added prop
}: PseudoCodeDisplayProps): React.JSX.Element {
  const hasPseudoCode = pseudoCode && Array.isArray(pseudoCode) && pseudoCode.length > 0
  const hasStats = !!sortStats && Object.keys(sortStats).length > 0

  if (!hasPseudoCode && !hasStats) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Algorithm Details</CardTitle>
          <CardDescription>
            {algorithmName
              ? `Details for ${algorithmName}`
              : 'No algorithm selected or details available.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">
            {algorithmName
              ? 'Pseudo-code and statistics not available.'
              : 'Select an algorithm to view its details.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const codeString = hasPseudoCode ? pseudoCode.join('\n') : ''
  // Reverted highlighterLanguage logic
  const highlighterLanguage = language === 'plaintext' ? 'text' : language

  return (
    <Card>
      {/* Header for Pseudo Code Section */}
      {hasPseudoCode && (
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
      )}

      {/* Content Area for Pseudo Code */}
      {hasPseudoCode && (
        <CardContent className="text-sm no-scrollbar">
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
              const style: React.CSSProperties = {
                display: 'block',
                width: '100%',
                wordBreak: 'break-all',
                whiteSpace: 'pre-wrap',
              }
              // activeLine is 0-indexed, lineNumber is 1-indexed
              if (activeLine !== undefined && lineNumber === activeLine + 1) {
                const currentLineContent =
                  pseudoCode && activeLine >= 0 && activeLine < pseudoCode.length
                    ? pseudoCode[activeLine]
                    : ''
                const trimmedLine = currentLineContent.trim()

                // Regex to check for empty, whitespace-only, or common comment-only lines
                // Covers: empty, whitespace, //, #, ;
                const isIgnorableLine = /^\s*$|^\s*(\/\/|#|;).*$/.test(trimmedLine)

                if (!isIgnorableLine) {
                  style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                  style.fontWeight = 'bold'
                }
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
      )}

      {/* Performance Statistics Section */}
      {hasStats && (
        <>
          {!hasPseudoCode && (
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                {`Performance data for ${algorithmName || 'the selected algorithm'}`}
              </CardDescription>
            </CardHeader>
          )}
          <CardContent>
            <SortStatisticsDisplay stats={sortStats} />
          </CardContent>
        </>
      )}
    </Card>
  )
}
