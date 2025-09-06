export interface ValidationError {
  message: string
  line: number
  column: number
  type: 'syntax' | 'semantic' | 'structure' | 'formatting'
  suggestion?: string
  severity: 'error' | 'warning' | 'info'
  fixable: boolean
  autoFix?: () => string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: string[]
  statistics: {
    lineCount: number
    characterCount: number
    depth: number
    keyCount: number
    arrayCount: number
    objectCount: number
  }
}

// Pure function to detect multiple JSON issues
const detectMultipleIssues = (input: string): ValidationError[] => {
  const issues: ValidationError[] = []
  const lines = input.split('\n')

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1
    const trimmed = line.trim()

    if (!trimmed) return

    // Check for trailing commas
    if (trimmed.endsWith(',')) {
      const nextLine = lines[lineIndex + 1]?.trim()
      if (!nextLine || nextLine.startsWith('}') || nextLine.startsWith(']')) {
        issues.push({
          message: 'Trailing comma detected',
          line: lineNumber,
          column: line.length,
          type: 'formatting',
          suggestion: 'Remove trailing comma',
          severity: 'warning',
          fixable: true,
          autoFix: () => line.substring(0, line.lastIndexOf(',')),
        })
      }
    }

    // Check for missing commas
    if (lineIndex < lines.length - 1) {
      const nextLine = lines[lineIndex + 1]?.trim()
      if (
        nextLine &&
        !nextLine.startsWith('}') &&
        !nextLine.startsWith(']') &&
        !nextLine.startsWith('{') &&
        !nextLine.startsWith('[') &&
        !trimmed.endsWith(',') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('[') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(']')
      ) {
        issues.push({
          message: 'Missing comma',
          line: lineNumber,
          column: line.length,
          type: 'syntax',
          suggestion: 'Add comma after this line',
          severity: 'error',
          fixable: true,
          autoFix: () => line + ',',
        })
      }
    }

    // Check for mixed quotes
    if (trimmed.includes('"') && trimmed.includes("'")) {
      issues.push({
        message: 'Mixed quote types detected',
        line: lineNumber,
        column: 1,
        type: 'formatting',
        suggestion: 'Use consistent quote types (preferably double quotes)',
        severity: 'warning',
        fixable: false,
      })
    }

    // Check for unescaped quotes in strings
    let inString = false
    let escapeNext = false
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
        if (!inString) {
          inString = true
        } else {
          inString = false
        }
        continue
      }
    }

    if (inString) {
      issues.push({
        message: 'Unclosed string',
        line: lineNumber,
        column: line.length,
        type: 'syntax',
        suggestion: 'Close the string with matching quote',
        severity: 'error',
        fixable: false,
      })
    }
  })

  return issues
}

// Pure function to analyze JSON structure with detailed error detection
const analyzeJsonStructure = (
  input: string
): {
  structure: ValidationResult['statistics']
  issues: ValidationError[]
} => {
  const issues: ValidationError[] = []
  const structure: ValidationResult['statistics'] = {
    lineCount: input.split('\n').length,
    characterCount: input.length,
    depth: 0,
    keyCount: 0,
    arrayCount: 0,
    objectCount: 0,
  }

  try {
    const parsed = JSON.parse(input)

    const analyzeNode = (node: unknown, currentDepth: number, path: string[]): void => {
      structure.depth = Math.max(structure.depth, currentDepth)

      if (Array.isArray(node)) {
        structure.arrayCount++
        node.forEach((item, index) => analyzeNode(item, currentDepth + 1, [...path, `[${index}]`]))
      } else if (node !== null && typeof node === 'object') {
        structure.objectCount++
        Object.keys(node).forEach(key => {
          structure.keyCount++
          analyzeNode((node as Record<string, unknown>)[key], currentDepth + 1, [...path, key])
        })
      }
    }

    analyzeNode(parsed, 0, [])
  } catch {
    // Structure analysis failed, but we still have basic stats
    const basicIssues = detectMultipleIssues(input)
    issues.push(...basicIssues)
  }

  return { structure, issues }
}

// Pure functions moved outside the hook for better performance
const getPositionFromIndexPure = (
  input: string,
  index: number
): { line: number; column: number } => {
  const lines = input.substring(0, index).split('\n')
  const line = lines.length
  const column = lines[lines.length - 1].length + 1
  return { line, column }
}

const analyzeStructurePure = (input: string): ValidationResult['statistics'] => {
  const { structure } = analyzeJsonStructure(input)
  return structure
}

