'use client'

import React from 'react'
import { KMapConfig, KMapGroup } from './types'
import { KMapCell } from './KMapCell'

interface KMapGridProps {
  config: KMapConfig
  mintermSet: Set<number>
  groups: KMapGroup[]
  showMintermNumbers?: boolean
  className?: string
}

export const KMapGrid: React.FC<KMapGridProps> = ({
  config,
  mintermSet,
  groups,
  showMintermNumbers = true,
  className = '',
}) => {
  const { rowHeaders, colHeaders, rowVarLabel, colVarLabel, kMapOrder } = config

  return (
    <div className={`flex justify-center overflow-x-auto ${className}`}>
      <div className="relative mt-8 ml-8">
        {/* Column Headers Label (CD) */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold text-sm flex items-center">
          <span className="mr-1">
            <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {colVarLabel}
            </span>
          </span>
          <span className="border-t-2 border-primary w-24 h-0"></span>
        </div>

        {/* Row Headers Label (AB) - vertical */}
        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
          <span className="mb-1">
            <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground rotate-90">
              {rowVarLabel}
            </span>
          </span>
          <span className="border-l-2 border-primary h-24 w-0"></span>
        </div>

        <table className="border-collapse shadow-md rounded overflow-hidden">
          <thead>
            <tr>
              <th className="border p-0 relative bg-muted w-10 h-10">
                <div className="h-10 w-10">
                  <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-muted-foreground rotate-45"></div>
                  </div>
                </div>
              </th>
              {colHeaders.map(header => (
                <th
                  key={`col-header-${header}`}
                  className="border px-3 py-2 font-bold text-center bg-secondary text-secondary-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kMapOrder.map((row, rowIndex) => (
              <tr key={`row-header-${rowHeaders[rowIndex]}`}>
                <th className="border px-3 py-2 font-bold text-center bg-secondary text-secondary-foreground">
                  {rowHeaders[rowIndex]}
                </th>
                {row.map(cell => (
                  <KMapCell
                    key={`cell-${cell.row}-${cell.col}`}
                    cell={cell}
                    rowHeaders={rowHeaders}
                    colHeaders={colHeaders}
                    hasMinterm={mintermSet.has(cell.minterm)}
                    groups={groups}
                    showMintermNumbers={showMintermNumbers}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
