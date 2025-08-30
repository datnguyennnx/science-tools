import { CharState, CharStatus, CharacterStateManager } from '../hooks/types'

/**
 * Utility class for managing character states in typing tests
 * Handles character updates, backspace, and initialization
 */
export class CharacterStateManagerImpl implements CharacterStateManager {
  /**
   * Initialize character states from text
   */
  initializeCharacters(text: string): CharState[] {
    const states = text.split('').map(char => ({
      char,
      status: 'untyped' as CharStatus,
    }))

    // Set the first character as current
    if (states.length > 0) {
      states[0].status = 'current'
    }

    return states
  }

  /**
   * Update a character at the given index
   */
  updateCharacter(index: number, typedChar: string, expectedChar: string): boolean {
    return typedChar === expectedChar
  }

  /**
   * Handle backspace operation
   */
  handleBackspace(currentIndex: number): boolean {
    return currentIndex > 0
  }

  /**
   * Create new character states array with updated character
   */
  static createUpdatedStates(
    currentStates: CharState[],
    index: number,
    typedChar: string,
    expectedChar: string,
    nextIndex?: number
  ): CharState[] {
    const newStates = [...currentStates]
    const isCorrect = typedChar === expectedChar

    // Update current character
    newStates[index] = {
      ...newStates[index],
      status: isCorrect ? 'correct' : 'incorrect',
      typedValue: typedChar,
    }

    // Set next character as current if provided
    if (nextIndex !== undefined && nextIndex < newStates.length) {
      newStates[nextIndex] = {
        ...newStates[nextIndex],
        status: 'current',
      }
    }

    return newStates
  }

  /**
   * Create new character states array for backspace
   */
  static createBackspaceStates(currentStates: CharState[], currentIndex: number): CharState[] {
    const newStates = [...currentStates]

    // Clear current character
    newStates[currentIndex] = {
      ...newStates[currentIndex],
      status: 'untyped',
      typedValue: undefined,
    }

    // Set previous character as current
    if (currentIndex > 0) {
      newStates[currentIndex - 1] = {
        ...newStates[currentIndex - 1],
        status: 'current',
      }
    }

    return newStates
  }
}
