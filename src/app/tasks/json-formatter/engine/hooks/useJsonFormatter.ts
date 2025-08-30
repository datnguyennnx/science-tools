export interface FormatOptions {
  indentSize: number
  compact: boolean
  sortKeys: boolean
  removeComments: boolean
  autoFixCommas?: boolean
  removeTrailingCommas?: boolean
}

export interface FormatResult {
  formatted: string
  isValid: boolean
  error?: string
  errorPosition?: { line: number; column: number }
}

export interface JsonStatistics {
  lineCount: number
  characterCount: number
  depth: number
  keyCount: number
  arrayCount: number
  objectCount: number
  estimatedSizeKB: number
}

export interface ProcessedJson {
  content: string
  statistics: JsonStatistics
  errors: Array<{
    line: number
    column: number
    message: string
    type: 'syntax' | 'semantic'
  }>
  isValid: boolean
}

// Pure functions for JSON processing
const removeComments = (input: string): string => {
  return input
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
    .trim()
}

// New: Fix trailing commas in JSON
const fixTrailingCommas = (input: string): string => {
  const lines = input.split('\n')
  const fixedLines = lines.map(line => {
    const trimmed = line.trim()

    // Skip lines that are just whitespace or contain strings
    if (!trimmed || trimmed.startsWith('"') || trimmed.startsWith("'")) {
      return line
    }

    // Remove trailing commas that are not inside strings
    if (trimmed.endsWith(',')) {
      // Check if this comma is actually trailing (not inside a string)
      let inString = false
      let escapeNext = false
      let commaIndex = -1

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (escapeNext) {
          escapeNext = false
          continue
        }

        if (char === '\\') {
          escapeNext = true
          continue
        }

        if (char === '"' || char === "'") {
          inString = !inString
          continue
        }

        if (char === ',' && !inString) {
          commaIndex = i
        }
      }

      // If the comma is truly trailing (at the end of meaningful content)
      if (commaIndex !== -1 && commaIndex === line.lastIndexOf(',')) {
        const afterComma = line.substring(commaIndex + 1).trim()

        // Only remove if there's nothing meaningful after the comma
        if (!afterComma || afterComma === '}' || afterComma === ']') {
          return line.substring(0, commaIndex) + line.substring(commaIndex + 1)
        }
      }
    }

    return line
  })

  return fixedLines.join('\n')
}

// New: Smart comma insertion
const insertMissingCommas = (input: string): string => {
  const lines = input.split('\n')
  const fixedLines = lines.map((line, index) => {
    const trimmed = line.trim()

    // Skip empty lines or lines that already end with comma
    if (!trimmed || trimmed.endsWith(',') || trimmed.endsWith('{') || trimmed.endsWith('[')) {
      return line
    }

    // Check if next line starts with a new object/array or if this line should have a comma
    if (index < lines.length - 1) {
      const nextLine = lines[index + 1].trim()

      // If next line starts with a new property/array item, this line needs a comma
      if (
        nextLine &&
        !nextLine.startsWith('}') &&
        !nextLine.startsWith(']') &&
        !nextLine.startsWith('{') &&
        !nextLine.startsWith('[') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(']')
      ) {
        return line + ','
      }
    }

    return line
  })

  return fixedLines.join('\n')
}

// New: Comprehensive JSON cleanup
const cleanupJson = (input: string, options: FormatOptions): string => {
  let cleaned = input

  if (options.removeTrailingCommas) {
    cleaned = fixTrailingCommas(cleaned)
  }

  if (options.autoFixCommas) {
    cleaned = insertMissingCommas(cleaned)
  }

  return cleaned
}

const sortObjectKeys = (obj: unknown): unknown => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  }

  const sortedObj: Record<string, unknown> = {}
  Object.keys(obj as Record<string, unknown>)
    .sort()
    .forEach(key => {
      sortedObj[key] = sortObjectKeys((obj as Record<string, unknown>)[key])
    })

  return sortedObj
}

