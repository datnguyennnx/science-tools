import { useEffect, useRef } from 'react'
import { CharState, TestStatus, KeyboardHandler } from './types'
import { CharacterStateManagerImpl } from '../utils/characterStateManager'

interface KeyboardHandlerConfig {
  charStates: CharState[]
  currentIndex: number
  testStatus: TestStatus
  setCharStates: (states: CharState[]) => void
  setCurrentIndex: (index: number) => void
  setTestStatus: (status: TestStatus) => void
  start: () => void
  stop: () => void
  resetMetricsState: () => void
  updateIntervalCounters: (isCorrect: boolean) => void
  onMetricsUpdate: () => void
}

interface QueuedCharacter {
  typedChar: string
  expectedChar: string
  isBackspace: boolean
  timestamp: number
}

/**
 * Custom hook for handling keyboard input in typing tests
 * Separates keyboard logic from main engine for better maintainability
 */
export function useKeyboardHandler(config: KeyboardHandlerConfig): KeyboardHandler {
  const {
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
    onMetricsUpdate,
  } = config

  // Character processing queue for frame-based rendering
  const characterQueueRef = useRef<QueuedCharacter[]>([])
  const isProcessingRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)

  // Use refs to avoid dependency issues with functions
  const setCharStatesRef = useRef(setCharStates)
  setCharStatesRef.current = setCharStates

  const setCurrentIndexRef = useRef(setCurrentIndex)
  setCurrentIndexRef.current = setCurrentIndex

  const setTestStatusRef = useRef(setTestStatus)
  setTestStatusRef.current = setTestStatus

  const startRef = useRef(start)
  startRef.current = start

  const stopRef = useRef(stop)
  stopRef.current = stop

  const resetMetricsStateRef = useRef(resetMetricsState)
  resetMetricsStateRef.current = resetMetricsState

  const updateIntervalCountersRef = useRef(updateIntervalCounters)
  updateIntervalCountersRef.current = updateIntervalCounters

  const onMetricsUpdateRef = useRef(onMetricsUpdate)
  onMetricsUpdateRef.current = onMetricsUpdate

  // Use ref for state to avoid stale closure issues
  const charStatesRef = useRef(charStates)
  charStatesRef.current = charStates

  const currentIndexRef = useRef(currentIndex)
  currentIndexRef.current = currentIndex

  const testStatusRef = useRef(testStatus)
  testStatusRef.current = testStatus

  useEffect(() => {
    // Process characters in batches using requestAnimationFrame
    const processCharacterBatch = () => {
      if (isProcessingRef.current || characterQueueRef.current.length === 0) {
        animationFrameRef.current = null
        return
      }

      isProcessingRef.current = true
      const batchSize = Math.min(10, characterQueueRef.current.length) // Process up to 10 chars per frame
      const batch = characterQueueRef.current.splice(0, batchSize)

      let localCharStates = [...charStatesRef.current]
      let localCurrentIndex = currentIndexRef.current
      let shouldFinish = false
      let metricsUpdateCount = 0

      // Process batch of characters
      for (const queuedChar of batch) {
        if (shouldFinish) break

        if (queuedChar.isBackspace) {
          if (CharacterStateManagerImpl.prototype.handleBackspace(localCurrentIndex)) {
            localCharStates = CharacterStateManagerImpl.createBackspaceStates(
              localCharStates,
              localCurrentIndex
            )
            localCurrentIndex = Math.max(0, localCurrentIndex - 1)
            metricsUpdateCount++
          }
        } else {
          const isCorrect = CharacterStateManagerImpl.prototype.updateCharacter(
            localCurrentIndex,
            queuedChar.typedChar,
            queuedChar.expectedChar
          )

          localCharStates = CharacterStateManagerImpl.createUpdatedStates(
            localCharStates,
            localCurrentIndex,
            queuedChar.typedChar,
            queuedChar.expectedChar,
            localCurrentIndex < localCharStates.length - 1 ? localCurrentIndex + 1 : undefined
          )

          updateIntervalCountersRef.current(isCorrect)

          if (localCurrentIndex < localCharStates.length - 1) {
            localCurrentIndex++
          } else {
            shouldFinish = true
          }

          metricsUpdateCount++
        }
      }

      // Update state once per batch
      setCharStatesRef.current(localCharStates)
      setCurrentIndexRef.current(localCurrentIndex)

      if (shouldFinish) {
        setTestStatusRef.current('finished')
        stopRef.current() // Stop the timer when test finishes
      }

      // Trigger metrics update less frequently (every 3 characters)
      if (metricsUpdateCount > 0 && (localCurrentIndex % 3 === 0 || shouldFinish)) {
        onMetricsUpdateRef.current()
      }

      isProcessingRef.current = false

      // Continue processing if there are more characters
      if (characterQueueRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(processCharacterBatch)
      } else {
        animationFrameRef.current = null
      }
    }
    const handleKeyPress = (event: KeyboardEvent) => {
      const currentCharStates = charStatesRef.current
      const currentTestStatus = testStatusRef.current

      if (currentCharStates.length === 0) return
      if (currentTestStatus === 'finished' && !(event.ctrlKey || event.metaKey)) return

      // Handle shortcuts
      if (event.ctrlKey || event.altKey || event.metaKey) {
        if (
          !(
            (event.ctrlKey || event.metaKey) &&
            (event.key.toLowerCase() === 'r' || event.key === 'Enter')
          )
        ) {
          return
        }
      }

      // Prevent default for typing keys
      if (
        !(
          (event.ctrlKey || event.metaKey) &&
          (event.key.toLowerCase() === 'r' || event.key === 'Enter')
        )
      ) {
        event.preventDefault()
      }

      // Start test on first valid key press
      if (currentTestStatus === 'pending') {
        if (event.key.length !== 1 && event.key !== 'Backspace') return
        setTestStatusRef.current('typing')
        startRef.current()
        resetMetricsStateRef.current()
        onMetricsUpdateRef.current()
        return
      }

      if (currentTestStatus === 'finished') return

      // Handle backspace
      if (event.key === 'Backspace') {
        characterQueueRef.current.push({
          typedChar: '',
          expectedChar: '',
          isBackspace: true,
          timestamp: Date.now(),
        })
      } else if (event.key.length === 1) {
        // Handle character input - add to queue
        characterQueueRef.current.push({
          typedChar: event.key,
          expectedChar: currentCharStates[currentIndexRef.current]?.char || '',
          isBackspace: false,
          timestamp: Date.now(),
        })
      }

      // Start processing if not already running
      if (!animationFrameRef.current && !isProcessingRef.current) {
        animationFrameRef.current = requestAnimationFrame(processCharacterBatch)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, []) // No dependencies needed since everything uses refs

  return { handleKeyPress: () => {} } // Stub function for interface compatibility
}
