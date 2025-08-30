// Character status types
export type CharStatus = 'untyped' | 'correct' | 'incorrect' | 'current'

// Character state interface
export interface CharState {
  char: string
  status: CharStatus
  typedValue?: string
}

// Test status types
export type TestStatus = 'pending' | 'typing' | 'finished'

// Interval data for metrics tracking
export interface IntervalData {
  intervalEndTime: number
  correctCharsInInterval: number
  errorsInInterval: number
}

// Performance metrics interface
export interface PerformanceMetrics {
  wpm: number
  cpm: number
  accuracy: number
  errorCount: number
  totalChars: number
  correctChars: number
}

// Keyboard event handler interface
export interface KeyboardHandler {
  handleKeyPress: (event: KeyboardEvent) => void
}

// Character state manager interface
export interface CharacterStateManager {
  updateCharacter: (index: number, char: string, expectedChar: string) => boolean
  handleBackspace: (currentIndex: number) => boolean
  initializeCharacters: (text: string) => CharState[]
}
