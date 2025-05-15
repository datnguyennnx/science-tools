'use client'

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
    const isSelectedInFiltered = filteredAlgorithms.some(algo => algo.id === selectedAlgorithmId)

    if (!isSelectedInFiltered) {
      // Current selection is not in the filtered list
      if (filteredAlgorithms.length > 0) {
        // If there are items in the filtered list, pick the first one
        handleSetSelectedAlgorithmId(filteredAlgorithms[0].id)
      }
      // else: Filters are active and resulted in an empty list.
      // The selectedAlgorithmId is now out of sync. We keep the stale ID to indicate no matches.
    } else {
      // Current selection IS in the filtered list.
      // If filters are ALL_CATEGORIES (i.e., filteredAlgorithms === SORT_ALGORITHMS),
      // ensure the selectedAlgorithmId is genuinely in SORT_ALGORITHMS (master list).
      // This handles the case where an invalid initialSelectedAlgorithmId was provided.
      const filtersAreOff =
        selectedTimeCategory === ALL_CATEGORIES && selectedSpaceCategory === ALL_CATEGORIES
      if (filtersAreOff) {
        const isSelectedInMasterList = SORT_ALGORITHMS.some(algo => algo.id === selectedAlgorithmId)
        if (!isSelectedInMasterList && SORT_ALGORITHMS.length > 0) {
          handleSetSelectedAlgorithmId(SORT_ALGORITHMS[0].id)
        }
      }
    }
  }, [
    selectedAlgorithmId,
    filteredAlgorithms,
    handleSetSelectedAlgorithmId,
    selectedTimeCategory,
    selectedSpaceCategory,
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
