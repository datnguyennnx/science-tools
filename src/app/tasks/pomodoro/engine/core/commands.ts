import { ReactNode } from 'react'

// Enum for command identifiers for type safety and easier refactoring
export enum PomodoroCommandType {
  ToggleTimer = 'TOGGLE_TIMER',
  SkipSession = 'SKIP_SESSION',
  ResetCycle = 'RESET_CYCLE',
  SwitchToFocus = 'SWITCH_TO_FOCUS',
  SwitchToShortBreak = 'SWITCH_TO_SHORT_BREAK',
  SwitchToLongBreak = 'SWITCH_TO_LONG_BREAK',
  OpenSettings = 'OPEN_SETTINGS',
  ToggleHelp = 'TOGGLE_HELP', // For command palette/shortcuts display
  ToggleTimeline = 'TOGGLE_TIMELINE', // For CurrentSectionDisplay
  ToggleTimerDisplayMode = 'TOGGLE_TIMER_DISPLAY_MODE', // e.g., show full date/time
}

export type CommandCategory = 'timer' | 'mode' | 'settings' | 'view' | 'help'

export interface Command {
  id: PomodoroCommandType
  label: string
  description?: string
  shortcut?: string // User-facing display string, e.g., "Shift+V"
  icon?: string | ReactNode // Icon identifier or component
  action: () => void // The function to execute
  category: CommandCategory
  disabled?: boolean // If the command is currently disabled
  hidden?: boolean // If the command should not be shown in lists
}

export interface KeyBinding {
  /** The `KeyboardEvent.code` value. */
  code: string
  shiftKey?: boolean
  ctrlKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  preventDefault?: boolean
  commandId: PomodoroCommandType | 'custom' // 'custom' for bindings not directly mapping to a Command ID
  customAction?: () => void // For 'custom' commandId
  /** Only allow if timer is not running. */
  requiresNotRunning?: boolean
}

// ADDED this interface here for wider use
export interface CommandWithShortcut extends Command {
  displayShortcut?: string
}

export const DEFAULT_KEY_BINDINGS: KeyBinding[] = [
  { code: 'Space', commandId: PomodoroCommandType.ToggleTimer, preventDefault: true },
  { code: 'KeyN', commandId: PomodoroCommandType.SkipSession, preventDefault: true },
  { code: 'KeyR', commandId: PomodoroCommandType.ResetCycle, preventDefault: true },

  { code: 'KeyS', commandId: PomodoroCommandType.OpenSettings, preventDefault: true }, // Typically dialogs steal focus, but good practice
  {
    code: 'Slash',
    shiftKey: true,
    commandId: PomodoroCommandType.ToggleHelp,
    preventDefault: true,
  }, // Shift + / = ?

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
