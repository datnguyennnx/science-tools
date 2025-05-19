import { ReactNode } from 'react'

// Enum for command identifiers for type safety and easier refactoring
export enum PomodoroCommandType {
  ToggleTimer = 'TOGGLE_TIMER',
  SkipSession = 'SKIP_SESSION',
  ResetCycle = 'RESET_CYCLE',
  OpenSettings = 'OPEN_SETTINGS',
  ToggleHelp = 'TOGGLE_HELP',
  ToggleTimeline = 'TOGGLE_TIMELINE',
  ToggleTimerDisplayMode = 'TOGGLE_TIMER_DISPLAY_MODE',
}

export type CommandCategory = 'timer' | 'mode' | 'settings' | 'view' | 'help'

export interface Command {
  id: PomodoroCommandType
  label: string
  description?: string
  shortcut?: string
  icon?: string | ReactNode
  action: () => void
  category: CommandCategory
  disabled?: boolean
  hidden?: boolean
}

export interface KeyBinding {
  /** The `KeyboardEvent.code` value. */
  code: string
  shiftKey?: boolean
  ctrlKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  preventDefault?: boolean
  commandId: PomodoroCommandType | 'custom'
  customAction?: () => void
  requiresNotRunning?: boolean
}

export interface CommandWithShortcut extends Command {
  displayShortcut?: string
}

export const DEFAULT_KEY_BINDINGS: KeyBinding[] = [
  { code: 'Space', commandId: PomodoroCommandType.ToggleTimer, preventDefault: true },
  { code: 'KeyN', commandId: PomodoroCommandType.SkipSession, preventDefault: true },
  { code: 'KeyR', commandId: PomodoroCommandType.ResetCycle, preventDefault: true },

  { code: 'KeyS', commandId: PomodoroCommandType.OpenSettings, preventDefault: true },
  {
    code: 'Slash',
    shiftKey: true,
    commandId: PomodoroCommandType.ToggleHelp,
    preventDefault: true,
  },

  {
    code: 'KeyV',
    shiftKey: true,
    commandId: PomodoroCommandType.ToggleTimeline,
    preventDefault: true,
  },
  {
    code: 'KeyQ',
    shiftKey: true,
    commandId: PomodoroCommandType.ToggleTimerDisplayMode,
    preventDefault: true,
  },
]
