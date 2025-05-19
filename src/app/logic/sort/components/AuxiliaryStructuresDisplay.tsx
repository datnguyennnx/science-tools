'use client'

import { memo, useMemo } from 'react'
import type { AuxiliaryStructure } from '../engine/types'
import { AuxiliaryStructureChart } from './AuxiliaryStructureChart'

interface AuxiliaryStructuresDisplayProps {
  currentPassAuxiliaryStructure?: AuxiliaryStructure | null
  historicalAuxiliaryStructures?: ReadonlyArray<AuxiliaryStructure>
  separateSection?: boolean
}

const MemoizedAuxiliaryStructuresDisplay = memo(function AuxiliaryStructuresDisplay({
  currentPassAuxiliaryStructure,
  historicalAuxiliaryStructures,
  separateSection = false,
}: AuxiliaryStructuresDisplayProps): React.JSX.Element | null {
  const combinedStructures = useMemo(() => {
    const structures: AuxiliaryStructure[] = []
    if (historicalAuxiliaryStructures) {
      structures.push(...historicalAuxiliaryStructures)
    }
    if (currentPassAuxiliaryStructure) {
      // Ensure current is added, potentially overwriting an older version from historical if ids match,
      // or just add it. For now, let's just add. The grouping logic might need adjustment if overwriting by ID is desired.
      // A simple way to avoid duplicates if an identical historical structure is also current:
      if (
        !historicalAuxiliaryStructures?.find(hist => hist.id === currentPassAuxiliaryStructure.id)
      ) {
        structures.push(currentPassAuxiliaryStructure)
      } else {
        // If it's already in historical, we might want to ensure the current one is used.
        // For now, let's assume IDs are unique enough or displaySlot grouping handles this.
        // A more robust approach might be to merge or replace if IDs match.
        // Current simple approach: if current is already in historical by ID, don't add again to avoid dupes, assuming historical is sufficient.
        // OR, always prioritize current. Let's prioritize current by potentially replacing.
        const existingIndex = structures.findIndex(s => s.id === currentPassAuxiliaryStructure!.id) // Added non-null assertion
        if (existingIndex !== -1) {
          structures[existingIndex] = currentPassAuxiliaryStructure // Replace with current
        } else {
          structures.push(currentPassAuxiliaryStructure) // Add if new
        }
      }
    }
    return structures
  }, [currentPassAuxiliaryStructure, historicalAuxiliaryStructures])

  const groupedStructures = useMemo(() => {
    if (combinedStructures.length === 0) return {}
    return combinedStructures.reduce(
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
  }, [combinedStructures])

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
      <div
        className={`grid grid-cols-1 ${numActiveSlots > 1 ? 'md:grid-cols-2' : ''} gap-x-4 gap-y-6`}
      >
        {Object.entries(groupedStructures).map(([slot, structuresInSlot], slotIndex) => (
          <div
            key={slot}
            className={`space-y-3 ${slotIndex > 0 && numActiveSlots > 1 ? 'pt-3 md:pt-0' : ''}`}
          >
            {(numActiveSlots > 1 || slot !== 'default') && (
              <h4 className="text-md font-medium text-muted-foreground capitalize mb-2">
                {slot
                  .replace(/([A-Z0-9])/g, ' $1')
                  .replace(/-/g, ' ')
                  .replace(/^./, str => str.toUpperCase())}
              </h4>
            )}
            {structuresInSlot.map(structure => (
              <AuxiliaryStructureChart key={structure.id} structure={structure} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
})

export { MemoizedAuxiliaryStructuresDisplay as AuxiliaryStructuresDisplay }
