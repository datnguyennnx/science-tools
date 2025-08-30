import { useEffect, useRef } from 'react'
import { CharState, TestStatus, PerformanceMetrics, IntervalData } from './types'

interface MetricsManagerConfig {
  testStatus: TestStatus
  elapsedTime: number
  charStates: CharState[]
  updateMetrics: (states: CharState[]) => PerformanceMetrics
  finalizeMetrics: (
    states: CharState[],
    time: number,
    setter: (metrics: PerformanceMetrics) => void
  ) => PerformanceMetrics
  finalizeIntervals: (
    time: number,
    correct: number,
    errors: number,
    setter: (intervals: IntervalData[]) => void
  ) => void
  recordInterval: (time: number, setter: (intervals: IntervalData[]) => void) => void
  setMetrics: (metrics: PerformanceMetrics) => void
  setIntervals: (intervals: IntervalData[]) => void
  triggerCount: number
}

/**
 * Custom hook for managing metrics updates efficiently
 * Handles when to update metrics to avoid unnecessary calculations
 */
export function useMetricsManager(config: MetricsManagerConfig) {
  const {
    testStatus,
    elapsedTime,
    charStates,
    updateMetrics,
    finalizeMetrics,
    finalizeIntervals,
    recordInterval,
    setMetrics,
    setIntervals,
    triggerCount,
  } = config

  // Metrics update queue for frame-based rendering
  const metricsQueueRef = useRef<Array<{ type: 'live' | 'final'; triggerCount: number }>>([])
  const isProcessingMetricsRef = useRef(false)
  const metricsAnimationFrameRef = useRef<number | null>(null)

  // Use refs to avoid dependency issues with functions
  const charStatesRef = useRef(charStates)
  charStatesRef.current = charStates

  const updateMetricsRef = useRef(updateMetrics)
  updateMetricsRef.current = updateMetrics

  const finalizeMetricsRef = useRef(finalizeMetrics)
  finalizeMetricsRef.current = finalizeMetrics

  const finalizeIntervalsRef = useRef(finalizeIntervals)
  finalizeIntervalsRef.current = finalizeIntervals

  const recordIntervalRef = useRef(recordInterval)
  recordIntervalRef.current = recordInterval

  const setMetricsRef = useRef(setMetrics)
  setMetricsRef.current = setMetrics

  const setIntervalsRef = useRef(setIntervals)
  setIntervalsRef.current = setIntervals

  // State refs
  const testStatusRef = useRef(testStatus)
  testStatusRef.current = testStatus

  const elapsedTimeRef = useRef(elapsedTime)
  elapsedTimeRef.current = elapsedTime

  // Update metrics only when explicitly triggered or at the end
  useEffect(() => {
    // Process metrics updates using requestAnimationFrame
    const processMetricsBatch = () => {
      if (isProcessingMetricsRef.current || metricsQueueRef.current.length === 0) {
        metricsAnimationFrameRef.current = null
        return
      }

      isProcessingMetricsRef.current = true
      const currentTestStatus = testStatusRef.current
      const currentElapsedTime = elapsedTimeRef.current

      if (currentTestStatus === 'finished') {
        // Calculate final metrics only when test is finished
        const finalMetrics = finalizeMetricsRef.current(
          charStatesRef.current,
          currentElapsedTime,
          setMetricsRef.current
        )
        finalizeIntervalsRef.current(
          currentElapsedTime,
          finalMetrics.correctChars,
          finalMetrics.errorCount,
          setIntervalsRef.current
        )
        metricsQueueRef.current = [] // Clear queue after final update
      } else if (currentTestStatus === 'typing') {
        // Process the latest live metrics update
        const liveMetrics = updateMetricsRef.current(charStatesRef.current)

        if (liveMetrics.correctChars > 0 && currentElapsedTime > 0.1) {
          const timeBasedMetrics: PerformanceMetrics = {
            ...liveMetrics,
            wpm: Math.round(liveMetrics.correctChars / 5 / (currentElapsedTime / 60)),
            cpm: Math.round(liveMetrics.correctChars / (currentElapsedTime / 60)),
          }
          setMetricsRef.current(timeBasedMetrics)
        } else {
          setMetricsRef.current(liveMetrics)
        }
        metricsQueueRef.current = [] // Clear queue after processing
      }

      isProcessingMetricsRef.current = false

      // Continue processing if there are more updates
      if (metricsQueueRef.current.length > 0) {
        metricsAnimationFrameRef.current = requestAnimationFrame(processMetricsBatch)
      } else {
        metricsAnimationFrameRef.current = null
      }
    }

    if (testStatus === 'finished') {
      metricsQueueRef.current.push({ type: 'final', triggerCount })
    } else if (testStatus === 'typing' && triggerCount > 0) {
      // Replace any existing live update with the latest one
      const existingIndex = metricsQueueRef.current.findIndex(item => item.type === 'live')
      if (existingIndex >= 0) {
        metricsQueueRef.current[existingIndex] = { type: 'live', triggerCount }
      } else {
        metricsQueueRef.current.push({ type: 'live', triggerCount })
      }
    }

    // Start processing if not already running
    if (!metricsAnimationFrameRef.current && !isProcessingMetricsRef.current) {
      metricsAnimationFrameRef.current = requestAnimationFrame(processMetricsBatch)
    }
  }, [testStatus, triggerCount])

  // Separate effect for interval recording - less frequent updates
  useEffect(() => {
    if (testStatus === 'typing' && recordIntervalRef.current) {
      recordIntervalRef.current(elapsedTime, setIntervalsRef.current)
    }
  }, [testStatus, elapsedTime])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (metricsAnimationFrameRef.current) {
        cancelAnimationFrame(metricsAnimationFrameRef.current)
      }
    }
  }, [])
}
