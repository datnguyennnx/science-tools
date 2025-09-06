import { SplitViewProps } from '../../engine/types'
import { processForSplitView, filterDiffResults } from '../../engine/utils'
import { CharHighlightRenderer } from '../displays'
import { useSynchronizedScroll, renderEmptyState } from '../../engine/utils/viewUtils'

export function SplitView({ diffResults, showOnlyChanges }: SplitViewProps) {
  const { leftScrollRef, rightScrollRef } = useSynchronizedScroll()

  if (diffResults.length === 0) {
    return renderEmptyState()
  }

  const filteredResults = filterDiffResults(diffResults, showOnlyChanges)
  const { lineMap, lineNumbers } = processForSplitView(filteredResults)

  return (
    <div className="h-full flex flex-col diff-bg-primary">
      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col w-1/2 min-h-0 border-r diff-border-light">
          <div className="flex-1 min-h-0 overflow-auto" ref={leftScrollRef}>
            <div className="min-h-full">
              {lineNumbers.map((displayLineNum: number) => {
                const lineData = lineMap[displayLineNum]
                const original = lineData.original

                if (!original) {
                  return (
                    <div
                      key={`orig-${displayLineNum}`}
                      className="flex items-center min-h-[1.5rem] px-4 border-l-2 diff-border-transparent diff-line-hover"
                    >
                      <span className="inline-block w-12 text-right mr-4 text-xs diff-text-quaternary select-none">
                        {displayLineNum}
                      </span>
                      <div className="flex-1 text-gray-400 text-xs italic">• • •</div>
                    </div>
                  )
                }

                const lineClass = `flex items-center min-h-[1.5rem] px-4 whitespace-pre-wrap font-mono text-sm leading-relaxed diff-line-hover ${
                  original.type === 'removed'
                    ? 'diff-line-removed bg-red-50 dark:bg-red-950/20'
                    : 'diff-line-unchanged'
                }`

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

                if (!modified) {
                  return (
                    <div
                      key={`mod-${displayLineNum}`}
                      className="flex items-center min-h-[1.5rem] px-4 border-l-2 diff-border-transparent diff-line-hover"
                    >
                      <span className="inline-block w-12 text-right mr-4 text-xs diff-text-quaternary select-none">
                        {displayLineNum}
                      </span>
                      <div className="flex-1 text-gray-400 text-xs italic">• • •</div>
                    </div>
                  )
                }

                const lineClass = `flex items-center min-h-[1.5rem] px-4 whitespace-pre-wrap font-mono text-sm leading-relaxed diff-line-hover ${
                  modified.type === 'added'
                    ? 'diff-line-added bg-green-50 dark:bg-green-950/20'
                    : modified.type === 'modified'
                      ? 'diff-line-modified bg-yellow-50 dark:bg-yellow-950/20'
                      : 'diff-line-unchanged'
                }`

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
