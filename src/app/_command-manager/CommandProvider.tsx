'use client'

import { useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import {
  createEmptyRegistry as cmdCreateEmptyRegistry,
  registerCommand as cmdRegisterCommand,
  unregisterCommand as cmdUnregisterCommand,
  registerKeyBinding as cmdRegisterKeyBinding,
  unregisterKeyBinding as cmdUnregisterKeyBinding,
  findKeyBinding as cmdFindKeyBinding,
  getCommand as cmdGetCommand,
  getAllCommands as cmdGetAllCommands,
  getShortcutForCommand as cmdGetShortcutForCommand,
} from './commandManager'
import type {
  Command,
  CommandId,
  KeyBinding,
  CommandManagerRegistry,
  CommandWithShortcut,
  CommandCategory,
} from './types'
import { CommandContext, CommandManagerContextProps } from './command-context'
import { GlobalCommandId, GlobalCommandCategory } from './global-command-types'
import { useFlashMessageStore } from '@/stores/flash-message.store'

interface CommandProviderProps {
  children: ReactNode
}

export const CommandProvider = ({ children }: CommandProviderProps) => {
  const [registry, setRegistry] = useState<CommandManagerRegistry>(cmdCreateEmptyRegistry())
  const showFlashMessage = useFlashMessageStore(state => state.showFlash)

  // Memoized actions to avoid re-creating functions on every render
  const registerCommandCb = useCallback((command: Command) => {
    setRegistry(prev => cmdRegisterCommand(prev, command))
  }, [])

  const unregisterCommandCb = useCallback((commandId: CommandId) => {
    setRegistry(prev => cmdUnregisterCommand(prev, commandId))
  }, [])

  const registerKeyBindingCb = useCallback((keyBinding: KeyBinding) => {
    setRegistry(prev => cmdRegisterKeyBinding(prev, keyBinding))
  }, [])

  const unregisterKeyBindingCb = useCallback(
    (keyBinding: Pick<KeyBinding, 'code' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>) => {
      setRegistry(prev => cmdUnregisterKeyBinding(prev, keyBinding))
    },
    []
  )

  const getCommandCb = useCallback(
    (commandId: CommandId) => cmdGetCommand(registry, commandId),
    [registry]
  )

  const executeCommandByIdCb = useCallback(
    (commandId: CommandId) => {
      const command = cmdGetCommand(registry, commandId)
      if (command && !command.disabled) {
        command.action()
      }
    },
    [registry]
  )

  const getAllCommandsCb = useCallback(
    (category?: CommandCategory): CommandWithShortcut[] => {
      return cmdGetAllCommands(registry, category).map(cmd => ({
        ...cmd,
        displayShortcut: cmdGetShortcutForCommand(registry, cmd.id),
      }))
    },
    [registry]
  )

  const getShortcutForCommandCb = useCallback(
    (commandId: CommandId) => {
      return cmdGetShortcutForCommand(registry, commandId)
    },
    [registry]
  )

  // --- Initialize Global Commands (example: flash message command) ---
  const flashMessageAction = useCallback(() => {
    showFlashMessage('God bless you!!')
  }, [showFlashMessage])

  useEffect(() => {
    const flashCommand: Command = {
      id: GlobalCommandId.ShowFlashMessage,
      label: 'Show God Bless You Flash',
      action: flashMessageAction,
      category: 'ui' as GlobalCommandCategory,
      icon: 'Sparkles',
      keywords: ['flash', 'message', 'fullscreen', 'bless'],
    }
    registerCommandCb(flashCommand)

    const flashKeyBinding: KeyBinding = {
      code: 'KeyF',
      shiftKey: true,
      commandId: GlobalCommandId.ShowFlashMessage,
      preventDefault: true,
    }
    registerKeyBindingCb(flashKeyBinding)

    // Cleanup on unmount if necessary
    // return () => {
    //   unregisterCommandCb(GlobalCommandId.ShowFlashMessage);
    //   unregisterKeyBindingCb({ code: 'KeyF', shiftKey: true });
    // }
  }, [flashMessageAction, registerCommandCb, registerKeyBindingCb])
  // --- End Initialize Global Commands ---

  // --- Global Keydown Listener ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const binding = cmdFindKeyBinding(registry, event, { target: event.target })

      if (binding) {
        const activeElement = document.activeElement
        if (
          activeElement instanceof HTMLElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable)
        ) {
          if (binding.code !== 'Escape') {
            return
          }
        }

        if (binding.preventDefault !== false) {
          event.preventDefault()
        }

        if (binding.commandId === 'custom' && binding.customAction) {
          binding.customAction()
        } else if (binding.commandId !== 'custom') {
          const command = cmdGetCommand(registry, binding.commandId)
          if (command && !command.disabled) {
            command.action()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [registry]) // Depends on registry
  // --- End Global Keydown Listener ---

  const contextValue: CommandManagerContextProps = useMemo(
    () => ({
      registry,
      registerCommand: registerCommandCb,
      unregisterCommand: unregisterCommandCb,
      registerKeyBinding: registerKeyBindingCb,
      unregisterKeyBinding: unregisterKeyBindingCb,
      getCommand: getCommandCb,
      getAllCommands: getAllCommandsCb,
      getShortcutForCommand: getShortcutForCommandCb,
      executeCommandById: executeCommandByIdCb,
    }),
    [
      registry,
      registerCommandCb,
      unregisterCommandCb,
      registerKeyBindingCb,
      unregisterKeyBindingCb,
      getCommandCb,
      getAllCommandsCb,
      getShortcutForCommandCb,
      executeCommandByIdCb,
    ]
  )

  return <CommandContext.Provider value={contextValue}>{children}</CommandContext.Provider>
}
