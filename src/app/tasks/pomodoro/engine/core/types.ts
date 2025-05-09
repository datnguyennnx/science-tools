export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

export interface PomodoroSettings {
  focusDuration: number // seconds
  shortBreakDuration: number // seconds
  longBreakDuration: number // seconds
  sessionsUntilLongBreak: number
  autoStartBreaks?: boolean
  autoStartFocus?: boolean
}

// This will be the state managed by the main Pomodoro logic hook (e.g., usePomodoroEngine)
export interface PomodoroEngineState {
  currentMode: TimerMode
  timeRemainingInSeconds: number
  isRunning: boolean
  completedFocusSessionsInSet: number // Towards current long break
  totalCompletedFocusSessions: number
  currentSetCount: number // Number of full pomodoro sets completed
  settings: PomodoroSettings
}

// This will be the more comprehensive state exposed to the UI, including display-ready values
export interface PomodoroUIState extends PomodoroEngineState {
  displayMinutes: number
  displaySeconds: number
  progressPercent: number // 0-100
}

// Actions the UI can dispatch to the Pomodoro engine
export interface PomodoroEngineActions {
  startTimer: () => void
  pauseTimer: () => void
  skipSession: () => void
  resetCycle: () => void
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void
  // Action to explicitly change mode - use with caution as it might disrupt the cycle
  switchToMode: (mode: TimerMode) => void
}

// The combined return from the main Pomodoro hook
export interface UsePomodoroReturn {
  uiState: PomodoroUIState
  actions: PomodoroEngineActions
  // We might re-introduce a simplified command object if needed for the command palette
  // or keep command generation separate/derived.
}
