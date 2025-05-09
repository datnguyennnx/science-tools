'use client'

import React, { useMemo } from 'react'
import { ExpressionParser } from '../../../engine'
import { latexToBoolean } from '@/components/KatexFormula'
import { KarnaughMapProps, KMapResult } from './types'
import { createKMapConfig, evaluateExpression, extractVariablesFromTree } from './KMapEngine'
import { detectGroups } from './KMapGroupDetector'
import { KMapGrid } from './KMapGrid'
import { KMapLegend } from './KMapLegend'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function KarnaughMap({ expression, className = '' }: KarnaughMapProps) {
  // Parse the expression and generate the K-Map data
  const kmapResult = useMemo<KMapResult>(() => {
    if (!expression) {
      return {
        status: 'waiting',
        message: 'Enter an expression and click Simplify to generate a Karnaugh Map.',
      }
    }

    try {
      // Convert from LaTeX to boolean expression
      const booleanExpr = latexToBoolean(expression)

      // Parse the expression using our engine
      const expressionTree = ExpressionParser.parse(booleanExpr)

      // Extract variables from the parsed expression
      const variables = extractVariablesFromTree(expressionTree)

      // Check if we have a valid number of variables
      if (variables.length < 2 || variables.length > 4) {
        return {
          status: 'error',
          variables,
          message: `K-Map generation currently supports 2 to 4 variables. Detected ${variables.length} variables (${variables.join(', ') || 'None'}).`,
          details: 'Please provide a valid boolean expression with 2 to 4 unique variables (A-Z).',
        }
      }

      // Evaluate all minterms
      const mintermSet = new Set<number>()
      const numVars = variables.length
      const maxValue = 1 << numVars // 2^numVars

      // Generate all possible combinations of variable values
      for (let i = 0; i < maxValue; i++) {
        const variableValues: Record<string, boolean> = {}

        // Set variable values based on binary representation of i
        for (let j = 0; j < numVars; j++) {
          variableValues[variables[j]] = ((i >> j) & 1) === 1
        }

        // Evaluate the expression with these variable values
        try {
          const result = evaluateExpression(expressionTree, variableValues)
          if (result) {
            mintermSet.add(i) // Add minterm if expression evaluates to true
          }
        } catch (error) {
          return {
            status: 'error',
            variables,
            message: 'Error evaluating expression values.',
            details: error instanceof Error ? error.message : String(error),
          }
        }
      }

      // K-Map configuration based on the number of variables
      const kMapConfig = createKMapConfig(variables)

      // Detect groups in the K-Map
      const groups = detectGroups(mintermSet, kMapConfig.kMapOrder, numVars)

      return {
        status: 'success',
        variables,
        expressionTree,
        mintermSet,
        kMapConfig,
        groups,
        numVars,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Error generating Karnaugh Map.',
        details: error instanceof Error ? error.message : 'Invalid expression format',
      }
    }
  }, [expression])

  // Waiting state (no expression provided)
  if (kmapResult.status === 'waiting') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Karnaugh Map</CardTitle>
          <CardDescription>Visualization limited to 2-4 variables</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="border border-dashed rounded-md p-6 flex items-center justify-center">
            <div className="text-center max-w-md">
              <p className="text-sm text-muted-foreground">
                Enter an expression and click Simplify to generate a Karnaugh Map.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (kmapResult.status === 'error') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Karnaugh Map</CardTitle>
          <CardDescription>Visualization limited to 2-4 variables</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="border border-dashed rounded-md p-6 flex items-center justify-center">
            <div className="text-center max-w-md">
              <p className="mb-2 text-sm">{kmapResult.message}</p>
              {kmapResult.variables && (
                <p className="text-sm text-muted-foreground">
                  Detected variables:{' '}
                  <span className="font-medium">{kmapResult.variables.join(', ')}</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Success state - we now know kmapResult is of type KMapResultSuccess due to narrowing
  const { variables, mintermSet, kMapConfig, groups, numVars } = kmapResult

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Karnaugh Map</CardTitle>
        <CardDescription>
          Visual tool for Boolean simplification with {numVars} variables ({variables.join(', ')})
          and {mintermSet.size} minterms
        </CardDescription>
      </CardHeader>

      <CardContent>
        <KMapGrid
          config={kMapConfig}
          mintermSet={mintermSet}
          groups={groups}
          showMintermNumbers={true}
        />
      </CardContent>

      <CardFooter className="flex-col items-start border-t">
        <div className="w-full space-y-3">
          <h4 className="text-sm font-medium text-foreground">Group Legend</h4>
          <KMapLegend />
          <p className="text-xs text-muted-foreground">
            Each group represents a term in the simplified boolean expression. Larger groups (more
            cells) result in simpler terms.
          </p>

          <div className="text-center text-sm text-muted-foreground pt-2">
            <span className="font-medium">
              2<sup>{numVars}</sup> = {Math.pow(2, numVars)} cells
            </span>
            {mintermSet.size > 0 && (
              <span>
                {' '}
                with {mintermSet.size} minterms (
                {((mintermSet.size / Math.pow(2, numVars)) * 100).toFixed(1)}%)
              </span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
