import { useEffect, useRef } from 'react'
import { CharState, TestStatus } from './types'
import { CharacterStateManagerImpl } from '../utils/characterStateManager'

interface TestManagerConfig {
  currentText: string
  testStatus: TestStatus
  setCharStates: (states: CharState[]) => void
  setCurrentIndex: (index: number) => void
  onMetricsUpdate: () => void
}

/**
 * Custom hook for managing test initialization and state
 * Handles text initialization and test setup
 */
export function useTestManager(config: TestManagerConfig) {
  const { currentText, testStatus, setCharStates, setCurrentIndex, onMetricsUpdate } = config

  // Use refs to avoid dependency issues with functions
  const setCharStatesRef = useRef(setCharStates)
  setCharStatesRef.current = setCharStates

  const setCurrentIndexRef = useRef(setCurrentIndex)
  setCurrentIndexRef.current = setCurrentIndex

  const onMetricsUpdateRef = useRef(onMetricsUpdate)
  onMetricsUpdateRef.current = onMetricsUpdate

  // Initialize character states when text changes
  useEffect(() => {
    if (currentText && testStatus === 'pending') {
      const characterManager = new CharacterStateManagerImpl()
      const states = characterManager.initializeCharacters(currentText)

      setCharStatesRef.current(states)
      setCurrentIndexRef.current(0)

      // Trigger initial metrics update when text is initialized
      onMetricsUpdateRef.current()
    }
  }, [currentText, testStatus])

  /**
   * Reset test state and prepare for new test
   */
  const resetTest = (
    resetTimer: () => void,
    resetTestState: () => void,
    resetMetricsState: () => void
  ) => {
    resetTimer()
    resetTestState()
    resetMetricsState()

    if (currentText) {
      const characterManager = new CharacterStateManagerImpl()
      const states = characterManager.initializeCharacters(currentText)
      setCharStates(states)
      setCurrentIndex(0)
    }
  }

  /**
   * Start a new test with fresh text
   */
  const startNewTest = (
    resetTimer: () => void,
    startNewTestState: () => void,
    resetMetricsState: () => void,
    loadNewText: () => void
  ) => {
    resetTimer()
    startNewTestState()
    resetMetricsState()
    loadNewText()
  }

  return {
    resetTest,
    startNewTest,
  }
}
