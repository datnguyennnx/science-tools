'use client'

import React from 'react'
import { useFullscreen } from '../../hooks/useFullscreen'
import { useVennDiagramGeneration } from '../../hooks/useVennDiagramGeneration'
import { VennDiagramContent } from './VennDiagramContent'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Maximize, Minimize } from 'lucide-react'
import type { VennDiagramProps } from './types'

export const VennDiagram = ({ expression, className = '' }: VennDiagramProps) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const vennDiagramResult = useVennDiagramGeneration(expression)

  // Define base and fullscreen classes
  const baseCardClasses = `${className} w-full h-fit`
  const fullscreenCardClasses =
    `ba-bg-background fixed inset-0 z-[9999] w-screen h-screen p-4 sm:p-6 flex flex-col ${className}`.trim()

  // Define base and fullscreen classes for the content area
  const baseContentClasses = 'pt-4' // Basic padding for normal mode
  const fullscreenContentClasses = 'flex-grow flex flex-col overflow-y-auto pt-0' // Simplified for better child layout control

  const cardTitle = 'Venn Diagram'

  const renderHeaderContent = () => (
    <>
      <CardTitle className={isFullscreen ? 'ba-text-foreground font-bold' : ''}>
        {cardTitle}
      </CardTitle>
      <CardDescription className={isFullscreen ? 'ba-text-muted' : ''}>
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

  return (
    <>
      {isFullscreen && (
        <div className="ba-fullscreen fixed inset-0 z-[9998] backdrop-blur-sm"></div>
      )}
      <Card className={isFullscreen ? fullscreenCardClasses : baseCardClasses}>
        <CardHeader>
          {renderHeaderContent()}
          <CardAction>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className={`flex-shrink-0 ${isFullscreen ? 'ba-text-foreground hover:ba-text-accent' : ''}`}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className={isFullscreen ? fullscreenContentClasses : baseContentClasses}>
          <VennDiagramContent vennDiagramResult={vennDiagramResult} isFullscreen={isFullscreen} />
        </CardContent>
      </Card>
    </>
  )
}
