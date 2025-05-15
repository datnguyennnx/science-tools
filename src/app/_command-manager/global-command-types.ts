import { CommandCategory } from './types'

// Enum for global command identifiers for type safety
export enum GlobalCommandId {
  ShowFlashMessage = 'SHOW_FLASH_MESSAGE',
  // Add other global command IDs here
}

// Define specific categories for global commands if needed, or use generic ones
export type GlobalCommandCategory = CommandCategory | 'global' | 'ui'

// You can also extend the base Command and KeyBinding interfaces if global commands
// have specific additional properties, but for now, we'll use the base types.
