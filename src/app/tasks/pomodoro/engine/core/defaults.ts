import { PomodoroSettings } from './types'

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusDuration: 25 * 60, // 25 minutes in seconds
  shortBreakDuration: 5 * 60, // 5 minutes in seconds
  longBreakDuration: 15 * 60, // 15 minutes in seconds
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
}