const calculateStatistics = (input: string): JsonStatistics => {
  const lines = input.split('\n')
  const characterCount = input.length

  let maxDepth = 0
  let keyCount = 0
  let arrayCount = 0
  let objectCount = 0

  try {
    const parsed = JSON.parse(input)

    const analyzeNode = (node: unknown, currentDepth: number): void => {
      maxDepth = Math.max(maxDepth, currentDepth)

      if (Array.isArray(node)) {
        arrayCount++
        node.forEach(item => analyzeNode(item, currentDepth + 1))
      } else if (node !== null && typeof node === 'object') {
        objectCount++
        Object.keys(node).forEach(key => {
          keyCount++
          analyzeNode((node as Record<string, unknown>)[key], currentDepth + 1)
        })
      }
    }

    analyzeNode(parsed, 0)
  } catch {
    // If parsing fails, we can't analyze structure
  }

  return {
    lineCount: lines.length,
    characterCount,
    depth: maxDepth,
    keyCount,
    arrayCount,
    objectCount,
    estimatedSizeKB: characterCount / 1024,
  }
}

const findErrorPosition = (
  input: string,
  error: Error
): { line: number; column: number } | undefined => {
  if (error instanceof SyntaxError) {
    const match = error.message.match(/position (\d+)/)
    if (match) {
      const position = parseInt(match[1])
      const lines = input.split('\n')
      let currentPos = 0
      let line = 1
      let column = 1

      for (const lineText of lines) {
        if (currentPos + lineText.length + 1 > position) {
          column = position - currentPos + 1
          break
        }
        currentPos += lineText.length + 1
        line++
      }

      return { line, column }
    }
  }
  return undefined
}

// Main processing function
const processJson = (input: string, options: FormatOptions): ProcessedJson => {
  try {
    // Clean up JSON first
    const cleanedInput = cleanupJson(
      options.removeComments ? removeComments(input) : input.trim(),
      options
    )

    if (!cleanedInput) {
      return {
        content: '',
        statistics: calculateStatistics(''),
        errors: [{ line: 1, column: 1, message: 'Input is empty', type: 'semantic' }],
        isValid: false,
      }
    }

    // Parse JSON to validate and get object
    const parsed = JSON.parse(cleanedInput)

    // Sort keys if requested
    const processed = options.sortKeys ? sortObjectKeys(parsed) : parsed

    // Format based on options
    let formatted: string
    if (options.compact) {
      formatted = JSON.stringify(processed)
    } else {
      const indent = ' '.repeat(options.indentSize)
      formatted = JSON.stringify(processed, null, indent)
    }

    // Calculate statistics
    const statistics = calculateStatistics(cleanedInput)

    return {
      content: formatted,
      statistics,
      errors: [],
      isValid: true,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorPosition = findErrorPosition(input, error as Error)

    return {
      content: input,
      statistics: calculateStatistics(input),
      errors: errorPosition
        ? [
            {
              line: errorPosition.line,
              column: errorPosition.column,
              message: errorMessage,
              type: 'syntax',
            },
          ]
        : [],
      isValid: false,
    }
  }
}

// Pure functions moved outside the hook for better performance
const formatJsonResult = (input: string, options: FormatOptions): FormatResult => {
  const result = processJson(input, options)

  return {
    formatted: result.content,
    isValid: result.isValid,
    error: result.errors[0]?.message,
    errorPosition: result.errors[0]
      ? {
          line: result.errors[0].line,
          column: result.errors[0].column,
        }
      : undefined,
  }
}

const getJsonSizeInfo = (input: string): { bytes: number; kilobytes: number } => {
  const bytes = new Blob([input]).size
  const kilobytes = bytes / 1024
  return { bytes, kilobytes }
}

const validateJsonInput = (input: string): boolean => {
  try {
    JSON.parse(input.trim())
    return true
  } catch {
    return false
  }
}

const analyzeJsonInput = (input: string, options: FormatOptions): ProcessedJson => {
  return processJson(input, options)
}

export const useJsonFormatter = () => {
  return {
    formatJson: formatJsonResult,
    getJsonSize: getJsonSizeInfo,
    validateJson: validateJsonInput,
    analyzeJson: analyzeJsonInput,
    processJsonWithOptions: processJson,
  }
}
