import { useCallback, useEffect, useReducer, useState, useMemo } from 'react'
import {
  PomodoroSettings,
  TimerMode,
  PomodoroEngineActions,
  PomodoroUIState,
  UsePomodoroReturn,
} from '../core/types'
import { DEFAULT_POMODORO_SETTINGS } from '../core/defaults'
import { useInternalTimer } from './useInternalTimer'
import {
  determineNextMode,
  formatTime,
  calculateProgress,
  getTotalTimeForMode,
} from '../utils/timerLogic'

// --- Reducer Logic ---
type PomodoroReducerAction =
  | { type: 'START_REQUEST' } // User wants to start/resume
  | { type: 'PAUSE_REQUEST' } // User wants to pause
  | { type: 'SESSION_COMPLETED' } // InternalTimer signals completion
  | { type: 'SKIP_REQUEST' } // User wants to skip current session
  | { type: 'RESET_REQUEST'; newSettings: PomodoroSettings }
  | { type: 'SETTINGS_UPDATED'; newSettings: PomodoroSettings }
  | { type: 'SWITCH_MODE_REQUEST'; targetMode: TimerMode } // For explicit mode switching
  | {
      type: '_EFFECT_MODE_TRANSITION_COMPLETE'
      newMode: TimerMode
      newTargetTime: number
      shouldAutoStart: boolean
    }

interface PomodoroReducerState {
  currentLogicalMode: TimerMode
  completedFocusSessionsInSet: number
  totalCompletedFocusSessions: number
  currentSetCount: number
  engineOperationalStatus: 'idle' | 'running' | 'paused' | 'transitioning_mode'
  // Holds the mode the engine wants useInternalTimer to be in
  // This allows the engine to decide a mode, then an effect makes useInternalTimer adopt it.
  internalTimerTargetMode: TimerMode
  // Holds the target time for useInternalTimer for the activeTimerMode
  internalTimerTargetTime: number
}

const createInitialReducerState = (settings: PomodoroSettings): PomodoroReducerState => ({
  currentLogicalMode: 'focus',
  completedFocusSessionsInSet: 0,
  totalCompletedFocusSessions: 0,
  currentSetCount: 0,
  engineOperationalStatus: 'idle',
  internalTimerTargetMode: 'focus',
  internalTimerTargetTime: getTotalTimeForMode('focus', settings),
})

