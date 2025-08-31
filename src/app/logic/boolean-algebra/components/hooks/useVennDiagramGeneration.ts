'use client'

import { useState, useEffect } from 'react'
import { ExpressionParser } from '../../engine'
import { latexToBoolean } from '@/components/KatexFormula'
import { extractVariablesFromTree } from '../visualization/utils/ExpressionUtils'
import {
  evaluate2VarVenn,
  evaluate3VarVenn,
  evaluate4VarVenn,
  evaluate5VarVenn,
  VennData,
} from '../visualization/venn-diagram/VennDiagramEngine'
import type { VennDiagramResultType } from '../visualization/venn-diagram/types'

export function useVennDiagramGeneration(expression: string): VennDiagramResultType {
  const [result, setResult] = useState<VennDiagramResultType>({
    status: 'waiting',
    message: 'Enter an expression to generate a Venn Diagram.',
  })

  useEffect(() => {
    if (!expression || !expression.trim()) {
      setResult({
        status: 'waiting',
        message: 'Enter an expression to generate a Venn Diagram.',
      })
      return
    }

    const originalExpression = expression

    try {
      const booleanExprStr = latexToBoolean(expression)
      const expressionTree = ExpressionParser.parse(booleanExprStr)
      const variables = extractVariablesFromTree(expressionTree)
      const numVars = variables.length

      if (numVars === 0) {
        setResult({
          status: 'error',
          variables,
          message: 'Constant expression found.',
          details:
            'Venn diagrams require variables. Constant expressions (0 or 1) are always true or false.',
        })
        return
      }

      if (numVars < 2 || numVars > 5) {
        setResult({
          status: 'error',
          variables,
          message: `Venn Diagrams support 2 to 5 variables. Detected ${numVars}.`,
          details:
            variables.length > 0
              ? `Variables found: ${variables.join(', ')}. Use 2-5 unique variables [A-Z].`
              : 'No variables found. Use a valid boolean expression with 2-5 variables [A-Z].',
        })
        return
      }

      let vennData: VennData

      try {
        if (numVars === 2) {
          vennData = evaluate2VarVenn(expressionTree, variables)
        } else if (numVars === 3) {
          vennData = evaluate3VarVenn(expressionTree, variables)
        } else if (numVars === 4) {
          vennData = evaluate4VarVenn(expressionTree, variables)
        } else {
          // numVars === 5
          vennData = evaluate5VarVenn(expressionTree, variables)
        }
      } catch (error) {
        setResult({
          status: 'error',
          variables,
          message: 'Failed to generate data for Venn Diagram.',
          details: error instanceof Error ? error.message : 'Evaluation process failed.',
        })
        return
      }

      setResult({
        status: 'success',
        variables,
        expressionTree,
        vennData,
        numVars,
        originalExpression,
      })
    } catch (error) {
      setResult({
        status: 'error',
        message: 'Error processing expression.',
        details:
          error instanceof Error ? error.message : 'Invalid expression format or internal error.',
      })
    }
  }, [expression])

  return result
}
