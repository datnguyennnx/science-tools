'use client'

import { useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { PomodoroSettings } from '../../engine/core/types'
import { DEFAULT_POMODORO_SETTINGS } from '../../engine/core/settings'

interface SettingsDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  currentSettings: PomodoroSettings
  onUpdateSettings: (newSettings: Partial<PomodoroSettings>) => void
}

export function SettingsDialog({
  isOpen,
  onOpenChange,
  currentSettings,
  onUpdateSettings,
}: SettingsDialogProps) {
  const localSettings = useRef<PomodoroSettings>(currentSettings)

  // Sync localSettings when currentSettings prop changes from outside
  useEffect(() => {
    localSettings.current = currentSettings
  }, [currentSettings])

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings.current)
    onOpenChange(false)
  }

  const handleResetToDefaults = () => {
    localSettings.current = DEFAULT_POMODORO_SETTINGS
    // User must explicitly save if they want to persist defaults
  }

  const handleSettingChange = (field: keyof PomodoroSettings, value: string) => {
    const numValue = parseInt(value, 10)
    const fieldStr = field as string
    if (!isNaN(numValue)) {
      if (fieldStr.includes('Duration')) {
        localSettings.current = { ...localSettings.current, [field]: numValue * 60 }
      } else if (field === 'sessionsUntilLongBreak') {
        localSettings.current = { ...localSettings.current, [field]: Math.max(1, numValue) }
      }
    }
  }

  const handleBooleanSettingChange = (field: keyof PomodoroSettings, checked: boolean) => {
    const booleanKey = field as 'autoStartBreaks' | 'autoStartFocus'
    localSettings.current = { ...localSettings.current, [booleanKey]: checked }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                      value={localSettings.current[durationKey] / 60} // Display in minutes
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
                      value={localSettings.current[key_unsafe as 'sessionsUntilLongBreak']}
                      onChange={e =>
                        handleSettingChange(key_unsafe as 'sessionsUntilLongBreak', e.target.value)
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
                      checked={!!localSettings.current[booleanKey]}
                      onCheckedChange={checked => handleBooleanSettingChange(booleanKey, !!checked)}
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
  )
}
