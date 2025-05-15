import { Command, KeyBinding, CommandId, CommandCategory, CommandManagerRegistry } from './types'

/**
 * Creates an empty command manager registry.
 * @returns An new, empty registry.
 */
export const createEmptyRegistry = (): CommandManagerRegistry => ({
  commands: new Map<CommandId, Command>(),
  keyBindings: new Map<string, KeyBinding>(),
})

/**
 * Registers a new command in the registry.
 * @param registry The current command manager registry.
 * @param command The command to register.
 * @returns A new registry instance with the command added.
 */
export const registerCommand = (
  registry: CommandManagerRegistry,
  command: Command
): CommandManagerRegistry => {
  const newCommands = new Map(registry.commands)
  newCommands.set(command.id, command)
  return { ...registry, commands: newCommands }
}

/**
 * Unregisters a command from the registry.
 * @param registry The current command manager registry.
 * @param commandId The ID of the command to unregister.
 * @returns A new registry instance with the command removed.
 */
export const unregisterCommand = (
  registry: CommandManagerRegistry,
  commandId: CommandId
): CommandManagerRegistry => {
  const newCommands = new Map(registry.commands)
  newCommands.delete(commandId)
  return { ...registry, commands: newCommands }
}

/**
 * Retrieves a command from the registry by its ID.
 * @param registry The command manager registry.
 * @param commandId The ID of the command to retrieve.
 * @returns The command if found, otherwise undefined.
 */
export const getCommand = (
  registry: CommandManagerRegistry,
  commandId: CommandId
): Command | undefined => {
  return registry.commands.get(commandId)
}

/**
 * Retrieves all registered commands, optionally filtered by category.
 * @param registry The command manager registry.
 * @param category Optional category to filter commands by.
 * @returns An array of commands.
 */
export const getAllCommands = (
  registry: CommandManagerRegistry,
  category?: CommandCategory
): Command[] => {
  const all = Array.from(registry.commands.values())
  if (!category) return all
  return all.filter(cmd => cmd.category === category)
}

/**
 * Generates a unique string key for a key binding based on its modifiers and code.
 * This key is used for storing and retrieving key bindings in the registry map.
 * Example: "Shift+Ctrl+KeyA", "Space"
 * @param event An object containing key binding properties (code, shiftKey, ctrlKey, altKey, metaKey).
 * @returns A string representation of the key binding combination.
 */
const generateKeyBindingKey = (
  event: Pick<KeyBinding, 'code' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>
): string => {
  const modifiers: string[] = []
  if (event.shiftKey) modifiers.push('Shift')
  if (event.ctrlKey) modifiers.push('Ctrl')
  if (event.altKey) modifiers.push('Alt')
  if (event.metaKey) modifiers.push('Meta')
  // Ensure consistent casing for the code, e.g., "keya" -> "KeyA"
  const codeNormalized =
    event.code.length > 1
      ? event.code.charAt(0).toUpperCase() + event.code.slice(1).toLowerCase()
      : event.code.toUpperCase()
  modifiers.push(codeNormalized)
  return modifiers.join('+')
}

/**
 * Registers a new key binding in the registry.
 * @param registry The current command manager registry.
 * @param keyBinding The key binding to register.
 * @returns A new registry instance with the key binding added.
 */
export const registerKeyBinding = (
  registry: CommandManagerRegistry,
  keyBinding: KeyBinding
): CommandManagerRegistry => {
  const bindingKey = generateKeyBindingKey(keyBinding)
  const newKeyBindings = new Map(registry.keyBindings)
  newKeyBindings.set(bindingKey, keyBinding)
  return { ...registry, keyBindings: newKeyBindings }
}

/**
 * Unregisters a key binding from the registry.
 * @param registry The current command manager registry.
 * @param keyBinding A pick of KeyBinding properties to identify the binding to unregister.
 * @returns A new registry instance with the key binding removed.
 */
export const unregisterKeyBinding = (
  registry: CommandManagerRegistry,
  keyBinding: Pick<KeyBinding, 'code' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>
): CommandManagerRegistry => {
  const bindingKey = generateKeyBindingKey(keyBinding)
  const newKeyBindings = new Map(registry.keyBindings)
  newKeyBindings.delete(bindingKey)
  return { ...registry, keyBindings: newKeyBindings }
}

/**
 * Finds a key binding in the registry that matches the given keyboard event properties.
 * @param registry The command manager registry.
 * @param event A pick of KeyboardEvent properties (code, shiftKey, ctrlKey, altKey, metaKey).
 * @param context Optional context to pass to the KeyBinding's `isActive` function.
 * @returns The matching key binding if found and active, otherwise undefined.
 */
export const findKeyBinding = (
  registry: CommandManagerRegistry,
  event: Pick<KeyboardEvent, 'code' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>,
  context?: unknown
): KeyBinding | undefined => {
  const bindingKey = generateKeyBindingKey(event)
  const binding = registry.keyBindings.get(bindingKey)

  if (binding && binding.isActive) {
    return binding.isActive(context) ? binding : undefined
  }
  return binding
}

/**
 * Gets a displayable shortcut string for a given command ID.
 * It finds the first key binding associated with the command ID and formats it.
 * @param registry The command manager registry.
 * @param commandId The ID of the command for which to find a shortcut.
 * @returns A string like "Shift+Ctrl+A" or "Space", or undefined if no shortcut is found.
 */
export const getShortcutForCommand = (
  registry: CommandManagerRegistry,
  commandId: CommandId
): string | undefined => {
  for (const binding of registry.keyBindings.values()) {
    if (binding.commandId === commandId) {
      const parts: string[] = []
      if (binding.metaKey) parts.push('Meta') // Order Meta first for macOS (Cmd)
      if (binding.ctrlKey) parts.push('Ctrl')
      if (binding.altKey) parts.push('Alt')
      if (binding.shiftKey) parts.push('Shift')

      // Pretty print for key codes
      let displayCode = binding.code
      if (displayCode.startsWith('Key')) {
        displayCode = displayCode.substring(3)
      } else if (displayCode.startsWith('Digit')) {
        displayCode = displayCode.substring(5)
      } else if (displayCode === 'Space') {
        displayCode = 'Space' // Or use a symbol like ␣
      } else if (displayCode === 'Slash' && binding.shiftKey) {
        // This is a common case for '/?' key, if Shift is pressed, it often means '?'
        displayCode = '?'
      } else if (displayCode === 'Backslash') {
        displayCode = '\\'
      } // Add more common key normalizations as needed

      parts.push(displayCode.toUpperCase())
      return parts.join('+')
    }
  }
  return undefined
}
