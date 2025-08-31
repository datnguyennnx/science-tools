'use client'

import React from 'react'

interface VennLegendProps {
  variables: string[]
  numVars: number
}

export function VennLegend({ variables, numVars }: VennLegendProps) {
  // Define base legend data for different variable counts
  let legendData: { color: string; label: string }[] = []

  if (numVars === 2) {
    legendData = [
      { color: 'var(--venn-region-a)', label: `${variables[0]} only` },
      { color: 'var(--venn-region-b)', label: `${variables[1]} only` },
      { color: 'var(--venn-region-intersection)', label: `${variables[0]} ∩ ${variables[1]}` },
    ]
  } else if (numVars === 3) {
    legendData = [
      { color: 'var(--venn-region-a)', label: `${variables[0]} only` },
      { color: 'var(--venn-region-b)', label: `${variables[1]} only` },
      { color: 'var(--venn-region-c)', label: `${variables[2]} only` },
      {
        color: 'var(--venn-region-intersection)',
        label: `${variables[0]} ∩ ${variables[1]} ∩ ${variables[2]}`,
      },
    ]
  } else if (numVars === 4 || numVars === 5) {
    // For 4 and 5 variables (which use the same color scheme for the 4-var diagram part)
    const colorLabels = [
      { color: 'var(--color-chart-1)', label: 'Region A' },
      { color: 'var(--color-chart-2)', label: 'Region B' },
      { color: 'var(--color-chart-3)', label: 'Region C' },
      { color: 'var(--color-chart-4)', label: 'Region D' },
      { color: 'var(--color-chart-5)', label: 'Intersections' },
    ]

    legendData = colorLabels

    // For 5 variables, add a note about the dual diagram approach
    if (numVars === 5) {
      legendData.push({
        color: 'var(--venn-border)',
        label: `Diagram split by ${variables[4]} value`,
      })
    }
  }

  return (
    <div className="flex flex-row flex-wrap gap-3 items-center justify-center mt-2 mb-1 text-xs">
      {legendData.map(item => (
        <div key={item.label} className="flex items-center gap-1">
          <span
            style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              background: item.color,
              borderRadius: 3,
              border: '1.5px solid var(--venn-border)',
              opacity: 0.5,
              marginRight: 4,
            }}
            aria-label={item.label}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
