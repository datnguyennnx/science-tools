import { useState, useEffect } from 'react'
import { useTimer } from './useTimer'
import { useWordGenerator } from './useWordGenerator'
import { useTypingState } from './useTypingState'
import { useTypingMetrics } from './useTypingMetrics'
import { useKeyboardHandler } from './useKeyboardHandler'
import { useMetricsManager } from './useMetricsManager'
import { useTestManager } from './useTestManager'

// Re-export types for external use
export type { CharStatus, CharState, TestStatus, IntervalData, PerformanceMetrics } from './types'

// Main orchestrator hook for typing test functionality
export function useTypingEngine() {
  // Use smaller, focused hooks
  const { currentText, loadNewText, initialize } = useWordGenerator()
  const { elapsedTime, formattedTime, start, stop, reset: resetTimer } = useTimer()
  const typingState = useTypingState()
  const typingMetrics = useTypingMetrics()

  // State to track metrics update trigger
  const [metricsUpdateTrigger, setMetricsUpdateTrigger] = useState(0)

  const {
    charStates,
    setCharStates,
    currentIndex,
    setCurrentIndex,
    testStatus,
    setTestStatus,
    metrics,
    setMetrics,
    intervals,
    setIntervals,
    resetTestState,
    startNewTest,
  } = typingState

  const {
    updateMetrics,
    finalizeMetrics,
    recordInterval,
    updateIntervalCounters,
    finalizeIntervals,
    resetMetricsState,
  } = typingMetrics

  // Metrics update callback
  const handleMetricsUpdate = () => {
    setMetricsUpdateTrigger(prev => prev + 1)
  }

  // Initialize test manager
  const { resetTest: resetTestInternal, startNewTest: startNewTestInternal } = useTestManager({
    currentText,
    testStatus,
    setCharStates,
    setCurrentIndex,
    onMetricsUpdate: handleMetricsUpdate,
  })

  // Initialize keyboard handler
  useKeyboardHandler({
    charStates,
    currentIndex,
    testStatus,
    setCharStates,
    setCurrentIndex,
    setTestStatus,
    start,
    stop,
    resetMetricsState,
    updateIntervalCounters,
    onMetricsUpdate: handleMetricsUpdate,
  })

  // Initialize metrics manager
  useMetricsManager({
    testStatus,
    elapsedTime,
    charStates,
    updateMetrics,
    finalizeMetrics,
    finalizeIntervals,
    recordInterval,
    setMetrics,
    setIntervals,
    triggerCount: metricsUpdateTrigger,
  })

  // Initialize word generator on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Clean reset test function
  const resetTest = () => {
    resetTestInternal(resetTimer, resetTestState, resetMetricsState)
  }

  // Clean new test function
  const newTest = () => {
    startNewTestInternal(resetTimer, startNewTest, resetMetricsState, loadNewText)
  }

  return {
    charStates,
    currentIndex,
    testStatus,
    metrics,
    formattedTime,
    elapsedTime,
    intervals,
    resetTest,
    newTest,
  }
}
