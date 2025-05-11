'use client'

import React from 'react'
import { GROUP_COLORS, GROUP_COLOR_NAMES } from './KMapGroupDetector'

interface KMapLegendProps {
  className?: string
}

export const KMapLegend: React.FC<KMapLegendProps> = ({ className = '' }) => {
  // Get the colors and names from the exported constants
  const entries = Object.entries(GROUP_COLORS)
    .map(([size, color]) => ({
      size: parseInt(size),
      color,
      name: GROUP_COLOR_NAMES[parseInt(size) as keyof typeof GROUP_COLOR_NAMES],
    }))
    .sort((a, b) => b.size - a.size) // Sort by size (largest first)

  return (
    <div className={`${className} flex flex-wrap gap-3 mt-3 justify-center`}>
      {entries.map(({ size, color, name }) => (
        <div key={size} className="flex items-center gap-2">
          <div
            className="w-5 h-5 border-2 border-dashed"
            style={{
              borderColor: color as string,
              backgroundColor: `${color}25`, // 25% opacity
            }}
          ></div>
          <p className="text-sm text-foreground">
            {name} ({size === 1 ? '1 cell' : `${size} cells`})
          </p>
        </div>
      ))}
    </div>
  )
}
