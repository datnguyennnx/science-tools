import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { KatexFormula, booleanToLatex, latexToBoolean } from '@/components/KatexFormula'
import { toast } from 'sonner'

interface TruthTableProps {
  expression: string
  variables?: string[]
}

// Extract all variables from an expression
const extractVariables = (expression: string): string[] => {
  const uniqueVars = new Set<string>()
  for (const char of expression) {
    if (/[A-Z]/.test(char) && char !== 'T' && char !== 'F') {
      uniqueVars.add(char)
    }
  }
  return Array.from(uniqueVars).sort()
}

// Safely evaluate a boolean expression without using eval or Function constructor
const evaluateExpression = (
  expression: string,
  values: Record<string, boolean>
): { result: boolean; steps: string } => {
  if (!expression.trim()) return { result: false, steps: '' }

  try {
    // Replace variables with their values
    let processedExpr = expression

    // First, replace all variables with their boolean values
    Object.entries(values).forEach(([variable, value]) => {
      const regex = new RegExp(variable, 'g')
      const valueStr = value ? '1' : '0'
      processedExpr = processedExpr.replace(regex, valueStr)
    })

    // Replace any remaining variables with false
    processedExpr = processedExpr.replace(/[A-Z]/g, 'false')

    // Replace operators with JavaScript equivalents
    processedExpr = processedExpr
      .replace(/\*/g, '&&')
      .replace(/\+/g, '||')
      .replace(/!/g, '!')
      .replace(/\b1\b/g, 'true')
      .replace(/\b0\b/g, 'false')

    // Manual evaluation - safer than using eval or Function
    // This is a simple implementation that handles basic expressions

    // Handle parentheses by recursive evaluation
    while (processedExpr.includes('(')) {
      const innerMostRegex = /\(([^()]*)\)/g
      processedExpr = processedExpr.replace(innerMostRegex, (match, group) => {
        // Recursively evaluate the inner expression
        const innerResult = evaluateSimpleExpression(group)
        return innerResult ? 'true' : 'false'
      })
    }

    // Track the steps of evaluation
    let evaluationSteps = ''

    // Build the evaluation step string
    if (processedExpr.includes('+')) {
      evaluationSteps = processedExpr.replace(/\+/g, '∨').replace(/!/g, '¬')
    } else if (processedExpr.includes('*')) {
      evaluationSteps = processedExpr.replace(/\*/g, '∧').replace(/!/g, '¬')
    }

    // Add the result
    evaluationSteps += `=${evaluateSimpleExpression(processedExpr) ? '1' : '0'}`

    return {
      result: evaluateSimpleExpression(processedExpr),
      steps: evaluationSteps,
    }
  } catch (error) {
    toast.error(
      `Error evaluating expression: ${error instanceof Error ? error.message : String(error)}`
    )
    return { result: false, steps: '' }
  }
}

// Helper function to evaluate simple expressions without parentheses
const evaluateSimpleExpression = (expr: string): boolean => {
  // First apply NOT operations
  while (expr.includes('!')) {
    expr = expr.replace(/!(\s*)(true|false)/g, (_, space, value) => {
      return value === 'true' ? 'false' : 'true'
    })
  }

  // Split by OR operators and evaluate
  const orParts = expr.split('||')
  for (const part of orParts) {
    // If any part evaluates to true after AND operations, the whole expression is true
    const andParts = part.split('&&')
    let andResult = true

    for (const andPart of andParts) {
      const trimmed = andPart.trim()
      if (trimmed === 'false') {
        andResult = false
        break
      }
    }

    if (andResult) {
      return true
    }
  }

  return false
}

