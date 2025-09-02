import React from 'react'
import { DiffStatsDisplayProps } from '../../engine/types'
import { formatNumber } from '../../engine/utils'
import { SECTION_LABELS } from '../../engine/constants'

export function DiffStatsDisplay({ stats, showOnlyChanges }: DiffStatsDisplayProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span>
        {showOnlyChanges ? SECTION_LABELS.changesDetected : SECTION_LABELS.comparisonResults}
      </span>
      <div className="flex items-center gap-3">
        {stats.additions > 0 && (
          <span className="diff-stats-added font-mono">+{formatNumber(stats.additions)}</span>
        )}
        {stats.deletions > 0 && (
          <span className="diff-stats-removed font-mono">-{formatNumber(stats.deletions)}</span>
        )}
        <span className="diff-stats-total font-mono">{formatNumber(stats.totalLines)} lines</span>
      </div>
    </div>
  )
}

export default DiffStatsDisplay
