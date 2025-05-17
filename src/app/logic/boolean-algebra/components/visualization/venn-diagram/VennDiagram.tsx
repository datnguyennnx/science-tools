'use client'

import { useMemo, useState, useCallback } from 'react'
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
  extractVariablesFromTree,
  evaluate2VarVenn,
  evaluate3VarVenn,
  evaluate4VarVenn,
  evaluate5VarVenn,
  VennData,
  VennData5Vars,
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
  // Define base legend data for different variable counts
  let legendData: { color: string; label: string }[] = []

  if (numVars === 2) {
    legendData = [
      { color: 'var(--venn-region-a)', label: `${variables[0]} only` },
      { color: 'var(--venn-region-b)', label: `${variables[1]} only` },
      { color: 'var(--venn-region-intersection)', label: `${variables[0]} ∩ ${variables[1]}` },
    ]
  } else if (numVars === 3) {
    legendData = [
      { color: 'var(--venn-region-a)', label: `${variables[0]} only` },
      { color: 'var(--venn-region-b)', label: `${variables[1]} only` },
      { color: 'var(--venn-region-c)', label: `${variables[2]} only` },
      {
        color: 'var(--venn-region-intersection)',
        label: `${variables[0]} ∩ ${variables[1]} ∩ ${variables[2]}`,
      },
    ]
  } else if (numVars === 4 || numVars === 5) {
    // For 4 and 5 variables (which use the same color scheme for the 4-var diagram part)
    const colorLabels = [
      { color: 'var(--color-chart-1)', label: 'Region A' },
      { color: 'var(--color-chart-2)', label: 'Region B' },
      { color: 'var(--color-chart-3)', label: 'Region C' },
      { color: 'var(--color-chart-4)', label: 'Region D' },
      { color: 'var(--color-chart-5)', label: 'Intersections' },
    ]

    legendData = colorLabels

    // For 5 variables, add a note about the dual diagram approach
    if (numVars === 5) {
      legendData.push({
        color: 'var(--venn-border)',
        label: `Diagram split by ${variables[4]} value`,
      })
    }
  }

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

