import { ReactNode } from 'react'

/**
 * Generic type for command identifiers.
 * Each module can define its own enum or string constants for specific command IDs.
 */
export type CommandId = string | number

/**
 * Generic type for command categories.
 * Each module can define its own categories.
 */
export type CommandCategory = string

/**
 * Represents a command that can be executed within the application.
 */
export interface Command {
  /** Unique identifier for the command. */
  id: CommandId
  /** User-facing label for the command. */
  label: string
  /** Optional detailed description of what the command does. */
  description?: string
  /** User-facing display string for the shortcut, e.g., "Shift+V". */
  shortcut?: string
  /** Icon identifier (e.g., string for a Lucide icon name) or a ReactNode for custom icons. */
  icon?: string | ReactNode
  /** The function to execute when the command is triggered. */
  action: () => void
  /** The category this command belongs to, used for grouping in UI. */
  category: CommandCategory
  /** Optional flag indicating if the command is currently disabled. */
  disabled?: boolean
  /** Optional flag indicating if the command should be hidden from UI lists. */
  hidden?: boolean
  /** Optional keywords for searching the command in a command palette. */
  keywords?: string[]
}

/**
 * Represents a key binding that triggers a command or a custom action.
 */
export interface KeyBinding {
  /** The `KeyboardEvent.code` value (e.g., "KeyS", "Space", "Enter"). */
  code: string
  /** Specifies if the Shift key must be pressed. Defaults to false. */
  shiftKey?: boolean
  /** Specifies if the Ctrl key (Control on Windows/Linux, Command on macOS) must be pressed. Defaults to false. */
  ctrlKey?: boolean
  /** Specifies if the Alt key (Option on macOS) must be pressed. Defaults to false. */
  altKey?: boolean
  /** Specifies if the Meta key (Windows key on Windows, Command key on macOS) must be pressed. Defaults to false. */
  metaKey?: boolean
  /** If true, `event.preventDefault()` will be called. Defaults to true for most command bindings. */
  preventDefault?: boolean
  /**
   * The ID of the command to execute.
   * Can also be a special string like "custom" if `customAction` is provided.
   */
  commandId: CommandId | 'custom'
  /** A custom action to execute if `commandId` is "custom". */
  customAction?: () => void
  /**
   * Optional condition for the key binding to be active.
   * For example, a key binding might only be active when a specific UI element is focused
   * or when the application is in a certain state.
   * The `context` parameter would be provided by the environment where the key listener is attached.
   */
  isActive?: (context?: unknown) => boolean
}

/**
 * Extends the base Command interface to include a displayable shortcut string.
 * This is typically derived from the registered KeyBindings.
 */
export interface CommandWithShortcut extends Command {
  displayShortcut?: string
}

/**
 * Defines the structure for the command manager's registry.
 * It holds maps of registered commands and key bindings.
 */
export interface CommandManagerRegistry {
  readonly commands: ReadonlyMap<CommandId, Command>
  /** Key is a string generated from the KeyBinding properties (e.g., "Shift+Ctrl+KeyA") */
  readonly keyBindings: ReadonlyMap<string, KeyBinding>
}
