import { useEffect, useState, useRef } from 'react'
import { Command, PomodoroCommandType, DEFAULT_KEY_BINDINGS, KeyBinding } from '../core/commands'
import {
  CommandManagerRegistry,
  createEmptyRegistry,
  registerCommand as registerCmd,
  registerKeyBinding as registerKb,
  findKeyBinding as findKb,
  getCommand as getCmd,
  getAllCommands as getAllCmds,
  getShortcutForCommand as getShortcutCmd,
} from '../utils/command-registry'
import { PomodoroEngineActions } from '../core/types'

// Debounce utility for command actions
function debounceSimpleVoid(func: () => void, waitFor: number): () => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return () => {
    if (timeout !== null) clearTimeout(timeout)
    timeout = setTimeout(() => func(), waitFor)
  }
}

interface UseCommandsProps {
  engineActions: PomodoroEngineActions
  isTimerRunning: boolean
}

export interface CommandWithShortcut extends Command {
  displayShortcut?: string
}

// Hook for managing pomodoro commands and keyboard shortcuts
export const useCommands = ({ engineActions, isTimerRunning }: UseCommandsProps) => {
  const [registry, setRegistry] = useState<CommandManagerRegistry>(createEmptyRegistry())
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [isTimelineVisible, setIsTimelineVisible] = useState(false)
  const [isTimerDisplayModeFull, setIsTimerDisplayModeFull] = useState(false)

  const engineActionsRef = useRef(engineActions)
  useEffect(() => {
    engineActionsRef.current = engineActions
  }, [engineActions])

  // Initialize commands and keybindings
  useEffect(() => {
    const toggleTimerAction = () => {
      if (isTimerRunning) {
        engineActionsRef.current.pauseTimer()
      } else {
        engineActionsRef.current.startTimer()
      }
    }
    const skipSessionAction = debounceSimpleVoid(() => engineActionsRef.current.skipSession(), 300)
    const resetCycleAction = () => engineActionsRef.current.resetCycle()
    const openSettingsAction = () => setIsSettingsDialogOpen(true)
    const toggleHelpAction = () => setIsCommandPaletteOpen(prev => !prev)
    const toggleTimelineAction = () => setIsTimelineVisible(prev => !prev)
    const toggleTimerDisplayModeAction = () => setIsTimerDisplayModeFull(prev => !prev)

    let currentRegistry = createEmptyRegistry()

    const commandsToRegister: Command[] = [
      {
        id: PomodoroCommandType.ToggleTimer,
        label: isTimerRunning ? 'Pause Timer' : 'Start Timer',
        action: toggleTimerAction,
        category: 'timer',
        icon: 'timer',
      },
      {
        id: PomodoroCommandType.SkipSession,
        label: 'Skip Current Session',
        action: skipSessionAction,
        category: 'timer',
        icon: 'skip-forward',
      },
      {
        id: PomodoroCommandType.ResetCycle,
        label: 'Reset Pomodoro Cycle',
        action: resetCycleAction,
        category: 'timer',
        icon: 'rotate-ccw',
      },
      {
        id: PomodoroCommandType.OpenSettings,
        label: 'Open Settings',
        action: openSettingsAction,
        category: 'settings',
        icon: 'settings',
      },
      {
        id: PomodoroCommandType.ToggleHelp,
        label: 'Toggle Command Palette',
        action: toggleHelpAction,
        category: 'help',
        icon: 'keyboard',
      },
      {
        id: PomodoroCommandType.ToggleTimeline,
        label: 'Toggle Timeline Display',
        action: toggleTimelineAction,
        category: 'view',
        icon: 'view',
      },
      {
        id: PomodoroCommandType.ToggleTimerDisplayMode,
        label: 'Toggle Full Time Display',
        action: toggleTimerDisplayModeAction,
        category: 'view',
        icon: 'view',
      },
    ]

    commandsToRegister.forEach(cmd => {
      currentRegistry = registerCmd(currentRegistry, cmd)
    })

    DEFAULT_KEY_BINDINGS.forEach(kb => {
      currentRegistry = registerKb(currentRegistry, kb)
    })

    const escapeBinding: KeyBinding = {
      code: 'Escape',
      commandId: 'custom',
      preventDefault: true,
      customAction: () => {
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false)
        if (isSettingsDialogOpen) setIsSettingsDialogOpen(false)
      },
    }
    currentRegistry = registerKb(currentRegistry, escapeBinding)

    setRegistry(currentRegistry)
  }, [isTimerRunning, isCommandPaletteOpen, isSettingsDialogOpen])

  // Global keydown listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      const binding = findKb(registry, event)
      if (binding) {
        if (binding.preventDefault) {
          event.preventDefault()
        }

        if (binding.commandId === 'custom' && binding.customAction) {
          binding.customAction()
        } else if (binding.commandId !== 'custom') {
          const command = getCmd(registry, binding.commandId)
          if (command && !command.disabled) {
            if (binding.requiresNotRunning && isTimerRunning) {
              return
            }
            command.action()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [registry, isTimerRunning])

  // Commands for UI display with shortcuts
  const commandsForUI: CommandWithShortcut[] = getAllCmds(registry).map(cmd => ({
    ...cmd,
    displayShortcut: getShortcutCmd(registry, cmd.id),
  }))

  return {
    commands: commandsForUI,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isSettingsDialogOpen,
    setIsSettingsDialogOpen,
    isTimelineVisible,
    isTimerDisplayModeFull,
  }
}
