import { useState, useEffect, useCallback, useRef } from 'react'
import { useTimer } from './useTimer'
import { useWordGenerator } from './useWordGenerator'
import { calculateWPM, calculateCPM, calculateAccuracy } from './utils/metricsCalculator'

// Character status types
export type CharStatus = 'untyped' | 'correct' | 'incorrect' | 'current'

// Character state interface
export interface CharState {
  char: string
  status: CharStatus
  typedValue?: string
}

// Test status types
export type TestStatus = 'pending' | 'typing' | 'finished'

// Interval data for metrics tracking
export interface IntervalData {
  intervalEndTime: number
  correctCharsInInterval: number
  errorsInInterval: number
}

// Performance metrics interface
export interface PerformanceMetrics {
  wpm: number
  cpm: number
  accuracy: number
  errorCount: number
  totalChars: number
  correctChars: number
}

/**
 * Custom hook for the core typing test functionality
 */
export function useTypingEngine() {
  const { currentText, loadNewText, initialize } = useWordGenerator()
  const { elapsedTime, formattedTime, start, stop, reset: resetTimer } = useTimer()

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
  const intervalsRef = useRef<IntervalData[]>([])
  const lastIntervalTimeRef = useRef<number>(0)
  const intervalCounters = useRef({
    correctCharsInSegment: 0,
    errorsInSegment: 0,
  })

  // Constants
  const INTERVAL_DURATION = 2 // seconds

  // Initialize the character states from the text
  const initializeCharStates = useCallback((text: string) => {
    const states = text.split('').map(char => ({
      char,
      status: 'untyped' as CharStatus,
    }))

    // Set the first character as current
    if (states.length > 0) {
      states[0].status = 'current'
    }

    setCharStates(states)
    setCurrentIndex(0)
  }, [])

  // Initialize charStates when currentText changes and the test is in a pending state.
  useEffect(() => {
    if (currentText && testStatus === 'pending') {
      initializeCharStates(currentText)
    }
  }, [currentText, testStatus, initializeCharStates])

  // Initialize word generator
  useEffect(() => {
    initialize()
  }, [initialize])

  // Effect for when the test finishes
  useEffect(() => {
    if (testStatus === 'finished') {
      stop() // Stop the timer

      // Calculate final overall metrics based on charStates and elapsedTime
      let finalCorrectCount = 0
      let finalErrorCount = 0
      charStates.forEach(cs => {
        if (cs.status === 'correct') finalCorrectCount++
        else if (cs.status === 'incorrect') finalErrorCount++
      })

      const finalWpm = calculateWPM(finalCorrectCount, elapsedTime || 0.1)
      const finalCpm = calculateCPM(finalCorrectCount, elapsedTime || 0.1)
      const finalAccuracy = calculateAccuracy(finalCorrectCount, finalErrorCount)

      setMetrics({
        wpm: finalWpm,
        cpm: finalCpm,
        accuracy: finalAccuracy,
        errorCount: finalErrorCount,
        totalChars: finalCorrectCount + finalErrorCount,
        correctChars: finalCorrectCount,
      })

      // Finalize intervals data
      const collectedIntervals = [...intervalsRef.current]

      // Add the final unrecorded segment's data if there was any activity in it
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

      // If collectedIntervals is still empty (e.g., test was shorter than INTERVAL_DURATION
      // and the segment counters were used above or were zero),
      // AND there was actual typing activity OR time elapsed, create a single summary interval.
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

      // Reset segment counters
      intervalCounters.current = { correctCharsInSegment: 0, errorsInSegment: 0 }
    }
  }, [testStatus, charStates, elapsedTime, stop])

  // Update metrics periodically and record intervals
  useEffect(() => {
    if (testStatus !== 'typing') return

    let currentCorrectCount = 0
    let currentErrorCount = 0
    charStates.forEach(cs => {
      if (cs.status === 'correct') currentCorrectCount++
      else if (cs.status === 'incorrect') currentErrorCount++
    })

    // Update live metrics for display during typing
    const liveWpm = calculateWPM(currentCorrectCount, elapsedTime || 0.1)
    const liveCpm = calculateCPM(currentCorrectCount, elapsedTime || 0.1)
    const liveAccuracy = calculateAccuracy(currentCorrectCount, currentErrorCount)

    setMetrics({
      wpm: liveWpm,
      cpm: liveCpm,
      accuracy: liveAccuracy,
      errorCount: currentErrorCount,
      totalChars: currentCorrectCount + currentErrorCount,
      correctChars: currentCorrectCount,
    })

    // Record interval data if enough time has passed since last interval
    if (elapsedTime > 0 && elapsedTime - lastIntervalTimeRef.current >= INTERVAL_DURATION) {
      const newInterval: IntervalData = {
        intervalEndTime: elapsedTime,
        // These represent characters/errors *within this specific segment*
        correctCharsInInterval: intervalCounters.current.correctCharsInSegment,
        errorsInInterval: intervalCounters.current.errorsInSegment,
      }

      // Append to ref first to avoid closure issues with setIntervals
      intervalsRef.current = [...intervalsRef.current, newInterval]
      setIntervals(intervalsRef.current) // Update state for UI

      // Reset segment counters for the next interval
      intervalCounters.current = { correctCharsInSegment: 0, errorsInSegment: 0 }
      lastIntervalTimeRef.current = elapsedTime
    }
  }, [testStatus, elapsedTime, charStates])

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (charStates.length === 0) return // Guard against empty charStates
      if (testStatus === 'finished' && !(event.ctrlKey || event.metaKey)) return // Allow shortcuts in finished state
      if (event.ctrlKey || event.altKey || event.metaKey) {
        // Allow specific shortcuts (like Ctrl+R for reset) handled by page.tsx
        if (
          !(
            (event.ctrlKey || event.metaKey) &&
            (event.key.toLowerCase() === 'r' || event.key === 'Enter')
          )
        ) {
          return
        }
      }

      // Prevent default for typing keys, but not for shortcuts
      if (
        !(
          (event.ctrlKey || event.metaKey) &&
          (event.key.toLowerCase() === 'r' || event.key === 'Enter')
        )
      ) {
        event.preventDefault()
      }

      if (testStatus === 'pending') {
        // Do not start if it's a modifier key press alone or a shortcut attempt
        if (event.key.length !== 1 && event.key !== 'Backspace') return

        setTestStatus('typing')
        start()
        lastIntervalTimeRef.current = 0 // Reset for new test
        intervalsRef.current = [] // Clear previous intervals
        setIntervals([]) // Clear UI
        intervalCounters.current = { correctCharsInSegment: 0, errorsInSegment: 0 } // Reset counters
      }

      // This check needs to be after 'pending' to 'typing' transition
      if (testStatus === 'finished') return

      // Handle backspace
      if (event.key === 'Backspace') {
        if (currentIndex > 0) {
          const newStates = [...charStates]

          // Reset the current character to untyped
          // No change to interval counters on backspace for simplicity,
          // or could decide to decrement if it was an error/correct.
          // Current logic: backspace only corrects the state, metrics update on next type.
          newStates[currentIndex].status = 'untyped'
          delete newStates[currentIndex].typedValue

          // Move back one character and set as current
          const prevIndex = currentIndex - 1
          newStates[prevIndex].status = 'current'

          setCharStates(newStates)
          setCurrentIndex(prevIndex)
        }
        return
      }

      // Ignore other non-character keys (unless it was a valid start)
      if (event.key.length !== 1) return

      // We have a valid character input
      const typedChar = event.key
      const expectedChar = charStates[currentIndex].char
      const isCorrect = typedChar === expectedChar

      // Update the character state
      const newStates = [...charStates]
      newStates[currentIndex].status = isCorrect ? 'correct' : 'incorrect'
      newStates[currentIndex].typedValue = typedChar

      // Update counters for the current interval segment
      if (isCorrect) {
        intervalCounters.current.correctCharsInSegment++
      } else {
        intervalCounters.current.errorsInSegment++
      }

      // Move to the next character if not at the end
      if (currentIndex < charStates.length - 1) {
        newStates[currentIndex + 1].status = 'current'
        setCurrentIndex(currentIndex + 1)
      } else {
        // Test is complete!
        setTestStatus('finished')
        // stop() and metrics/interval finalization is handled by the 'finished' useEffect
      }

      setCharStates(newStates)
    },
    [charStates, currentIndex, testStatus, start]
  )

  // Register and unregister keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  // Reset the entire test
  const resetTest = useCallback(() => {
    resetTimer()
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
    intervalsRef.current = []
    lastIntervalTimeRef.current = 0
    intervalCounters.current = { correctCharsInSegment: 0, errorsInSegment: 0 }

    // Re-initialize the characters from the existing text
    if (currentText) initializeCharStates(currentText)
  }, [resetTimer, currentText, initializeCharStates])

  // Reset and load new text
  const newTest = useCallback(() => {
    resetTimer()
    setTestStatus('pending')
    // loadNewText will trigger a change in currentText, which will
    // then be handled by the useEffect that calls initializeCharStates.
    loadNewText()
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
    intervalsRef.current = []
    lastIntervalTimeRef.current = 0
    intervalCounters.current = { correctCharsInSegment: 0, errorsInSegment: 0 }
  }, [resetTimer, loadNewText])

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
