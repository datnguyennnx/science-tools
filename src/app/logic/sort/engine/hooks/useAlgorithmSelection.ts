'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  defaultAlgorithmId,
  AVAILABLE_ALGORITHMS_LIST,
  getAlgorithmDetails,
} from '../algorithmRegistry'
import type { SortAlgorithm } from '../algorithmRegistry'

export interface UseAlgorithmSelectionProps {
  initialSelectedAlgorithmId?: string
  onAlgorithmChange?: (algorithmId: string, algorithmDetails?: SortAlgorithm) => void
}

export interface UseAlgorithmSelectionReturn {
  selectedAlgorithmId: string
  setSelectedAlgorithmId: (id: string) => void
  selectedAlgorithm: SortAlgorithm | undefined
  filteredAlgorithms: ReadonlyArray<{ id: string; name: string }>
  isLoadingDetails: boolean
  algorithmError: string | null
}

export const useAlgorithmSelection = ({
  initialSelectedAlgorithmId = defaultAlgorithmId,
  onAlgorithmChange,
}: UseAlgorithmSelectionProps = {}): UseAlgorithmSelectionReturn => {
  const [selectedAlgorithmId, setSelectedAlgorithmIdState] = useState<string>(
    initialSelectedAlgorithmId
  )
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SortAlgorithm | undefined>(undefined)
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false)
  const [algorithmError, setAlgorithmError] = useState<string | null>(null)

  // Filtered algorithms list (lightweight for dropdowns)
  const filteredAlgorithms = AVAILABLE_ALGORITHMS_LIST // This is already sorted

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedAlgorithmId) {
        setSelectedAlgorithm(undefined)
        setIsLoadingDetails(false)
        setAlgorithmError(null)
        return
      }

      setIsLoadingDetails(true)
      setAlgorithmError(null)
      try {
        const details = await getAlgorithmDetails(selectedAlgorithmId)
        setSelectedAlgorithm(details)
        if (onAlgorithmChange) {
          onAlgorithmChange(selectedAlgorithmId, details)
        }
      } catch (error) {
        console.error(`Error fetching algorithm details for ${selectedAlgorithmId}:`, error)
        setSelectedAlgorithm(undefined)
        setAlgorithmError(`Failed to load details for ${selectedAlgorithmId}.`)
        if (onAlgorithmChange) {
          onAlgorithmChange(selectedAlgorithmId, undefined)
        }
      } finally {
        setIsLoadingDetails(false)
      }
    }

    fetchDetails()
  }, [selectedAlgorithmId, onAlgorithmChange]) // Dependency on onAlgorithmChange is important if it has side effects

  const handleSetSelectedAlgorithmId = useCallback((id: string) => {
    // Check if ID is valid against the lightweight list before setting
    if (AVAILABLE_ALGORITHMS_LIST.some(algo => algo.id === id)) {
      setSelectedAlgorithmIdState(id)
    } else {
      console.warn(`Attempted to select invalid algorithm ID: ${id}`)
      // Optionally, set an error or revert to a default
    }
  }, [])

  return {
    selectedAlgorithmId,
    setSelectedAlgorithmId: handleSetSelectedAlgorithmId,
    selectedAlgorithm,
    filteredAlgorithms,
    isLoadingDetails,
    algorithmError,
  }
}
