import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { TextPreviewProps, PreviewMode } from '../../engine/types'
import { DiffStatsDisplay } from './diffStatsDisplay'
import { ModeControls } from '../inputs'
import { UnifiedView, SplitView } from '../views'

export function TextPreview({ diffResults, stats, className }: TextPreviewProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('split')
  const [showOnlyChanges, setShowOnlyChanges] = useState(false)

  const filteredResults = diffResults.filter(
    result => !showOnlyChanges || result.type !== 'unchanged'
  )

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
          <UnifiedView diffResults={filteredResults} />
        ) : (
          <SplitView diffResults={diffResults} showOnlyChanges={showOnlyChanges} />
        )}
      </div>
    </div>
  )
}

export default TextPreview
