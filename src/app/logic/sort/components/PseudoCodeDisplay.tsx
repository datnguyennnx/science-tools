'use client'

import { lazy, memo, Suspense, CSSProperties, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ClipboardCopy } from 'lucide-react'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { SortStats } from '../engine/types'
import type {
  SortAlgorithm,
  PerformanceScenario,
  PseudoCodeLineMapping,
  PseudoCodeLanguageMap,
} from '../engine/algorithmRegistry'
import { SortStatisticsDisplay } from './SortStatisticsDisplay'

const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then(module => ({ default: module.Prism }))
)

export type SupportedLanguages = 'plaintext' | 'c' | 'cpp' | 'python'

// Define the processed pseudo-code line structure directly here
interface ProcessedPseudoCodeLine {
  id: number // Unique ID for the line (e.g., original line index)
  lineNumber: number // Display line number (1-indexed)
  code: string // The actual pseudo-code text
  indents: number // Number of indentations
}

const DEFAULT_INDENT_SIZE = 2 // Assume 2 spaces per indent level

interface PseudoCodeDisplayProps {
  algorithmData?: SortAlgorithm
  activeLines?: number[]
  initialLanguage?: SupportedLanguages
  sortStats?: Readonly<SortStats>
  performanceScenario: PerformanceScenario
  setPerformanceScenario: (scenario: PerformanceScenario) => void
}

const languageOptions: Array<{ value: SupportedLanguages; label: string }> = [
  { value: 'plaintext', label: 'Pseudo-code' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'python', label: 'Python' },
]

const performanceScenarioOptions: Array<{ value: PerformanceScenario; label: string }> = [
  { value: 'best', label: 'Best Case' },
  { value: 'average', label: 'Average Case' },
  { value: 'worst', label: 'Worst Case' },
]