function pomodoroEngineReducer(
  state: PomodoroReducerState,
  action: PomodoroReducerAction,
  currentSettings: PomodoroSettings
): PomodoroReducerState {
  switch (action.type) {
    case 'START_REQUEST':
      if (state.engineOperationalStatus === 'idle' || state.engineOperationalStatus === 'paused') {
        return { ...state, engineOperationalStatus: 'running' } // Effect will call internalTimer.start()
      }
      return state
    case 'PAUSE_REQUEST':
      if (state.engineOperationalStatus === 'running') {
        return { ...state, engineOperationalStatus: 'paused' } // Effect will call internalTimer.pause()
      }
      return state
    case 'SESSION_COMPLETED':
    case 'SKIP_REQUEST': {
      if (state.engineOperationalStatus === 'transitioning_mode') return state // Avoid processing during another transition

      let { completedFocusSessionsInSet, totalCompletedFocusSessions, currentSetCount } = state
      const modeJustFinished = state.currentLogicalMode // In SKIP_REQUEST, this is the mode being skipped.

      if (modeJustFinished === 'focus') {
        completedFocusSessionsInSet++
        totalCompletedFocusSessions++
      }

      const nextLogicalMode = determineNextMode(
        modeJustFinished,
        modeJustFinished === 'focus'
          ? completedFocusSessionsInSet - 1
          : completedFocusSessionsInSet,
        currentSettings
      )

      if (modeJustFinished === 'longBreak') {
        // A full set completed
        currentSetCount++
        completedFocusSessionsInSet = 0 // Reset for the new set
      }
      // If short break completed, or focus completed and it wasn't a long break next
      // completedFocusSessionsInSet remains as is or was incremented.

      return {
        ...state,
        engineOperationalStatus: 'transitioning_mode',
        currentLogicalMode: nextLogicalMode, // The new logical mode of the pomodoro cycle
        internalTimerTargetMode: nextLogicalMode, // Request useInternalTimer to adopt this mode
        internalTimerTargetTime: getTotalTimeForMode(nextLogicalMode, currentSettings),
        completedFocusSessionsInSet,
        totalCompletedFocusSessions,
        currentSetCount,
      }
    }
    case 'RESET_REQUEST':
      return { ...createInitialReducerState(action.newSettings), engineOperationalStatus: 'idle' } // Reset timer too

    case 'SETTINGS_UPDATED': {
      // If mode or durations change, reset the current segment timer but try to preserve cycle progress
      // More complex logic could be added here to be smarter about preserving state.
      // For now, if settings change, we reset the current segment to its new duration.
      const newTargetTimeForCurrentMode = getTotalTimeForMode(
        state.currentLogicalMode,
        action.newSettings
      )
      return {
        ...state,
        internalTimerTargetMode: state.currentLogicalMode, // Keep current mode but update its time
        internalTimerTargetTime: newTargetTimeForCurrentMode,
        // If status was running, it might need to be paused or reset explicitly by an effect.
        // For simplicity, let user restart if settings change mid-run.
        engineOperationalStatus:
          state.engineOperationalStatus === 'running' ? 'paused' : state.engineOperationalStatus,
      }
    }

    case 'SWITCH_MODE_REQUEST': // User explicitly changes mode
      if (state.engineOperationalStatus === 'transitioning_mode') return state
      // This is a hard switch, resets current pomodoro progress for the set usually.
      // Could be made smarter if needed.
      return {
        ...state,
        engineOperationalStatus: 'transitioning_mode', // Treat as a transition
        currentLogicalMode: action.targetMode,
        internalTimerTargetMode: action.targetMode,
        internalTimerTargetTime: getTotalTimeForMode(action.targetMode, currentSettings),
        completedFocusSessionsInSet: 0, // Typically resets focus count in set
      }

    case '_EFFECT_MODE_TRANSITION_COMPLETE':
      return {
        ...state,
        internalTimerTargetMode: action.newMode,
        internalTimerTargetTime: action.newTargetTime,
        engineOperationalStatus: action.shouldAutoStart ? 'running' : 'idle',
      }
    default:
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const exhaustiveCheck: never = action
      return state
  }
}

