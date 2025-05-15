import { useState, useEffect } from 'react'
import type { AuxiliaryStructure } from '../types'
import { DEBOUNCE_DELAY } from '../../constants/sortSettings'

export function useDebouncedAuxiliaryStructures(
  sourceStructures: ReadonlyArray<AuxiliaryStructure> | undefined
): ReadonlyArray<AuxiliaryStructure> | undefined {
  const [debouncedAuxiliaryStructures, setDebouncedAuxiliaryStructures] = useState<
    ReadonlyArray<AuxiliaryStructure> | undefined
  >(sourceStructures)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAuxiliaryStructures(sourceStructures)
    }, DEBOUNCE_DELAY)

    return () => {
      clearTimeout(handler)
    }
  }, [sourceStructures])

  return debouncedAuxiliaryStructures
}
