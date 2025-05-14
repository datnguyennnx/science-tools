import { useState, useEffect, useCallback, useRef } from 'react'
import type { SortStep } from '../types'
import type { SortAlgorithm } from '../algorithmRegistry'
import type { SortStats } from '../../components/AuxiliaryVisualizer'

const MIN_ARRAY_SIZE = 10
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

  const nextStep = useCallback(() => {
    if (isPaused) return
    if (!sortGeneratorRef.current) return

    const result = sortGeneratorRef.current.next()

    if (!result.done) {
      const currentStep = result.value
      setSortSteps(prevSteps => [...prevSteps, currentStep])
      setCurrentStepIndex(prevIndex => prevIndex + 1)

      const updatedLiveStats: Partial<SortStats> = { ...(liveSortStats || {}) }
      if (currentStep.currentStats) {
        Object.assign(updatedLiveStats, currentStep.currentStats)
      }
      updatedLiveStats.delay = `${calculateDelay().toFixed(1)} ms`
      if (visualStartTimeRef.current) {
        const currentElapsedTime = Date.now() - visualStartTimeRef.current
        updatedLiveStats.visualTime = `${(currentElapsedTime / 1000).toFixed(2)} s`
        updatedLiveStats.sortTime = updatedLiveStats.visualTime
      }
      setLiveSortStats(updatedLiveStats)

      timeoutRef.current = setTimeout(nextStep, calculateDelay())
    } else {
      clearSortingTimeout()
      let determinedFinalArray: ReadonlyArray<number>
      let determinedStats: SortStats | Partial<SortStats> = { ...(liveSortStats || {}) }

      if (visualStartTimeRef.current) {
        const finalElapsedTime = Date.now() - visualStartTimeRef.current
        determinedStats.visualTime = `${(finalElapsedTime / 1000).toFixed(2)} s`
        determinedStats.sortTime = determinedStats.visualTime
        visualStartTimeRef.current = null
      } else {
        determinedStats.visualTime = '-'
        determinedStats.sortTime = '-'
      }
      determinedStats.delay = `${calculateDelay().toFixed(1)} ms`

      const genResultValue = result.value as unknown

      if (
        typeof genResultValue === 'object' &&
        genResultValue !== null &&
        'finalArray' in genResultValue &&
        Array.isArray((genResultValue as { finalArray: unknown }).finalArray)
      ) {
        determinedFinalArray = (genResultValue as { finalArray: ReadonlyArray<number> }).finalArray
        if (
          'stats' in genResultValue &&
          typeof (genResultValue as { stats: unknown }).stats === 'object' &&
          (genResultValue as { stats: unknown }).stats !== null
        ) {
          determinedStats = {
            ...determinedStats,
            ...(genResultValue as { stats: Partial<SortStats> }).stats,
          }
        }
      } else if (Array.isArray(genResultValue)) {
        determinedFinalArray = genResultValue
      } else {
        if (sortSteps[currentStepIndex] && sortSteps[currentStepIndex].array) {
          determinedFinalArray = [...sortSteps[currentStepIndex].array]
        } else {
          determinedFinalArray = [...array]
        }
      }

      const finalStepObject: SortStep = {
        array: determinedFinalArray,
        message: 'Sort Complete!',
        sortedIndices: [...Array(determinedFinalArray.length).keys()],
        currentStats: determinedStats as SortStats,
      }

      setSortSteps(prevSteps => [...prevSteps, finalStepObject])
      setCurrentStepIndex(prevIndex => prevIndex + 1)
      setFinalSortStats(determinedStats as SortStats)
      setIsSorting(false)
      setIsPaused(false)
      sortGeneratorRef.current = null
    }
  }, [
    isPaused,
    calculateDelay,
    clearSortingTimeout,
    sortSteps,
    currentStepIndex,
    array,
    liveSortStats,
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

      const updatedLiveStats: Partial<SortStats> = { ...(liveSortStats || {}) }
      if (currentStep.currentStats) {
        Object.assign(updatedLiveStats, currentStep.currentStats)
      }
      if (visualStartTimeRef.current) {
        const currentElapsedTime = Date.now() - visualStartTimeRef.current
        updatedLiveStats.visualTime = `${(currentElapsedTime / 1000).toFixed(2)} s`
        updatedLiveStats.sortTime = updatedLiveStats.visualTime
      }
      setLiveSortStats(updatedLiveStats)
    } else {
      let determinedFinalArray: ReadonlyArray<number>
      let determinedStats: SortStats | Partial<SortStats> = { ...(liveSortStats || {}) }

      if (visualStartTimeRef.current) {
        const finalElapsedTime = Date.now() - visualStartTimeRef.current
        determinedStats.visualTime = `${(finalElapsedTime / 1000).toFixed(2)} s`
        determinedStats.sortTime = determinedStats.visualTime
        visualStartTimeRef.current = null
      } else {
        determinedStats.visualTime = '-'
        determinedStats.sortTime = '-'
      }
      determinedStats.delay = isPaused ? 'Paused' : `${calculateDelay().toFixed(1)} ms`

      const genResultValue = result.value as unknown

      if (
        typeof genResultValue === 'object' &&
        genResultValue !== null &&
        'finalArray' in genResultValue &&
        Array.isArray((genResultValue as { finalArray: unknown }).finalArray)
      ) {
        determinedFinalArray = (genResultValue as { finalArray: ReadonlyArray<number> }).finalArray
        if (
          'stats' in genResultValue &&
          typeof (genResultValue as { stats: unknown }).stats === 'object' &&
          (genResultValue as { stats: unknown }).stats !== null
        ) {
          determinedStats = {
            ...determinedStats,
            ...(genResultValue as { stats: Partial<SortStats> }).stats,
          }
        }
      } else if (Array.isArray(genResultValue)) {
        determinedFinalArray = genResultValue
      } else {
        if (sortSteps[currentStepIndex] && sortSteps[currentStepIndex].array) {
          determinedFinalArray = [...sortSteps[currentStepIndex].array]
        } else {
          determinedFinalArray = [...array]
        }
      }

      const finalStepObject: SortStep = {
        array: determinedFinalArray,
        message: 'Sort Complete!',
        sortedIndices: [...Array(determinedFinalArray.length).keys()],
        currentStats: determinedStats as SortStats,
      }

      setSortSteps(prevSteps => [...prevSteps, finalStepObject])
      setCurrentStepIndex(prevIndex => prevIndex + 1)
      setFinalSortStats(determinedStats as SortStats)
      setIsSorting(false)
      setIsPaused(false)
      sortGeneratorRef.current = null
    }
  }, [isSorting, isPaused, clearSortingTimeout, sortSteps, currentStepIndex, array, liveSortStats])

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
