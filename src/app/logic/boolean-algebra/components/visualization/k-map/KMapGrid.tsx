'use client'

import { KMapConfig, KMapGroup } from './types'
import { KMapCell } from './KMapCell'

interface KMapGridProps {
  config: KMapConfig
  mintermSet: Set<number>
  groups: KMapGroup[]
  showMintermNumbers?: boolean
  className?: string
}

export const KMapGrid = ({
  config,
  mintermSet,
  groups,
  showMintermNumbers = true,
  className = '',
}: KMapGridProps) => {
  const { rowHeaders, colHeaders, rowVarLabel, colVarLabel, kMapOrder } = config

  return (
    <div className={`flex h-full justify-center items-center ${className} no-scrollbar`}>
      <div className="relative m-4 sm:m-6 lg:m-8">
        {/* Column Headers Label (CD) */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold flex items-center">
          <p className="mr-1">
            <span className="ba-kmap-header inline-block rounded-full px-2 py-0.5 text-xs">
              {colVarLabel}
            </span>
          </p>
          <p className="ba-kmap-axis border-t-4 w-32 h-0"></p>
        </div>

        {/* Row Headers Label (AB) - vertical */}
        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
          <p className="mb-1">
            <span className="ba-kmap-header inline-block rounded-full px-2 py-0.5 text-xs rotate-90">
              {rowVarLabel}
            </span>
          </p>
          <p className="ba-kmap-axis border-l-4 h-32 w-0"></p>
        </div>

        <table className="border-collapse shadow-lg rounded-lg overflow-hidden border-2 border-border">
          <thead>
            <tr>
              <th className="ba-kmap-corner-diagonal border p-0 relative w-16 h-16">
                <div className="h-12 w-12">
                  <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center">
                    <div className="w-full h-1 rotate-45"></div>
                  </div>
                </div>
              </th>
              {colHeaders.map(header => (
                <th
                  key={`col-header-${header}`}
                  className="ba-kmap-header border px-4 py-3 font-bold text-center text-lg"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kMapOrder.map((row, rowIndex) => (
              <tr key={`row-header-${rowHeaders[rowIndex]}`}>
                <th className="ba-kmap-header border px-4 py-3 font-bold text-center text-lg">
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
