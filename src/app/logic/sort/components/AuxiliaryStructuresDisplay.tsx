'use client'

import React from 'react'
import { AnimatePresence } from 'framer-motion'
import type { AuxiliaryStructure } from '../engine/types'
import { AuxiliaryStructureChart } from './AuxiliaryStructureChart'

interface AuxiliaryStructuresDisplayProps {
  auxiliaryStructures: ReadonlyArray<AuxiliaryStructure> | undefined
  maxValue: number
  /** Indicates if this section should have a top border and padding, useful when it's not the first item. */
  separateSection?: boolean
}

export function AuxiliaryStructuresDisplay({
  auxiliaryStructures,
  maxValue,
  separateSection = false,
}: AuxiliaryStructuresDisplayProps): React.JSX.Element | null {
  const hasAuxStructures = !!auxiliaryStructures && auxiliaryStructures.length > 0

  if (!hasAuxStructures) {
    // If it's meant to be a separate section but is empty,
    // it could optionally render a message or just null to collapse.
    // For now, returning null and letting the parent decide on overall empty states.
    return (
      <div
        className={`${separateSection ? 'pt-4 border-t mt-4' : ''} w-full text-center p-4 border border-dashed rounded-md min-h-[5rem] flex items-center justify-center`}
      >
        <p className="text-sm text-muted-foreground">
          This algorithm does not utilize specific auxiliary data structures for visualization.
        </p>
      </div>
    )
  }

  return (
    <div className={`${separateSection ? 'pt-4 border-t mt-4' : ''} space-y-4`}>
      <h3 className="text-lg font-semibold text-foreground">Auxiliary Data Structures</h3>
      <AnimatePresence initial={false}>
        {auxiliaryStructures.map(structure => (
          <AuxiliaryStructureChart key={structure.id} structure={structure} maxValue={maxValue} />
        ))}
      </AnimatePresence>
    </div>
  )
}
