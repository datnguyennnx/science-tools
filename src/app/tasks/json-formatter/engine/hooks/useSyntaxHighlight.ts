import React from 'react'
import { useTheme } from 'next-themes'

export interface JsonToken {
  type: 'string' | 'number' | 'boolean' | 'null' | 'key' | 'punctuation' | 'whitespace'
  value: string
  start: number
  end: number
  line: number
  column: number
}

export interface HighlightTheme {
  string: string
  number: string
  boolean: string
  null: string
  key: string
  punctuation: string
  error: string
  lineNumber: string
  background: string
}

// Static theme definitions moved outside the hook
const THEMES: Record<string, HighlightTheme> = {
  light: {
    string: '#22863a', // Green for strings
    number: '#005cc5', // Blue for numbers
    boolean: '#6f42c1', // Purple for booleans
    null: '#d73a49', // Red for null
    key: '#d15704', // Orange for keys
    punctuation: '#24292e', // Dark for punctuation
    error: '#d73a49', // Red for errors
    lineNumber: '#6a737d', // Gray for line numbers
    background: '#ffffff', // White background
  },
  dark: {
    string: '#7ee787', // Light green for strings
    number: '#79c0ff', // Light blue for numbers
    boolean: '#d2a8ff', // Light purple for booleans
    null: '#ff7b72', // Light red for null
    key: '#ffa657', // Light orange for keys
    punctuation: '#c9d1d9', // Light gray for punctuation
    error: '#ff7b72', // Light red for errors
    lineNumber: '#8b949e', // Medium gray for line numbers
    background: '#0d1117', // Dark background
  },
}

export const useSyntaxHighlight = () => {
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme

  // Get current theme colors (no need for useMemo since it's just a lookup)
  const currentThemeColors = THEMES[currentTheme || 'light'] || THEMES.light

  // Tokenize JSON string into tokens
  const tokenizeJson = (input: string): JsonToken[] => {
    const tokens: JsonToken[] = []
    let currentIndex = 0
    let currentLine = 1
    let currentColumn = 1

    const addToken = (type: JsonToken['type'], value: string, start: number, end: number) => {
      tokens.push({
        type,
        value,
        start,
        end,
        line: currentLine,
        column: currentColumn,
      })
    }

    const updatePosition = (char: string) => {
      if (char === '\n') {
        currentLine++
        currentColumn = 1
      } else {
        currentColumn++
      }
      currentIndex++
    }

    while (currentIndex < input.length) {
      const char = input[currentIndex]
      const start = currentIndex

      if (char === '"') {
        // String token
        let value = char
        updatePosition(char)

        while (currentIndex < input.length && input[currentIndex] !== '"') {
          if (input[currentIndex] === '\\' && currentIndex + 1 < input.length) {
            value += input[currentIndex] + input[currentIndex + 1]
            updatePosition(input[currentIndex])
            updatePosition(input[currentIndex])
          } else {
            value += input[currentIndex]
            updatePosition(input[currentIndex])
          }
        }

        if (currentIndex < input.length) {
          value += input[currentIndex]
          updatePosition(input[currentIndex])
        }

        addToken('string', value, start, currentIndex)
      } else if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
        // Whitespace token
        let value = char
        updatePosition(char)

        while (
          currentIndex < input.length &&
          (input[currentIndex] === ' ' ||
            input[currentIndex] === '\t' ||
            input[currentIndex] === '\n' ||
            input[currentIndex] === '\r')
        ) {
          value += input[currentIndex]
          updatePosition(input[currentIndex])
        }

        addToken('whitespace', value, start, currentIndex - 1)
      } else if (
        char === '{' ||
        char === '}' ||
        char === '[' ||
        char === ']' ||
        char === ':' ||
        char === ',' ||
        char === '"' ||
        char === "'"
      ) {
        // Punctuation token
        addToken('punctuation', char, start, currentIndex)
        updatePosition(char)
      } else if (char === 't' && input.substring(currentIndex, currentIndex + 4) === 'true') {
        // Boolean true
        addToken('boolean', 'true', start, currentIndex + 3)
        currentIndex += 4
        currentColumn += 4
      } else if (char === 'f' && input.substring(currentIndex, currentIndex + 5) === 'false') {
        // Boolean false
        addToken('boolean', 'false', start, currentIndex + 4)
        currentIndex += 5
        currentColumn += 5
      } else if (char === 'n' && input.substring(currentIndex, currentIndex + 4) === 'null') {
        // Null value
        addToken('null', 'null', start, currentIndex + 3)
        currentIndex += 4
        currentColumn += 4
      } else if (char === '-' || (char >= '0' && char <= '9')) {
        // Number token
        let value = char
        updatePosition(char)

        while (
          currentIndex < input.length &&
          ((input[currentIndex] >= '0' && input[currentIndex] <= '9') ||
            input[currentIndex] === '.' ||
            input[currentIndex] === 'e' ||
            input[currentIndex] === 'E' ||
            input[currentIndex] === '+' ||
            input[currentIndex] === '-')
        ) {
          value += input[currentIndex]
          updatePosition(input[currentIndex])
        }

        addToken('number', value, start, currentIndex - 1)
      } else {
        // Unknown character - treat as punctuation
        addToken('punctuation', char, start, currentIndex)
        updatePosition(char)
      }
    }

    return tokens
  }

  // Get CSS styles for a token type (pure function, no need for useCallback)
  const getTokenStyles = (tokenType: JsonToken['type']): React.CSSProperties => {
    const colors = currentThemeColors

    switch (tokenType) {
      case 'string':
        return { color: colors.string, fontWeight: '500' }
      case 'number':
        return { color: colors.number, fontWeight: '500' }
      case 'boolean':
        return { color: colors.boolean, fontWeight: '600' }
      case 'null':
        return { color: colors.null, fontWeight: '600' }
      case 'key':
        return { color: colors.key, fontWeight: '600' }
      case 'punctuation':
        return { color: colors.punctuation, fontWeight: '400' }
      case 'whitespace':
        return { color: 'transparent' }
      default:
        return { color: colors.punctuation }
    }
  }

  // Highlight a specific line with error
  const getErrorLineStyles = (lineNumber: number, currentLine: number): React.CSSProperties => {
    if (lineNumber === currentLine) {
      return {
        backgroundColor: currentThemeColors.error + '20',
        borderLeft: `3px solid ${currentThemeColors.error}`,
        paddingLeft: '8px',
      }
    }
    return {}
  }

  // Get line number styles
  const getLineNumberStyles = (): React.CSSProperties => {
    return {
      color: currentThemeColors.lineNumber,
      backgroundColor: currentThemeColors.background,
      borderRight: `1px solid ${currentThemeColors.punctuation}30`,
      paddingRight: '12px',
      textAlign: 'right',
      userSelect: 'none',
      fontFamily: 'monospace',
      fontSize: '12px',
      lineHeight: '24px',
      height: '24px',
    }
  }

  return {
    tokenizeJson,
    getTokenStyles,
    getErrorLineStyles,
    getLineNumberStyles,
    currentThemeColors,
    themes: THEMES,
  }
}
