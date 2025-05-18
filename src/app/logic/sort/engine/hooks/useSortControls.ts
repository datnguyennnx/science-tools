'use client'
import { useState, useEffect, useCallback, useTransition, useRef } from 'react'
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

type ResetState = 'idle' | 'awaiting_stop' | 'configuring'
interface PendingResetConfig {
  newArraySize?: number
  newArray?: ReadonlyArray<number>
  newSelectedAlgorithmName?: string // Store name for initial stats
  newSortDirection?: 'asc' | 'desc'
  forceRegenerate?: boolean // Added for explicit regeneration
  reason: string // For debugging/logging
}

export const useSortControls = ({
  initialSpeed = DEFAULT_SPEED,
  initialSortDirection = 'asc',
  selectedAlgorithm,
}: UseSortControlsProps) => {
  const {
    array: currentArrayInternal, // Renamed to avoid conflict
    setArray: setInternalArray,
    arraySize: currentArraySizeInternal,
    setArraySize: setInternalArraySize,
    regenerateArray,
  } = useSortableArray(DEFAULT_ARRAY_SIZE)

  const {
    liveSortStats,
    finalSortStats,
    setLiveSortStats,
    setFinalSortStats,
    resetPerformanceStats,
  } = useSortPerformance()

  // User-facing state for direction and speed (controlled by this hook)
  const [sortDirection, setSortDirectionState] = useState<'asc' | 'desc'>(initialSortDirection)
  const [currentSpeed, setCurrentSpeed] = useState<number>(initialSpeed)
  const [performanceScenario, setPerformanceScenarioState] =
    useState<PerformanceScenario>('average')

  // Worker communication and state
  const {
    currentStep: workerCurrentStepInput,
    isRunning: workerIsRunning,
    isPaused: workerIsPaused,
    isStopping: workerIsStopping,
    startSort: workerStartSort,
    pauseSort: workerPauseSort,
    resumeSort: workerResumeSort,
    stopSort: workerStopSort,
    requestOneStep: workerRequestOneStep,
    error: workerError,
  } = useSortWorker()

  const workerCurrentStep: SortStep | null = workerCurrentStepInput

  const [, startUILayoutTransition] = useTransition() // For UI updates that can be deferred

  // State for managing the reset flow
  const [resetState, setResetState] = useState<ResetState>('idle')
  const [pendingResetConfig, setPendingResetConfig] = useState<PendingResetConfig | null>(null)

  // Track previous algorithm and direction to detect changes for reset
  const prevSelectedAlgorithmRef = useRef<SortAlgorithm | undefined>(selectedAlgorithm)
  // const prevSortDirectionRef = useRef<'asc' | 'desc'>(sortDirection); // Likely unused, commenting out for now
  const prevArraySizeRef = useRef<number>(currentArraySizeInternal)

  // --- Core Reset Logic ---
  const initiateReset = useCallback(
    (config: PendingResetConfig) => {
      setPendingResetConfig(config)
      if (workerIsRunning || workerIsPaused) {
        setResetState('awaiting_stop')
        workerStopSort()
      } else {
        // If worker is idle (or already stopping and will soon be idle),
        // we can move to configuring. The effect below will pick it up.
        setResetState('configuring')
      }
    },
    [workerIsRunning, workerIsPaused, workerStopSort]
  )

  useEffect(() => {
    if (
      resetState === 'awaiting_stop' &&
      !workerIsRunning &&
      !workerIsPaused &&
      !workerIsStopping
    ) {
      // Worker has stopped, proceed to configure
      setResetState('configuring')
    } else if (resetState === 'configuring' && pendingResetConfig) {
      startUILayoutTransition(() => {
        let newArrayToUse = currentArrayInternal
        let newSize = currentArraySizeInternal

        if (pendingResetConfig.forceRegenerate) {
          // If forceRegenerate is true, always regenerate with the determined size.
          // newSize would be pendingResetConfig.newArraySize if provided, else currentArraySizeInternal.
          newSize =
            pendingResetConfig.newArraySize !== undefined
              ? pendingResetConfig.newArraySize
              : currentArraySizeInternal
          newArrayToUse = regenerateArray(newSize)
        } else if (
          pendingResetConfig.newArraySize !== undefined &&
          pendingResetConfig.newArraySize !== currentArraySizeInternal
        ) {
          newSize = pendingResetConfig.newArraySize
          newArrayToUse = regenerateArray(newSize)
        } else if (pendingResetConfig.newArray) {
          newArrayToUse = [...pendingResetConfig.newArray]
          newSize = newArrayToUse.length
        }

        // Apply the new array and size if they changed
        if (newSize !== currentArraySizeInternal) {
          setInternalArraySize(newSize) // Update the source of truth for size
        }
        if (newArrayToUse !== currentArrayInternal) {
          setInternalArray(newArrayToUse) // Update the source of truth for array
        }

        resetPerformanceStats()
        setFinalSortStats(null)
        setLiveSortStats({
          algorithmName: pendingResetConfig.newSelectedAlgorithmName || selectedAlgorithm?.name,
          numElements: newSize,
          comparisons: 0,
          swaps: 0,
          mainArrayWrites: 0,
          auxiliaryArrayWrites: 0,
        })

        // If direction changed as part of reset, ensure it's reflected
        if (
          pendingResetConfig.newSortDirection &&
          pendingResetConfig.newSortDirection !== sortDirection
        ) {
          setSortDirectionState(pendingResetConfig.newSortDirection)
        }

        // Update prevArraySizeRef to the size that was just configured.
        // This prevents the useEffect watching currentArraySizeInternal from re-triggering a reset.
        prevArraySizeRef.current = newSize

        setPendingResetConfig(null)
        setResetState('idle')
      })
    }
  }, [
    resetState,
    workerIsRunning,
    workerIsPaused,
    workerIsStopping,
    pendingResetConfig,
    currentArrayInternal,
    currentArraySizeInternal,
    regenerateArray,
    setInternalArray,
    setInternalArraySize,
    resetPerformanceStats,
    setFinalSortStats,
    setLiveSortStats,
    selectedAlgorithm?.name,
    sortDirection, // to ensure latest direction is used if not overridden by pendingConfig
  ])

  // --- Event Handlers & Effects for triggering resets ---

  // Public function to reset with current parameters or new array
  const resetSort = useCallback(
    (newArray?: readonly number[]) => {
      const isForceRegenerate = newArray === undefined // True if called by "New Array" button
      initiateReset({
        newArray: newArray,
        newSelectedAlgorithmName: selectedAlgorithm?.name,
        newSortDirection: sortDirection,
        newArraySize: newArray ? newArray.length : currentArraySizeInternal,
        forceRegenerate: isForceRegenerate, // Set the flag
        reason: newArray ? 'manual_reset_with_new_array' : 'manual_reset_new_array_button',
      })
    },
    [selectedAlgorithm?.name, sortDirection, currentArraySizeInternal, initiateReset]
  )

  // Effect for changes in selectedAlgorithm
  useEffect(() => {
    if (selectedAlgorithm && prevSelectedAlgorithmRef.current?.id !== selectedAlgorithm.id) {
      initiateReset({
        newSelectedAlgorithmName: selectedAlgorithm.name,
        newSortDirection: sortDirection, // Keep current direction
        newArraySize: currentArraySizeInternal, // Keep current size
        reason: `algorithm_changed_to_${selectedAlgorithm.id}`,
      })
    }
    prevSelectedAlgorithmRef.current = selectedAlgorithm
  }, [selectedAlgorithm, sortDirection, currentArraySizeInternal, initiateReset])

  // Public setter for sortDirection
  const setSortDirection = useCallback(
    (newDirection: 'asc' | 'desc') => {
      if (newDirection !== sortDirection && resetState === 'idle') {
        initiateReset({
          newSelectedAlgorithmName: selectedAlgorithm?.name,
          newSortDirection: newDirection,
          newArraySize: currentArraySizeInternal,
          reason: `direction_changed_to_${newDirection}`,
        })
        // Optimistically update UI for direction if needed, or let effect handle it
        // setSortDirectionState(newDirection); // Can be set here, or by the effect when configuring
      } else if (newDirection !== sortDirection && resetState !== 'idle') {
        // If a reset is already pending, update the pending config's direction
        setPendingResetConfig(prev =>
          prev
            ? {
                ...prev,
                newSortDirection: newDirection,
                reason: prev.reason + `_and_direction_to_${newDirection}`,
              }
            : null
        )
        // And update the state that the main effect reads, if appropriate, or just let the pending config take precedence
        setSortDirectionState(newDirection)
      } else {
        setSortDirectionState(newDirection) // No reset needed, just update
      }
    },
    [sortDirection, selectedAlgorithm?.name, currentArraySizeInternal, initiateReset, resetState]
  )

  // Public setter for arraySize
  const setArraySize = useCallback(
    (newSize: number) => {
      if (newSize !== currentArraySizeInternal && resetState === 'idle') {
        initiateReset({
          newArraySize: newSize,
          newSelectedAlgorithmName: selectedAlgorithm?.name,
          newSortDirection: sortDirection,
          reason: `array_size_changed_to_${newSize}`,
        })
      } else if (newSize !== currentArraySizeInternal && resetState !== 'idle') {
        setPendingResetConfig(prev =>
          prev
            ? { ...prev, newArraySize: newSize, reason: prev.reason + `_and_size_to_${newSize}` }
            : null
        )
      }
      // Note: The actual currentArraySizeInternal is updated by the reset effect later
      // or by useSortableArray if no reset is needed. For direct changes without reset,
      // this would directly call setInternalArraySize.
      // For now, we assume size changes always go through reset if active.
      // If not active, it should just update. This part needs care.

      // If no reset is being initiated (e.g. worker idle, and this is a direct size change request)
      if (resetState === 'idle' && newSize !== currentArraySizeInternal) {
        setInternalArraySize(newSize) // This will trigger useSortableArray's own array regeneration.
        // Then a reset is needed for stats.
        initiateReset({
          newArraySize: newSize, // This might be redundant if setInternalArraySize already triggers array update
          newSelectedAlgorithmName: selectedAlgorithm?.name,
          newSortDirection: sortDirection,
          reason: `array_size_direct_change_to_${newSize}`,
        })
      }
    },
    [
      currentArraySizeInternal,
      selectedAlgorithm?.name,
      sortDirection,
      initiateReset,
      resetState,
      setInternalArraySize,
    ]
  )

  // Effect for arraySize changes from useSortableArray (if it regenerates independently)
  useEffect(() => {
    if (currentArraySizeInternal !== prevArraySizeRef.current && resetState === 'idle') {
      // This handles if useSortableArray changed the size and we need to reset everything else.
      initiateReset({
        newArraySize: currentArraySizeInternal,
        newSelectedAlgorithmName: selectedAlgorithm?.name,
        newSortDirection: sortDirection,
        reason: `internal_array_size_sync_to_${currentArraySizeInternal}`,
      })
    }
    prevArraySizeRef.current = currentArraySizeInternal
  }, [currentArraySizeInternal, selectedAlgorithm?.name, sortDirection, initiateReset, resetState])

  // --- Worker Interaction Callbacks ---
  const startSort = useCallback(() => {
    if (workerIsRunning || workerIsStopping || resetState !== 'idle') {
      return
    }
    if (selectedAlgorithm && currentArrayInternal.length > 0) {
      // Ensure stats are clean for the current array configuration
      resetPerformanceStats() // Clear any lingering stats
      setFinalSortStats(null)
      setLiveSortStats({
        algorithmName: selectedAlgorithm.name,
        numElements: currentArrayInternal.length,
        comparisons: 0,
        swaps: 0,
        accesses: 0,
        mainArrayWrites: 0,
        auxiliaryArrayWrites: 0,
      })
      workerStartSort(selectedAlgorithm.id, [...currentArrayInternal], sortDirection, currentSpeed)
    }
  }, [
    workerIsRunning,
    workerIsStopping,
    resetState,
    selectedAlgorithm,
    currentArrayInternal,
    sortDirection,
    currentSpeed,
    workerStartSort,
    resetPerformanceStats, // Added
    setFinalSortStats, // Added
    setLiveSortStats, // Added
  ])

  // Pause and Resume are direct pass-throughs, guarded by useSortWorker
  const memoizedPauseSort = useCallback(workerPauseSort, [workerPauseSort])
  const memoizedResumeSort = useCallback(workerResumeSort, [workerResumeSort])

  // --- Step Forward Logic ---
  const stepForward = useCallback(() => {
    if (resetState !== 'idle') {
      return
    }

    if (!workerIsRunning && !workerIsPaused && !workerIsStopping) {
      // Sort hasn't started yet, start it in step mode
      if (selectedAlgorithm && currentArrayInternal.length > 0) {
        resetPerformanceStats()
        setFinalSortStats(null)
        setLiveSortStats({
          algorithmName: selectedAlgorithm.name,
          numElements: currentArrayInternal.length,
          comparisons: 0,
          swaps: 0,
          accesses: 0,
          mainArrayWrites: 0,
          auxiliaryArrayWrites: 0,
        })
        workerStartSort(
          selectedAlgorithm.id,
          [...currentArrayInternal],
          sortDirection,
          currentSpeed,
          true /* initialStepMode */
        )
      } else {
      }
    } else if (workerIsRunning && workerIsPaused && !workerIsStopping) {
      // Sort is paused, request next step
      workerRequestOneStep()
    } else {
      // In another state (e.g., running continuously, stopping), cannot step.
    }
  }, [
    resetState,
    workerIsRunning,
    workerIsPaused,
    workerIsStopping,
    selectedAlgorithm,
    currentArrayInternal,
    sortDirection,
    currentSpeed,
    workerStartSort,
    workerRequestOneStep,
    resetPerformanceStats,
    setFinalSortStats,
    setLiveSortStats,
  ])

  // --- Stats and Step Handling ---
  useEffect(() => {
    if (workerCurrentStep) {
      if (workerCurrentStep.currentStats) {
        setLiveSortStats(workerCurrentStep.currentStats)
      }
      if (
        !workerIsRunning &&
        !workerIsPaused &&
        workerCurrentStep.array &&
        workerCurrentStep.sortedIndices?.length === workerCurrentStep.array.length
      ) {
        // Sort is complete
        if (workerCurrentStep.currentStats) {
          setFinalSortStats(workerCurrentStep.currentStats as SortStats)
        }
        setInternalArray([...workerCurrentStep.array]) // Ensure internal array reflects final sorted state
        setLiveSortStats(null) // Clear live stats once final
      }
    } else if (!workerIsRunning && !workerIsPaused && resetState === 'idle') {
      // Idle and not resetting, ensure live stats are cleared if they somehow persist
      if (Object.keys(liveSortStats || {}).length > 0 && !finalSortStats) {
        setLiveSortStats(null)
      }
    }
  }, [
    workerCurrentStep,
    workerIsRunning,
    workerIsPaused,
    resetState,
    setLiveSortStats,
    setFinalSortStats,
    setInternalArray,
    liveSortStats,
    finalSortStats,
  ])

  // Display step logic
  const displayStep: SortStep | null =
    workerCurrentStep ??
    (currentArrayInternal && currentArrayInternal.length > 0
      ? {
          array: currentArrayInternal,
          sortedIndices: [],
          message:
            resetState !== 'idle'
              ? `Reconfiguring (${resetState})... Please wait.`
              : "Initial array state. Click 'Start' to sort.",
          currentStats: liveSortStats || {
            algorithmName: selectedAlgorithm?.name,
            numElements: currentArrayInternal.length,
            comparisons: 0,
            swaps: 0,
            mainArrayWrites: 0,
            auxiliaryArrayWrites: 0,
          },
          comparisonIndices: [],
          swappingIndices: [],
          highlightedIndices: [],
          currentPassAuxiliaryStructure: null,
          historicalAuxiliaryStructures: [],
          currentPseudoCodeLine: [],
        }
      : null)

  useEffect(() => {
    if (workerError) {
      console.error('Sort Worker Error from useSortControls:', workerError)
      setResetState('idle')
      setPendingResetConfig(null)
    }
  }, [workerError])

  const algorithmName =
    workerCurrentStep?.currentStats?.algorithmName || selectedAlgorithm?.name || 'N/A'
  const isBusy = workerIsRunning || workerIsStopping || resetState !== 'idle'

  return {
    array: currentArrayInternal,
    arraySize: currentArraySizeInternal,
    setArraySize, // Use the new one
    sortDirection,
    setSortDirection, // Use the new one
    currentSortStep: displayStep,
    isBusy,
    isPaused: workerIsPaused,
    isStopping: workerIsStopping, // Expose for fine-grained UI control if needed
    liveSortStats,
    finalSortStats,
    speed: currentSpeed,
    setSpeed: setCurrentSpeed, // Direct setter for speed, no reset needed typically
    MIN_ARRAY_SIZE,
    MAX_ARRAY_SIZE,
    MIN_SPEED,
    MAX_SPEED,
    performanceScenario, // performanceScenario state itself
    setPerformanceScenario: setPerformanceScenarioState, // Correctly expose the setter
    startSort,
    pauseSort: memoizedPauseSort,
    resumeSort: memoizedResumeSort,
    resetSort, // Use the new one
    stepForward, // Expose stepForward
    algorithmName,
    error: workerError,
  }
}
