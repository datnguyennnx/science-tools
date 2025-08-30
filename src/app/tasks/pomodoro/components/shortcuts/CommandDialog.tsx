'use client'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { Timer, SkipForward, RotateCcw, Settings, Keyboard, Eye, LucideIcon } from 'lucide-react'
import {
  CommandWithShortcut,
  PomodoroCommandType,
  CommandCategory,
} from '../../engine/core/commands'
import { ReactNode } from 'react'

// Map icon strings to Lucide components
const iconMap: Record<string, LucideIcon> = {
  timer: Timer,
  'rotate-ccw': RotateCcw,
  'skip-forward': SkipForward,
  settings: Settings,
  keyboard: Keyboard,
  view: Eye,
}

interface PomodoroCommandDialogProps {
  commands: CommandWithShortcut[]
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

// Helper to render icon
const renderIcon = (iconName?: string | ReactNode) => {
  if (!iconName) return null
  if (typeof iconName === 'string' && iconMap[iconName]) {
    const IconComponent = iconMap[iconName]
    return <IconComponent className="mr-2 h-4 w-4" />
  }
  return <p className="mr-2">{iconName}</p> // For ReactNode icons
}

// Group commands by category for display in CommandDialog
const getGroupedCommands = (commands: CommandWithShortcut[]) => {
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
}

export function PomodoroCommandDialog({
  commands,
  isOpen,
  onOpenChange,
}: PomodoroCommandDialogProps) {
  const groupedCommands = getGroupedCommands(commands)

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
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
                    onOpenChange(false)
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
  )
}
