import { useState, useEffect, useRef, useCallback } from 'react'

interface TimerState {
  isRunning: boolean
  elapsedTime: number
  formattedTime: string
}

/**
 * Custom hook for managing a precise timer for typing tests
 */
export function useTimer() {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    elapsedTime: 0,
    formattedTime: '00:00',
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

  // Format seconds to MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Start the timer
  const start = useCallback(() => {
    if (state.isRunning) return

    startTimeRef.current = Date.now() - pausedTimeRef.current * 1000

    setState(prev => ({ ...prev, isRunning: true }))

    intervalRef.current = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000
      setState({
        isRunning: true,
        elapsedTime: elapsedSeconds,
        formattedTime: formatTime(elapsedSeconds),
      })
    }, 100) // Update 10 times per second for smoother display
  }, [state.isRunning, formatTime])

  // Stop the timer
  const stop = useCallback(() => {
    if (!state.isRunning) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    pausedTimeRef.current = state.elapsedTime
    setState(prev => ({ ...prev, isRunning: false }))
  }, [state])

  // Reset the timer
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    startTimeRef.current = 0
    pausedTimeRef.current = 0
    setState({
      isRunning: false,
      elapsedTime: 0,
      formattedTime: '00:00',
    })
  }, [])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    isRunning: state.isRunning,
    elapsedTime: state.elapsedTime,
    formattedTime: state.formattedTime,
    start,
    stop,
    reset,
  }
}
