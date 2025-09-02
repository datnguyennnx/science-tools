import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { TextPreviewProps, PreviewMode } from '../../engine/types'
import { DiffStatsDisplay } from './diffStatsDisplay'
import { ModeControls } from '../inputs'
import { UnifiedView, SplitView, useChangeNavigation } from '../views'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TextPreview({ diffResults, stats, className }: TextPreviewProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('split')
  const [showOnlyChanges, setShowOnlyChanges] = useState(false)

  const { changedLines, currentChangeIndex, navigateToChange, hasChanges, canNavigate } =
    useChangeNavigation(diffResults)

  return (
    <div
      className={cn(
        'h-full w-full overflow-hidden rounded-lg bg-card flex flex-col border',
        className
      )}
    >
      <div className="flex-shrink-0 px-4 py-2 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DiffStatsDisplay stats={stats} showOnlyChanges={showOnlyChanges} />

            {hasChanges && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateToChange('prev')}
                  disabled={!canNavigate}
                  className="h-7 w-7 p-0"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                  {currentChangeIndex + 1}/{changedLines.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateToChange('next')}
                  disabled={!canNavigate}
                  className="h-7 w-7 p-0"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <ModeControls
            previewMode={previewMode}
            showOnlyChanges={showOnlyChanges}
            onPreviewModeChange={setPreviewMode}
            onShowOnlyChangesChange={setShowOnlyChanges}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {previewMode === 'unified' ? (
          <UnifiedView
            diffResults={diffResults}
            showOnlyChanges={showOnlyChanges}
            currentChangeIndex={currentChangeIndex}
            changedLines={changedLines}
          />
        ) : (
          <SplitView
            diffResults={diffResults}
            showOnlyChanges={showOnlyChanges}
            currentChangeIndex={currentChangeIndex}
            changedLines={changedLines}
          />
        )}
      </div>
    </div>
  )
}

export default TextPreview
