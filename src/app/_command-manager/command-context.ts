import { createContext, useContext } from 'react'
import type {
  Command,
  CommandId,
  CommandManagerRegistry,
  CommandWithShortcut,
  KeyBinding,
  CommandCategory,
} from './types'

export interface CommandManagerContextProps {
  registry: CommandManagerRegistry
  registerCommand: (command: Command) => void
  unregisterCommand: (commandId: CommandId) => void
  registerKeyBinding: (keyBinding: KeyBinding) => void
  unregisterKeyBinding: (
    keyBinding: Pick<KeyBinding, 'code' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>
  ) => void
  getCommand: (commandId: CommandId) => Command | undefined
  getAllCommands: (category?: CommandCategory) => CommandWithShortcut[]
  getShortcutForCommand: (commandId: CommandId) => string | undefined
  executeCommandById: (commandId: CommandId) => void
  // Add any other functions you want to expose, e.g., for opening a command palette
}

export const CommandContext = createContext<CommandManagerContextProps | undefined>(undefined)

export const useCommandManager = (): CommandManagerContextProps => {
  const context = useContext(CommandContext)
  if (!context) {
    throw new Error('useCommandManager must be used within a CommandProvider')
  }
  return context
}
