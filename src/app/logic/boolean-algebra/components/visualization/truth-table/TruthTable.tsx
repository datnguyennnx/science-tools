import { useMemo, useState, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { KatexFormula, booleanToLatex } from '@/components/KatexFormula'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Maximize, Minimize } from 'lucide-react'

// --- Engine Imports ---
import { ExpressionParser as EngineExpressionParser, type BooleanExpression } from '../../../engine' // Adjusted path
import { evaluateExpression as engineEvaluateExpression } from '../../../engine/evaluator' // Adjusted path
import { latexToBoolean as engineLatexToBoolean } from '../../../engine/converter/latex-converter' // Adjusted path
// --- End Engine Imports ---

import type { TruthTableProps, SubExpressionStep } from './types' // Import from local types
import { getAllSubExpressions, extractVariables } from './TrueTableEngine' // Import from local engine

export function TruthTable({ expression, variables: propVariables }: TruthTableProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  const memoizedTableData = useMemo(() => {
    let errorOccurred = false
    let errorMessage = ''
    const rawInput = expression
    let processedForParsing = ''
    let mainAst: BooleanExpression | null = null

    // Check for empty expression FIRST - this is an initial state, not necessarily an error for display purposes.
    if (!expression || !expression.trim()) {
      return {
        variablesToUse: [] as string[],
        subExpressionStepsForColumns: [] as SubExpressionStep[],
        rows: [] as Array<{
          variableValues: Record<string, boolean>
          stepResults: Record<string, boolean>
        }>,
        errorOccurred: false, // Treat as not an error for display, but an initial state.
        errorMessage: 'Enter an expression and click Simplify to generate a Truth Table.', // New message
        isInitialEmptyState: true, // Flag for initial empty state
        rawInput: expression,
        processedExpressionForDisplay: '',
      }
    }

    // Try-catch for actual parsing and processing errors
    try {
      processedForParsing = engineLatexToBoolean(rawInput)
      if (!processedForParsing && rawInput.trim()) {
        throw new Error('Expression became empty after LaTeX conversion. Check syntax.')
      }
      mainAst = EngineExpressionParser.parse(processedForParsing)
      if (!mainAst) {
        throw new Error('Failed to parse the expression into an AST.')
      }

      const astBasedVariables = extractVariables(EngineExpressionParser.toBooleanString(mainAst))
      const initialVars =
        propVariables && propVariables.length > 0 ? propVariables : astBasedVariables
      const localVariablesToUse = initialVars.length > 0 ? initialVars : extractVariables(rawInput)

      const steps: SubExpressionStep[] = mainAst // Explicitly type steps
        ? getAllSubExpressions(mainAst, EngineExpressionParser.toBooleanString)
        : []
      if (steps.length === 0 && mainAst) {
        steps.push({
          str: EngineExpressionParser.toBooleanString(mainAst),
          ast: mainAst,
          isFinal: true,
        })
      }
      const subExpressionStepsForColumns: SubExpressionStep[] = steps // Assign typed steps

      const localRows: Array<{
        variableValues: Record<string, boolean>
        stepResults: Record<string, boolean>
      }> = []
      const numVars = localVariablesToUse.length
      const numRows = Math.pow(2, numVars)
      for (let i = 0; i < numRows; i++) {
        const currentVariableValues: Record<string, boolean> = {}
        for (let j = 0; j < numVars; j++) {
          currentVariableValues[localVariablesToUse[j]] = Boolean((i >> (numVars - j - 1)) & 1)
        }
        const currentStepResults: Record<string, boolean> = {}
        for (const step of subExpressionStepsForColumns) {
          currentStepResults[step.str] = engineEvaluateExpression(step.ast, currentVariableValues)
        }
        localRows.push({ variableValues: currentVariableValues, stepResults: currentStepResults })
      }
      return {
        variablesToUse: localVariablesToUse,
        subExpressionStepsForColumns: subExpressionStepsForColumns,
        rows: localRows,
        errorOccurred: false,
        errorMessage: '',
        isInitialEmptyState: false,
        rawInput,
        processedExpressionForDisplay: mainAst
          ? EngineExpressionParser.toBooleanString(mainAst)
          : processedForParsing || rawInput,
      }
    } catch (err) {
      errorOccurred = true
      errorMessage = err instanceof Error ? err.message : 'TEST: Failed to generate truth table.'
      return {
        variablesToUse: [] as string[],
        subExpressionStepsForColumns: [] as SubExpressionStep[],
        rows: [] as Array<{
          variableValues: Record<string, boolean>
          stepResults: Record<string, boolean>
        }>,
        errorOccurred,
        errorMessage,
        isInitialEmptyState: false, // This is a true error state
        rawInput,
        processedExpressionForDisplay: processedForParsing || rawInput,
      }
    }
  }, [expression, propVariables])

  // Fullscreen styles - Increase z-index for testing
  const fullscreenCardClasses = isFullscreen
    ? 'fixed inset-0 z-[9999] w-screen h-screen bg-background p-4 sm:p-6 flex flex-col' // Use bg-background from theme
    : 'w-full h-fit'
  const fullscreenContentClasses = isFullscreen ? 'flex-grow overflow-y-auto pt-0' : ''

  const renderContent = () => {
    // Handle initial empty state (not an error, but placeholder)
    if (memoizedTableData.isInitialEmptyState) {
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md`}
        >
          <p
            className={`text-sm mt-2 ${isFullscreen ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {memoizedTableData.errorMessage}
          </p>
        </div>
      )
    }

    // Handle actual errors
    if (memoizedTableData.errorOccurred) {
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md`}
        >
          <h2
            className={`text-xl font-bold ${isFullscreen ? 'text-foreground' : 'text-destructive'}`}
          >
            Truth Table Error
          </h2>
          <p
            className={`text-sm mt-2 ${isFullscreen ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {memoizedTableData.errorMessage}
          </p>
          {memoizedTableData.rawInput && (
            <p
              className={`mt-1 text-sm ${isFullscreen ? 'text-gray-200' : 'text-muted-foreground'}`}
            >
              Input: {memoizedTableData.rawInput}
            </p>
          )}
        </div>
      )
    }

    // Handle no variables/steps state (after processing, not an error but specific outcome)
    if (
      memoizedTableData.variablesToUse.length === 0 &&
      memoizedTableData.subExpressionStepsForColumns.length === 0 &&
      !memoizedTableData.errorOccurred // Already handled above
    ) {
      if (
        memoizedTableData.rows.length === 0 ||
        (memoizedTableData.rows.length === 1 &&
          Object.keys(memoizedTableData.rows[0].stepResults).length === 0)
      ) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <h2 className={`text-xl font-semibold ${isFullscreen ? 'text-foreground' : ''}`}>
              Truth Table Status
            </h2>
            <p className={`mt-1 ${isFullscreen ? 'text-foreground' : 'text-muted-foreground'}`}>
              Could not determine variables or meaningful steps.
            </p>
            <p
              className={`mt-1 text-sm ${isFullscreen ? 'text-gray-200' : 'text-muted-foreground'}`}
            >
              Input: {booleanToLatex(memoizedTableData.rawInput)}
            </p>
          </div>
        )
      }
    }

    // Actual table rendering (structure remains the same)
    return (
      <div className="space-y-2">
        {!isFullscreen && (
          <div className="mb-2">
            <h3 className="font-medium text-sm">Truth Table for:</h3>
            <div className="bg-muted p-2 rounded my-1 overflow-x-auto no-scrollbar">
              <KatexFormula formula={booleanToLatex(memoizedTableData.rawInput)} block={true} />
            </div>
          </div>
        )}
        <div className="overflow-x-auto w-full">
          <Table className="w-full min-w-max table-auto">
            <TableHeader>
              <TableRow>
                {memoizedTableData.variablesToUse.map((variable: string) => (
                  <TableHead
                    key={`var-${variable}`}
                    className="text-center px-1 py-2 text-xs sm:text-sm whitespace-nowrap"
                  >
                    <KatexFormula formula={variable} />
                  </TableHead>
                ))}
                {memoizedTableData.subExpressionStepsForColumns.map((step: SubExpressionStep) => (
                  <TableHead
                    key={`step-${step.str}`}
                    className="text-center px-1 py-2 text-xs sm:text-sm"
                  >
                    <div className="overflow-x-auto max-w-[150px] sm:max-w-none mx-auto no-scrollbar">
                      <KatexFormula formula={booleanToLatex(step.str)} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {memoizedTableData.rows.map(row => {
                const rowKeyPart = memoizedTableData.variablesToUse
                  .map((v: string) => (row.variableValues[v] ? '1' : '0'))
                  .join('')
                const stableRowKey = `row-${rowKeyPart}`
                return (
                  <TableRow key={stableRowKey}>
                    {memoizedTableData.variablesToUse.map((variable: string) => (
                      <TableCell
                        key={`cell-${stableRowKey}-var-${variable}`}
                        className="text-center p-1 text-xs sm:text-sm"
                      >
                        <KatexFormula
                          formula={row.variableValues[variable] ? '\\text{T}' : '\\text{F}'}
                        />
                      </TableCell>
                    ))}
                    {memoizedTableData.subExpressionStepsForColumns.map(
                      (step: SubExpressionStep) => (
                        <TableCell
                          key={`cell-${stableRowKey}-step-${step.str}`}
                          className="text-center p-1 text-xs sm:text-sm"
                        >
                          <KatexFormula
                            formula={row.stepResults[step.str] ? '\\text{T}' : '\\text{F}'}
                          />
                        </TableCell>
                      )
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // Card structure remains the same
  return (
    <>
      {isFullscreen && <div className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"></div>}
      <Card className={fullscreenCardClasses}>
        <CardHeader className="pb-2">
          <CardTitle className={isFullscreen ? 'text-foreground font-bold' : ''}>
            Truth Table
          </CardTitle>
          <CardDescription className={isFullscreen ? 'text-muted-foreground' : ''}>
            {memoizedTableData.isInitialEmptyState
              ? 'Shows outputs for all input combinations.'
              : isFullscreen
                ? `For: ${booleanToLatex(memoizedTableData.rawInput)}`
                : 'Evaluation for all possible inputs'}
          </CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className={isFullscreen ? 'text-foreground hover:text-accent-foreground' : ''}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className={fullscreenContentClasses}>{renderContent()}</CardContent>
      </Card>
    </>
  )
}
