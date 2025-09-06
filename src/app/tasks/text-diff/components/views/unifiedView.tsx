import { UnifiedViewProps } from '../../engine/types'
import { processForUnifiedView } from '../../engine/utils'
import { CharHighlightRenderer } from '../displays'
import { renderEmptyState } from '../../engine/utils/viewUtils'

export function UnifiedView({ diffResults }: UnifiedViewProps) {
  if (diffResults.length === 0) {
    return renderEmptyState()
  }

  const { results: processedResults } = processForUnifiedView(diffResults)

  return (
    <div className="h-full flex flex-col diff-bg-primary">
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="min-h-full">
          {processedResults.map(result => (
            <div
              key={`${result.type}-${result.lineNumber}-${result.value}`}
              className={`flex items-center min-h-[1.5rem] px-4 whitespace-pre-wrap font-mono text-sm leading-relaxed border-l-4 diff-line-hover ${
                result.value === '---'
                  ? 'diff-line-separator'
                  : result.type === 'added'
                    ? 'diff-line-added'
                    : result.type === 'removed'
                      ? 'diff-line-removed'
                      : result.type === 'modified'
                        ? 'diff-line-modified'
                        : 'diff-line-unchanged'
              }`}
            >
              <span className="inline-block w-6 text-center mr-2 text-xs select-none diff-text-quaternary">
                {result.value === '---'
                  ? '⋯'
                  : result.type === 'added'
                    ? '+'
                    : result.type === 'removed'
                      ? '−'
                      : ''}
              </span>

              <span className="inline-block w-8 text-right mr-4 text-xs diff-text-quaternary select-none">
                {result.value === '---' ? '' : result.lineNumber}
              </span>

              <span className="flex-1">
                <CharHighlightRenderer
                  charChanges={result.charChanges || []}
                  fallbackText={result.value}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UnifiedView
