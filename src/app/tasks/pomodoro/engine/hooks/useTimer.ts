import { useState, useEffect, useRef } from 'react'

interface UseTimerProps {
  targetTimeInSeconds: number
  onCompletion: () => void
  onTick?: (remainingSeconds: number) => void
}

interface UseTimerReturn {
  timeRemainingInSeconds: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: (newTargetTimeInSeconds?: number) => void
}

// Hook for managing countdown timer
export const useTimer = ({
  targetTimeInSeconds,
  onCompletion,
  onTick,
}: UseTimerProps): UseTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState(targetTimeInSeconds)
  const [isRunning, setIsRunning] = useState(false)

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
    if (!isRunning) return

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
          onCompletionRef.current()
          setIsRunning(false)
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isRunning, timeRemaining])

  const start = () => {
    if (timeRemaining <= 0) {
      if (targetTimeInSeconds > 0) {
        setTimeRemaining(targetTimeInSeconds)
        setIsRunning(true)
      }
    } else {
      setIsRunning(true)
    }
  }

  const pause = () => {
    setIsRunning(false)
  }

  const reset = (newTargetTime?: number) => {
    const resetTime = newTargetTime !== undefined ? newTargetTime : targetTimeInSeconds
    setIsRunning(false)
    setTimeRemaining(Math.max(0, resetTime))
  }

  return {
    timeRemainingInSeconds: timeRemaining,
    isRunning,
    start,
    pause,
    reset,
  }
}
