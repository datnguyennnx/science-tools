'use client'

import React, { useMemo } from 'react'
import { ExpressionParser } from '../../../engine'
import { latexToBoolean } from '@/components/KatexFormula'
import { KarnaughMapProps } from './types'
import { createKMapConfig, evaluateExpression, extractVariablesFromTree } from './KMapEngine'
import { detectGroups } from './KMapGroupDetector'
import { KMapGrid } from './KMapGrid'
import { KMapLegend } from './KMapLegend'
import { toast } from 'sonner'
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
  const kmapData = useMemo(() => {
    if (!expression) {
      return {
        variables: [],
        expressionTree: null,
        mintermSet: new Set<number>(),
      }
    }

    try {
      // Convert from LaTeX to boolean expression
      const booleanExpr = latexToBoolean(expression)

      // Parse the expression using our engine
      const expressionTree = ExpressionParser.parse(booleanExpr)

      // Extract variables from the parsed expression
      const variables = extractVariablesFromTree(expressionTree)

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
          toast.error(
            `Error evaluating expression: ${error instanceof Error ? error.message : String(error)}`
          )
        }
      }

      return { variables, expressionTree, mintermSet }
    } catch (error) {
      toast.error(
        `Error parsing expression: ${error instanceof Error ? error.message : String(error)}`
      )
      return {
        variables: [],
        expressionTree: null,
        mintermSet: new Set<number>(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }, [expression])

  const { variables, mintermSet, error } = kmapData
  const numVars = variables.length

  // Setup K-Map configuration based on the number of variables
  const kMapConfig = useMemo(() => {
    return createKMapConfig(variables)
  }, [variables])

  // Detect groups in the K-Map
  const groups = useMemo(() => {
    return detectGroups(mintermSet, kMapConfig.kMapOrder, numVars)
  }, [mintermSet, kMapConfig.kMapOrder, numVars])

  if (!expression) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          Expression needed for K-Map.
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-destructive-foreground bg-destructive/10">
          Error generating K-Map: {error}
        </CardContent>
      </Card>
    )
  }

  if (numVars < 2 || numVars > 4) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-destructive-foreground bg-destructive/10">
          K-Map generation currently supports 2 to 4 variables. Detected {numVars} variables (
          {variables.join(', ') || 'None'}). Please provide a valid boolean expression with 2 to 4
          unique variables (A-Z).
        </CardContent>
      </Card>
    )
  }

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
