// Optimized metrics calculation for React 19 - focused on metrics and intervals
import { useRef } from 'react'
import { calculateWPM, calculateCPM, calculateAccuracy } from '../utils/metricsCalculator'
import { PerformanceMetrics, IntervalData, CharState } from './useTypingEngine'

// Manages typing metrics calculations and interval tracking
export function useTypingMetrics() {
  const intervalsRef = useRef<IntervalData[]>([])
  const lastIntervalTimeRef = useRef<number>(0)
  const intervalCounters = useRef({
    correctCharsInSegment: 0,
    errorsInSegment: 0,
  })

  const INTERVAL_DURATION = 2 // seconds

  // Calculates live metrics from current character states
  function updateMetrics(charStates: CharState[]): PerformanceMetrics {
    let correctCount = 0
    let errorCount = 0

    charStates.forEach(cs => {
      if (cs.status === 'correct') correctCount++
      else if (cs.status === 'incorrect') errorCount++
    })

    return {
      wpm: calculateWPM(correctCount, 0.1), // Temporary time, will be updated with real time
      cpm: calculateCPM(correctCount, 0.1),
      accuracy: calculateAccuracy(correctCount, errorCount),
      errorCount,
      totalChars: correctCount + errorCount,
      correctChars: correctCount,
    }
  }

  // Finalizes metrics when test completes
  function finalizeMetrics(
    charStates: CharState[],
    elapsedTime: number,
    setMetrics: (metrics: PerformanceMetrics) => void
  ) {
    let finalCorrectCount = 0
    let finalErrorCount = 0

    charStates.forEach(cs => {
      if (cs.status === 'correct') finalCorrectCount++
      else if (cs.status === 'incorrect') finalErrorCount++
    })

    const finalMetrics: PerformanceMetrics = {
      wpm: calculateWPM(finalCorrectCount, elapsedTime || 0.1),
      cpm: calculateCPM(finalCorrectCount, elapsedTime || 0.1),
      accuracy: calculateAccuracy(finalCorrectCount, finalErrorCount),
      errorCount: finalErrorCount,
      totalChars: finalCorrectCount + finalErrorCount,
      correctChars: finalCorrectCount,
    }

    setMetrics(finalMetrics)
    return finalMetrics
  }

  // Records typing interval data for charting
  function recordInterval(elapsedTime: number, setIntervals: (intervals: IntervalData[]) => void) {
    if (elapsedTime <= 0 || elapsedTime - lastIntervalTimeRef.current < INTERVAL_DURATION) {
      return
    }

    const newInterval: IntervalData = {
      intervalEndTime: elapsedTime,
      correctCharsInInterval: intervalCounters.current.correctCharsInSegment,
      errorsInInterval: intervalCounters.current.errorsInSegment,
    }

    // Update ref first to avoid closure issues
    intervalsRef.current = [...intervalsRef.current, newInterval]
    setIntervals(intervalsRef.current)

    // Reset segment counters for the next interval
    intervalCounters.current = { correctCharsInSegment: 0, errorsInSegment: 0 }
    lastIntervalTimeRef.current = elapsedTime
  }

  // Updates counters for current typing interval
  function updateIntervalCounters(isCorrect: boolean) {
    if (isCorrect) {
      intervalCounters.current.correctCharsInSegment++
    } else {
      intervalCounters.current.errorsInSegment++
    }
  }

  // Finalizes interval data when test completes
  function finalizeIntervals(
    elapsedTime: number,
    finalCorrectCount: number,
    finalErrorCount: number,
    setIntervals: (intervals: IntervalData[]) => void
  ) {
    const collectedIntervals = [...intervalsRef.current]

    // Add final unrecorded segment if it has activity
    if (
      intervalCounters.current.correctCharsInSegment > 0 ||
      intervalCounters.current.errorsInSegment > 0
    ) {
      collectedIntervals.push({
        intervalEndTime: elapsedTime,
        correctCharsInInterval: intervalCounters.current.correctCharsInSegment,
        errorsInInterval: intervalCounters.current.errorsInSegment,
      })
    }

    // Create summary interval if no intervals exist
    if (collectedIntervals.length === 0 && elapsedTime > 0) {
      const charsForSummary =
        finalCorrectCount > 0 || finalErrorCount > 0
          ? finalCorrectCount
          : intervalCounters.current.correctCharsInSegment
      const errorsForSummary =
        finalCorrectCount > 0 || finalErrorCount > 0
          ? finalErrorCount
          : intervalCounters.current.errorsInSegment

      collectedIntervals.push({
        intervalEndTime: elapsedTime,
        correctCharsInInterval: charsForSummary,
        errorsInInterval: errorsForSummary,
      })
    }

    setIntervals(collectedIntervals)

    // Reset counters
    intervalCounters.current = { correctCharsInSegment: 0, errorsInSegment: 0 }
  }

  // Resets all metrics state and counters
  function resetMetricsState() {
    intervalsRef.current = []
    lastIntervalTimeRef.current = 0
    intervalCounters.current = { correctCharsInSegment: 0, errorsInSegment: 0 }
  }

  return {
    // Metrics functions
    updateMetrics,
    finalizeMetrics,
    recordInterval,
    updateIntervalCounters,
    finalizeIntervals,
    resetMetricsState,

    // Refs for external access
    intervalsRef,
    lastIntervalTimeRef,
  }
}
