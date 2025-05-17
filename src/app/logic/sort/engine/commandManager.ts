import type { Command, KeyBinding, CommandCategory } from './commands'
import { SortCommandType } from './commands'

export interface CommandManagerRegistry {
  readonly commands: ReadonlyMap<SortCommandType, Command>
  readonly keyBindings: ReadonlyMap<string, KeyBinding>
}

export const createEmptyRegistry = (): CommandManagerRegistry => ({
  commands: new Map<SortCommandType, Command>(),
  keyBindings: new Map<string, KeyBinding>(),
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
  commandId: SortCommandType
): CommandManagerRegistry => {
  const newCommands = new Map(registry.commands)
  newCommands.delete(commandId)
  return { ...registry, commands: newCommands }
}

export const getCommand = (
  registry: CommandManagerRegistry,
  commandId: SortCommandType
): Command | undefined => {
  return registry.commands.get(commandId)
}

export const getAllCommands = (
  registry: CommandManagerRegistry,
  category?: CommandCategory
): Command[] => {
  const commands = Array.from(registry.commands.values())
  if (category) {
    return commands.filter(cmd => cmd.category === category)
  }
  return commands
}

const generateKeyBindingKey = (
  event: Pick<KeyBinding, 'code' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>
): string => {
  let key = ''
  if (event.metaKey) key += 'Meta+'
  if (event.ctrlKey) key += 'Control+'
  if (event.altKey) key += 'Alt+'
  if (event.shiftKey) key += 'Shift+'
  key += event.code
  return key
}

export const registerKeyBinding = (
  registry: CommandManagerRegistry,
  keyBinding: KeyBinding
): CommandManagerRegistry => {
  const key = generateKeyBindingKey(keyBinding)
  const newKeyBindings = new Map(registry.keyBindings)
  newKeyBindings.set(key, keyBinding)
  return { ...registry, keyBindings: newKeyBindings }
}

export const unregisterKeyBinding = (
  registry: CommandManagerRegistry,
  keyBinding: Pick<KeyBinding, 'code' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>
): CommandManagerRegistry => {
  const key = generateKeyBindingKey(keyBinding)
  const newKeyBindings = new Map(registry.keyBindings)
  newKeyBindings.delete(key)
  return { ...registry, keyBindings: newKeyBindings }
}

export const findKeyBinding = (
  registry: CommandManagerRegistry,
  event: Pick<KeyboardEvent, 'code' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>
): KeyBinding | undefined => {
  const key = generateKeyBindingKey(event)
  return registry.keyBindings.get(key)
}

export const getShortcutForCommand = (
  registry: CommandManagerRegistry,
  commandId: SortCommandType
): string | undefined => {
  for (const [key, binding] of registry.keyBindings) {
    if (binding.commandId === commandId) {
      return key
        .replace('Control', 'Ctrl')
        .replace(/\+/g, ' + ')
        .replace('Key', '')
        .replace('Digit', '')
    }
  }
  return undefined
}