const validateJsonInput = (input: string): ValidationResult => {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  if (!input.trim()) {
    return {
      isValid: false,
      errors: [
        {
          message: 'Input is empty',
          line: 1,
          column: 1,
          type: 'syntax',
          severity: 'error',
          fixable: false,
        },
      ],
      warnings: [],
      statistics: {
        lineCount: 0,
        characterCount: 0,
        depth: 0,
        keyCount: 0,
        arrayCount: 0,
        objectCount: 0,
      },
    }
  }

  try {
    // Try to parse JSON
    JSON.parse(input)

    // Check for common warnings and formatting issues
    const formattingIssues = detectMultipleIssues(input)
    formattingIssues.forEach(issue => {
      if (issue.severity === 'warning') {
        warnings.push(`${issue.message} at line ${issue.line}`)
      }
    })

    return {
      isValid: true,
      errors: [],
      warnings,
      statistics: analyzeStructurePure(input),
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error'

    // Extract position information from error message
    let line = 1
    let column = 1
    const type: ValidationError['type'] = 'syntax'

    // Try to extract position from common error patterns
    const positionMatch = errorMessage.match(/position (\d+)/)
    if (positionMatch) {
      const position = parseInt(positionMatch[1])
      const positionInfo = getPositionFromIndexPure(input, position)
      line = positionInfo.line
      column = positionInfo.column
    }

    // Try to extract line/column from other error patterns
    const lineMatch = errorMessage.match(/line (\d+)/)
    if (lineMatch) {
      line = parseInt(lineMatch[1])
    }

    const columnMatch = errorMessage.match(/column (\d+)/)
    if (columnMatch) {
      column = parseInt(columnMatch[1])
    }

    // Generate helpful suggestions
    let suggestion: string | undefined
    const fixable = false
    if (errorMessage.includes('Unexpected token')) {
      suggestion = 'Check for missing commas, brackets, or quotes'
    } else if (errorMessage.includes('Unexpected end')) {
      suggestion = 'Check for missing closing brackets or quotes'
    } else if (errorMessage.includes('Unexpected number')) {
      suggestion = 'Check for invalid number format or missing quotes around strings'
    }

    // Add the main parsing error
    errors.push({
      message: errorMessage,
      line,
      column,
      type,
      suggestion,
      severity: 'error',
      fixable,
    })

    // Add additional formatting issues
    const formattingIssues = detectMultipleIssues(input)
    errors.push(...formattingIssues.filter(issue => issue.severity === 'error'))

    return {
      isValid: false,
      errors,
      warnings,
      statistics: analyzeStructurePure(input),
    }
  }
}

export const useJsonValidator = () => {
  // Quick validation check
  const isValidJson = (input: string): boolean => {
    try {
      JSON.parse(input.trim())
      return true
    } catch {
      return false
    }
  }

  // Get specific error at a given line
  const getErrorAtLine = (input: string, lineNumber: number): ValidationError | null => {
    const result = validateJsonInput(input)
    return result.errors.find(error => error.line === lineNumber) || null
  }

  // Get all errors for a specific line range
  const getErrorsInRange = (
    input: string,
    startLine: number,
    endLine: number
  ): ValidationError[] => {
    const result = validateJsonInput(input)
    return result.errors.filter(error => error.line >= startLine && error.line <= endLine)
  }

  // Auto-fix specific error if possible
  const autoFixError = (input: string, error: ValidationError): string => {
    if (!error.fixable || !error.autoFix) {
      return input
    }

    const lines = input.split('\n')
    const lineIndex = error.line - 1

    if (lineIndex >= 0 && lineIndex < lines.length) {
      const fixedLine = error.autoFix()
      lines[lineIndex] = fixedLine
      return lines.join('\n')
    }

    return input
  }

  // Group errors by line number for UI rendering
  const groupErrorsByLine = (input: string): Record<number, ValidationError[]> => {
    const result = validateJsonInput(input)
    return result.errors.reduce<Record<number, ValidationError[]>>((acc, err) => {
      if (!acc[err.line]) acc[err.line] = []
      acc[err.line].push(err)
      return acc
    }, {})
  }

  return {
    validateJson: validateJsonInput,
    isValidJson,
    getErrorAtLine,
    getErrorsInRange,
    autoFixError,
    analyzeStructure: analyzeStructurePure,
    getPositionFromIndex: getPositionFromIndexPure,
    groupErrorsByLine,
  }
}
