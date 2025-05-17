'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { SORT_ALGORITHMS, type SortAlgorithm } from '../algorithmRegistry'

const defaultAlgorithmId = SORT_ALGORITHMS[0]?.id || ''

export interface UseAlgorithmSelectionProps {
  initialSelectedAlgorithmId?: string
  onAlgorithmChange?: (algorithmId: string) => void
}

export const useAlgorithmSelection = ({
  initialSelectedAlgorithmId = defaultAlgorithmId,
  onAlgorithmChange,
}: UseAlgorithmSelectionProps = {}) => {
  const [selectedAlgorithmId, setSelectedAlgorithmIdInternal] = useState<string>(
    initialSelectedAlgorithmId
  )

  const selectedAlgorithm = useMemo<SortAlgorithm | undefined>(
    () => SORT_ALGORITHMS.find(algo => algo.id === selectedAlgorithmId),
    [selectedAlgorithmId]
  )

  // filteredAlgorithms is now just all algorithms
  const filteredAlgorithms = useMemo(() => SORT_ALGORITHMS, [])

  const handleSetSelectedAlgorithmId = useCallback(
    (id: string) => {
      setSelectedAlgorithmIdInternal(id)
      onAlgorithmChange?.(id)
    },
    [onAlgorithmChange]
  )

  useEffect(() => {
    // Ensure the selectedAlgorithmId is genuinely in SORT_ALGORITHMS (master list).
    // This handles the case where an invalid initialSelectedAlgorithmId was provided
    // or if the list of algorithms itself changed (though less likely for a static list).
    const isSelectedInMasterList = SORT_ALGORITHMS.some(algo => algo.id === selectedAlgorithmId)
    if (!isSelectedInMasterList && SORT_ALGORITHMS.length > 0) {
      // If current selection is invalid and there are algorithms, pick the first one.
      handleSetSelectedAlgorithmId(SORT_ALGORITHMS[0].id)
    } else if (SORT_ALGORITHMS.length === 0 && selectedAlgorithmId !== '') {
      // If there are no algorithms (e.g. error loading them), reset selection.
      handleSetSelectedAlgorithmId('')
    }
  }, [selectedAlgorithmId, handleSetSelectedAlgorithmId])

  return {
    selectedAlgorithmId,
    setSelectedAlgorithmId: handleSetSelectedAlgorithmId,
    selectedAlgorithm,
    filteredAlgorithms, // Still returning this, though it's always the full list now
  }
}
