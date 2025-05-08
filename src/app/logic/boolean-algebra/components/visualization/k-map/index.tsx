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
      <div className={className}>
        <div className="p-4 text-center text-muted-foreground">Expression needed for K-Map.</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <div className="mt-4 p-4 border rounded border-dashed text-center text-destructive-foreground bg-destructive/10">
          Error generating K-Map: {error}
        </div>
      </div>
    )
  }

  if (numVars < 2 || numVars > 4) {
    return (
      <div className={className}>
        <div className="mt-4 p-4 border rounded border-dashed text-center text-destructive-foreground bg-destructive/10">
          K-Map generation currently supports 2 to 4 variables. Detected {numVars} variables (
          {variables.join(', ') || 'None'}). Please provide a valid boolean expression with 2 to 4
          unique variables (A-Z).
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} rounded-lg border shadow-sm p-6`}>
      <div className="space-y-4">
        {/* Header section */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">Karnaugh Map</h3>
          <p className="text-sm text-gray-600">
            Visual tool for Boolean simplification with {numVars} variables ({variables.join(', ')})
            and {mintermSet.size} minterms
          </p>
        </div>

        {/* Main K-Map grid */}
        <KMapGrid
          config={kMapConfig}
          mintermSet={mintermSet}
          groups={groups}
          showMintermNumbers={true}
        />

        {/* Legend */}
        <div className="pt-3 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Group Legend</h4>
          <KMapLegend />
          <p className="text-xs text-gray-500 mt-3">
            Each group represents a term in the simplified boolean expression. Larger groups (more
            cells) result in simpler terms.
          </p>
        </div>

        {/* Info on cell count */}
        <div className="text-center text-sm text-gray-600 mt-2">
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
    </div>
  )
}
