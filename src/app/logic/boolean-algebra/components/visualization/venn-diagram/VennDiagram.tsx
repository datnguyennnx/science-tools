'use client'

import React, { useMemo, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Maximize, Minimize } from 'lucide-react'
import { ExpressionParser } from '../../../engine' // Adjusted path
import { latexToBoolean } from '@/components/KatexFormula'

import {
  extractVariablesFromTree, // Reused from KMapEngine via VennDiagramEngine
  generateVennData,
  VennData,
} from './VennDiagramEngine'
import { VennDiagramSVG } from './VennDiagramSVG'
import type { BooleanExpression } from '../../../engine' // Type import

export interface VennDiagramProps {
  expression: string
  className?: string
}

export type VennDiagramResultStatus = 'waiting' | 'error' | 'success'

export type VennDiagramResultWaiting = {
  status: 'waiting'
  message: string
}

export type VennDiagramResultError = {
  status: 'error'
  message: string
  details?: string
  variables?: string[] // Variables detected before error
}

export interface VennDiagramResultSuccess {
  status: 'success'
  variables: string[]
  expressionTree: BooleanExpression
  vennData: VennData
  numVars: number
  originalExpression: string // Store the expression used for this result
}

export type VennDiagramResultType = // Renamed from VennDiagramResult to avoid conflict with interface
  VennDiagramResultWaiting | VennDiagramResultError | VennDiagramResultSuccess

