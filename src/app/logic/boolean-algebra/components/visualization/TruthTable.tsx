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
import { ExpressionParser as EngineExpressionParser, type BooleanExpression } from '../../engine'
import { evaluateExpression as engineEvaluateExpression } from '../../engine/evaluator'
import { latexToBoolean as engineLatexToBoolean } from '../../engine/converter/latex-converter'
// --- End Engine Imports ---

interface TruthTableProps {
  expression: string
  variables?: string[]
}

// --- Helper to get all sub-expressions from AST ---
interface SubExpressionStep {
  str: string // String representation for display and key
  ast: BooleanExpression // AST node for evaluation
  isFinal: boolean // True if this is the main (final) expression
}

const getAllSubExpressions = (
  mainAstNode: BooleanExpression,
  exprToString: (ast: BooleanExpression) => string
): SubExpressionStep[] => {
  const collectedExpressions = new Map<string, BooleanExpression>()

  function visit(currentNode: BooleanExpression) {
    if (!currentNode) return

    if (currentNode.left) {
      visit(currentNode.left)
    }
    if (currentNode.right) {
      visit(currentNode.right)
    }

    // Collect operator nodes and the main node itself
    if (currentNode.type !== 'VARIABLE' && currentNode.type !== 'CONSTANT') {
      const strRepresentation = exprToString(currentNode)
      if (!collectedExpressions.has(strRepresentation)) {
        collectedExpressions.set(strRepresentation, currentNode)
      }
    }
  }

  visit(mainAstNode)

  const mainExpressionStr = exprToString(mainAstNode)
  // Ensure the main expression is always included
  if (!collectedExpressions.has(mainExpressionStr)) {
    collectedExpressions.set(mainExpressionStr, mainAstNode)
  }

  let steps = Array.from(collectedExpressions.entries()).map(([str, ast]) => ({
    str,
    ast,
    isFinal: false,
  }))

  // Sort by string length as a proxy for complexity, shorter expressions first.
  steps.sort((a, b) => a.str.length - b.str.length)

  // Ensure the main expression is the last one and marked as final.
  // Remove it from its current position if it exists and append it.
  const mainIndex = steps.findIndex(step => step.str === mainExpressionStr)
  if (mainIndex > -1) {
    const mainStep = steps.splice(mainIndex, 1)[0]
    steps.push({ ...mainStep, isFinal: true })
  } else {
    // This case should ideally not happen if main expression was added correctly
    steps.push({ str: mainExpressionStr, ast: mainAstNode, isFinal: true })
  }

  // Filter out single variables or constants if they are not the main expression itself,
  // as variables are already columns.
  steps = steps.filter(step => {
    if (step.isFinal) return true // Always keep the final expression
    return step.ast.type !== 'VARIABLE' && step.ast.type !== 'CONSTANT'
  })

  return steps
}
// --- End Helper ---

// Extract all variables from an expression string (can be simplified or derived from AST later if needed)
const extractVariables = (expression: string): string[] => {
  const uniqueVars = new Set<string>()
  // Regex to find uppercase letters not part of common logic words like TRUE, FALSE, NOT, AND, OR etc.
  // This is a simplified approach; a robust solution would parse or use AST.
  // const variableRegex = /([A-Z])(?<!TRU)(?<!FALS)(?<!NO)(?<!AN)(?<!O)/g // improved regex to avoid matching parts of keywords

  // Simpler regex for variables if the above is too complex or restrictive for some cases
  const simplerVarRegex = /[A-Z]/g
  const tempExpression = expression.replace(/TRUE|FALSE|NOT|AND|OR|XOR|NAND|NOR|XNOR/g, '') // Remove keywords

  let match
  while ((match = simplerVarRegex.exec(tempExpression)) !== null) {
    if (match[0].length === 1) {
      // Ensure it's a single uppercase letter
      uniqueVars.add(match[0])
    }
  }
  return Array.from(uniqueVars).sort()
}

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
        variablesToUse: [],
        subExpressionStepsForColumns: [],
        rows: [],
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

      const steps = mainAst
        ? getAllSubExpressions(mainAst, EngineExpressionParser.toBooleanString)
        : []
      if (steps.length === 0 && mainAst) {
        steps.push({
          str: EngineExpressionParser.toBooleanString(mainAst),
          ast: mainAst,
          isFinal: true,
        })
      }
      const subExpressionStepsForColumns = steps

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
        variablesToUse: [],
        subExpressionStepsForColumns: [],
        rows: [],
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
                {memoizedTableData.variablesToUse.map(variable => (
                  <TableHead
                    key={`var-${variable}`}
                    className="text-center px-1 py-2 text-xs sm:text-sm whitespace-nowrap"
                  >
                    <KatexFormula formula={variable} />
                  </TableHead>
                ))}
                {memoizedTableData.subExpressionStepsForColumns.map(step => (
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
                  .map(v => (row.variableValues[v] ? '1' : '0'))
                  .join('')
                const stableRowKey = `row-${rowKeyPart}`
                return (
                  <TableRow key={stableRowKey}>
                    {memoizedTableData.variablesToUse.map(variable => (
                      <TableCell
                        key={`cell-${stableRowKey}-var-${variable}`}
                        className="text-center p-1 text-xs sm:text-sm"
                      >
                        <KatexFormula
                          formula={row.variableValues[variable] ? '\\text{T}' : '\\text{F}'}
                        />
                      </TableCell>
                    ))}
                    {memoizedTableData.subExpressionStepsForColumns.map(step => (
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
