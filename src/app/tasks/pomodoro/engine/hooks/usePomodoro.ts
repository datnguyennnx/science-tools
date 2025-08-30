import { useEffect, useReducer, useState } from 'react'
import {
  PomodoroSettings,
  TimerMode,
  PomodoroEngineActions,
  PomodoroUIState,
  UsePomodoroReturn,
} from '../core/types'
import { DEFAULT_POMODORO_SETTINGS } from '../core/settings'
import { useTimer } from './useTimer'
import {
  determineNextMode,
  formatTime,
  calculateProgress,
  getTotalTimeForMode,
} from '../utils/timer-utils'

type PomodoroReducerAction =
  | { type: 'START_REQUEST' }
  | { type: 'PAUSE_REQUEST' }
  | { type: 'SESSION_COMPLETED' }
  | { type: 'SKIP_REQUEST' }
  | { type: 'RESET_REQUEST'; newSettings: PomodoroSettings }
  | { type: 'SETTINGS_UPDATED'; newSettings: PomodoroSettings }
  | { type: 'SWITCH_MODE_REQUEST'; targetMode: TimerMode }
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
  internalTimerTargetMode: TimerMode
  internalTimerTargetTime: number
}

// Create initial reducer state
const createInitialReducerState = (settings: PomodoroSettings): PomodoroReducerState => ({
  currentLogicalMode: 'focus',
  completedFocusSessionsInSet: 0,
  totalCompletedFocusSessions: 0,
  currentSetCount: 0,
  engineOperationalStatus: 'idle',
  internalTimerTargetMode: 'focus',
  internalTimerTargetTime: getTotalTimeForMode('focus', settings),
})

// Pomodoro state reducer
function pomodoroEngineReducer(
  state: PomodoroReducerState,
  action: PomodoroReducerAction,
  currentSettings: PomodoroSettings
): PomodoroReducerState {
  switch (action.type) {
    case 'START_REQUEST':
      if (state.engineOperationalStatus === 'idle' || state.engineOperationalStatus === 'paused') {
        return { ...state, engineOperationalStatus: 'running' }
      }
      return state
    case 'PAUSE_REQUEST':
      if (state.engineOperationalStatus === 'running') {
        return { ...state, engineOperationalStatus: 'paused' }
      }
      return state
    case 'SESSION_COMPLETED':
    case 'SKIP_REQUEST': {
      if (state.engineOperationalStatus === 'transitioning_mode') return state

      let { completedFocusSessionsInSet, totalCompletedFocusSessions, currentSetCount } = state
      const modeJustFinished = state.currentLogicalMode

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
        currentSetCount++
        completedFocusSessionsInSet = 0
      }

      return {
        ...state,
        engineOperationalStatus: 'transitioning_mode',
        currentLogicalMode: nextLogicalMode,
        internalTimerTargetMode: nextLogicalMode,
        internalTimerTargetTime: getTotalTimeForMode(nextLogicalMode, currentSettings),
        completedFocusSessionsInSet,
        totalCompletedFocusSessions,
        currentSetCount,
      }
    }
    case 'RESET_REQUEST':
      return { ...createInitialReducerState(action.newSettings), engineOperationalStatus: 'idle' }

    case 'SETTINGS_UPDATED': {
      const newTargetTimeForCurrentMode = getTotalTimeForMode(
        state.currentLogicalMode,
        action.newSettings
      )
      return {
        ...state,
        internalTimerTargetMode: state.currentLogicalMode,
        internalTimerTargetTime: newTargetTimeForCurrentMode,
        engineOperationalStatus:
          state.engineOperationalStatus === 'running' ? 'paused' : state.engineOperationalStatus,
      }
    }

    case 'SWITCH_MODE_REQUEST':
      if (state.engineOperationalStatus === 'transitioning_mode') return state
      return {
        ...state,
        engineOperationalStatus: 'transitioning_mode',
        currentLogicalMode: action.targetMode,
        internalTimerTargetMode: action.targetMode,
        internalTimerTargetTime: getTotalTimeForMode(action.targetMode, currentSettings),
        completedFocusSessionsInSet: 0,
      }

    case '_EFFECT_MODE_TRANSITION_COMPLETE':
      return {
        ...state,
        internalTimerTargetMode: action.newMode,
        internalTimerTargetTime: action.newTargetTime,
        engineOperationalStatus: action.shouldAutoStart ? 'running' : 'idle',
      }
    default:
      return state
  }
}

