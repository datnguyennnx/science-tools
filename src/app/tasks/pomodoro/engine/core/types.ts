export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

export interface PomodoroSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  autoStartBreaks?: boolean
  autoStartFocus?: boolean
}

// This will be the state managed by the main Pomodoro logic hook (e.g., usePomodoroEngine)
export interface PomodoroEngineState {
  currentMode: TimerMode
  timeRemainingInSeconds: number
  isRunning: boolean
  completedFocusSessionsInSet: number
  totalCompletedFocusSessions: number
  currentSetCount: number
  settings: PomodoroSettings
}

// This will be the more comprehensive state exposed to the UI, including display-ready values
export interface PomodoroUIState extends PomodoroEngineState {
  displayMinutes: number
  displaySeconds: number
  progressPercent: number
}

// Actions the UI can dispatch to the Pomodoro engine
export interface PomodoroEngineActions {
  startTimer: () => void
  pauseTimer: () => void
  skipSession: () => void
  resetCycle: () => void
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void
  switchToMode: (mode: TimerMode) => void
}

// The combined return from the main Pomodoro hook
export interface UsePomodoroReturn {
  uiState: PomodoroUIState
  actions: PomodoroEngineActions
}
