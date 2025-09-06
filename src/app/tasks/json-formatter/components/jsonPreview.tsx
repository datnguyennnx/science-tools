import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useJsonFormatter, FormatOptions } from '../engine/hooks/useJsonFormatter'
import { useSyntaxHighlight, JsonToken } from '../engine/hooks/useSyntaxHighlight'
import { JsonError } from './jsonError'
import { Button } from '@/components/ui/button'
import { Copy, Check, Navigation } from 'lucide-react'
import { toast } from 'sonner'
import { useJsonValidator } from '../engine/hooks/useJsonValidator'

interface JsonPreviewProps {
  jsonInput: string
  formatOptions: FormatOptions
  className?: string
}

// Virtualized line renderer for large JSON files
function VirtualizedJsonRenderer({
  tokens,
  getTokenStyles,
  lineHeight = 24,
  visibleLines = 50,
}: {
  tokens: JsonToken[]
  getTokenStyles: (type: JsonToken['type']) => React.CSSProperties
  lineHeight?: number
  visibleLines?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  // Calculate visible range
  const startIndex = Math.floor(scrollTop / lineHeight)
  const endIndex = Math.min(startIndex + visibleLines, tokens.length)

  // Get visible tokens
  const visibleTokens = tokens.slice(startIndex, endIndex)

  // Calculate offset for positioning
  const offsetY = startIndex * lineHeight

  return (
    <div className="h-full overflow-auto scrollbar-json" onScroll={handleScroll}>
      <div style={{ height: tokens.length * lineHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleTokens.map((token, index) => (
            <span
              key={`${startIndex + index}-${token.type}-${token.value}`}
              style={getTokenStyles(token.type)}
              className="whitespace-pre"
            >
              {token.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function JsonPreview({ jsonInput, formatOptions, className }: JsonPreviewProps) {
  const { formatJson, getJsonSize, analyzeJson } = useJsonFormatter()
  const { tokenizeJson, getTokenStyles } = useSyntaxHighlight()
  const { groupErrorsByLine } = useJsonValidator()
  const [copied, setCopied] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(true)

  // Analyze JSON with comprehensive processing
  const jsonAnalysis = analyzeJson(jsonInput, formatOptions)

  // Format JSON with current options
  const formatResult = formatJson(jsonInput, formatOptions)

  // Get JSON size information
  const sizeInfo = getJsonSize(jsonInput)

  // Tokenize formatted JSON for syntax highlighting
  const tokens = formatResult.isValid ? tokenizeJson(formatResult.formatted) : []

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatResult.formatted)
      setCopied(true)
      toast('JSON copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Failed to copy to clipboard')
    }
  }

  // Render syntax highlighted JSON with virtualization for large files
  const renderHighlightedJson = () => {
    if (!formatResult.isValid || tokens.length === 0) {
      return null
    }

    const isLargeFile = jsonAnalysis.statistics.lineCount > 1000

    if (isLargeFile) {
      return (
        <div className="h-full">
          <div className="p-4 border-b bg-muted/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Navigation className="h-4 w-4" />
              <span>
                Large file detected ({jsonAnalysis.statistics.lineCount.toLocaleString()} lines)
              </span>
              <span>•</span>
              <span>Virtualized rendering enabled</span>
            </div>
          </div>
          <VirtualizedJsonRenderer
            tokens={tokens}
            getTokenStyles={getTokenStyles}
            visibleLines={100}
          />
        </div>
      )
    }

    if (showLineNumbers) {
      // Render with line numbers
      const lines = formatResult.formatted.split('\n')
      return (
        <div className="relative h-full">
          {/* Line numbers */}
          <div className="absolute left-0 top-0 h-full w-12 overflow-hidden bg-muted/20 select-none z-10 rounded-l-lg">
            <div className="json-line-numbers pt-4">
              {lines.map((line, index) => (
                <div key={`line-${index + 1}-${line.slice(0, 10)}`} className="json-line-number">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>

          {/* JSON content with line numbers */}
          <div className="json-textarea p-4 pl-16 overflow-auto scrollbar-json">
            {tokens.map(token => (
              <span
                key={`token-${token.type}-${token.start}-${token.end}-${token.line}-${token.column}`}
                style={getTokenStyles(token.type)}
                className="whitespace-pre"
              >
                {token.value}
              </span>
            ))}
          </div>
        </div>
      )
    }

    // Render without line numbers
    return (
      <div className="json-textarea p-4 overflow-auto scrollbar-json">
        {tokens.map(token => (
          <span
            key={`token-nl-${token.type}-${token.start}-${token.end}-${token.line}-${token.column}`}
            style={getTokenStyles(token.type)}
            className="whitespace-pre"
          >
            {token.value}
          </span>
        ))}
      </div>
    )
  }

  // Render grouped errors by line with actionable information
  const renderErrorDisplay = () => {
    if (!formatResult.isValid) {
      const grouped = groupErrorsByLine(jsonInput)
      const lineNumbers = Object.keys(grouped)
        .map(Number)
        .sort((a, b) => a - b)

      return (
        <div className="p-4 space-y-2">
          {lineNumbers.map(line => (
            <JsonError
              key={`err-${line}`}
              title={`Line ${line}`}
              message={grouped[line].map(e => e.message).join(' \u2022 ')}
              details={grouped[line]
                .map(e => (e.suggestion ? `Col ${e.column}: ${e.suggestion}` : `Col ${e.column}`))
                .join(' | ')}
              type="error"
            />
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div
      className={cn(
        'h-full w-full overflow-hidden rounded-lg border bg-card flex flex-col',
        className
      )}
    >
      {/* Clean Header with Copy Button and Controls */}
      <div className="flex-shrink-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-medium">Formatted Output</span>
            <span className="font-medium">Size: {sizeInfo.kilobytes.toFixed(2)} KB</span>
            <span className="font-medium">
              Lines: {jsonAnalysis.statistics.lineCount.toLocaleString()}
            </span>
            <span className="font-medium">
              Keys: {jsonAnalysis.statistics.keyCount.toLocaleString()}
            </span>
            {jsonAnalysis.statistics.lineCount > 1000 && (
              <span className="font-medium text-blue-600">⚡ Virtualized</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className="h-7 px-2 text-xs"
            >
              {showLineNumbers ? 'Hide' : 'Show'} Line Numbers
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2.5 text-xs"
              disabled={!formatResult.isValid}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content area - Full height */}
      <div className="flex-1 min-h-0 overflow-auto scrollbar-json">
        {!formatResult.isValid ? (
          renderErrorDisplay()
        ) : (
          <div className="relative h-full">{renderHighlightedJson()}</div>
        )}
      </div>
    </div>
  )
}
export default JsonPreview
