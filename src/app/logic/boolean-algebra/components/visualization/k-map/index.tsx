'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { ExpressionParser } from '../../../engine'
import { latexToBoolean } from '@/components/KatexFormula'
import { KarnaughMapProps, KMapResult, KMapResultSuccess } from './types'
import {
  createKMapConfig,
  evaluateExpression,
  extractVariablesFromTree,
  generateMultiKMaps,
} from './KMapEngine'
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
  CardAction,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Maximize, Minimize } from 'lucide-react'

export function KarnaughMap({ expression, className = '' }: KarnaughMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  const kmapResult = useMemo<KMapResult>(() => {
    if (!expression) {
      return {
        status: 'waiting',
        message: 'Enter an expression and click Simplify to generate a Karnaugh Map.',
      }
    }

    try {
      const booleanExpr = latexToBoolean(expression)
      const expressionTree = ExpressionParser.parse(booleanExpr)
      const variables = extractVariablesFromTree(expressionTree)
      if (variables.length < 2 || variables.length > 5) {
        return {
          status: 'error',
          variables,
          message: `K-Map generation currently supports 2 to 5 variables. Detected ${variables.length} variables (${variables.join(', ') || 'None'}).`,
          details:
            variables.length > 0
              ? `Please provide a valid boolean expression with 2 to 5 unique variables [A-Z].`
              : `No variables detected. Please ensure your expression contains 2 to 5 unique variables [A-Z].`,
        }
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

        return {
          status: 'success',
          allVariables: variables,
          expressionTree,
          maps: mapsWithGroups,
          isMultiMap: true,
        } as KMapResultSuccess
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
          return {
            status: 'error',
            variables,
            message: 'Error evaluating expression values.',
            details: error instanceof Error ? error.message : String(error),
          }
        }
      }
      const kMapConfig = createKMapConfig(variables)
      const groups = detectGroups(mintermSet, kMapConfig.kMapOrder, numVars)
      return {
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
      } as KMapResultSuccess
    } catch (error) {
      return {
        status: 'error',
        message: 'Error generating Karnaugh Map.',
        details: error instanceof Error ? error.message : 'Invalid expression format',
      }
    }
  }, [expression])

  const fullscreenCardClasses = isFullscreen
    ? `fixed inset-0 z-[9999] w-screen h-screen bg-background p-4 sm:p-6 flex flex-col ${className}`.trim()
    : `${className} w-full h-fit`.trim()
  const fullscreenContentClasses = isFullscreen ? 'flex-grow overflow-y-auto pt-0' : ''
  const baseContentClasses = 'pt-4'

  const cardTitle = 'Karnaugh Map'
  const defaultCardDescription = 'Visualization limited to 2-5 variables'

  const renderHeaderContent = () => (
    <>
      <CardTitle>{cardTitle}</CardTitle>
      {isFullscreen ? (
        kmapResult.status === 'waiting' ? (
          <CardDescription>{defaultCardDescription}</CardDescription>
        ) : kmapResult.status === 'error' ? (
          <CardDescription className="text-destructive">{kmapResult.message}</CardDescription>
        ) : (
          <CardDescription>{defaultCardDescription}</CardDescription>
        )
      ) : kmapResult.status === 'success' ? (
        <CardDescription>
          Visual tool for Boolean simplification with {kmapResult.allVariables.length}
          variables ({kmapResult.allVariables.join(', ')})
          {kmapResult.maps.length > 0 && ` and ${kmapResult.maps[0].mintermSet.size} minterms`}
          {kmapResult.isMultiMap && ` (Split into ${kmapResult.maps.length} maps)`}
        </CardDescription>
      ) : kmapResult.status === 'waiting' ? (
        <CardDescription>{defaultCardDescription}</CardDescription>
      ) : (
        <CardDescription>{defaultCardDescription}</CardDescription>
      )}
    </>
  )

  const renderKMapContent = () => {
    if (kmapResult.status === 'waiting') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-md min-h-[15rem]">
          <div className="text-center max-w-md">
            <p className="text-sm">Enter an expression to generate a Karnaugh Map.</p>
            <p className="text-sm mt-2">K-Map generation supports 2 to 5 variables.</p>
          </div>
        </div>
      )
    }

    if (kmapResult.status === 'error') {
      return (
        <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center h-full min-h-[15rem] text-center">
          <div className="text-center max-w-md">
            <p className="mb-2 text-base font-medium">
              K-Map generation currently supports 2 to 5 variables. Detected
              {kmapResult.variables?.length || 0} variables.
            </p>
            {kmapResult.variables && (
              <p className="text-sm">Detected variables: {kmapResult.variables.join(', ')}</p>
            )}
            <p className="text-sm mt-2">
              Please provide a valid boolean expression with 2 to 5 unique variables [A-Z].
            </p>
          </div>
        </div>
      )
    }

    const { maps, isMultiMap } = kmapResult as KMapResultSuccess

    if (isMultiMap) {
      // Use flex layout for multi-map display
      return (
        <div className="w-full flex flex-col items-center">
          <div
            className={`flex flex-col ${isFullscreen ? 'flex-row space-x-6' : 'space-y-2'} w-full`}
          >
            {maps.map((mapData, index) => (
              <div key={index} className="flex-1 border rounded-lg p-4 min-w-0">
                <h3 className="text-lg font-semibold mb-3 text-center">{mapData.title}</h3>
                <KMapGrid
                  config={mapData.kMapConfig}
                  mintermSet={mapData.mintermSet}
                  groups={mapData.groups}
                  showMintermNumbers={true}
                />
              </div>
            ))}
          </div>
          {/* Add shared legend below the maps */}
          <div className="mt-4 w-full border-t pt-4">
            <h4 className="text-sm font-medium text-center mb-2">Group Legend</h4>
            <KMapLegend className="justify-center" />
            <p className="text-xs text-muted-foreground text-center mt-2 max-w-md mx-auto">
              Each group represents a term in the simplified boolean expression. Larger groups (more
              cells) result in simpler terms.
            </p>
          </div>
        </div>
      )
    }

    // Single map rendering (existing logic)
    const mainMap = maps[0]

    return (
      <>
        <KMapGrid
          config={mainMap.kMapConfig}
          mintermSet={mainMap.mintermSet}
          groups={mainMap.groups}
          showMintermNumbers={true}
        />
        <CardFooter
          className={`flex-col items-center w-full ${isFullscreen ? 'pt-4 mt-auto' : 'border-t mt-4'}`}
        >
          {/* Container for Legend + Text + Stats */}
          <div className="w-full">
            {/* Top section: Legend and Text */}
            <div
              className={`w-full mb-4 ${isFullscreen ? 'flex flex-col items-center gap-4' : 'space-y-3'}`}
            >
              {/* Legend Block */}
              <div className={`${isFullscreen ? 'space-y-2' : 'space-y-2'}`}>
                {/* Consistent spacing */}
                <h4 className="text-sm font-medium text-foreground">Group Legend</h4>
                {/* KMapLegend uses flex-wrap internally */}
                <KMapLegend className={`${isFullscreen ? 'justify-start' : 'justify-center'}`} />

                <p
                  className={`text-xs text-muted-foreground ${
                    isFullscreen ? 'md:text-left md:max-w-xs' : 'text-left'
                  }`}
                >
                  Each group represents a term in the simplified boolean expression. Larger groups
                  (more cells) result in simpler terms.
                </p>
              </div>
            </div>

            {/* Bottom section: Statistics */}
            <div
              className={`w-full text-center text-sm text-muted-foreground border-t pt-3 ${
                isFullscreen ? 'mt-auto' : ''
              }`}
            >
              {mainMap.variables.length > 0 && (
                <p className="font-medium">
                  2<sup>{mainMap.variables.length}</sup> = {Math.pow(2, mainMap.variables.length)}
                  cells
                </p>
              )}
              {mainMap.mintermSet.size > 0 && (
                <p>
                  with {mainMap.mintermSet.size} minterms (
                  {(
                    (mainMap.mintermSet.size / Math.pow(2, mainMap.variables.length)) *
                    100
                  ).toFixed(1)}
                  %)
                </p>
              )}
            </div>
          </div>
        </CardFooter>
      </>
    )
  }

  return (
    <>
      {isFullscreen && <div className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"></div>}
      <Card className={fullscreenCardClasses}>
        <CardHeader>
          {renderHeaderContent()}
          <CardAction>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="flex-shrink-0"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent
          className={`${isFullscreen ? fullscreenContentClasses : baseContentClasses} ${kmapResult.status === 'success' && kmapResult.isMultiMap && !isFullscreen ? 'flex' : ''} ${kmapResult.status !== 'success' ? 'flex items-center justify-center' : ''}`}
        >
          {renderKMapContent()}
        </CardContent>
      </Card>
    </>
  )
}
