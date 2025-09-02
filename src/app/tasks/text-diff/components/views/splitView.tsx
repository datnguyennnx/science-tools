import React from 'react'
import { SplitViewProps } from '../../engine/types'
import { SECTION_LABELS } from '../../engine/constants'
import { processForSplitView, filterDiffResults } from '../../engine/utils'
import { CharHighlightRenderer } from '../displays'
import {
  useSynchronizedScroll,
  renderEmptyState,
  getCurrentChangeHighlight,
  ChangeNavigationData,
} from '../../engine/utils/viewUtils'

export function SplitView({
  diffResults,
  showOnlyChanges,
  currentChangeIndex = 0,
  changedLines = [],
}: SplitViewProps) {
  const { leftScrollRef, rightScrollRef } = useSynchronizedScroll()

  if (diffResults.length === 0) {
    return renderEmptyState()
  }

  const filteredResults = filterDiffResults(diffResults, showOnlyChanges)
  const { lineMap, lineNumbers, lineStats } = processForSplitView(filteredResults)

  const currentChange = changedLines[currentChangeIndex]
  const currentLineNumber = currentChange?.result.lineNumber

  return (
    <div className="h-full flex flex-col diff-bg-primary">
      <div className="flex items-center justify-between px-6 py-3 diff-bg-secondary border-b diff-border-light">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full diff-header-original"></div>
            <span className="text-sm font-medium diff-text-primary">{SECTION_LABELS.original}</span>
            <span className="text-xs diff-text-tertiary">{lineStats.originalLines} lines</span>
          </div>
          <div className="w-px h-4 diff-separator"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full diff-header-modified"></div>
            <span className="text-sm font-medium diff-text-primary">{SECTION_LABELS.modified}</span>
            <span className="text-xs diff-text-tertiary">{lineStats.modifiedLines} lines</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col w-1/2 min-h-0 border-r diff-border-light">
          <div className="flex-1 min-h-0 overflow-auto" ref={leftScrollRef}>
            <div className="min-h-full">
              {lineNumbers.map((displayLineNum: number) => {
                const lineData = lineMap[displayLineNum]
                const original = lineData.original

                const isCurrentChange = showOnlyChanges
                  ? Boolean(
                      (original &&
                        changedLines.findIndex(
                          (change: ChangeNavigationData) =>
                            change.result.lineNumber === original.lineNumber
                        ) === currentChangeIndex) ||
                        (lineData.modified &&
                          changedLines.findIndex(
                            (change: ChangeNavigationData) =>
                              change.result.lineNumber === lineData.modified!.lineNumber
                          ) === currentChangeIndex)
                    )
                  : displayLineNum === currentLineNumber

                if (!original) {
                  return (
                    <div
                      key={`orig-${displayLineNum}`}
                      className={`flex items-center min-h-[1.5rem] px-4 border-l-2 diff-border-transparent diff-line-hover ${getCurrentChangeHighlight(isCurrentChange)}`}
                    >
                      <span className="inline-block w-12 text-right mr-4 text-xs diff-text-quaternary select-none">
                        {displayLineNum}
                      </span>
                      <div className="flex-1 h-px diff-empty-line"></div>
                    </div>
                  )
                }

                const lineClass = `flex items-center min-h-[1.5rem] px-4 whitespace-pre-wrap font-mono text-sm leading-relaxed border-l-4 diff-line-hover ${
                  original.type === 'removed' ? 'diff-line-removed' : 'diff-line-unchanged'
                } ${getCurrentChangeHighlight(isCurrentChange)}`

                return (
                  <div key={`orig-${displayLineNum}`} className={lineClass}>
                    <span className="inline-block w-12 text-right mr-4 text-xs diff-text-quaternary select-none">
                      {original.lineNumber}
                    </span>
                    <span className="flex-1">
                      <CharHighlightRenderer
                        charChanges={original.charChanges || []}
                        fallbackText={original.value}
                      />
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col w-1/2 min-h-0">
          <div className="flex-1 min-h-0 overflow-auto" ref={rightScrollRef}>
            <div className="min-h-full">
              {lineNumbers.map((displayLineNum: number) => {
                const lineData = lineMap[displayLineNum]
                const modified = lineData.modified

                const isCurrentChange = showOnlyChanges
                  ? Boolean(
                      (modified &&
                        changedLines.findIndex(
                          (change: ChangeNavigationData) =>
                            change.result.lineNumber === modified.lineNumber
                        ) === currentChangeIndex) ||
                        (lineData.original &&
                          changedLines.findIndex(
                            (change: ChangeNavigationData) =>
                              change.result.lineNumber === lineData.original!.lineNumber
                          ) === currentChangeIndex)
                    )
                  : displayLineNum === currentLineNumber

                if (!modified) {
                  return (
                    <div
                      key={`mod-${displayLineNum}`}
                      className={`flex items-center min-h-[1.5rem] px-4 border-l-2 diff-border-transparent diff-line-hover ${getCurrentChangeHighlight(isCurrentChange)}`}
                    >
                      <span className="inline-block w-12 text-right mr-4 text-xs diff-text-quaternary select-none">
                        {displayLineNum}
                      </span>
                      <div className="flex-1 h-px diff-empty-line"></div>
                    </div>
                  )
                }

                const lineClass = `flex items-center min-h-[1.5rem] px-4 whitespace-pre-wrap font-mono text-sm leading-relaxed border-l-4 diff-line-hover ${
                  modified.type === 'added'
                    ? 'diff-line-added'
                    : modified.type === 'modified'
                      ? 'diff-line-modified'
                      : 'diff-line-unchanged'
                } ${getCurrentChangeHighlight(isCurrentChange)}`

                return (
                  <div key={`mod-${displayLineNum}`} className={lineClass}>
                    <span className="inline-block w-12 text-right mr-4 text-xs diff-text-quaternary select-none">
                      {modified.lineNumber}
                    </span>
                    <span className="flex-1">
                      <CharHighlightRenderer
                        charChanges={modified.charChanges || []}
                        fallbackText={modified.value}
                      />
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
