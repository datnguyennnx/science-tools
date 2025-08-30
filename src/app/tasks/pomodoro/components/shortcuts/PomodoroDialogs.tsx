'use client'

import { PomodoroSettings } from '../../engine/core/types'
import { CommandWithShortcut } from '../../engine/core/commands'
import { PomodoroCommandDialog } from './CommandDialog'
import { SettingsDialog } from './SettingsDialog'

interface PomodoroDialogsProps {
  commands: CommandWithShortcut[]
  isCommandPaletteOpen: boolean
  setIsCommandPaletteOpen: (isOpen: boolean) => void
  isSettingsDialogOpen: boolean
  setIsSettingsDialogOpen: (isOpen: boolean) => void
  currentSettings: PomodoroSettings
  onUpdateSettings: (newSettings: Partial<PomodoroSettings>) => void
}

export function PomodoroDialogs({
  commands,
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  isSettingsDialogOpen,
  setIsSettingsDialogOpen,
  currentSettings,
  onUpdateSettings,
}: PomodoroDialogsProps) {
  return (
    <>
      <PomodoroCommandDialog
        commands={commands}
        isOpen={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
      />
      <SettingsDialog
        isOpen={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
        currentSettings={currentSettings}
        onUpdateSettings={onUpdateSettings}
      />
    </>
  )
}
