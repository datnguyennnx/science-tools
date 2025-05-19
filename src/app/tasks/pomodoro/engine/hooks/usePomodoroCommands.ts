import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import {
  Command,
  PomodoroCommandType,
  DEFAULT_KEY_BINDINGS,
  KeyBinding,
  CommandCategory,
} from '../core/commands'
import {
  CommandManagerRegistry,
  createEmptyRegistry,
  registerCommand as registerCmd,
  registerKeyBinding as registerKb,
  findKeyBinding as findKb,
  getCommand as getCmd,
  getAllCommands as getAllCmds,
  getShortcutForCommand as getShortcutCmd,
} from '../utils/commandManager'
import { PomodoroEngineActions } from '../core/types'

// Debounce utility - Simplified for functions with no args returning void
const debounceSimpleVoid = (func: () => void, waitFor: number): (() => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return () => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(), waitFor)
  }
}

interface UsePomodoroCommandsProps {
  engineActions: PomodoroEngineActions
  // Add any other state needed for command conditions, e.g., isTimerRunning
  isTimerRunning: boolean
}

export interface CommandWithShortcut extends Command {
  displayShortcut?: string
}

export const usePomodoroCommands = ({
  engineActions,
  isTimerRunning,
}: UsePomodoroCommandsProps) => {
  const [registry, setRegistry] = useState<CommandManagerRegistry>(createEmptyRegistry())
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  // Example: you might have other UI states controlled by commands
  const [isTimelineVisible, setIsTimelineVisible] = useState(false)
  const [isTimerDisplayModeFull, setIsTimerDisplayModeFull] = useState(false)

  const engineActionsRef = useRef(engineActions) // Ref to always call the latest actions
  useEffect(() => {
    engineActionsRef.current = engineActions
  }, [engineActions])

  // Define Command Actions
  // These are stable callbacks that will be assigned to command objects.
  // Debounce critical actions like skip if necessary.
  const toggleTimerAction = useCallback(() => {
    if (isTimerRunning) {
      engineActionsRef.current.pauseTimer()
    } else {
      engineActionsRef.current.startTimer()
    }
  }, [isTimerRunning, engineActionsRef])
  const skipSessionAction = useMemo(
    () => debounceSimpleVoid(() => engineActionsRef.current.skipSession(), 300),
    [engineActionsRef] // engineActionsRef itself is stable
  )
  const resetCycleAction = useCallback(
    () => engineActionsRef.current.resetCycle(),
    [engineActionsRef]
  )
  const openSettingsAction = useCallback(() => setIsSettingsDialogOpen(true), [])
  const toggleHelpAction = useCallback(() => setIsCommandPaletteOpen(prev => !prev), [])
  const toggleTimelineAction = useCallback(() => setIsTimelineVisible(prev => !prev), [])
  const toggleTimerDisplayModeAction = useCallback(
    () => setIsTimerDisplayModeFull(prev => !prev),
    []
  )

  // Initialize commands and keybindings
  useEffect(() => {
    let currentRegistry = createEmptyRegistry()

    // Define all commands
    const commandsToRegister: Command[] = [
      {
        id: PomodoroCommandType.ToggleTimer,
        label: isTimerRunning ? 'Pause Timer' : 'Start Timer', // Label can be dynamic
        action: toggleTimerAction,
        category: 'timer',
        icon: 'timer', // Example icon identifier
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
        icon: 'view', // Placeholder, replace with actual Eye icon if that was the name
      },
      {
        id: PomodoroCommandType.ToggleTimerDisplayMode,
        label: 'Toggle Full Time Display',
        action: toggleTimerDisplayModeAction,
        category: 'view',
        icon: 'view', // Placeholder
      },
    ]

    commandsToRegister.forEach(cmd => {
      currentRegistry = registerCmd(currentRegistry, cmd)
    })

    DEFAULT_KEY_BINDINGS.forEach(kb => {
      currentRegistry = registerKb(currentRegistry, kb)
    })

    // Add Escape key for dialogs
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
  }, [
    isTimerRunning,
    toggleTimerAction,
    skipSessionAction,
    resetCycleAction,
    openSettingsAction,
    toggleHelpAction,
    toggleTimelineAction,
    toggleTimerDisplayModeAction,
    isCommandPaletteOpen,
    isSettingsDialogOpen,
  ])

  // Global keydown listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return // Ignore inputs
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
              return // Command requires timer to be stopped
            }
            command.action()
            // If command should close palette (most do)
            if (command.id !== PomodoroCommandType.ToggleHelp && command.category !== 'settings') {
              // setIsCommandPaletteOpen(false); // This might be too aggressive here, handle in action itself or dialog component
            }
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [registry, isTimerRunning]) // Re-attach if registry or isTimerRunning changes

  // Memoized list of commands for UI display, with shortcuts
  const commandsForUI: CommandWithShortcut[] = useMemo(() => {
    return getAllCmds(registry).map(cmd => ({
      ...cmd,
      displayShortcut: getShortcutCmd(registry, cmd.id),
    }))
  }, [registry])

  return {
    commands: commandsForUI,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isSettingsDialogOpen,
    setIsSettingsDialogOpen,
    isTimelineVisible,
    isTimerDisplayModeFull,
    getCommandsByCategory: (category: CommandCategory) =>
      getAllCmds(registry, category).map(cmd => ({
        ...cmd,
        displayShortcut: getShortcutCmd(registry, cmd.id),
      })),
  }
}
