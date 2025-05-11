'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { ExpressionParser } from '../../../engine'
import { latexToBoolean } from '@/components/KatexFormula'
import { KarnaughMapProps, KMapResult, KMapResultSuccess } from './types'
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
      if (variables.length < 2 || variables.length > 4) {
        return {
          status: 'error',
          variables,
          message: `K-Map generation currently supports 2 to 4 variables. Detected ${variables.length} variables (${variables.join(', ') || 'None'}).`,
          details: 'Please provide a valid boolean expression with 2 to 4 unique variables (A-Z).',
        }
      }
      const mintermSet = new Set<number>()
      const numVars = variables.length
      const maxValue = 1 << numVars
      for (let i = 0; i < maxValue; i++) {
        const variableValues: Record<string, boolean> = {}
        for (let j = 0; j < numVars; j++) {
          variableValues[variables[j]] = ((i >> j) & 1) === 1
        }
        try {
          const result = evaluateExpression(expressionTree, variableValues)
          if (result) {
            mintermSet.add(i)
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
        variables,
        expressionTree,
        mintermSet,
        kMapConfig,
        groups,
        numVars,
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

  const cardTitle = 'Karnaugh Map'
  const defaultCardDescription = 'Visualization limited to 2-4 variables'

  const renderHeaderContent = () => (
    <>
      <CardTitle>{cardTitle}</CardTitle>
      {isFullscreen ? (
        kmapResult.status === 'success' ? (
          <CardDescription>For: {latexToBoolean(expression)}</CardDescription>
        ) : kmapResult.status === 'waiting' ? (
          <CardDescription>{defaultCardDescription}</CardDescription>
        ) : kmapResult.status === 'error' ? (
          <CardDescription className="text-destructive">{kmapResult.message}</CardDescription>
        ) : (
          <CardDescription>{defaultCardDescription}</CardDescription>
        )
      ) : kmapResult.status === 'success' ? (
        <CardDescription>
          Visual tool for Boolean simplification with {kmapResult.numVars} variables (
          {kmapResult.variables.join(', ')}) and {kmapResult.mintermSet.size} minterms
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
        <div
          className={`w-full h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md`}
        >
          <div className="text-center max-w-md">
            <p className={`text-sm ${isFullscreen ? 'text-foreground' : 'text-muted-foreground'}`}>
              {kmapResult.message}
            </p>
          </div>
        </div>
      )
    }

    if (kmapResult.status === 'error') {
      return (
        <div className="border border-dashed rounded-md p-6 flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <p
              className={`mb-2 text-sm font-medium ${isFullscreen ? 'text-destructive-foreground' : 'text-destructive'}`}
            >
              {kmapResult.message}
            </p>
            {kmapResult.variables && (
              <p
                className={`text-sm ${isFullscreen ? 'text-destructive-foreground/80' : 'text-muted-foreground'}`}
              >
                Detected variables:{' '}
                <span className="font-medium">{kmapResult.variables.join(', ')}</span>
              </p>
            )}
            {kmapResult.details && (
              <p
                className={`text-xs mt-1 ${isFullscreen ? 'text-destructive-foreground/70' : 'text-muted-foreground'}`}
              >
                {kmapResult.details}
              </p>
            )}
          </div>
        </div>
      )
    }

    const { mintermSet, kMapConfig, groups, numVars } = kmapResult as KMapResultSuccess

    return (
      <>
        <KMapGrid
          config={kMapConfig}
          mintermSet={mintermSet}
          groups={groups}
          showMintermNumbers={true}
        />
        <CardFooter
          className={`flex-col items-start ${isFullscreen ? 'pt-4 mt-auto' : 'border-t mt-4'}`}
        >
          <div className="w-full space-y-3">
            <h4 className="text-sm font-medium text-foreground">Group Legend</h4>
            <KMapLegend />
            <p className="text-xs text-muted-foreground">
              Each group represents a term in the simplified boolean expression. Larger groups (more
              cells) result in simpler terms.
            </p>
            <div className="text-center text-sm text-muted-foreground pt-2">
              <p className="font-medium">
                2<sup>{numVars}</sup> = {Math.pow(2, numVars)} cells
              </p>
              {mintermSet.size > 0 && (
                <p>
                  {' '}
                  with {mintermSet.size} minterms (
                  {((mintermSet.size / Math.pow(2, numVars)) * 100).toFixed(1)}%)
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
        <CardHeader className="pb-2">
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
          className={`${fullscreenContentClasses} ${kmapResult.status !== 'success' ? 'flex items-center justify-center' : ''}`}
        >
          {renderKMapContent()}
        </CardContent>
      </Card>
    </>
  )
}