// Hook for managing pomodoro timer state
export const usePomodoro = (initialSettings?: Partial<PomodoroSettings>): UsePomodoroReturn => {
  const [settings, setSettings] = useState<PomodoroSettings>({
    ...DEFAULT_POMODORO_SETTINGS,
    ...initialSettings,
  })

  const boundReducer = (state: PomodoroReducerState, action: PomodoroReducerAction) =>
    pomodoroEngineReducer(state, action, settings)

  const [engineCycleState, dispatch] = useReducer(boundReducer, createInitialReducerState(settings))

  const internalTimer = useTimer({
    targetTimeInSeconds: engineCycleState.internalTimerTargetTime,
    onCompletion: () => dispatch({ type: 'SESSION_COMPLETED' }),
  })

  // Manage timer based on engine status
  useEffect(() => {
    if (engineCycleState.engineOperationalStatus === 'running' && !internalTimer.isRunning) {
      internalTimer.start()
    } else if (engineCycleState.engineOperationalStatus === 'paused' && internalTimer.isRunning) {
      internalTimer.pause()
    } else if (engineCycleState.engineOperationalStatus === 'transitioning_mode') {
      internalTimer.reset(engineCycleState.internalTimerTargetTime)
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
      internalTimer.pause()
    }
  }, [
    engineCycleState.engineOperationalStatus,
    engineCycleState.internalTimerTargetTime,
    internalTimer,
    settings.autoStartFocus,
    settings.autoStartBreaks,
    engineCycleState.internalTimerTargetMode,
  ])

  // Update state when settings change
  useEffect(() => {
    dispatch({ type: 'SETTINGS_UPDATED', newSettings: settings })
  }, [settings])

  // UI actions
  const startTimer = () => dispatch({ type: 'START_REQUEST' })
  const pauseTimer = () => dispatch({ type: 'PAUSE_REQUEST' })
  const skipSession = () => dispatch({ type: 'SKIP_REQUEST' })
  const resetCycle = () => {
    const newInitialState = createInitialReducerState(settings)
    internalTimer.reset(newInitialState.internalTimerTargetTime)
    dispatch({ type: 'RESET_REQUEST', newSettings: settings })
  }

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const switchToMode = (mode: TimerMode) => {
    dispatch({ type: 'SWITCH_MODE_REQUEST', targetMode: mode })
  }

  const actions: PomodoroEngineActions = {
    startTimer,
    pauseTimer,
    skipSession,
    resetCycle,
    updateSettings,
    switchToMode,
  }

  // Derive UI state
  const { displayMinutes, displaySeconds } = formatTime(internalTimer.timeRemainingInSeconds)
  const progress = calculateProgress(
    internalTimer.timeRemainingInSeconds,
    engineCycleState.internalTimerTargetTime
  )

  const uiState: PomodoroUIState = {
    currentMode: engineCycleState.currentLogicalMode,
    timeRemainingInSeconds: internalTimer.timeRemainingInSeconds,
    isRunning: internalTimer.isRunning,
    completedFocusSessionsInSet: engineCycleState.completedFocusSessionsInSet,
    totalCompletedFocusSessions: engineCycleState.totalCompletedFocusSessions,
    currentSetCount: engineCycleState.currentSetCount,
    settings,
    displayMinutes,
    displaySeconds,
    progressPercent: progress,
  }

  return { uiState, actions }
}
