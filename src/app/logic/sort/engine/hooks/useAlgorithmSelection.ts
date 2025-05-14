import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  SORT_ALGORITHMS,
  mapComplexityToCategory,
  type SortAlgorithm,
  // type AlgorithmComplexity, // Removed unused import
} from '../algorithmRegistry'

const ALL_CATEGORIES = 'all'
const defaultAlgorithmId = SORT_ALGORITHMS[0]?.id || ''

export interface UseAlgorithmSelectionProps {
  initialSelectedAlgorithmId?: string
  initialTimeCategory?: string
  initialSpaceCategory?: string
  onAlgorithmChange?: (algorithmId: string) => void // Callback when algorithm actually changes
}

export const useAlgorithmSelection = ({
  initialSelectedAlgorithmId = defaultAlgorithmId,
  initialTimeCategory = ALL_CATEGORIES,
  initialSpaceCategory = ALL_CATEGORIES,
  onAlgorithmChange,
}: UseAlgorithmSelectionProps = {}) => {
  const [selectedAlgorithmId, setSelectedAlgorithmIdInternal] = useState<string>(
    initialSelectedAlgorithmId
  )
  const [selectedTimeCategory, setSelectedTimeCategory] = useState<string>(initialTimeCategory)
  const [selectedSpaceCategory, setSelectedSpaceCategory] = useState<string>(initialSpaceCategory)

  const selectedAlgorithm = useMemo<SortAlgorithm | undefined>(
    () => SORT_ALGORITHMS.find(algo => algo.id === selectedAlgorithmId),
    [selectedAlgorithmId]
  )

  const filteredAlgorithms = useMemo(() => {
    if (selectedTimeCategory === ALL_CATEGORIES && selectedSpaceCategory === ALL_CATEGORIES) {
      return SORT_ALGORITHMS
    }
    return SORT_ALGORITHMS.filter(algo => {
      const algoTimeBestCat = mapComplexityToCategory(algo.complexity.time.best).time
      const algoTimeWorstCat = mapComplexityToCategory(algo.complexity.time.worst).time
      const algoSpaceCat = mapComplexityToCategory(algo.complexity.space).space

      const timeMatch =
        selectedTimeCategory === ALL_CATEGORIES ||
        (algoTimeBestCat && selectedTimeCategory === algoTimeBestCat) ||
        (algoTimeWorstCat && selectedTimeCategory === algoTimeWorstCat)

      const spaceMatch =
        selectedSpaceCategory === ALL_CATEGORIES ||
        (algoSpaceCat && selectedSpaceCategory === algoSpaceCat)

      return timeMatch && spaceMatch
    })
  }, [selectedTimeCategory, selectedSpaceCategory])

  const handleSetSelectedAlgorithmId = useCallback(
    (id: string) => {
      setSelectedAlgorithmIdInternal(id)
      onAlgorithmChange?.(id)
    },
    [onAlgorithmChange]
  )

  const handleTimeCategoryChange = useCallback((category: string) => {
    setSelectedTimeCategory(category)
  }, [])

  const handleSpaceCategoryChange = useCallback((category: string) => {
    setSelectedSpaceCategory(category)
  }, [])

  useEffect(() => {
    const isCurrentAlgorithmFilteredOut = !filteredAlgorithms.find(
      algo => algo.id === selectedAlgorithmId
    )

    if (isCurrentAlgorithmFilteredOut) {
      if (filteredAlgorithms.length > 0) {
        handleSetSelectedAlgorithmId(filteredAlgorithms[0].id)
      } else {
        // Optional: Handle case where no algorithms match filters (e.g., show message or revert filters)
        // For now, it will keep the last valid selectedAlgorithmId or become undefined if that was filtered out.
        // If ALL_CATEGORIES, ensure a valid default is set if current is somehow invalid.
        if (selectedTimeCategory !== ALL_CATEGORIES || selectedSpaceCategory !== ALL_CATEGORIES) {
          // No action needed, it means filters are active and resulted in no matches.
        }
      }
    } else if (
      selectedTimeCategory === ALL_CATEGORIES &&
      selectedSpaceCategory === ALL_CATEGORIES
    ) {
      // If filters are cleared, and current selected algorithm is not in full list (e.g. bad initial id), reset to default.
      if (
        !SORT_ALGORITHMS.find(algo => algo.id === selectedAlgorithmId) &&
        SORT_ALGORITHMS.length > 0
      ) {
        handleSetSelectedAlgorithmId(SORT_ALGORITHMS[0].id)
      }
    }
  }, [
    filteredAlgorithms,
    selectedAlgorithmId,
    selectedTimeCategory,
    selectedSpaceCategory,
    handleSetSelectedAlgorithmId,
  ])

  // Effect to reset to a default algorithm if the current one becomes invalid and no filters are applied.
  // This handles cases where selectedAlgorithmId might be stale or invalid for other reasons.
  useEffect(() => {
    if (selectedTimeCategory === ALL_CATEGORIES && selectedSpaceCategory === ALL_CATEGORIES) {
      const currentExists = SORT_ALGORITHMS.some(algo => algo.id === selectedAlgorithmId)
      if (!currentExists && SORT_ALGORITHMS.length > 0) {
        handleSetSelectedAlgorithmId(SORT_ALGORITHMS[0].id)
      }
    }
  }, [
    selectedAlgorithmId,
    selectedTimeCategory,
    selectedSpaceCategory,
    handleSetSelectedAlgorithmId,
  ])

  return {
    selectedAlgorithmId,
    setSelectedAlgorithmId: handleSetSelectedAlgorithmId,
    selectedAlgorithm,
    filteredAlgorithms,
    selectedTimeCategory,
    handleTimeCategoryChange,
    selectedSpaceCategory,
    handleSpaceCategoryChange,
    ALL_CATEGORIES, // Export for use in UI if needed
  }
}
