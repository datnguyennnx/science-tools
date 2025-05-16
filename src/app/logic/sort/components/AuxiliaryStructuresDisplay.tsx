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

// Helper to group structures by displaySlot
const groupStructuresBySlot = (
  structures: ReadonlyArray<AuxiliaryStructure> | undefined
): Record<string, AuxiliaryStructure[]> => {
  if (!structures) return {}
  return structures.reduce(
    (acc, structure) => {
      const slot = structure.displaySlot || 'default'
      if (!acc[slot]) {
        acc[slot] = []
      }
      acc[slot].push(structure)
      return acc
    },
    {} as Record<string, AuxiliaryStructure[]>
  )
}

export function AuxiliaryStructuresDisplay({
  auxiliaryStructures,
  maxValue,
  separateSection = false,
}: AuxiliaryStructuresDisplayProps): React.JSX.Element | null {
  const groupedStructures = groupStructuresBySlot(auxiliaryStructures)
  const numActiveSlots = Object.keys(groupedStructures).length

  if (numActiveSlots === 0) {
    // If it's meant to be a separate section but is empty,
    // it could optionally render a message or just null to collapse.
    // For now, returning null and letting the parent decide on overall empty states.
    return (
      <div
        className={`${separateSection ? 'pt-4 border-t mt-4' : ''} w-full text-center p-4 border border-dashed rounded-md min-h-[5rem] flex items-center justify-center`}
      >
        <p className="text-sm text-muted-foreground">
          No auxiliary data structures to display for this step or algorithm.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-foreground mb-3">Auxiliary Data Structures</h3>
      {/* Apply grid layout to the container of slots */}
      <div
        className={`grid grid-cols-1 ${numActiveSlots > 1 ? 'md:grid-cols-2' : ''} gap-x-4 gap-y-6`}
      >
        {Object.entries(groupedStructures).map(([slot, structuresInSlot], slotIndex) => (
          <div
            key={slot}
            className={`space-y-3 ${slotIndex > 0 && numActiveSlots > 1 ? 'pt-3 md:pt-0' : ''}`}
          >
            {/* Slot title styling adjustment - ensure it's clearly part of its grid item */}
            {(numActiveSlots > 1 || slot !== 'default') && (
              <h4 className="text-md font-medium text-muted-foreground capitalize mb-2">
                {slot
                  .replace(/([A-Z0-9])/g, ' $1')
                  .replace(/-/g, ' ')
                  .replace(/^./, str => str.toUpperCase())}
              </h4>
            )}
            <AnimatePresence initial={false}>
              {structuresInSlot.map(structure => (
                <AuxiliaryStructureChart
                  key={structure.id}
                  structure={structure}
                  maxValue={maxValue}
                />
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
