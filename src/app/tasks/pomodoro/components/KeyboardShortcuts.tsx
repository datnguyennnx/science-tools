'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Timer, SkipForward, RotateCcw, Settings, Keyboard, Eye, LucideIcon } from 'lucide-react'
import { PomodoroSettings } from '../engine/core/types'
import { CommandWithShortcut, PomodoroCommandType, CommandCategory } from '../engine/core/commands'
import { DEFAULT_POMODORO_SETTINGS } from '../engine/core/defaults'

// Map icon strings to Lucide components
const iconMap: Record<string, LucideIcon> = {
  timer: Timer,
  'rotate-ccw': RotateCcw,
  'skip-forward': SkipForward,
  settings: Settings,
  keyboard: Keyboard,
  view: Eye,
}

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
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(currentSettings)

  // Sync localSettings when currentSettings prop changes from outside
  useEffect(() => {
    setLocalSettings(currentSettings)
  }, [currentSettings])

  const handleSaveSettings = useCallback(() => {
    onUpdateSettings(localSettings)
    setIsSettingsDialogOpen(false)
  }, [localSettings, onUpdateSettings, setIsSettingsDialogOpen])

  const handleResetToDefaults = useCallback(() => {
    setLocalSettings(DEFAULT_POMODORO_SETTINGS)
    // User must explicitly save if they want to persist defaults
  }, [setLocalSettings])

  const handleSettingChange = useCallback((field: keyof PomodoroSettings, value: string) => {
    const numValue = parseInt(value, 10)
    const fieldStr = field as string
    if (!isNaN(numValue)) {
      if (fieldStr.includes('Duration')) {
        setLocalSettings((prev: PomodoroSettings) => ({ ...prev, [field]: numValue * 60 }))
      } else if (field === 'sessionsUntilLongBreak') {
        setLocalSettings((prev: PomodoroSettings) => ({ ...prev, [field]: Math.max(1, numValue) }))
      }
    }
  }, [])

  // Helper to render icon
  const renderIcon = (iconName?: string | React.ReactNode) => {
    if (!iconName) return null
    if (typeof iconName === 'string' && iconMap[iconName]) {
      const IconComponent = iconMap[iconName]
      return <IconComponent className="mr-2 h-4 w-4" />
    }
    return <p className="mr-2">{iconName}</p> // For ReactNode icons
  }

  // Group commands by category for display in CommandDialog
  const groupedCommands = useMemo(() => {
    const groups: { category: CommandCategory; commands: CommandWithShortcut[] }[] = []
    commands.forEach(command => {
      if (command.hidden) return
      let group = groups.find(g => g.category === command.category)
      if (!group) {
        group = { category: command.category, commands: [] }
        groups.push(group)
      }
      group.commands.push(command)
    })
    // Ensure a consistent order for categories if desired
    const categoryOrder: CommandCategory[] = ['timer', 'mode', 'view', 'settings', 'help']
    return groups.sort(
      (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
    )
  }, [commands])

  return (
    <>
      <CommandDialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No commands found.</CommandEmpty>
          {groupedCommands.map(group => (
            <CommandGroup
              key={group.category}
              heading={group.category.charAt(0).toUpperCase() + group.category.slice(1)}
            >
              {group.commands.map(cmd => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => {
                    cmd.action()
                    // Close palette unless command is for opening settings or help itself
                    if (
                      cmd.id !== PomodoroCommandType.OpenSettings &&
                      cmd.id !== PomodoroCommandType.ToggleHelp
                    ) {
                      setIsCommandPaletteOpen(false)
                    }
                  }}
                  disabled={cmd.disabled}
                >
                  {renderIcon(cmd.icon)}
                  <p>{cmd.label}</p>
                  {cmd.displayShortcut && <CommandShortcut>{cmd.displayShortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>

      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Timer Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {(Object.keys(DEFAULT_POMODORO_SETTINGS) as Array<keyof PomodoroSettings>).map(
              key_unsafe => {
                const key = key_unsafe as string
                if (key.includes('Duration')) {
                  const durationKey = key_unsafe as
                    | 'focusDuration'
                    | 'shortBreakDuration'
                    | 'longBreakDuration'
                  return (
                    <div className="grid grid-cols-3 items-center gap-4" key={key}>
                      <Label htmlFor={key} className="col-span-1 whitespace-nowrap">
                        {key
                          .replace('Duration', ' Duration')
                          .replace(/([A-Z])/g, ' $1')
                          .trim()}
                      </Label>
                      <Input
                        id={key}
                        type="number"
                        value={localSettings[durationKey] / 60} // Display in minutes
                        onChange={e => handleSettingChange(durationKey, e.target.value)}
                        min={1}
                        className="col-span-2"
                      />
                    </div>
                  )
                } else if (key === 'sessionsUntilLongBreak') {
                  return (
                    <div className="grid grid-cols-3 items-center gap-4" key={key}>
                      <Label htmlFor={key} className="col-span-1">
                        Sessions / Long Break
                      </Label>
                      <Input
                        id={key}
                        type="number"
                        value={localSettings[key_unsafe as 'sessionsUntilLongBreak']}
                        onChange={e =>
                          handleSettingChange(
                            key_unsafe as 'sessionsUntilLongBreak',
                            e.target.value
                          )
                        }
                        min={1}
                        max={12}
                        className="col-span-2"
                      />
                    </div>
                  )
                } else if (key === 'autoStartBreaks' || key === 'autoStartFocus') {
                  // Simple toggle for booleans, can be improved with Switch component
                  const booleanKey = key_unsafe as 'autoStartBreaks' | 'autoStartFocus'
                  return (
                    <div className="flex items-center justify-between space-x-2 py-2" key={key}>
                      <Label htmlFor={key} className="flex flex-col space-y-1">
                        <p>{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      </Label>
                      <Checkbox
                        id={key}
                        checked={!!localSettings[booleanKey]}
                        onCheckedChange={checked =>
                          setLocalSettings((prev: PomodoroSettings) => ({
                            ...prev,
                            [booleanKey]: checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-primary text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  )
                }
                return null
              }
            )}
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleResetToDefaults}>
              Reset to Defaults
            </Button>
            <Button type="button" onClick={handleSaveSettings}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
