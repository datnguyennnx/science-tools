'use client'

import { useState, useEffect } from 'react'
import { ExpressionParser, evaluateExpression } from '../../engine'
import { latexToBoolean } from '@/components/KatexFormula'
import { KMapResult, KMapResultSuccess } from '../visualization/k-map/types'
import { createKMapConfig, generateMultiKMaps } from '../visualization/k-map/KMapEngine'
import { extractVariablesFromTree } from '../visualization/utils/ExpressionUtils'
import { detectGroups } from '../visualization/k-map/KMapGroupDetector'

export function useKMapGeneration(expression: string): KMapResult {
  const [result, setResult] = useState<KMapResult>({
    status: 'waiting',
    message: 'Enter an expression and click Simplify to generate a Karnaugh Map.',
  })

  useEffect(() => {
    if (!expression) {
      setResult({
        status: 'waiting',
        message: 'Enter an expression and click Simplify to generate a Karnaugh Map.',
      })
      return
    }

    try {
      const booleanExpr = latexToBoolean(expression)
      const expressionTree = ExpressionParser.parse(booleanExpr)
      const variables = extractVariablesFromTree(expressionTree)

      if (variables.length < 2 || variables.length > 5) {
        setResult({
          status: 'error',
          variables,
          message: `K-Map generation currently supports 2 to 5 variables. Detected ${variables.length} variables (${variables.join(', ') || 'None'}).`,
          details:
            variables.length > 0
              ? `Please provide a valid boolean expression with 2 to 5 unique variables [A-Z].`
              : `No variables detected. Please ensure your expression contains 2 to 5 unique variables [A-Z].`,
        })
        return
      }

      if (variables.length === 5) {
        const multiMaps = generateMultiKMaps(expressionTree, variables, 4)

        const mapsWithGroups = multiMaps.map(mapData => ({
          ...mapData,
          kMapConfig: mapData.config,
          groups: detectGroups(
            mapData.mintermSet,
            mapData.config.kMapOrder,
            mapData.variables.length
          ),
        }))

        setResult({
          status: 'success',
          allVariables: variables,
          expressionTree,
          maps: mapsWithGroups,
          isMultiMap: true,
        } as KMapResultSuccess)
        return
      }

      const mintermSet = new Set<number>()
      const numVars = variables.length
      const maxValue = 1 << numVars
      for (let i = 0; i < maxValue; i++) {
        const variableValues: Record<string, boolean> = {}
        for (let j = 0; j < numVars; j++) {
          variableValues[variables[j]] = ((i >> (numVars - 1 - j)) & 1) === 1
        }
        try {
          const result = evaluateExpression(expressionTree, variableValues)
          if (result) {
            let mintermIndex = 0
            for (let j = 0; j < numVars; j++) {
              if (variableValues[variables[j]]) {
                mintermIndex |= 1 << (numVars - 1 - j)
              }
            }
            mintermSet.add(mintermIndex)
          }
        } catch (error) {
          setResult({
            status: 'error',
            variables,
            message: 'Error evaluating expression values.',
            details: error instanceof Error ? error.message : String(error),
          })
          return
        }
      }

      const kMapConfig = createKMapConfig(variables)
      const groups = detectGroups(mintermSet, kMapConfig.kMapOrder, numVars)

      setResult({
        status: 'success',
        allVariables: variables,
        expressionTree,
        maps: [
          {
            variables,
            mintermSet,
            kMapConfig,
            groups,
            title: `K-Map for ${variables.join(', ')}`,
            fixedVariables: {},
          },
        ],
        isMultiMap: false,
      } as KMapResultSuccess)
    } catch (error) {
      setResult({
        status: 'error',
        message: 'Error generating Karnaugh Map.',
        details: error instanceof Error ? error.message : 'Invalid expression format',
      })
    }
  }, [expression])

  return result
}
