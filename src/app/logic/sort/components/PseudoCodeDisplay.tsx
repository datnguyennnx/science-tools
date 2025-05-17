'use client'

import { lazy, memo, Suspense, CSSProperties, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { SortStats } from '../engine/types'
import type { SortAlgorithm } from '../engine/algorithmRegistry'
import { SortStatisticsDisplay } from './SortStatisticsDisplay'

const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then(module => ({ default: module.Prism }))
)

export type SupportedLanguages = 'c' | 'cpp' | 'python' | 'plaintext'

interface PseudoCodeDisplayProps {
  algorithmData?: SortAlgorithm
  activeLines?: number[]
  language: SupportedLanguages
  onLanguageChange: (newLanguage: SupportedLanguages) => void
  sortStats?: Readonly<SortStats>
}

const languageOptions: Array<{ value: SupportedLanguages; label: string }> = [
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'python', label: 'Python' },
  { value: 'plaintext', label: 'Plain Text' },
]

const MemoizedPseudoCodeDisplay = memo(function PseudoCodeDisplay({
  algorithmData,
  activeLines,
  language,
  onLanguageChange,
  sortStats,
}: PseudoCodeDisplayProps): React.JSX.Element {
  const currentPseudoCodeLines = algorithmData?.pseudoCodes?.[language]
  const hasPseudoCode =
    currentPseudoCodeLines &&
    Array.isArray(currentPseudoCodeLines) &&
    currentPseudoCodeLines.length > 0
  const hasStats = !!sortStats && Object.keys(sortStats).length > 0
  const algorithmName = algorithmData?.name

  const preprocessedMapping = useMemo(() => {
    if (
      !algorithmData?.pseudoCodeMapping ||
      language === 'plaintext' ||
      !algorithmData.pseudoCodeMapping
    ) {
      return null
    }

    const mapping = algorithmData.pseudoCodeMapping
    const directMap = new Map<number, number[]>()

    for (const ptLineStr in mapping) {
      const ptLine = parseInt(ptLineStr, 10) // ptLine is 0-indexed key from pseudoCodeMapping
      const langSpecificLines1Indexed =
        mapping[ptLine]?.[language as Exclude<SupportedLanguages, 'plaintext'>]
      if (langSpecificLines1Indexed) {
        directMap.set(
          ptLine,
          langSpecificLines1Indexed.map(l => l - 1) // Convert 1-indexed to 0-indexed here
        )
      }
    }
    return directMap
  }, [algorithmData, language])

  const languageSpecificActiveLinesSet = useMemo(() => {
    if (!activeLines || activeLines.length === 0) {
      return new Set<number>()
    }

    if (language === 'plaintext') {
      // Assuming activeLines from engine are 0-indexed and directly map to plaintext lines.
      // The SyntaxHighlighter component expects 0-indexed lines in this Set for highlighting.
      return new Set(activeLines)
    }

    if (!preprocessedMapping || !algorithmData?.pseudoCodeMapping) {
      return new Set<number>()
    }

    const lines = new Set<number>()
    activeLines.forEach(ptLine => {
      // ptLine from activeLines is 0-indexed from the engine.
      const mappedLines = preprocessedMapping.get(ptLine)
      if (mappedLines) {
        mappedLines.forEach(l => lines.add(l))
      }
    })
    return lines
  }, [activeLines, language, preprocessedMapping, algorithmData?.pseudoCodeMapping])

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

  const codeString = hasPseudoCode ? currentPseudoCodeLines.join('\n') : ''
  const highlighterLanguage = language === 'plaintext' ? 'text' : language

  return (
    <Card>
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

      {hasPseudoCode && (
        <CardContent className="text-sm no-scrollbar">
          <Suspense fallback={<div className="p-4 text-center">Loading code highlighter...</div>}>
            <SyntaxHighlighter
              language={highlighterLanguage}
              style={oneDark}
              showLineNumbers
              wrapLines={true}
              lineNumberStyle={
                {
                  minWidth: '3em',
                  textAlign: 'right',
                  color: '#777',
                } as CSSProperties
              }
              lineProps={(lineNumber: number) => {
                const style: React.CSSProperties = {
                  display: 'block',
                  width: '100%',
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-wrap',
                }

                // lineNumber is 1-indexed from SyntaxHighlighter
                const lineIndexZeroBased = lineNumber - 1

                if (languageSpecificActiveLinesSet.size > 0 && currentPseudoCodeLines) {
                  const actualLineContent = currentPseudoCodeLines[lineIndexZeroBased] ?? ''
                  const trimmedLine = actualLineContent.trim()
                  // Common comment patterns: //, #, ; (assembly), /* ... */, <!-- ... -->
                  // Regex simplified for common single-line comments in typical pseudo-code languages
                  const isIgnorableLine = /^\s*($|(\/\/|#|;|\/\*|\*\/|<!--|-->|--)).*$/.test(
                    trimmedLine
                  )

                  if (languageSpecificActiveLinesSet.has(lineIndexZeroBased) && !isIgnorableLine) {
                    style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                    style.fontWeight = 'bold'
                  }
                }
                return { style }
              }}
              customStyle={
                {
                  margin: 0,
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--syntax-bg, #282c34)',
                  fontSize: '0.75rem',
                  lineHeight: '1.75',
                } as CSSProperties
              }
              codeTagProps={{
                style: {
                  fontFamily: 'var(--font-mono)',
                } as CSSProperties,
              }}
            >
              {codeString}
            </SyntaxHighlighter>
          </Suspense>
        </CardContent>
      )}

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
})

export { MemoizedPseudoCodeDisplay as PseudoCodeDisplay }
