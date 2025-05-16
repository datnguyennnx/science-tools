import { useState, useCallback, useRef, RefObject } from 'react'
import type { SortStep, SortStats } from '../types'

export interface UseSortPerformanceReturn {
  liveSortStats: Partial<SortStats> | null
  finalSortStats: SortStats | null
  setLiveSortStats: React.Dispatch<React.SetStateAction<Partial<SortStats> | null>>
  setFinalSortStats: React.Dispatch<React.SetStateAction<SortStats | null>>
  visualStartTimeRef: RefObject<number | null>
  processActiveGeneratorStep: (
    generatorStep: SortStep,
    currentLiveStats: Partial<SortStats> | null,
    visualStartTime: number | null,
    delayMilliseconds: number
  ) => Partial<SortStats>
  calculateTimingStats: (
    currentLiveStats: Partial<SortStats> | null,
    visualStartTime: number | null,
    delayMilliseconds: number,
    isPausedForDisplay?: boolean
  ) => Partial<SortStats>
  resetPerformanceStats: () => void
}

export function useSortPerformance(): UseSortPerformanceReturn {
  const [liveSortStats, setLiveSortStats] = useState<Partial<SortStats> | null>(null)
  const [finalSortStats, setFinalSortStats] = useState<SortStats | null>(null)
  const visualStartTimeRef = useRef<number | null>(null)

  const processActiveGeneratorStep = useCallback(
    (
      generatorStep: SortStep,
      currentLiveStats: Partial<SortStats> | null,
      visualStartTime: number | null,
      delayMilliseconds: number
    ): Partial<SortStats> => {
      const newLiveStats: Partial<SortStats> = { ...(currentLiveStats || {}) }
      if (generatorStep.currentStats) {
        Object.assign(newLiveStats, generatorStep.currentStats)
      }
      newLiveStats.delay = `${delayMilliseconds.toFixed(1)} ms`
      if (visualStartTime) {
        const elapsedTime = Date.now() - visualStartTime
        newLiveStats.visualTime = `${(elapsedTime / 1000).toFixed(2)} s`
        newLiveStats.sortTime = newLiveStats.visualTime // Assuming sortTime mirrors visualTime during live updates
      }
      return newLiveStats
    },
    []
  )

  const calculateTimingStats = useCallback(
    (
      currentLiveStats: Partial<SortStats> | null,
      visualStartTime: number | null,
      delayMilliseconds: number,
      isPausedForDisplay?: boolean
    ): Partial<SortStats> => {
      const timingStats: Partial<SortStats> = {}
      if (visualStartTime) {
        const finalElapsedTime = Date.now() - visualStartTime
        timingStats.visualTime = `${(finalElapsedTime / 1000).toFixed(2)} s`
        timingStats.sortTime = timingStats.visualTime
      } else {
        timingStats.visualTime = currentLiveStats?.visualTime || '-'
        timingStats.sortTime = currentLiveStats?.sortTime || '-'
      }
      timingStats.delay = isPausedForDisplay
        ? 'Paused'
        : currentLiveStats?.delay || `${delayMilliseconds.toFixed(1)} ms`
      return timingStats
    },
    []
  )

  const resetPerformanceStats = useCallback(() => {
    setLiveSortStats({ delay: '-', visualTime: '-', sortTime: '-' })
    setFinalSortStats(null)
    visualStartTimeRef.current = null
  }, [])

  return {
    liveSortStats,
    finalSortStats,
    setLiveSortStats,
    setFinalSortStats,
    visualStartTimeRef,
    processActiveGeneratorStep,
    calculateTimingStats,
    resetPerformanceStats,
  }
}