const MemoizedPseudoCodeDisplay = memo(function PseudoCodeDisplay({
  algorithmData,
  activeLines,
  initialLanguage = 'plaintext',
  sortStats,
  performanceScenario,
  setPerformanceScenario,
}: PseudoCodeDisplayProps): React.JSX.Element {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguages>(initialLanguage)
  const [isCopied, setIsCopied] = useState(false)

  const rawPseudoCodeLines = algorithmData?.pseudoCode
  const languageExamples = algorithmData?.languageExamples
  const pseudoCodeMapping = algorithmData?.pseudoCodeMapping

  const processedPseudoCodeLines: ProcessedPseudoCodeLine[] = useMemo(() => {
    if (!rawPseudoCodeLines || rawPseudoCodeLines.length === 0) {
      return []
    }
    return rawPseudoCodeLines.map((line, index) => {
      let indents = 0
      let code = line
      const match = line.match(/^(\\s*)/)
      if (match) {
        const leadingSpaces = match[1].length
        indents = Math.floor(leadingSpaces / DEFAULT_INDENT_SIZE)
        code = line.substring(leadingSpaces)
      }
      return {
        id: index, // Use original index as ID
        lineNumber: index + 1,
        code: code,
        indents: indents,
      }
    })
  }, [rawPseudoCodeLines])

  const hasRawPseudoCode = useMemo(() => {
    return processedPseudoCodeLines.length > 0
  }, [processedPseudoCodeLines])

  const hasLanguageExamples =
    languageExamples && Object.values(languageExamples).some(arr => arr && arr.length > 0)

  const codeStringToDisplay = useMemo(() => {
    if (currentLanguage === 'plaintext') {
      return processedPseudoCodeLines.map(line => '  '.repeat(line.indents) + line.code).join('\n')
    }
    return (
      languageExamples?.[currentLanguage as Exclude<SupportedLanguages, 'plaintext'>]?.join('\n') ||
      ''
    )
  }, [currentLanguage, processedPseudoCodeLines, languageExamples])

  const actualDisplayLanguageForSyntaxHighlight = useMemo(() => {
    if (currentLanguage === 'plaintext') return 'text' // Using 'text' for pseudo-code with oneDark
    return currentLanguage
  }, [currentLanguage])

  const hasStats = !!sortStats && Object.keys(sortStats).length > 0
  const algorithmName = algorithmData?.name

  const activePseudoCodeLineIdsSet = useMemo(() => {
    return activeLines ? new Set(activeLines) : new Set<number>()
  }, [activeLines])

  const mappedActiveLangLinesSet = useMemo(() => {
    if (currentLanguage === 'plaintext' || !pseudoCodeMapping || !activeLines) {
      return new Set<number>()
    }
    const mappedLines = new Set<number>()
    activeLines.forEach(activePtId => {
      const lineMapping = pseudoCodeMapping as PseudoCodeLineMapping
      const langSpecificLines =
        lineMapping[activePtId]?.[currentLanguage as keyof PseudoCodeLanguageMap]
      if (langSpecificLines) {
        langSpecificLines.forEach(l => mappedLines.add(l))
      }
    })
    return mappedLines
  }, [currentLanguage, pseudoCodeMapping, activeLines])

  const scenarioPathLineIdsSet = useMemo(() => {
    if (
      !algorithmData?.performancePaths ||
      !performanceScenario ||
      performanceScenario === 'average'
    ) {
      return new Set<number>()
    }
    const pathLineIds = algorithmData.performancePaths[performanceScenario]
    return pathLineIds ? new Set(pathLineIds) : new Set<number>()
  }, [algorithmData, performanceScenario])

  const mappedScenarioPathLangLinesSet = useMemo(() => {
    if (
      currentLanguage === 'plaintext' ||
      !pseudoCodeMapping ||
      !algorithmData?.performancePaths ||
      !performanceScenario ||
      performanceScenario === 'average'
    ) {
      return new Set<number>()
    }

    const pathLineIds = algorithmData.performancePaths[performanceScenario]
    if (!pathLineIds) return new Set<number>()

    const mappedLines = new Set<number>()
    pathLineIds.forEach(ptId => {
      const lineMapping = pseudoCodeMapping as PseudoCodeLineMapping
      const langSpecificLines = lineMapping[ptId]?.[currentLanguage as keyof PseudoCodeLanguageMap]
      if (langSpecificLines) {
        langSpecificLines.forEach(l => mappedLines.add(l))
      }
    })
    return mappedLines
  }, [currentLanguage, pseudoCodeMapping, algorithmData, performanceScenario])

  const displayableLanguageOptions = useMemo(() => {
    return languageOptions.filter(opt => {
      if (opt.value === 'plaintext') return hasRawPseudoCode
      return (
        languageExamples &&
        languageExamples[opt.value as Exclude<SupportedLanguages, 'plaintext'>] &&
        languageExamples[opt.value as Exclude<SupportedLanguages, 'plaintext'>]!.length > 0
      )
    })
  }, [hasRawPseudoCode, languageExamples])

  if (!codeStringToDisplay && !hasStats) {
    // Simplified condition: if no code and no stats
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Algorithm Details</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">
            No details available for {algorithmName || 'the selected algorithm'}.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleCopy = async (): Promise<void> => {
    if (codeStringToDisplay) {
      try {
        await navigator.clipboard.writeText(codeStringToDisplay)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy text: ', err)
      }
    }
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {(hasRawPseudoCode || hasLanguageExamples) && (
        <CardHeader>
          <div className="flex flex-row justify-between items-center flex-wrap gap-2">
            <CardTitle>Algorithm Code</CardTitle>
            <div className="flex gap-2 flex-wrap items-center">
              {displayableLanguageOptions.length > 1 && (
                <Select
                  value={currentLanguage}
                  onValueChange={value => setCurrentLanguage(value as SupportedLanguages)}
                >
                  <SelectTrigger className="w-fit space-x-2 h-9">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayableLanguageOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select
                value={performanceScenario}
                onValueChange={value => setPerformanceScenario(value as PerformanceScenario)}
              >
                <SelectTrigger className="w-fit space-x-2 h-9">
                  <SelectValue placeholder="Scenario" />
                </SelectTrigger>
                <SelectContent>
                  {performanceScenarioOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {codeStringToDisplay.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleCopy} className="h-9 px-3">
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  {isCopied ? 'Copied!' : 'Copy'}
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            {`Logic for ${algorithmName || 'the selected algorithm'}${
              currentLanguage !== 'plaintext'
                ? ` (${languageOptions.find(l => l.value === currentLanguage)?.label || currentLanguage})`
                : ' (Pseudo-code)'
            }`}
            {` - Scenario: ${performanceScenarioOptions.find(s => s.value === performanceScenario)?.label || performanceScenario}`}
          </CardDescription>
        </CardHeader>
      )}

      {codeStringToDisplay.length > 0 && (
        <CardContent className="text-sm overflow-auto flex-grow no-scrollbar">
          <Suspense fallback={<div className="p-4 text-center">Loading code highlighter...</div>}>
            <SyntaxHighlighter
              language={actualDisplayLanguageForSyntaxHighlight}
              style={oneDark}
              showLineNumbers
              wrapLines={true}
              lineNumberStyle={
                {
                  minWidth: '3.5em',
                  paddingRight: '1em',
                  textAlign: 'right',
                  color: '#888',
                  userSelect: 'none',
                } as CSSProperties
              }
              lineProps={(lineNumber: number) => {
                const style: React.CSSProperties = {
                  display: 'block',
                  width: '100%',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }

                let isActiveLine = false
                let isScenarioPathLine = false

                if (currentLanguage === 'plaintext') {
                  const currentLineOriginalIndex = lineNumber - 1
                  isActiveLine = activePseudoCodeLineIdsSet.has(currentLineOriginalIndex)
                  isScenarioPathLine = scenarioPathLineIdsSet.has(currentLineOriginalIndex)
                } else {
                  isActiveLine = mappedActiveLangLinesSet.has(lineNumber)
                  isScenarioPathLine = mappedScenarioPathLangLinesSet.has(lineNumber)
                }

                if (isActiveLine && isScenarioPathLine) {
                  style.backgroundColor = 'var(--code-highlight-active-scenario-path)'
                } else if (isActiveLine) {
                  style.backgroundColor = 'var(--code-highlight-active)'
                } else if (isScenarioPathLine) {
                  style.backgroundColor = 'var(--code-highlight-scenario-path)'
                }
                return { style }
              }}
            >
              {codeStringToDisplay}
            </SyntaxHighlighter>
          </Suspense>
        </CardContent>
      )}

      {hasStats && (
        <CardContent className="border-t pt-4">
          <SortStatisticsDisplay stats={sortStats} />
        </CardContent>
      )}
    </Card>
  )
})

MemoizedPseudoCodeDisplay.displayName = 'PseudoCodeDisplay'
export { MemoizedPseudoCodeDisplay as PseudoCodeDisplay }
