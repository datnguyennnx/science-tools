'use client'
import { useState, useEffect, useCallback, useTransition } from 'react'
import type { SortStep, SortStats } from '../types'
import type { SortAlgorithm, PerformanceScenario } from '../algorithmRegistry'
import {
  DEFAULT_ARRAY_SIZE,
  MIN_ARRAY_SIZE,
  MAX_ARRAY_SIZE,
  DEFAULT_SPEED,
  MIN_SPEED,
  MAX_SPEED,
} from '../../constants/sortSettings'
import { useSortableArray } from './useSortableArray'
import { useSortPerformance } from './useSortPerformance'
import { useSortWorker } from './useSortWorker'

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
    resetPerformanceStats,
  } = useSortPerformance()

  const [sortDirection, setSortDirectionState] = useState<'asc' | 'desc'>(initialSortDirection)
  const [performanceScenario, setPerformanceScenarioState] =
    useState<PerformanceScenario>('average')

  const [currentSpeed, setCurrentSpeed] = useState<number>(initialSpeed)

  const {
    currentStep: workerCurrentStepInput,
    isRunning: workerIsRunning,
    isPaused: workerIsPaused,
    startSort: workerStartSort,
    pauseSort: workerPauseSort,
    resumeSort: workerResumeSort,
    stopSort: workerStopSort,
    error: workerError,
  } = useSortWorker()

  const workerCurrentStep: SortStep | null = workerCurrentStepInput

  const [, startSortTransition] = useTransition()

  // Create a display step that shows the initial array if worker is idle
  const displayStep: SortStep | null =
    workerCurrentStep ??
    (array && array.length > 0
      ? {
          array: array,
          sortedIndices: [],
          comparisonIndices: [],
          swappingIndices: [],
          highlightedIndices: [],
          activeRange: undefined,
          tempSubArray: undefined,
          mainArrayLabel: undefined,
          currentPassAuxiliaryStructure: null,
          historicalAuxiliaryStructures: [],
          currentPseudoCodeLine: [],
          message: "Initial array state. Click 'Start' to sort.",
          currentStats: liveSortStats || {
            // liveSortStats should have numElements from reset
            algorithmName: selectedAlgorithm?.name,
            numElements: array.length,
            comparisons: 0,
            swaps: 0,
            mainArrayWrites: 0,
            auxiliaryArrayWrites: 0,
          },
        }
      : null)

  useEffect(() => {
    if (workerCurrentStep) {
      if (workerCurrentStep.currentStats) {
        setLiveSortStats(workerCurrentStep.currentStats)
      }

      if (
        !workerIsRunning &&
        workerIsPaused === false &&
        workerCurrentStep.array &&
        workerCurrentStep.sortedIndices
      ) {
        const isFullySorted =
          workerCurrentStep.array.length > 0 &&
          workerCurrentStep.sortedIndices.length === workerCurrentStep.array.length &&
          workerCurrentStep.array.every((_, i) => workerCurrentStep.sortedIndices?.includes(i))

        if (isFullySorted && workerCurrentStep.currentStats) {
          setFinalSortStats(workerCurrentStep.currentStats as SortStats)
          setLiveSortStats(null)
          setArray([...workerCurrentStep.array])
        }
      }
    } else if (!workerIsRunning && !workerIsPaused) {
      // When idle (e.g. after reset and before start), ensure live stats are cleared.
      // Final stats are cleared by reset.
      if (Object.keys(liveSortStats || {}).length > 0) {
        // Only clear if not already empty/null
        setLiveSortStats(null)
      }
    }
  }, [
    workerCurrentStep,
    workerIsRunning,
    workerIsPaused,
    setLiveSortStats,
    setFinalSortStats,
    setArray,
    liveSortStats,
  ])

  const performFullReset = useCallback(
    (newArrayToUse?: number[]) => {
      workerStopSort()
      const currentArray = newArrayToUse || regenerateArray(arraySize)
      setArray(currentArray) // Always set array, even if it's the regenerated one

      resetPerformanceStats()
      setFinalSortStats(null)
      setLiveSortStats({
        algorithmName: selectedAlgorithm?.name,
        numElements: currentArray.length,
      }) // Set initial live stats
    },
    [
      workerStopSort,
      regenerateArray,
      arraySize,
      setArray,
      resetPerformanceStats,
      setFinalSortStats,
      setLiveSortStats,
      selectedAlgorithm?.name, // Add selectedAlgorithm.name as a dependency for initial live stats
    ]
  )

  const startSort = useCallback(() => {
    if (selectedAlgorithm) {
      // Ensure performance stats are clean before a new sort.
      // performFullReset might have already set initial live stats,
      // but this ensures they are set with the current array if it was reset separately.
      resetPerformanceStats()
      setFinalSortStats(null) // Clear previous final stats
      setLiveSortStats({
        algorithmName: selectedAlgorithm.name,
        numElements: array.length,
        comparisons: 0,
        swaps: 0,
        accesses: 0,
        mainArrayWrites: 0,
        auxiliaryArrayWrites: 0,
      })
      startSortTransition(() => {
        workerStartSort(selectedAlgorithm.id, [...array], sortDirection, currentSpeed)
      })
    }
  }, [
    selectedAlgorithm,
    workerStartSort,
    array,
    sortDirection,
    currentSpeed,
    resetPerformanceStats,
    setFinalSortStats,
    setLiveSortStats,
    startSortTransition,
  ])

  const pauseSort = useCallback(() => {
    workerPauseSort()
  }, [workerPauseSort])

  const resumeSort = useCallback(() => {
    workerResumeSort()
  }, [workerResumeSort])

  useEffect(() => {
    performFullReset()
  }, [arraySize, performFullReset])

  const resetSort = useCallback(
    (newArray?: readonly number[]) => {
      performFullReset(newArray ? [...newArray] : undefined)
    },
    [performFullReset]
  )

  const setSortDirection = useCallback(
    (direction: 'asc' | 'desc') => {
      setSortDirectionState(direction)
      // No direct reset here, will be caught by the useEffect below if sortDirection is a dep
    },
    [setSortDirectionState]
  )

  const setPerformanceScenario = useCallback(
    (scenario: PerformanceScenario) => {
      setPerformanceScenarioState(scenario)
    },
    [setPerformanceScenarioState]
  )

  useEffect(() => {
    // Reset when algorithm or direction changes.
    // This will call performFullReset, which stops the worker and resets states.
    resetSort()
  }, [selectedAlgorithm, sortDirection, resetSort])

  useEffect(() => {
    if (workerError) {
      console.error('Sort Worker Error:', workerError)
      // TODO: Set an error state here to inform the user via UI
    }
  }, [workerError])

  const algorithmName =
    workerCurrentStep?.currentStats?.algorithmName || selectedAlgorithm?.name || 'N/A'

  const stableSetArraySize = useCallback(setArraySize, [setArraySize])
  const stableSetSpeed = useCallback(
    (newSpeed: number) => {
      setCurrentSpeed(newSpeed)
      // TODO: If worker needs speed updates, send a message here.
      // For now, this just updates local state.
      console.log('Set speed to:', newSpeed)
    },
    [setCurrentSpeed]
  )

  return {
    array,
    arraySize,
    setArraySize: stableSetArraySize,
    sortDirection,
    setSortDirection,
    currentSortStep: displayStep,
    isSorting: workerIsRunning,
    isPaused: workerIsPaused,
    liveSortStats,
    finalSortStats,
    speed: currentSpeed,
    setSpeed: stableSetSpeed,
    MIN_ARRAY_SIZE,
    MAX_ARRAY_SIZE,
    MIN_SPEED,
    MAX_SPEED,
    performanceScenario,
    setPerformanceScenario,
    startSort,
    pauseSort,
    resumeSort,
    resetSort,
    algorithmName,
    workerError,
  }
}
