// Optimized state management for React 19 - focused on typing state only
import { useState } from 'react'
import { CharState, TestStatus, PerformanceMetrics, IntervalData } from './useTypingEngine'

// Manages typing test state and actions
export function useTypingState() {
  // Character states array
  const [charStates, setCharStates] = useState<CharState[]>([])

  // Current typing position
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  // Overall test status
  const [testStatus, setTestStatus] = useState<TestStatus>('pending')

  // Performance metrics
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    wpm: 0,
    cpm: 0,
    accuracy: 100,
    errorCount: 0,
    totalChars: 0,
    correctChars: 0,
  })

  // For collecting data points for the performance chart
  const [intervals, setIntervals] = useState<IntervalData[]>([])

  // Resets all test state to initial values
  function resetTestState() {
    setTestStatus('pending')
    setCurrentIndex(0)
    setMetrics({
      wpm: 0,
      cpm: 0,
      accuracy: 100,
      errorCount: 0,
      totalChars: 0,
      correctChars: 0,
    })
    setIntervals([])
    setCharStates([])
  }

  // Prepares state for new test
  function startNewTest() {
    setTestStatus('pending')
    setCurrentIndex(0)
    setMetrics({
      wpm: 0,
      cpm: 0,
      accuracy: 100,
      errorCount: 0,
      totalChars: 0,
      correctChars: 0,
    })
    setIntervals([])
  }

  return {
    // State
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

    // Actions
    resetTestState,
    startNewTest,
  }
}
