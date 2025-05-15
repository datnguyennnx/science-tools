import { useState, useEffect, useCallback, useRef } from 'react'
import type { SortStep } from '../types'
import type { SortAlgorithm } from '../algorithmRegistry'
import type { SortStats } from '../types'

const MIN_ARRAY_SIZE = 5
const MAX_ARRAY_SIZE = 200
const DEFAULT_ARRAY_SIZE = 20
const MIN_VALUE = 10
const MAX_VALUE = 100
const DEFAULT_SPEED = 5
const MIN_SPEED = 1
const MAX_SPEED = 10
const BASE_DELAY_MS = 200
const MIN_DELAY_MS = 1

export interface UseSortControlsProps {
  initialArraySize?: number
  initialSpeed?: number
  initialSortDirection?: 'asc' | 'desc'
  selectedAlgorithm: SortAlgorithm | undefined
}

export const useSortControls = ({
  initialArraySize = DEFAULT_ARRAY_SIZE,
  initialSpeed = DEFAULT_SPEED,
  initialSortDirection = 'asc',
  selectedAlgorithm,
}: UseSortControlsProps) => {
  const [array, setArray] = useState<number[]>([])
  const [arraySize, setArraySize] = useState<number>(initialArraySize)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection)
  const [sortSteps, setSortSteps] = useState<SortStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1)
  const [isSorting, setIsSorting] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(initialSpeed)
  const [finalSortStats, setFinalSortStats] = useState<SortStats | null>(null)
  const [liveSortStats, setLiveSortStats] = useState<Partial<SortStats> | null>(null)

  const sortGeneratorRef = useRef<Generator<
    SortStep,
    { finalArray: number[]; stats: SortStats },
    void
  > | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const justResumedRef = useRef(false)
  const visualStartTimeRef = useRef<number | null>(null)

  const clearSortingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const generateRandomArray = useCallback(() => {
    const newArray: number[] = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
    )
    setArray(newArray)
    clearSortingTimeout()
    const initialStep: SortStep = { array: [...newArray], sortedIndices: [] }
    setSortSteps([initialStep])
    setCurrentStepIndex(0)
    setIsSorting(false)
    setIsPaused(false)
    setFinalSortStats(null)
    setLiveSortStats({
      delay: '-',
      visualTime: '-',
      sortTime: '-',
    })
    sortGeneratorRef.current = null
    visualStartTimeRef.current = null
  }, [arraySize, clearSortingTimeout])

  useEffect(() => {
    generateRandomArray()
  }, [generateRandomArray])

  const calculateDelay = useCallback(() => {
    const speedRange = MAX_SPEED - MIN_SPEED
    const delayRange = BASE_DELAY_MS - MIN_DELAY_MS
    const normalizedSpeed = (MAX_SPEED - speed) / speedRange
    const delay = MIN_DELAY_MS + Math.pow(normalizedSpeed, 2) * delayRange
    return Math.max(MIN_DELAY_MS, delay)
  }, [speed])

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
      isPausedForDisplay?: boolean // Specifically for stepForward's "Paused" delay display
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

  const nextStep = useCallback(() => {
    if (isPaused) return
    if (!sortGeneratorRef.current) return

    const result = sortGeneratorRef.current.next()

    if (!result.done) {
      const currentStep = result.value
      setSortSteps(prevSteps => [...prevSteps, currentStep])
      setCurrentStepIndex(prevIndex => prevIndex + 1)

      const updatedLiveStats: Partial<SortStats> = processActiveGeneratorStep(
        currentStep,
        liveSortStats,
        visualStartTimeRef.current,
        calculateDelay()
      )
      setLiveSortStats(updatedLiveStats)

      timeoutRef.current = setTimeout(nextStep, calculateDelay())
    } else {
      clearSortingTimeout()

      const timingStats = calculateTimingStats(
        liveSortStats,
        visualStartTimeRef.current,
        calculateDelay()
      )
      if (visualStartTimeRef.current) {
        visualStartTimeRef.current = null // Clear after use
      }

      let returnedStats: Partial<SortStats> = {}
      // Ensure result.value and result.value.stats are properly typed and checked
      const genResultValue = result.value as { finalArray?: number[]; stats?: Partial<SortStats> }

      if (typeof genResultValue === 'object' && genResultValue !== null && genResultValue.stats) {
        returnedStats = genResultValue.stats
      }

      const lastYieldedStep = sortSteps[currentStepIndex]
      // Use finalArray from generator result if available, otherwise fallback
      const finalArrayFromGenerator = genResultValue?.finalArray
      const arrayForStep = finalArrayFromGenerator
        ? [...finalArrayFromGenerator]
        : lastYieldedStep?.array
          ? [...lastYieldedStep.array]
          : [...array]

      const lastYieldedStepCurrentStats = lastYieldedStep?.currentStats || {}

      const finalCombinedStats: SortStats = {
        ...(liveSortStats || {}), // Start with any existing live stats
        ...lastYieldedStepCurrentStats, // Overlay stats from the last actual step
        ...returnedStats, // Overlay stats directly returned by the generator
        ...timingStats, // Overlay the calculated timing stats
        numElements: arrayForStep.length, // Use the length of the determined final array
      } as SortStats

      if (lastYieldedStep || finalArrayFromGenerator) {
        const stepToUpdateIndex = lastYieldedStep ? currentStepIndex : -1 // -1 if we need to add a new final step

        const updatedStepData: SortStep = {
          array: arrayForStep,
          message:
            returnedStats.algorithmName || lastYieldedStep?.message
              ? `${returnedStats.algorithmName || finalCombinedStats.algorithmName || 'Algorithm'} Complete!`
              : 'Sort Complete!',
          sortedIndices: [...Array(arrayForStep.length).keys()],
          highlightedIndices: lastYieldedStep?.highlightedIndices?.length
            ? lastYieldedStep.highlightedIndices
            : [],
          comparisonIndices: lastYieldedStep?.comparisonIndices?.length
            ? lastYieldedStep.comparisonIndices
            : [],
          swappingIndices:
            lastYieldedStep?.swappingIndices !== undefined ? lastYieldedStep.swappingIndices : null,
          activeRange: lastYieldedStep?.activeRange,
          currentStats: finalCombinedStats, // Crucially, use the fully combined stats
        }

        if (stepToUpdateIndex !== -1 && sortSteps[stepToUpdateIndex]) {
          setSortSteps(prevSteps => {
            const newSteps = [...prevSteps]
            newSteps[stepToUpdateIndex] = {
              ...prevSteps[stepToUpdateIndex], // Preserve other properties of the last yielded step
              ...updatedStepData, // Overlay with new final data
            }
            return newSteps
          })
        } else {
          // This case should ideally not be hit if a sort was in progress,
          // but as a fallback, add a new step.
          setSortSteps(prevSteps => [...prevSteps, updatedStepData])
          setCurrentStepIndex(prevIndex => prevIndex + 1)
        }
      }
      // If lastYieldedStep was undefined (shouldn't happen if sorting started),
      // no step update occurs, but stats and sorting state are still finalized.

      setFinalSortStats(finalCombinedStats)
      setLiveSortStats(null)
      setIsSorting(false)
      setIsPaused(false)
      sortGeneratorRef.current = null
    }
  }, [
    isPaused,
    clearSortingTimeout,
    sortSteps,
    currentStepIndex,
    array,
    liveSortStats,
    calculateDelay,
    processActiveGeneratorStep,
    calculateTimingStats,
  ])

  const startSort = useCallback(() => {
    if (!selectedAlgorithm?.generator || isSorting || array.length <= 1) return

    sortGeneratorRef.current = selectedAlgorithm.generator([...array], sortDirection) as Generator<
      SortStep,
      { finalArray: number[]; stats: SortStats },
      void
    >
    const initialStep: SortStep = { array: [...array], sortedIndices: [] }
    setSortSteps([initialStep])
    setCurrentStepIndex(0)
    setFinalSortStats(null)
    setLiveSortStats({
      delay: `${calculateDelay().toFixed(1)} ms`,
      visualTime: '0.00 s',
      sortTime: '0.00 s',
    })
    setIsSorting(true)
    setIsPaused(false)
    clearSortingTimeout()
    visualStartTimeRef.current = Date.now()
    timeoutRef.current = setTimeout(nextStep, calculateDelay())
  }, [
    selectedAlgorithm,
    array,
    sortDirection,
    isSorting,
    calculateDelay,
    nextStep,
    clearSortingTimeout,
  ])

  const pauseSort = useCallback(() => {
    if (!isSorting || isPaused) return
    setIsPaused(true)
    clearSortingTimeout()
  }, [isSorting, isPaused, clearSortingTimeout])

  const resumeSort = useCallback(() => {
    if (!isSorting || !isPaused) return
    justResumedRef.current = true
    setIsPaused(false)
  }, [isSorting, isPaused])

  const resetSort = useCallback(() => {
    generateRandomArray()
  }, [generateRandomArray])

  const stepForward = useCallback(() => {
    if (!isSorting || !isPaused || !sortGeneratorRef.current) return

    const result = sortGeneratorRef.current.next()

    if (!result.done) {
      const currentStep = result.value
      setSortSteps(prevSteps => [...prevSteps, currentStep])
      setCurrentStepIndex(prevIndex => prevIndex + 1)

      const updatedLiveStats: Partial<SortStats> = processActiveGeneratorStep(
        currentStep,
        liveSortStats,
        visualStartTimeRef.current,
        calculateDelay()
      )
      setLiveSortStats(updatedLiveStats)
    } else {
      clearSortingTimeout() // Clear any pending timeout for autoplay

      const baseStats = { ...(liveSortStats || {}) }
      const timingPart = calculateTimingStats(
        baseStats,
        visualStartTimeRef.current,
        calculateDelay(),
        isPaused // Pass isPaused for the "Paused" delay display
      )
      if (visualStartTimeRef.current) {
        visualStartTimeRef.current = null // Clear after use
      }

      let determinedFinalArray: ReadonlyArray<number>
      let determinedStats: Partial<SortStats> = {
        ...baseStats,
        ...timingPart,
      }

      const genResultValue = result.value as {
        finalArray?: ReadonlyArray<number>
        stats?: Partial<SortStats>
      }

      if (genResultValue?.finalArray && Array.isArray(genResultValue.finalArray)) {
        determinedFinalArray = genResultValue.finalArray
        if (genResultValue.stats && typeof genResultValue.stats === 'object') {
          determinedStats = {
            ...determinedStats,
            ...genResultValue.stats,
          }
        }
      } else if (Array.isArray(genResultValue)) {
        // Fallback if generator directly returns an array (older convention)
        determinedFinalArray = genResultValue
      } else {
        // Fallback to the array from the last known step if generator result is unexpected
        determinedFinalArray = sortSteps[currentStepIndex]?.array
          ? [...sortSteps[currentStepIndex].array]
          : [...array]
      }

      // Ensure numElements is set
      determinedStats.numElements = determinedFinalArray.length
      if (!determinedStats.algorithmName && selectedAlgorithm?.name) {
        determinedStats.algorithmName = selectedAlgorithm.name
      }

      const finalStepObject: SortStep = {
        array: determinedFinalArray,
        message: `${determinedStats.algorithmName || 'Sort'} Complete! (Stepped)`,
        sortedIndices: [...Array(determinedFinalArray.length).keys()],
        currentStats: determinedStats as SortStats, // Cast as SortStats, assuming it's complete
        // Clear other visual cues for the final step
        highlightedIndices: [],
        comparisonIndices: [],
        swappingIndices: null,
        activeRange: undefined,
      }

      setSortSteps(prevSteps => [...prevSteps, finalStepObject])
      setCurrentStepIndex(prevIndex => prevIndex + 1)
      setFinalSortStats(determinedStats as SortStats)
      setLiveSortStats(null) // Clear live stats as we have final stats now
      setIsSorting(false)
      setIsPaused(false)
      sortGeneratorRef.current = null
    }
  }, [
    isSorting,
    isPaused,
    clearSortingTimeout,
    sortSteps,
    currentStepIndex,
    array,
    liveSortStats,
    selectedAlgorithm,
    calculateDelay,
    processActiveGeneratorStep,
    calculateTimingStats,
  ])

  useEffect(() => {
    if (isSorting && !isPaused && justResumedRef.current) {
      if (sortGeneratorRef.current) {
        clearSortingTimeout()
        nextStep()
      }
      justResumedRef.current = false
    } else if (!isSorting || isPaused) {
      justResumedRef.current = false
    }
  }, [isSorting, isPaused, nextStep, clearSortingTimeout])

  useEffect(() => {
    return () => {
      clearSortingTimeout()
      visualStartTimeRef.current = null
    }
  }, [clearSortingTimeout])

  useEffect(() => {
    if (isSorting && !isPaused) {
      setLiveSortStats(prevStats => ({
        ...(prevStats || {}),
        delay: `${calculateDelay().toFixed(1)} ms`,
      }))
    }
  }, [speed, isSorting, isPaused, calculateDelay])

  const currentSortStep = sortSteps[currentStepIndex] || null
  const auxiliaryStructures = currentSortStep?.auxiliaryStructures
  const actualLiveStats = currentSortStep?.currentStats
    ? { ...(liveSortStats || {}), ...currentSortStep.currentStats }
    : liveSortStats

  return {
    array,
    arraySize,
    setArraySize: (newSize: number) => {
      setArraySize(newSize)
    },
    sortDirection,
    setSortDirection,
    sortSteps,
    currentStepIndex,
    isSorting,
    isPaused,
    speed,
    setSpeed,
    startSort,
    pauseSort,
    resumeSort,
    resetSort,
    stepForward,
    generateRandomArray,
    currentSortStep,
    auxiliaryStructures,
    finalSortStats,
    liveSortStats: actualLiveStats,
    MIN_ARRAY_SIZE,
    MAX_ARRAY_SIZE,
    MIN_SPEED,
    MAX_SPEED,
    MIN_VALUE,
    MAX_VALUE,
  }
}
