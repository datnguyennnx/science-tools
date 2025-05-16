import { ReactNode } from 'react'

// Enum for command identifiers for type safety and easier refactoring
export enum SortCommandType {
  // Existing Pomodoro commands might be here if this enum was shared.
  // For now, let's assume it's specific to Sort or add Sort-specific ones.
  // Example: SOME_EXISTING_SORT_COMMAND = 'someExistingSortCommand',

  TOGGLE_ALGORITHM_INFO = 'toggleAlgorithmInfo',
  TOGGLE_PSEUDO_CODE = 'togglePseudoCode',

  // Sort Action Commands
  NEW_ARRAY = 'newArray',
  START_SORT = 'startSort',
  PAUSE_SORT = 'pauseSort',
  RESUME_SORT = 'resumeSort',
  STEP_FORWARD = 'stepForward',
  RESET_SORT = 'resetSort',
}

export type CommandCategory = 'timer' | 'mode' | 'settings' | 'view' | 'help' | 'display' | 'action' // Added 'action' category

export interface Command {
  id: SortCommandType // Changed from PomodoroCommandType
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
  commandId: SortCommandType | 'custom' // Changed from PomodoroCommandType
  customAction?: () => void // For 'custom' commandId
  /** Only allow if timer is not running. */
  requiresNotRunning?: boolean
}

// ADDED this interface here for wider use
export interface CommandWithShortcut extends Command {
  displayShortcut?: string
}

export const DEFAULT_KEY_BINDINGS: KeyBinding[] = []
