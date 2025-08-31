'use client'

import React from 'react'
import { useFullscreen } from '../../hooks/useFullscreen'
import { useTruthTableGeneration } from '../../hooks/useTruthTableGeneration'
import { TruthTableContent } from './TruthTableContent'
import { booleanToLatex } from '@/components/KatexFormula'
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
import type { TruthTableProps } from './types'

export function TruthTable({ expression, variables: propVariables }: TruthTableProps) {
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const tableData = useTruthTableGeneration(expression, propVariables)

  // Fullscreen styles - Increase z-index for testing
  const fullscreenCardClasses = isFullscreen
    ? 'ba-bg-background fixed inset-0 z-[9999] w-screen h-screen p-4 sm:p-6 flex flex-col' // Use centralized background
    : 'w-full h-fit '
  const fullscreenContentClasses = isFullscreen ? 'flex-grow overflow-y-auto' : ''

  return (
    <>
      {isFullscreen && (
        <div className="ba-fullscreen fixed inset-0 z-[9998] backdrop-blur-sm"></div>
      )}
      <Card className={fullscreenCardClasses}>
        <CardHeader className="pb-2">
          <CardTitle className={isFullscreen ? 'ba-text-foreground font-bold' : ''}>
            Truth Table
          </CardTitle>
          <CardDescription className={isFullscreen ? 'ba-text-muted' : ''}>
            {tableData.status === 'waiting'
              ? 'Shows outputs for all input combinations.'
              : tableData.status === 'error'
                ? 'Cannot generate table. Check expression syntax.' // Updated error description
                : isFullscreen && tableData.status === 'success'
                  ? `For: ${booleanToLatex(tableData.rawInput)}`
                  : 'Evaluation for all possible inputs'}
          </CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className={isFullscreen ? 'ba-text-foreground hover:ba-text-accent' : ''}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className={fullscreenContentClasses}>
          <TruthTableContent tableData={tableData} isFullscreen={isFullscreen} />
        </CardContent>
      </Card>
    </>
  )
}
