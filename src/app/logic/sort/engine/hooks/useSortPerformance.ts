import { useState, useCallback, useRef, RefObject } from 'react'
import type { SortStats } from '../types'

export interface UseSortPerformanceReturn {
  liveSortStats: Partial<SortStats> | null
  finalSortStats: SortStats | null
  setLiveSortStats: React.Dispatch<React.SetStateAction<Partial<SortStats> | null>>
  setFinalSortStats: React.Dispatch<React.SetStateAction<SortStats | null>>
  visualStartTimeRef: RefObject<number | null>
  resetPerformanceStats: () => void
}

export function useSortPerformance(): UseSortPerformanceReturn {
  const [liveSortStats, setLiveSortStats] = useState<Partial<SortStats> | null>(null)
  const [finalSortStats, setFinalSortStats] = useState<SortStats | null>(null)
  const visualStartTimeRef = useRef<number | null>(null)

  const resetPerformanceStats = useCallback(() => {
    setLiveSortStats(null)
    setFinalSortStats(null)
    visualStartTimeRef.current = null
  }, [])

  return {
    liveSortStats,
    finalSortStats,
    setLiveSortStats,
    setFinalSortStats,
    visualStartTimeRef,
    resetPerformanceStats,
  }
}
