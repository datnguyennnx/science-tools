'use client'

import { useState, useEffect } from 'react'
import {
  ExpressionParser as EngineExpressionParser,
  evaluateExpression as engineEvaluateExpression,
} from '../../engine'
import { latexToBoolean as engineLatexToBoolean } from '../../engine/converter/latex-format-converter'
import type {
  TruthTableResult,
  SubExpressionStep,
  TruthTableRowData,
} from '../visualization/truth-table/types'
import {
  getAllSubExpressions,
  extractVariablesFromTree,
} from '../visualization/truth-table/TruthTableEngine'

export function useTruthTableGeneration(
  expression: string,
  propVariables?: string[]
): TruthTableResult {
  const [result, setResult] = useState<TruthTableResult>({
    status: 'waiting',
    message: 'Enter an expression and click Simplify to generate a Truth Table.',
  })

  useEffect(() => {
    if (!expression || !expression.trim()) {
      setResult({
        status: 'waiting',
        message: 'Enter an expression and click Simplify to generate a Truth Table.',
      })
      return
    }

    try {
      const rawInput = expression
      let processedForParsing = ''

      processedForParsing = engineLatexToBoolean(rawInput)
      if (!processedForParsing && rawInput.trim()) {
        // This specific error is about LaTeX conversion failure
        setResult({
          status: 'error',
          message: 'Expression became empty after LaTeX conversion.',
          details: 'Please check your LaTeX syntax or ensure the expression is not trivial.',
          rawInput,
        })
        return
      }

      const mainAst = EngineExpressionParser.parse(processedForParsing)
      if (!mainAst) {
        // This error is about parsing the (potentially converted) boolean string
        setResult({
          status: 'error',
          message: 'Failed to parse the expression.',
          details:
            'The expression string is invalid. This could be due to incorrect operators, unbalanced parentheses, or other syntax issues.',
          rawInput,
        })
        return
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
        // Pre-generate all variable combinations for efficiency
        const variableCombinations: Record<string, boolean>[] = []
        for (let i = 0; i < numRows; i++) {
          const currentVariableValues: Record<string, boolean> = {}
          for (let j = 0; j < numVars; j++) {
            currentVariableValues[localVariablesToUse[j]] = Boolean((i >> (numVars - j - 1)) & 1)
          }
          variableCombinations.push(currentVariableValues)
        }

        // Batch evaluate all steps for all combinations
        // This reduces redundant AST traversals
        for (const variableValues of variableCombinations) {
          const currentStepResults: Record<string, boolean> = {}
          for (const step of steps) {
            currentStepResults[step.str] = engineEvaluateExpression(step.ast, variableValues)
          }
          localRows.push({ variableValues, stepResults: currentStepResults })
        }
      }

      setResult({
        status: 'success',
        variables: localVariablesToUse,
        subExpressionSteps: steps,
        rows: localRows,
        rawInput,
        processedExpression: EngineExpressionParser.toBooleanString(mainAst),
      })
    } catch (err) {
      // This is a general catch-all for unexpected errors during processing
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.'
      let errorDetails = 'Failed to generate truth table due to an unexpected issue.'
      if (err instanceof Error && err.stack) {
        // console.error("Truth Table Error:", err) // Optional: for debugging
        errorDetails = `Details: ${errorMessage}`
      }

      setResult({
        status: 'error',
        message: 'Error generating Truth Table.',
        details: errorDetails,
        rawInput: expression,
      })
    }
  }, [expression, propVariables])

  return result
}