export function TruthTable({ expression, variables }: TruthTableProps) {
  const memoizedTableData = useMemo(() => {
    let errorOccurred = false
    let errorMessage = ''
    let processedExpression = ''
    let localVariablesToUse: string[] = []
    const localRows: Array<{ values: Record<string, boolean>; result: boolean }> = []

    if (!expression.trim()) {
      // Should not happen if parent is rendering this conditionally based on expression presence,
      // but good for defensive coding within useMemo.
      return {
        variablesToUse: [],
        rows: [],
        errorOccurred: true,
        errorMessage: 'Expression is empty.',
        rawInput: expression,
        processedExpression: '',
      }
    }

    try {
      processedExpression = latexToBoolean(expression)
      localVariablesToUse =
        variables && variables.length > 0 ? variables : extractVariables(processedExpression)

      if (localVariablesToUse.length === 0) {
        return {
          variablesToUse: [],
          rows: [],
          errorOccurred: true,
          errorMessage: 'No variables detected in the processed expression.',
          rawInput: expression,
          processedExpression,
        }
      }

      const numVars = localVariablesToUse.length
      const numRows = Math.pow(2, numVars)

      for (let i = 0; i < numRows; i++) {
        const values: Record<string, boolean> = {}
        for (let j = 0; j < numVars; j++) {
          const variable = localVariablesToUse[j]
          values[variable] = Boolean((i >> (numVars - j - 1)) & 1)
        }
        const { result } = evaluateExpression(processedExpression, values)
        localRows.push({ values, result })
      }
    } catch (err) {
      toast.error(
        `Error in TruthTable calculation: ${err instanceof Error ? err.message : String(err)}`
      )
      errorOccurred = true
      errorMessage = err instanceof Error ? err.message : 'Failed to generate truth table.'
      // Attempt to provide processed expression for error context if available
      processedExpression = processedExpression || latexToBoolean(expression) // ensure it's attempted
    }

    return {
      variablesToUse: localVariablesToUse,
      rows: localRows,
      errorOccurred,
      errorMessage,
      rawInput: expression,
      processedExpression,
    }
  }, [expression, variables]) // Dependencies for useMemo

  // The parent component handles the overall conditional rendering (e.g. via `isSimplified` state).
  // So, if this component renders, we proceed based on memoizedTableData.

  if (memoizedTableData.errorOccurred) {
    return (
      <div className="text-center p-4 text-destructive bg-destructive/10 rounded">
        <p>Error generating truth table: {memoizedTableData.errorMessage}</p>
        <p className="font-mono text-xs mt-1">Raw Input: {memoizedTableData.rawInput}</p>
        {memoizedTableData.processedExpression && (
          <p className="font-mono text-xs mt-1">
            Processed As: {memoizedTableData.processedExpression}
          </p>
        )}
      </div>
    )
  }

  // This condition can also be part of useMemo's return if preferred, covered by error above.
  if (memoizedTableData.variablesToUse.length === 0 && !memoizedTableData.errorOccurred) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No variables detected in the expression to generate a truth table.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="mb-2">
        <h3 className="font-medium text-sm">Truth Table for:</h3>
        <div className="bg-muted p-2 rounded my-1 overflow-x-auto no-scrollbar">
          <KatexFormula formula={booleanToLatex(memoizedTableData.rawInput)} block={true} />
        </div>
      </div>

      <div className="overflow-x-auto w-full ">
        <Table className="w-full min-w-max table-auto ">
          <TableHeader>
            <TableRow>
              {memoizedTableData.variablesToUse.map(variable => (
                <TableHead
                  key={variable}
                  className="text-center px-1 py-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <KatexFormula formula={variable} />
                </TableHead>
              ))}
              <TableHead className="text-center px-1 py-2 text-xs sm:text-sm">
                <div className="overflow-x-auto max-w-[150px] sm:max-w-none mx-auto">
                  <KatexFormula formula={booleanToLatex(memoizedTableData.rawInput)} />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memoizedTableData.rows.map(row => (
              <TableRow
                key={`row-${memoizedTableData.variablesToUse.map(v => (row.values[v] ? '1' : '0')).join('')}`}
              >
                {memoizedTableData.variablesToUse.map(variable => (
                  <TableCell
                    key={variable}
                    className="text-center p-1 text-xs sm:text-sm no-scrollbar"
                  >
                    <KatexFormula formula={row.values[variable] ? '\\text{T}' : '\\text{F}'} />
                  </TableCell>
                ))}
                <TableCell className="text-center p-1 text-xs sm:text-sm">
                  <KatexFormula formula={row.result ? '\\text{T}' : '\\text{F}'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
