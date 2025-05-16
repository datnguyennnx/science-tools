'use client'
import { useState, useEffect, useCallback } from 'react'
import type { SortStep, SortStats } from '../types'
import type { SortAlgorithm } from '../algorithmRegistry'
import { SORT_ALGORITHMS } from '../algorithmRegistry'
import {
  DEFAULT_ARRAY_SIZE,
  MIN_ARRAY_SIZE,
  MAX_ARRAY_SIZE,
  MAX_VALUE,
  DEFAULT_SPEED,
  MIN_SPEED,
  MAX_SPEED,
} from '../../constants/sortSettings'
import { useSortableArray } from './useSortableArray'
import { useSortPerformance } from './useSortPerformance'
import { useSortExecution } from './useSortExecution'
// import { useDebouncedAuxiliaryStructures } from './useDebouncedAuxiliaryStructures'

export interface UseSortControlsProps {
  initialSpeed?: number
  initialSortDirection?: 'asc' | 'desc'
  selectedAlgorithm: SortAlgorithm | undefined
}

export const useSortControls = ({
  initialSpeed = DEFAULT_SPEED,
  initialSortDirection = 'asc',
  selectedAlgorithm,
}: UseSortControlsProps) => {
  const { array, setArray, arraySize, setArraySize, regenerateArray } =
    useSortableArray(DEFAULT_ARRAY_SIZE)

  const {
    liveSortStats,
    finalSortStats,
    setLiveSortStats,
    setFinalSortStats,
    visualStartTimeRef,
    processActiveGeneratorStep,
    calculateTimingStats,
    resetPerformanceStats,
  } = useSortPerformance()

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection)
  const [sortSteps, setSortSteps] = useState<SortStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1)
  const [displayedSortStep, setDisplayedSortStep] = useState<SortStep | null>(null)

  const auxiliaryStructures = displayedSortStep?.auxiliaryStructures

  const currentStep = sortSteps[currentStepIndex]

  const algorithmName = currentStep?.currentStats?.algorithmName || 'N/A'

  const handleStepProcessed = useCallback((step: SortStep) => {
    setDisplayedSortStep(step)
    setSortSteps(prev => [...prev, step])
    setCurrentStepIndex(prev => prev + 1)
  }, [])

  const handleSortComplete = useCallback(
    (finalArray: number[], stats: SortStats, lastStep: SortStep) => {
      setArray(finalArray)
      setFinalSortStats(stats)
      setLiveSortStats(null)
      setDisplayedSortStep(lastStep)
    },
    [setArray, setFinalSortStats, setLiveSortStats]
  )

  const handleLiveStatsUpdate = useCallback(
    (stats: Partial<SortStats>) => {
      setLiveSortStats(stats)
    },
    [setLiveSortStats]
  )

  const {
    isSorting,
    isPaused,
    speed,
    setSpeed,
    startSort,
    pauseSort,
    resumeSort,
    stepForward,
    resetExecution,
  } = useSortExecution({
    array,
    sortDirection,
    selectedAlgorithm,
    initialSpeed,
    onStepProcessed: handleStepProcessed,
    onSortComplete: handleSortComplete,
    onLiveStatsUpdate: handleLiveStatsUpdate,
    visualStartTimeRef,
    processActiveGeneratorStep,
    calculateTimingStats,
  })

  const performFullReset = useCallback(
    (newArrayToUse?: number[]) => {
      resetExecution()
      const currentArray = newArrayToUse || regenerateArray(arraySize)
      if (newArrayToUse) {
        setArray(currentArray)
      }

      const initialStep: SortStep = { array: [...currentArray], sortedIndices: [] }
      setSortSteps([initialStep])
      setCurrentStepIndex(0)
      setDisplayedSortStep(initialStep)
      resetPerformanceStats()
      setFinalSortStats(null)
      setLiveSortStats({})
    },
    [
      regenerateArray,
      arraySize,
      setArray,
      resetPerformanceStats,
      resetExecution,
      setFinalSortStats,
      setLiveSortStats,
    ]
  )

  useEffect(() => {
    performFullReset()
  }, [performFullReset])

  useEffect(() => {
    performFullReset()
  }, [arraySize, performFullReset])

  const resetSort = useCallback(
    (newArray?: readonly number[]) => {
      performFullReset(newArray ? [...newArray] : undefined)
    },
    [performFullReset]
  )

  // Effect to reset everything when the selected algorithm changes
  useEffect(() => {
    // Don't reset on initial mount if selectedAlgorithm is the default
    // This check might need adjustment based on how initialSelectedAlgorithmId is handled upstream
    if (selectedAlgorithm && selectedAlgorithm.id !== (SORT_ALGORITHMS[0]?.id || '')) {
      resetSort()
    }
    // Adding resetSort to dependency array as it's a useCallback
    // selectedAlgorithm.id is not directly available for dependency, using selectedAlgorithm which is a memoized object
  }, [selectedAlgorithm, resetSort])

  return {
    array,
    arraySize,
    setArraySize,
    sortDirection,
    setSortDirection,
    currentSortStep: displayedSortStep,
    isSorting,
    isPaused,
    liveSortStats,
    finalSortStats,
    auxiliaryStructures,
    speed,
    setSpeed,
    MIN_ARRAY_SIZE,
    MAX_ARRAY_SIZE,
    MAX_VALUE,
    MIN_SPEED,
    MAX_SPEED,
    sortSteps,
    currentStepIndex,
    startSort,
    pauseSort,
    resumeSort,
    stepForward,
    resetSort,
    algorithmName,
  }
}