export const VennDiagram = ({ expression, className = '' }: VennDiagramProps) => {
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

    const originalExpression = expression // Keep original for display - Use const

    try {
      const booleanExprStr = latexToBoolean(expression) // Convert LaTeX to standard string first
      const expressionTree = ExpressionParser.parse(booleanExprStr)
      const variables = extractVariablesFromTree(expressionTree)
      const numVars = variables.length

      if (numVars === 0) {
        return {
          status: 'error',
          variables,
          message: `Constant expression found.`,
          details:
            'Venn diagrams require variables. Constant expressions (0 or 1) are always true or false.',
        }
      }

      if (numVars < 2 || numVars > 5) {
        return {
          status: 'error',
          variables,
          message: `Venn Diagrams support 2 to 5 variables. Detected ${numVars}.`,
          details:
            variables.length > 0
              ? `Variables found: ${variables.join(', ')}. Use 2-5 unique variables [A-Z].`
              : `No variables found. Use a valid boolean expression with 2-5 variables [A-Z].`,
        }
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
        return {
          status: 'error',
          variables,
          message: 'Failed to generate data for Venn Diagram.',
          details: error instanceof Error ? error.message : 'Evaluation process failed.',
        }
      }

      return {
        status: 'success',
        variables,
        expressionTree,
        vennData,
        numVars,
        originalExpression, // Store original expression
      } as VennDiagramResultSuccess
    } catch (error) {
      return {
        status: 'error',
        message: 'Error processing expression.',
        details:
          error instanceof Error ? error.message : 'Invalid expression format or internal error.',
      }
    }
  }, [expression])

  // Define base and fullscreen classes
  const baseCardClasses = `${className} w-full h-fit`
  const fullscreenCardClasses =
    `fixed inset-0 z-[9999] w-screen h-screen bg-background p-4 sm:p-6 flex flex-col ${className}`.trim()

  // Define base and fullscreen classes for the content area
  const baseContentClasses = 'pt-4' // Basic padding for normal mode
  const fullscreenContentClasses = 'flex-grow flex flex-col overflow-y-auto pt-0' // Simplified for better child layout control

  const cardTitle = 'Venn Diagram'

  const renderHeaderContent = () => (
    <>
      <CardTitle className={isFullscreen ? 'text-foreground font-bold' : ''}>{cardTitle}</CardTitle>
      {/* Simplified Description - Expression moved below */}
      <CardDescription className={isFullscreen ? 'text-muted-foreground' : ''}>
        {
          vennDiagramResult.status === 'success'
            ? `Visual representation for ${vennDiagramResult.numVars} variables: ${vennDiagramResult.variables.join(', ')}`
            : vennDiagramResult.status === 'error'
              ? vennDiagramResult.message // Show error message here
              : 'Enter an expression to generate.' // Waiting message
        }
      </CardDescription>
    </>
  )

  const renderVennDiagramContent = () => {
    // Define classes based on fullscreen state
    const rootContentDivClass = isFullscreen
      ? 'w-full max-w-6xl max-h-[calc(100vh-10rem)] flex flex-col items-center justify-center ' // Fullscreen: constrained, centered, padding inside
      : 'w-full h-full flex flex-col items-center justify-start ' // Normal: fill container, start alignment, top padding

    if (vennDiagramResult.status === 'waiting' || vennDiagramResult.status === 'error') {
      // Keep existing waiting/error states rendering as before
      if (vennDiagramResult.status === 'waiting') {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-md min-h-[15rem]">
            <p className="text-sm">Enter an expression to generate a Venn Diagram.</p>
            <p className="text-sm mt-2">Venn Diagrams support 2 to 5 variables.</p>
          </div>
        )
      }
      // Error state rendering
      return (
        <div className="border-2 border-dashed rounded-md flex flex-col items-center justify-center h-full p-6 min-h-[15rem] text-center">
          <p className="mb-2 text-base font-medium">
            {/* Display specific error message from result */}
            {vennDiagramResult.message}
          </p>
          {vennDiagramResult.details && (
            <p className="text-sm mt-1 text-muted-foreground">{vennDiagramResult.details}</p>
          )}
          {vennDiagramResult.variables && vennDiagramResult.variables.length > 0 && (
            <p className="text-sm mt-2">
              Detected variables: {vennDiagramResult.variables.join(', ')}
            </p>
          )}
        </div>
      )
    }

    // --- Success State Rendering ---
    const { variables, vennData, numVars /*, originalExpression */ } =
      vennDiagramResult as VennDiagramResultSuccess // Removed originalExpression

    // Common structure for success state
    const renderSuccessContent = (diagramContent: React.ReactNode) => (
      <div className={rootContentDivClass}>
        {/* Diagram(s) */}
        {diagramContent}

        {/* Legend */}
        <VennLegend variables={variables} numVars={numVars} />

        {/* Footer */}
        <CardFooter className="mt-auto pt-4 border-t w-full flex flex-col items-center">
          <p className="text-xs text-muted-foreground text-center">
            {numVars === 5
              ? `Diagram for ${numVars} variables: ${variables.join(', ')}. Displaying two 4-variable diagrams, one for each value of ${(vennData as VennData5Vars).E_name}.`
              : `Diagram for ${numVars} variables: ${variables.join(', ')}. Highlighted regions represent areas where the expression is true.`}
          </p>
        </CardFooter>
      </div>
    )

    // --- Specific Diagram Layouts ---

    if (numVars === 5) {
      const fiveVarData = vennData as VennData5Vars
      const diagramContent = (
        <div className="w-full flex-grow flex flex-col items-center justify-center">
          <div className="w-full pb-2 text-center">
            <p className="text-sm font-medium">5-Variable Venn Diagram</p>
          </div>
          <div
            className={`flex ${isFullscreen ? 'flex-row space-x-4' : 'flex-col space-y-4'} w-full max-w-4xl mx-auto flex-grow`}
          >
            {/* Diagram E=1 */}
            <div className="flex-1 border rounded-md p-2 flex flex-col items-center min-w-0">
              <h4 className="text-sm font-medium text-center mb-2">
                When {fiveVarData.E_name} = 1
              </h4>
              <div className="w-full h-full">
                <VennDiagramSVG
                  variables={variables.slice(0, 4)}
                  vennData={fiveVarData.whenEIsTrue}
                />
              </div>
            </div>
            {/* Diagram E=0 */}
            <div className="flex-1 border rounded-md p-2 flex flex-col items-center min-w-0">
              <h4 className="text-sm font-medium text-center mb-2">
                When {fiveVarData.E_name} = 0
              </h4>
              <div className="w-full h-full">
                <VennDiagramSVG
                  variables={variables.slice(0, 4)}
                  vennData={fiveVarData.whenEIsFalse}
                />
              </div>
            </div>
          </div>
        </div>
      )
      return renderSuccessContent(diagramContent)
    } else {
      // Layout for 2-4 variables
      const diagramContent = (
        <div className="w-full flex-grow flex items-center justify-center">
          <VennDiagramSVG variables={variables} vennData={vennData} />
        </div>
      )
      return renderSuccessContent(diagramContent)
    }
  }

  return (
    <>
      {isFullscreen && <div className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"></div>}
      <Card className={isFullscreen ? fullscreenCardClasses : baseCardClasses}>
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
        <CardContent className={isFullscreen ? fullscreenContentClasses : baseContentClasses}>
          {renderVennDiagramContent()}
        </CardContent>
      </Card>
    </>
  )
}
