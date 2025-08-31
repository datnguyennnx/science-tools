'use client'

import { CellPosition, KMapGroup } from './types'
import { getCellBorderStyles } from './KMapGroupDetector'

interface KMapCellProps {
  cell: CellPosition
  rowHeaders: string[]
  colHeaders: string[]
  hasMinterm: boolean
  groups: KMapGroup[]
  showMintermNumbers?: boolean
}

export const KMapCell = ({
  cell,
  rowHeaders,
  colHeaders,
  hasMinterm,
  groups,
  showMintermNumbers = true,
}: KMapCellProps) => {
  const { row, col, minterm } = cell

  // Get border styles for the cell
  const borderStyles = getCellBorderStyles(rowHeaders, colHeaders, row, col, minterm, groups)

  // Use 'X' for 1 and '0' for false values to match the reference images
  const cellValue = hasMinterm ? 'X' : '0'

  return (
    <td
      className="relative border border-border w-16 h-16 sm:w-20 sm:h-20 text-center transition-colors"
      style={borderStyles}
    >
      {showMintermNumbers && (
        <div className="absolute top-1 left-1 text-[0.6rem] ba-text-muted">{minterm}</div>
      )}
      <div className="h-full w-full flex items-center justify-center">
        <p
          className={`
            text-xl sm:text-2xl font-bold
            ${hasMinterm ? 'ba-text-primary' : 'ba-text-muted'}
          `}
        >
          {cellValue}
        </p>
      </div>
    </td>
  )
}
