'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { SortStep, SortStats, SortGenerator, SortResult } from '../types'
import type { SortAlgorithm } from '../algorithmRegistry'
import { DEFAULT_SPEED, MIN_SPEED, MAX_SPEED, MIN_DELAY_MS } from '../../constants/sortSettings'

export interface UseSortExecutionProps {
  array: number[]
  sortDirection: 'asc' | 'desc'
  selectedAlgorithm: SortAlgorithm | undefined
  initialSpeed?: number
  // Callbacks to update parent/sibling hook states
  onStepProcessed: (step: SortStep) => void // For history and raw current step update
  onSortComplete: (finalArray: number[], stats: SortStats, lastStep: SortStep) => void
  onLiveStatsUpdate: (stats: Partial<SortStats>) => void
  // Refs from other hooks if direct manipulation is simpler (e.g. visualStartTimeRef)
  visualStartTimeRef: React.MutableRefObject<number | null>
  // Stat processing functions (could also be passed in if they remain in useSortPerformance)
  processActiveGeneratorStep: (
    generatorStep: SortStep,
    currentLiveStats: Partial<SortStats> | null, // This hook will manage its own temp live stats for a step
    visualStartTime: number | null,
    delayMilliseconds: number
  ) => Partial<SortStats>
  calculateTimingStats: (
    currentLiveStats: Partial<SortStats> | null,
    visualStartTime: number | null,
    delayMilliseconds: number,
    isPausedForDisplay?: boolean
  ) => Partial<SortStats>
}

export interface UseSortExecutionReturn {
  isSorting: boolean
  isPaused: boolean
  speed: number
  setSpeed: React.Dispatch<React.SetStateAction<number>>
  currentRawSortStep: SortStep | null // The most recent step from the generator, undebounced aux
  startSort: () => void
  pauseSort: () => void
  resumeSort: () => void
  stepForward: () => void
  clearSortingTimeout: () => void // Expose to be callable from performFullReset
  resetExecution: () => void // Added for comprehensive reset
}

