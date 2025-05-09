import { TimerMode, PomodoroSettings } from '../core/types'

export const formatTime = (
  totalSeconds: number
): { displayMinutes: number; displaySeconds: number } => {
  const clampedSeconds = Math.max(0, totalSeconds)
  const displayMinutes = Math.floor(clampedSeconds / 60)
  const displaySeconds = Math.floor(clampedSeconds % 60)
  return { displayMinutes, displaySeconds }
}

export const calculateProgress = (
  timeRemainingInSeconds: number,
  totalTimeForModeInSeconds: number
): number => {
  if (totalTimeForModeInSeconds <= 0) return 0
  const timeElapsed = totalTimeForModeInSeconds - timeRemainingInSeconds
  const progress = (timeElapsed / totalTimeForModeInSeconds) * 100
  return Math.max(0, Math.min(100, progress)) // Clamp between 0 and 100
}

export const determineNextMode = (
  currentMode: TimerMode,
  completedFocusSessionsInSet: number, // Count before the one just finished
  settings: PomodoroSettings
): TimerMode => {
  if (currentMode === 'focus') {
    const isLongBreakNext =
      (completedFocusSessionsInSet + 1) % settings.sessionsUntilLongBreak === 0
    return isLongBreakNext ? 'longBreak' : 'shortBreak'
  }
  // After any break, or if currentMode is somehow not focus (e.g. explicit switch), default to focus
  return 'focus'
}

export const getTotalTimeForMode = (mode: TimerMode, settings: PomodoroSettings): number => {
  switch (mode) {
    case 'focus':
      return settings.focusDuration
    case 'shortBreak':
      return settings.shortBreakDuration
    case 'longBreak':
      return settings.longBreakDuration
    default:
      return 0 // Should not happen with valid TimerMode
  }
}