// --- Hook Implementation ---
export const usePomodoroEngine = (
  initialSettings?: Partial<PomodoroSettings>
): UsePomodoroReturn => {
  const [settings, setSettings] = useState<PomodoroSettings>({
    ...DEFAULT_POMODORO_SETTINGS,
    ...initialSettings,
  })

  // Bind settings to the reducer so it always has the latest
  const boundReducer = (state: PomodoroReducerState, action: PomodoroReducerAction) =>
    pomodoroEngineReducer(state, action, settings)

  const [engineCycleState, dispatch] = useReducer(boundReducer, createInitialReducerState(settings))

  const internalTimer = useInternalTimer({
    targetTimeInSeconds: engineCycleState.internalTimerTargetTime,
    onCompletion: () => dispatch({ type: 'SESSION_COMPLETED' }),
  })

  // Effect to manage internalTimer based on engineStatus
  useEffect(() => {
    if (engineCycleState.engineOperationalStatus === 'running' && !internalTimer.isRunning) {
      internalTimer.start()
    } else if (engineCycleState.engineOperationalStatus === 'paused' && internalTimer.isRunning) {
      internalTimer.pause()
    } else if (engineCycleState.engineOperationalStatus === 'transitioning_mode') {
      internalTimer.reset(engineCycleState.internalTimerTargetTime)
      // After reset, the internal timer's mode and time are effectively changed.
      // Now, check if we should auto-start the new segment.
      const autoStartFocus = settings.autoStartFocus ?? false
      const autoStartBreaks = settings.autoStartBreaks ?? false
      const shouldAutoStart =
        (engineCycleState.internalTimerTargetMode === 'focus' && autoStartFocus) ||
        (engineCycleState.internalTimerTargetMode !== 'focus' && autoStartBreaks)
      dispatch({
        type: '_EFFECT_MODE_TRANSITION_COMPLETE',
        newMode: engineCycleState.internalTimerTargetMode,
        newTargetTime: engineCycleState.internalTimerTargetTime,
        shouldAutoStart,
      })
      if (shouldAutoStart) {
        internalTimer.start()
      }
    } else if (engineCycleState.engineOperationalStatus === 'idle' && internalTimer.isRunning) {
      internalTimer.pause() // Ensure timer is not running when idle
    }
  }, [
    engineCycleState.engineOperationalStatus,
    engineCycleState.internalTimerTargetTime,
    internalTimer,
    settings.autoStartFocus,
    settings.autoStartBreaks,
    engineCycleState.internalTimerTargetMode,
  ])

  // Update Reducer if settings change from outside, potentially resetting current segment
  useEffect(() => {
    dispatch({ type: 'SETTINGS_UPDATED', newSettings: settings })
  }, [settings])

  // Actions exposed to the UI
  const startTimer = useCallback(() => dispatch({ type: 'START_REQUEST' }), [])
  const pauseTimer = useCallback(() => dispatch({ type: 'PAUSE_REQUEST' }), [])
  const skipSession = useCallback(() => dispatch({ type: 'SKIP_REQUEST' }), [])
  const resetCycle = useCallback(() => {
    // Also reset the internal timer to the new initial state's target time
    const newInitialState = createInitialReducerState(settings)
    internalTimer.reset(newInitialState.internalTimerTargetTime)
    dispatch({ type: 'RESET_REQUEST', newSettings: settings })
  }, [settings, internalTimer])

  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const switchToMode = useCallback((mode: TimerMode) => {
    dispatch({ type: 'SWITCH_MODE_REQUEST', targetMode: mode })
  }, [])

  const actions: PomodoroEngineActions = useMemo(
    () => ({
      startTimer,
      pauseTimer,
      skipSession,
      resetCycle,
      updateSettings,
      switchToMode,
    }),
    [startTimer, pauseTimer, skipSession, resetCycle, updateSettings, switchToMode]
  )

  // Derive PomodoroUIState from engineState and internalTimer state
  const uiState: PomodoroUIState = useMemo(() => {
    const { displayMinutes, displaySeconds } = formatTime(internalTimer.timeRemainingInSeconds)
    const progress = calculateProgress(
      internalTimer.timeRemainingInSeconds,
      engineCycleState.internalTimerTargetTime // Use target time for the current active mode
    )
    return {
      currentMode: engineCycleState.currentLogicalMode, // The logical pomodoro mode
      timeRemainingInSeconds: internalTimer.timeRemainingInSeconds,
      isRunning: internalTimer.isRunning, // Reflect actual timer running state
      completedFocusSessionsInSet: engineCycleState.completedFocusSessionsInSet,
      totalCompletedFocusSessions: engineCycleState.totalCompletedFocusSessions,
      currentSetCount: engineCycleState.currentSetCount,
      settings,
      displayMinutes,
      displaySeconds,
      progressPercent: progress,
      // engine specific states if needed for debug, but generally not for UIState
      internalTimerTargetMode: engineCycleState.internalTimerTargetMode, // Exposing for clarity, could be internal
      internalTimerTargetTime: engineCycleState.internalTimerTargetTime, // Exposing for clarity
    }
  }, [engineCycleState, internalTimer.timeRemainingInSeconds, internalTimer.isRunning, settings])

  return { uiState, actions }
}