export function useSortExecution({
  array,
  sortDirection,
  selectedAlgorithm,
  initialSpeed,
  onStepProcessed,
  onSortComplete,
  onLiveStatsUpdate,
  visualStartTimeRef,
  processActiveGeneratorStep,
  calculateTimingStats,
}: UseSortExecutionProps): UseSortExecutionReturn {
  const [isSorting, setIsSorting] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(
    initialSpeed !== undefined ? initialSpeed : DEFAULT_SPEED
  )
  const [currentRawSortStep, setCurrentRawSortStep] = useState<SortStep | null>(null)

  const sortGeneratorRef = useRef<ReturnType<SortGenerator> | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const justResumedRef = useRef(false)
  // Internal temporary live stats for a step, to be passed to onLiveStatsUpdate
  const [tempLiveStats, setTempLiveStats] = useState<Partial<SortStats> | null>(null)
  const isInitialMountRef = useRef(true) // Ref to track initial mount

  const clearSortingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const resetExecution = useCallback(() => {
    clearSortingTimeout()
    setIsSorting(false)
    setIsPaused(false)
    sortGeneratorRef.current = null
    setCurrentRawSortStep(null)
    setTempLiveStats(null)
    // visualStartTimeRef is managed by useSortPerformance and reset there via resetPerformanceStats
    justResumedRef.current = false
  }, [clearSortingTimeout])

  const calculateDelay = useCallback(() => {
    const speedRange = MAX_SPEED - MIN_SPEED
    const normalizedSpeed = (MAX_SPEED - speed) / speedRange
    const delay = MIN_DELAY_MS + normalizedSpeed
    return Math.max(MIN_DELAY_MS, delay)
  }, [speed])

  const nextStep = useCallback(() => {
    if (isPaused || !isSorting) return
    if (!sortGeneratorRef.current) {
      return
    }

    const result = sortGeneratorRef.current.next()

    if (!result.done) {
      const stepFromGenerator = result.value
      setCurrentRawSortStep(stepFromGenerator)
      onStepProcessed(stepFromGenerator)

      const liveStatsForStep = processActiveGeneratorStep(
        stepFromGenerator,
        tempLiveStats,
        visualStartTimeRef.current,
        calculateDelay()
      )
      setTempLiveStats(liveStatsForStep)
      onLiveStatsUpdate(liveStatsForStep)

      timeoutRef.current = setTimeout(nextStep, calculateDelay())
    } else {
      clearSortingTimeout()
      const finalAlgorithmResult = result.value as SortResult

      const timingStats = calculateTimingStats(
        tempLiveStats,
        visualStartTimeRef.current,
        calculateDelay()
      )

      const finalCombinedStats: SortStats = {
        ...(tempLiveStats || {}),
        ...(finalAlgorithmResult.stats || {}),
        ...timingStats,
        numElements: array.length,
      } as SortStats

      const completionStep: SortStep = {
        array: [...finalAlgorithmResult.finalArray],
        sortedIndices: finalAlgorithmResult.finalArray.map((_, idx) => idx),
        message: `${selectedAlgorithm?.name || 'Algorithm'} Complete!`,
        currentStats: finalCombinedStats,
        auxiliaryStructures:
          finalAlgorithmResult.finalAuxiliaryStructures || currentRawSortStep?.auxiliaryStructures,
      }

      onSortComplete(finalAlgorithmResult.finalArray, finalCombinedStats, completionStep)
      setCurrentRawSortStep(completionStep)
      setIsSorting(false)
      setIsPaused(false)
      sortGeneratorRef.current = null
      setTempLiveStats(null)
    }
  }, [
    isPaused,
    isSorting,
    selectedAlgorithm,
    array.length,
    onStepProcessed,
    onSortComplete,
    onLiveStatsUpdate,
    visualStartTimeRef,
    processActiveGeneratorStep,
    calculateTimingStats,
    calculateDelay,
    tempLiveStats,
    currentRawSortStep,
    clearSortingTimeout,
  ])

  const startSort = useCallback(() => {
    if (!selectedAlgorithm || array.length === 0) {
      return
    }

    clearSortingTimeout()
    setTempLiveStats({
      // Initialize temp live stats
      comparisons: 0,
      swaps: 0,
      accesses: 0,
      visualTime: '0.00 s',
      sortTime: '0.00 s',
      algorithmName: selectedAlgorithm.name,
      numElements: array.length,
    })
    visualStartTimeRef.current = Date.now()

    const initialStep: SortStep = { array: [...array], sortedIndices: [] }
    setCurrentRawSortStep(initialStep)
    onStepProcessed(initialStep) // Process the initial step for history etc.

    setIsPaused(false)
    setIsSorting(true)
    justResumedRef.current = false

    sortGeneratorRef.current = selectedAlgorithm.generator([...array], sortDirection)
  }, [
    selectedAlgorithm,
    array,
    sortDirection,
    clearSortingTimeout,
    onStepProcessed,
    visualStartTimeRef,
  ])

  const pauseSort = useCallback(() => {
    // Corrected condition: Only pause if sorting is active and not already paused.
    if (!isSorting || isPaused) return
    setIsPaused(true)
    clearSortingTimeout()
  }, [isSorting, isPaused, clearSortingTimeout])

  const resumeSort = useCallback(() => {
    if (!isSorting || !isPaused) return
    setIsPaused(false)
    justResumedRef.current = true // Signal that we need to kick off nextStep via useEffect
  }, [isSorting, isPaused])

  const stepForward = useCallback(() => {
    if (!isSorting || !isPaused || !sortGeneratorRef.current) return

    const result = sortGeneratorRef.current.next()

    if (!result.done) {
      const stepFromGenerator = result.value
      setCurrentRawSortStep(stepFromGenerator)
      onStepProcessed(stepFromGenerator)

      const liveStatsForStep = processActiveGeneratorStep(
        stepFromGenerator,
        tempLiveStats,
        visualStartTimeRef.current,
        0 // No delay for manual step
      )
      setTempLiveStats(liveStatsForStep)
      onLiveStatsUpdate(liveStatsForStep)
    } else {
      clearSortingTimeout()
      const finalAlgorithmResult = result.value
      const timingStats = calculateTimingStats(
        tempLiveStats,
        visualStartTimeRef.current,
        0,
        true // isPausedForDisplay true because it's a manual step
      )
      const finalCombinedStats: SortStats = {
        ...tempLiveStats,
        ...finalAlgorithmResult.stats,
        ...timingStats,
        numElements: array.length,
      } as SortStats

      const completionStep: SortStep = {
        array: [...finalAlgorithmResult.finalArray],
        sortedIndices: finalAlgorithmResult.finalArray.map((_, idx) => idx),
        message: `${selectedAlgorithm?.name || 'Algorithm'} Complete!`,
        currentStats: finalCombinedStats,
        auxiliaryStructures: currentRawSortStep?.auxiliaryStructures,
      }
      onSortComplete(finalAlgorithmResult.finalArray, finalCombinedStats, completionStep)
      setCurrentRawSortStep(completionStep)
      setIsSorting(false)
      setIsPaused(false)
      sortGeneratorRef.current = null
      setTempLiveStats(null)
    }
  }, [
    isSorting,
    isPaused,
    selectedAlgorithm,
    array.length,
    onStepProcessed,
    onSortComplete,
    onLiveStatsUpdate,
    visualStartTimeRef,
    processActiveGeneratorStep,
    calculateTimingStats,
    tempLiveStats,
    clearSortingTimeout,
    currentRawSortStep,
  ])

  // Effect to handle resume AND the initial start of the sort after state is set
  useEffect(() => {
    if (isSorting && !isPaused && sortGeneratorRef.current) {
      if (justResumedRef.current) {
        nextStep()
        justResumedRef.current = false
      } else if (!timeoutRef.current) {
        nextStep()
      }
    }
  }, [isSorting, isPaused, nextStep])

  // Effect to reset sorting state when the selected algorithm changes
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      return
    }

    resetExecution()
  }, [selectedAlgorithm, resetExecution])

  return {
    isSorting,
    isPaused,
    speed,
    setSpeed,
    currentRawSortStep,
    startSort,
    pauseSort,
    resumeSort,
    stepForward,
    clearSortingTimeout,
    resetExecution,
  }
}
