'use client'

import { useEffect, useRef, useMemo } from 'react'
import {
  createEmptyRegistry,
  registerCommand,
  registerKeyBinding,
  findKeyBinding,
  getCommand,
  getShortcutForCommand,
  type CommandManagerRegistry,
} from '../commandManager'
import { SortCommandType, type KeyBinding, type Command } from '../commands'

interface UseSortKeyboardCommandsProps {
  setShowAlgorithmInfo: React.Dispatch<React.SetStateAction<boolean>>
  setShowPseudoCode: React.Dispatch<React.SetStateAction<boolean>>
}

interface UseSortKeyboardCommandsReturn {
  toggleAlgorithmInfoShortcut?: string
  togglePseudoCodeShortcut?: string
}

export function useSortKeyboardCommands({
  setShowAlgorithmInfo,
  setShowPseudoCode,
}: UseSortKeyboardCommandsProps): UseSortKeyboardCommandsReturn {
  const commandRegistryRef = useRef<CommandManagerRegistry>(createEmptyRegistry())

  if (commandRegistryRef.current.commands.size === 0) {
    let registry = commandRegistryRef.current

    const toggleAlgorithmInfoCommand: Command = {
      id: SortCommandType.TOGGLE_ALGORITHM_INFO,
      label: 'Toggle Algorithm Info',
      action: () => setShowAlgorithmInfo(prev => !prev),
      category: 'display',
    }
    registry = registerCommand(registry, toggleAlgorithmInfoCommand)

    const toggleAlgorithmInfoBinding: KeyBinding = {
      code: 'KeyA',
      shiftKey: true,
      commandId: SortCommandType.TOGGLE_ALGORITHM_INFO,
      preventDefault: true,
    }
    registry = registerKeyBinding(registry, toggleAlgorithmInfoBinding)

    const togglePseudoCodeCommand: Command = {
      id: SortCommandType.TOGGLE_PSEUDO_CODE,
      label: 'Toggle Pseudo-code & Stats',
      action: () => setShowPseudoCode(prev => !prev),
      category: 'display',
    }
    registry = registerCommand(registry, togglePseudoCodeCommand)

    const togglePseudoCodeBinding: KeyBinding = {
      code: 'KeyC',
      shiftKey: true,
      commandId: SortCommandType.TOGGLE_PSEUDO_CODE,
      preventDefault: true,
    }
    registry = registerKeyBinding(registry, togglePseudoCodeBinding)

    commandRegistryRef.current = registry
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const binding = findKeyBinding(commandRegistryRef.current, {
        code: event.code,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      })

      if (binding) {
        if (binding.preventDefault) {
          event.preventDefault()
        }
        const command = getCommand(commandRegistryRef.current, binding.commandId as SortCommandType)
        if (command && !command.disabled) {
          command.action()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const shortcuts = useMemo(() => {
    return {
      toggleAlgorithmInfoShortcut: getShortcutForCommand(
        commandRegistryRef.current,
        SortCommandType.TOGGLE_ALGORITHM_INFO
      ),
      togglePseudoCodeShortcut: getShortcutForCommand(
        commandRegistryRef.current,
        SortCommandType.TOGGLE_PSEUDO_CODE
      ),
    }
  }, [])

  return shortcuts
}
