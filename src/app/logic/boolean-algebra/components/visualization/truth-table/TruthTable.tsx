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

import { ExpressionParser as EngineExpressionParser } from '../../../engine'
import { evaluateExpression as engineEvaluateExpression } from '../../../engine/evaluator'
import { latexToBoolean as engineLatexToBoolean } from '../../../engine/converter/latex-converter'

import type {
  TruthTableProps,
  SubExpressionStep,
  TruthTableResult,
  TruthTableResultWaiting,
  TruthTableResultError,
  TruthTableResultSuccess,
  TruthTableRowData,
} from './types'
import { getAllSubExpressions, extractVariablesFromTree } from './TruthTableEngine'

export function TruthTable({ expression, variables: propVariables }: TruthTableProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  const memoizedTableData = useMemo<TruthTableResult>(() => {
    const rawInput = expression
    let processedForParsing = ''

    if (!expression || !expression.trim()) {
      return {
        status: 'waiting',
        message: 'Enter an expression and click Simplify to generate a Truth Table.',
      } satisfies TruthTableResultWaiting
    }

    try {
      processedForParsing = engineLatexToBoolean(rawInput)
      if (!processedForParsing && rawInput.trim()) {
        // This specific error is about LaTeX conversion failure
        return {
          status: 'error',
          message: 'Expression became empty after LaTeX conversion.',
          details: 'Please check your LaTeX syntax or ensure the expression is not trivial.',
          rawInput,
        } satisfies TruthTableResultError
      }

      const mainAst = EngineExpressionParser.parse(processedForParsing)
      if (!mainAst) {
        // This error is about parsing the (potentially converted) boolean string
        return {
          status: 'error',
          message: 'Failed to parse the expression.',
          details:
            'The expression string is invalid. This could be due to incorrect operators, unbalanced parentheses, or other syntax issues.',
          rawInput,
        } satisfies TruthTableResultError
      }

      const astBasedVariables = extractVariablesFromTree(mainAst)
      const localVariablesToUse =
        propVariables && propVariables.length > 0 ? propVariables : astBasedVariables

      const steps: SubExpressionStep[] = getAllSubExpressions(
        mainAst,
        EngineExpressionParser.toBooleanString
      )

      // If no steps were found (e.g. for a single variable or constant expression)
      // and it wasn't caught as an error, ensure the main expression is a step.
      if (steps.length === 0) {
        steps.push({
          str: EngineExpressionParser.toBooleanString(mainAst),
          ast: mainAst,
          isFinal: true,
        })
      }
      // Ensure the final main expression is correctly marked
      const mainExpressionStr = EngineExpressionParser.toBooleanString(mainAst)
      const mainIndex = steps.findIndex(step => step.str === mainExpressionStr)
      if (mainIndex > -1) {
        steps[mainIndex].isFinal = true
        if (mainIndex !== steps.length - 1) {
          const mainStep = steps.splice(mainIndex, 1)[0]
          steps.push(mainStep)
        }
      } else {
        // This case should be rare if getAllSubExpressions includes the main expression
        steps.push({ str: mainExpressionStr, ast: mainAst, isFinal: true })
      }

      const localRows: TruthTableRowData[] = []
      const numVars = localVariablesToUse.length
      const numRows = Math.pow(2, numVars)

      // Handle 0-variable case (constant expression)
      if (numVars === 0) {
        const currentVariableValues: Record<string, boolean> = {}
        const currentStepResults: Record<string, boolean> = {}
        for (const step of steps) {
          currentStepResults[step.str] = engineEvaluateExpression(step.ast, currentVariableValues)
        }
        localRows.push({ variableValues: currentVariableValues, stepResults: currentStepResults })
      } else {
        for (let i = 0; i < numRows; i++) {
          const currentVariableValues: Record<string, boolean> = {}
          for (let j = 0; j < numVars; j++) {
            currentVariableValues[localVariablesToUse[j]] = Boolean((i >> (numVars - j - 1)) & 1)
          }
          const currentStepResults: Record<string, boolean> = {}
          for (const step of steps) {
            currentStepResults[step.str] = engineEvaluateExpression(step.ast, currentVariableValues)
          }
          localRows.push({ variableValues: currentVariableValues, stepResults: currentStepResults })
        }
      }

      return {
        status: 'success',
        variables: localVariablesToUse,
        subExpressionSteps: steps,
        rows: localRows,
        rawInput,
        processedExpression: EngineExpressionParser.toBooleanString(mainAst),
      } satisfies TruthTableResultSuccess
    } catch (err) {
      // This is a general catch-all for unexpected errors during processing
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.'
      let errorDetails = 'Failed to generate truth table due to an unexpected issue.'
      if (err instanceof Error && err.stack) {
        // console.error("Truth Table Error:", err) // Optional: for debugging
        errorDetails = `Details: ${errorMessage}`
      }

      return {
        status: 'error',
        message: 'Error generating Truth Table.',
        details: errorDetails,
        rawInput,
      } satisfies TruthTableResultError
    }
  }, [expression, propVariables])

  // Fullscreen styles - Increase z-index for testing
  const fullscreenCardClasses = isFullscreen
    ? 'fixed inset-0 z-[9999] w-screen h-screen bg-background p-4 sm:p-6 flex flex-col' // Use bg-background from theme
    : 'w-full h-fit '
  const fullscreenContentClasses = isFullscreen ? 'flex-grow overflow-y-auto' : ''

  const renderContent = () => {
    if (memoizedTableData.status === 'waiting') {
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md min-h-[10rem]`}
        >
          <p
            className={`text-sm mt-2 ${isFullscreen ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {memoizedTableData.message}
          </p>
        </div>
      )
    }

    if (memoizedTableData.status === 'error') {
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-md min-h-[10rem] `}
        >
          <p
            className={`text-sm mt-2 ${isFullscreen ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {memoizedTableData.message.includes('LaTeX conversion')
              ? 'Please check the LaTeX syntax in your expression.'
              : memoizedTableData.message.includes('parse the expression')
                ? 'Please check the expression syntax (operators, parentheses, etc.).'
                : 'Could not generate the truth table. Please check your expression.'}
          </p>
        </div>
      )
    }

    // status === 'success'
    const { variables, subExpressionSteps, rows, rawInput } = memoizedTableData

    if (variables.length === 0 && subExpressionSteps.length === 1 && rows.length === 1) {
      // This is a constant expression case (e.g. "1", "0", "A*!A")
      // Display a simplified version or just the result.
      const constantStep = subExpressionSteps[0]
      const constantValue = rows[0].stepResults[constantStep.str]
      return (
        <div className="space-y-2 ">
          {!isFullscreen && (
            <div>
              <h3 className="font-medium text-sm">Truth Table for:</h3>
              <div className="bg-muted p-2 rounded my-1 overflow-x-auto no-scrollbar">
                <KatexFormula formula={booleanToLatex(rawInput)} block={true} />
              </div>
            </div>
          )}
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-max table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center px-1 py-2 text-xs sm:text-sm">
                    <div className="overflow-x-auto max-w-[150px] sm:max-w-none mx-auto no-scrollbar">
                      <KatexFormula formula={booleanToLatex(constantStep.str)} />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-center p-1 text-xs sm:text-sm">
                    <KatexFormula formula={constantValue ? '\\text{T}' : '\\text{F}'} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            The expression evaluates to a constant value.
          </p>
        </div>
      )
    }

    if (rows.length === 0) {
      // Should be caught by error states, but as a fallback:
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md min-h-[10rem]">
          <h2 className={`text-xl font-semibold ${isFullscreen ? 'text-foreground' : ''}`}>
            Truth Table Status
          </h2>
          <p className={`mt-1 ${isFullscreen ? 'text-foreground' : 'text-muted-foreground'}`}>
            Could not generate truth table rows.
          </p>
          {rawInput && (
            <div className="mt-3 text-xs bg-muted p-2 rounded w-full max-w-md overflow-x-auto no-scrollbar">
              <span className={`${isFullscreen ? 'text-gray-200' : 'text-muted-foreground'} mr-1`}>
                Input:
              </span>
              <KatexFormula formula={booleanToLatex(rawInput)} />
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-2 ">
        {!isFullscreen && (
          <div className="mb-2">
            <h3 className="font-medium text-sm">Truth Table for:</h3>
            <div className="bg-muted p-2 rounded my-1 overflow-x-auto no-scrollbar">
              <KatexFormula formula={booleanToLatex(rawInput)} block={true} />
            </div>
          </div>
        )}
        <div className="overflow-x-auto w-full ">
          <Table className="w-full min-w-max table-auto ">
            <TableHeader>
              <TableRow>
                {variables.map((variable: string) => (
                  <TableHead
                    key={`var-${variable}`}
                    className="text-center px-1 py-2 text-xs sm:text-sm whitespace-nowrap"
                  >
                    <KatexFormula formula={variable} />
                  </TableHead>
                ))}
                {subExpressionSteps.map((step: SubExpressionStep) => (
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
              {rows.map(row => {
                const rowKeyPart = variables
                  .map((v: string) => (row.variableValues[v] ? '1' : '0'))
                  .join('')
                const stableRowKey = `row-${rowKeyPart}`
                return (
                  <TableRow key={stableRowKey}>
                    {variables.map((variable: string) => (
                      <TableCell
                        key={`cell-${stableRowKey}-var-${variable}`}
                        className="text-center p-1 text-xs sm:text-sm"
                      >
                        <KatexFormula
                          formula={row.variableValues[variable] ? '\\text{T}' : '\\text{F}'}
                        />
                      </TableCell>
                    ))}
                    {subExpressionSteps.map((step: SubExpressionStep) => (
                      <TableCell
                        key={`cell-${stableRowKey}-step-${step.str}`}
                        className="text-center p-1 text-xs sm:text-sm"
                      >
                        <KatexFormula
                          formula={row.stepResults[step.str] ? '\\text{T}' : '\\text{F}'}
                        />
                      </TableCell>
                    ))}
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
            {memoizedTableData.status === 'waiting'
              ? 'Shows outputs for all input combinations.'
              : memoizedTableData.status === 'error'
                ? 'Cannot generate table. Check expression syntax.' // Updated error description
                : isFullscreen && memoizedTableData.status === 'success'
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
