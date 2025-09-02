import React from 'react'
import { UnifiedViewProps } from '../../engine/types'
import { processForUnifiedView, filterDiffResults, getDiffStats } from '../../engine/utils'
import { CharHighlightRenderer } from '../displays'
import {
  useScrollToChange,
  renderEmptyState,
  getCurrentChangeHighlight,
} from '../../engine/utils/viewUtils'

export function UnifiedView({
  diffResults,
  showOnlyChanges,
  currentChangeIndex = 0,
  changedLines = [],
}: UnifiedViewProps) {
  const { scrollContainerRef, currentChangeRef } = useScrollToChange(currentChangeIndex)

  if (diffResults.length === 0) {
    return renderEmptyState()
  }

  const { results: processedResults } = processForUnifiedView(diffResults)
  const filteredResults = filterDiffResults(processedResults, showOnlyChanges)
  const currentChange = changedLines[currentChangeIndex]
  const currentLineNumber = currentChange?.result.lineNumber

  const stats = getDiffStats(filteredResults)

  return (
    <div className="h-full flex flex-col diff-bg-primary">
      <div className="flex items-center justify-between px-6 py-3 diff-bg-secondary border-b diff-border-light">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full diff-header-unified"></div>
            <span className="text-sm font-medium diff-text-primary">Unified Diff</span>
            <span className="text-xs diff-text-tertiary">{stats.changes} changes</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto" ref={scrollContainerRef}>
        <div className="min-h-full">
          {filteredResults.map((result, index) => {
            const isCurrentChange = showOnlyChanges
              ? index === currentChangeIndex
              : result.lineNumber === currentLineNumber

            return (
              <div
                key={`${result.type}-${result.lineNumber}-${result.value}`}
                ref={isCurrentChange ? currentChangeRef : undefined}
                className={`flex items-center min-h-[1.5rem] px-4 whitespace-pre-wrap font-mono text-sm leading-relaxed border-l-4 diff-line-hover ${
                  result.type === 'added'
                    ? 'diff-line-added'
                    : result.type === 'removed'
                      ? 'diff-line-removed'
                      : result.type === 'modified'
                        ? 'diff-line-modified'
                        : 'diff-line-unchanged'
                } ${getCurrentChangeHighlight(isCurrentChange)}`}
              >
                <span className="inline-block w-6 text-center mr-2 text-xs select-none diff-text-quaternary">
                  {result.type === 'added' ? '+' : result.type === 'removed' ? '−' : ''}
                </span>

                <span className="inline-block w-8 text-right mr-4 text-xs diff-text-quaternary select-none">
                  {result.lineNumber}
                </span>

                <span className="flex-1">
                  <CharHighlightRenderer
                    charChanges={result.charChanges || []}
                    fallbackText={result.value}
                  />
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default UnifiedView
