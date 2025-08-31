'use client'

import React from 'react'
import { KarnaughMapProps } from './types'
import { useKMapGeneration } from '../../hooks/useKMapGeneration'
import { useFullscreen } from '../../hooks/useFullscreen'
import { KMapHeader } from './KMapHeader'
import { KMapContent } from './KMapContent'
import { Card, CardContent, CardHeader, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Maximize, Minimize } from 'lucide-react'

export function KarnaughMap({ expression, className = '' }: KarnaughMapProps) {
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const kmapResult = useKMapGeneration(expression)

  const fullscreenCardClasses = isFullscreen
    ? `ba-bg-background fixed inset-0 z-[9999] w-screen h-screen p-4 sm:p-6 flex flex-col ${className}`.trim()
    : `${className} w-full h-full flex flex-col`.trim()
  const fullscreenContentClasses = isFullscreen ? 'flex-grow overflow-y-auto pt-0' : 'flex-grow'
  const baseContentClasses = 'pt-4 flex-grow'

  return (
    <>
      {isFullscreen && (
        <div className="ba-fullscreen fixed inset-0 z-[9998] backdrop-blur-sm"></div>
      )}
      <Card className={fullscreenCardClasses}>
        <CardHeader>
          <KMapHeader kmapResult={kmapResult} isFullscreen={isFullscreen} />
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
          <KMapContent kmapResult={kmapResult} isFullscreen={isFullscreen} />
        </CardContent>
      </Card>
    </>
  )
}
