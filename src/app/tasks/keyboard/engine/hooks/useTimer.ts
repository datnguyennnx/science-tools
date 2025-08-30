import { useState, useEffect, useRef } from 'react'
import { formatTime } from '../utils/timeUtils'

interface TimerState {
  isRunning: boolean
  elapsedTime: number
  formattedTime: string
}

// Manages precise timer state and controls for typing tests
export function useTimer() {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    elapsedTime: 0,
    formattedTime: '00:00',
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

  // Starts the timer and begins counting elapsed time
  const start = () => {
    if (state.isRunning) return

    startTimeRef.current = Date.now() - pausedTimeRef.current * 1000

    setState(prev => ({ ...prev, isRunning: true }))

    intervalRef.current = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000
      setState(prev => ({
        ...prev,
        elapsedTime: elapsedSeconds,
        formattedTime: formatTime(elapsedSeconds),
      }))
    }, 250) // Update 4 times per second for better performance
  }

  // Stops the timer and preserves elapsed time
  const stop = () => {
    if (!state.isRunning) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    pausedTimeRef.current = state.elapsedTime
    setState(prev => ({ ...prev, isRunning: false }))
  }

  // Resets timer to initial state
  const reset = () => {
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
  }

  // Cleanup interval on unmount
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
