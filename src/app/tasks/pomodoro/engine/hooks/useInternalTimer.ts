import { useState, useEffect, useCallback, useRef } from 'react'

interface UseInternalTimerProps {
  targetTimeInSeconds: number
  onCompletion: () => void
  onTick?: (remainingSeconds: number) => void
}

interface UseInternalTimerReturn {
  timeRemainingInSeconds: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: (newTargetTimeInSeconds?: number) => void
}

export const useInternalTimer = ({
  targetTimeInSeconds,
  onCompletion,
  onTick,
}: UseInternalTimerProps): UseInternalTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState(targetTimeInSeconds)
  const [isRunning, setIsRunning] = useState(false)

  // Refs for callbacks to ensure stability in useEffect
  const onCompletionRef = useRef(onCompletion)
  const onTickRef = useRef(onTick)

  useEffect(() => {
    onCompletionRef.current = onCompletion
    onTickRef.current = onTick
  }, [onCompletion, onTick])

  useEffect(() => {
    setTimeRemaining(targetTimeInSeconds)
    setIsRunning(false)
  }, [targetTimeInSeconds])

  useEffect(() => {
    if (!isRunning) {
      // If timer was running and time hit zero, onCompletion was already called by setInterval's logic
      return
    }

    // This case handles if isRunning somehow becomes true while timeRemaining is already <= 0
    // Or if timeRemaining was forcefully set to 0 while running (though reset should handle this)
    if (timeRemaining <= 0) {
      onCompletionRef.current()
      setIsRunning(false)
      return
    }

    const intervalId = setInterval(() => {
      setTimeRemaining(prevTime => {
        const newTime = prevTime - 1
        if (onTickRef.current) {
          onTickRef.current(newTime)
        }

        if (newTime <= 0) {
          clearInterval(intervalId)
          // Order: Call completion, then update state that might trigger effects
          onCompletionRef.current()
          setIsRunning(false) // This will trigger re-evaluation of the outer useEffect
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isRunning, timeRemaining]) // Effect re-runs if isRunning changes or timeRemaining changes

  const start = useCallback(() => {
    if (timeRemaining <= 0) {
      // If starting at 0, but target allows for a run, reset to target first
      if (targetTimeInSeconds > 0) {
        setTimeRemaining(targetTimeInSeconds)
        setIsRunning(true)
      }
      // else, if targetTimeInSeconds is also 0 or less, do nothing
    } else {
      // If timeRemaining > 0, just start
      setIsRunning(true)
    }
  }, [timeRemaining, targetTimeInSeconds])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(
    (newTargetTime?: number) => {
      const resetTime = newTargetTime !== undefined ? newTargetTime : targetTimeInSeconds
      setIsRunning(false)
      setTimeRemaining(Math.max(0, resetTime))
    },
    [targetTimeInSeconds]
  )

  return {
    timeRemainingInSeconds: timeRemaining,
    isRunning,
    start,
    pause,
    reset,
  }
}
