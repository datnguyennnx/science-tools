import { Command, KeyBinding, PomodoroCommandType, CommandCategory } from '../core/commands'

export interface CommandManagerRegistry {
  readonly commands: ReadonlyMap<PomodoroCommandType, Command>
  readonly keyBindings: ReadonlyMap<string, KeyBinding> // Key is string like 'Shift+KeyV' or 'Space'
}

export const createEmptyRegistry = (): CommandManagerRegistry => ({
  commands: new Map(),
  keyBindings: new Map(),
})

export const registerCommand = (
  registry: CommandManagerRegistry,
  command: Command
): CommandManagerRegistry => {
  const newCommands = new Map(registry.commands)
  newCommands.set(command.id, command)
  return { ...registry, commands: newCommands }
}

export const unregisterCommand = (
  registry: CommandManagerRegistry,
  commandId: PomodoroCommandType
): CommandManagerRegistry => {
  const newCommands = new Map(registry.commands)
  newCommands.delete(commandId)
  return { ...registry, commands: newCommands }
}

export const getCommand = (
  registry: CommandManagerRegistry,
  commandId: PomodoroCommandType
): Command | undefined => {
  return registry.commands.get(commandId)
}

export const getAllCommands = (
  registry: CommandManagerRegistry,
  category?: CommandCategory
): Command[] => {
  const all = Array.from(registry.commands.values())
  if (!category) return all
  return all.filter(cmd => cmd.category === category)
}

const generateKeyBindingKey = (
  event: Pick<KeyBinding, 'code' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>
): string => {
  const modifiers: string[] = []
  if (event.shiftKey) modifiers.push('Shift')
  if (event.ctrlKey) modifiers.push('Ctrl')
  if (event.altKey) modifiers.push('Alt')
  if (event.metaKey) modifiers.push('Meta')
  modifiers.push(event.code)
  return modifiers.join('+')
}

export const registerKeyBinding = (
  registry: CommandManagerRegistry,
  keyBinding: KeyBinding
): CommandManagerRegistry => {
  const bindingKey = generateKeyBindingKey(keyBinding)
  const newKeyBindings = new Map(registry.keyBindings)
  newKeyBindings.set(bindingKey, keyBinding)
  return { ...registry, keyBindings: newKeyBindings }
}

export const unregisterKeyBinding = (
  registry: CommandManagerRegistry,
  keyBinding: Pick<KeyBinding, 'code' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>
): CommandManagerRegistry => {
  const bindingKey = generateKeyBindingKey(keyBinding)
  const newKeyBindings = new Map(registry.keyBindings)
  newKeyBindings.delete(bindingKey)
  return { ...registry, keyBindings: newKeyBindings }
}

export const findKeyBinding = (
  registry: CommandManagerRegistry,
  event: Pick<KeyboardEvent, 'code' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>
): KeyBinding | undefined => {
  const bindingKey = generateKeyBindingKey(event)
  return registry.keyBindings.get(bindingKey)
}

// Helper to get display shortcut for a command (finds the first one)
export const getShortcutForCommand = (
  registry: CommandManagerRegistry,
  commandId: PomodoroCommandType
): string | undefined => {
  for (const binding of registry.keyBindings.values()) {
    if (binding.commandId === commandId) {
      // Reconstruct the display string from the binding.
      // This could be more sophisticated if KEY_DISPLAY_NAMES were reintroduced.
      const parts: string[] = []
      if (binding.shiftKey) parts.push('Shift')
      if (binding.ctrlKey) parts.push('Ctrl')
      if (binding.altKey) parts.push('Alt')
      if (binding.metaKey) parts.push('Meta')
      // A simple way to make KeyV -> V, etc. for common keys.
      const displayCode = binding.code.startsWith('Key') ? binding.code.substring(3) : binding.code
      parts.push(displayCode)
      return parts.join('+')
    }
  }
  return undefined
}