function VennLegend({ variables, numVars }: { variables: string[]; numVars: number }) {
  const legendData =
    numVars === 2
      ? [
          { color: 'var(--venn-region-a)', label: `${variables[0]} only` },
          { color: 'var(--venn-region-b)', label: `${variables[1]} only` },
          { color: 'var(--venn-region-intersection)', label: `${variables[0]} ∩ ${variables[1]}` },
        ]
      : [
          { color: 'var(--venn-region-a)', label: `${variables[0]} only` },
          { color: 'var(--venn-region-b)', label: `${variables[1]} only` },
          { color: 'var(--venn-region-c)', label: `${variables[2]} only` },
          {
            color: 'var(--venn-region-intersection)',
            label: `${variables[0]} ∩ ${variables[1]} ∩ ${variables[2]}`,
          },
        ]
  return (
    <div className="flex flex-row flex-wrap gap-3 items-center justify-center mt-2 mb-1 text-xs">
      {legendData.map(item => (
        <div key={item.label} className="flex items-center gap-1">
          <span
            style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              background: item.color,
              borderRadius: 3,
              border: '1.5px solid var(--venn-border)',
              opacity: 0.5,
              marginRight: 4,
            }}
            aria-label={item.label}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export const VennDiagram: React.FC<VennDiagramProps> = ({ expression, className = '' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  const vennDiagramResult = useMemo<VennDiagramResultType>(() => {
    if (!expression || !expression.trim()) {
      return {
        status: 'waiting',
        message: 'Enter an expression to generate a Venn Diagram.',
      }
    }

    try {
      const booleanExprStr = latexToBoolean(expression) // Convert LaTeX to standard string first
      const expressionTree = ExpressionParser.parse(booleanExprStr)
      const variables = extractVariablesFromTree(expressionTree)
      const numVars = variables.length

      if (numVars === 0) {
        // Handle constant expressions like "1" or "0"
        // For "1", all regions including Neither are true. For "0", all are false.
        // This is a special case for Venn diagrams.
        // Let's treat "1" as universal set active, "0" as empty set.
        // This requires careful thought on how generateVennData handles it.
        // For now, we can return an error or a specific message for constants.
        return {
          status: 'error',
          variables,
          message: `Constant expression \'${expression}\' found.`,
          details:
            'Venn diagrams visualize variable relationships. Constant expressions (like 0 or 1) do not have variables to depict in this way. The truth value is either always true or always false across the entire domain.',
        }
      }

      if (numVars < 2 || numVars > 3) {
        // K-Map supports 2-4, Venn is best for 2-3.
        return {
          status: 'error',
          variables,
          message: `Venn Diagrams support 2 or 3 variables. Detected ${numVars}.`,
          details: `Variables found: ${variables.join(', ') || 'None'}. Please use an expression with 2 or 3 unique variables (A-Z).`,
        }
      }

      const vennData = generateVennData(expressionTree, variables)

      if (!vennData) {
        // Should not happen if numVars is 2 or 3, but as a safeguard
        return {
          status: 'error',
          variables,
          message: 'Failed to generate data for Venn Diagram.',
          details:
            'The number of variables might be unsupported by the current engine configuration.',
        }
      }

      return {
        status: 'success',
        variables,
        expressionTree,
        vennData,
        numVars,
        originalExpression: expression, // Store it
      } as VennDiagramResultSuccess // Ensure type assertion if all fields are present
    } catch (error) {
      return {
        status: 'error',
        message: 'Error processing expression for Venn Diagram.',
        details:
          error instanceof Error ? error.message : 'Invalid expression format or internal error.',
      }
    }
  }, [expression])

  const fullscreenCardClasses = isFullscreen
    ? `fixed inset-0 z-[9999] w-screen h-screen bg-background p-4 sm:p-6 flex flex-col ${className}`.trim()
    : `${className} w-full h-fit`.trim()
  const fullscreenContentClasses = isFullscreen ? 'flex-grow overflow-y-auto pt-0' : ''

  const cardTitle = 'Venn Diagram'
  const defaultCardDescription = 'Visual representation of boolean sets (2-3 variables).'

  const renderHeaderContent = () => (
    <>
      <CardTitle className={isFullscreen ? 'text-foreground font-bold' : ''}>{cardTitle}</CardTitle>
      <CardDescription className={isFullscreen ? 'text-muted-foreground' : ''}>
        {vennDiagramResult.status === 'success'
          ? `For expression: ${vennDiagramResult.originalExpression}` // Show original for clarity
          : vennDiagramResult.message || defaultCardDescription}
      </CardDescription>
    </>
  )

  const renderVennDiagramContent = () => {
    if (vennDiagramResult.status === 'waiting') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md min-h-[15rem]">
          <p className={`text-sm ${isFullscreen ? 'text-foreground' : 'text-muted-foreground'}`}>
            {vennDiagramResult.message}
          </p>
        </div>
      )
    }

    if (vennDiagramResult.status === 'error') {
      return (
        <div className="border border-dashed border-destructive rounded-md flex flex-col items-center justify-center h-full p-6 min-h-[15rem]">
          <p
            className={`mb-1 text-sm font-medium ${isFullscreen ? 'text-destructive-foreground' : 'text-destructive'}`}
          >
            {vennDiagramResult.message}
          </p>
          {vennDiagramResult.variables && vennDiagramResult.variables.length > 0 && (
            <p
              className={`text-xs mt-1 ${isFullscreen ? 'text-destructive-foreground/70' : 'text-muted-foreground'}`}
            >
              Detected variables: {vennDiagramResult.variables.join(', ')}
            </p>
          )}
          {vennDiagramResult.details && (
            <p
              className={`text-xs mt-1 ${isFullscreen ? 'text-destructive-foreground/80' : 'text-muted-foreground'}`}
            >
              {vennDiagramResult.details}
            </p>
          )}
        </div>
      )
    }

    // Success state
    const { variables, vennData, numVars } = vennDiagramResult as VennDiagramResultSuccess
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <VennDiagramSVG variables={variables} vennData={vennData} />
        <VennLegend variables={variables} numVars={numVars} />
        {/* Optional: Footer for legend or additional info */}
        <CardFooter className="mt-4 pt-4 border-t w-full flex flex-col items-center">
          <p className="text-xs text-muted-foreground">
            Diagram for {numVars} variables: {variables.join(', ')}. Highlighted regions represent
            areas where the expression is true.
          </p>
          {/* Add more details if needed, e.g. specific region labels */}
        </CardFooter>
      </div>
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
              className={`flex-shrink-0 ${isFullscreen ? 'text-foreground hover:text-accent-foreground' : ''}`}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent
          className={`${fullscreenContentClasses} ${vennDiagramResult.status !== 'success' ? 'flex items-center justify-center' : ''} pt-4`}
        >
          {renderVennDiagramContent()}
        </CardContent>
      </Card>
    </>
  )
}
