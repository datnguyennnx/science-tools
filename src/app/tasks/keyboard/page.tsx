'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTypingEngine } from './engine/hooks/useTypingEngine'
import { Kbd } from '@/components/ui/Kbd'
import dynamic from 'next/dynamic'

const TextDisplay = dynamic(() => import('./components/TextDisplay').then(mod => mod.TextDisplay), {
  loading: () => null,
  ssr: false,
})

const MetricsDisplay = dynamic(
  () => import('./components/MetricsDisplay').then(mod => mod.MetricsDisplay),
  {
    loading: () => null,
    ssr: false,
  }
)

const ResultsSummary = dynamic(
  () => import('./components/ResultsSummary').then(mod => mod.ResultsSummary),
  {
    loading: () => null,
    ssr: false,
  }
)

// Timer component
interface TimerProps {
  formattedTime: string
  testStatus: 'pending' | 'typing' | 'finished'
  className?: string
}

function Timer({ formattedTime, testStatus, className = '' }: TimerProps) {
  if (testStatus === 'pending') {
    return null
  }
  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div className="text-2xl font-mono font-medium">{formattedTime}</div>
    </div>
  )
}

export default function KeyboardPage() {
  const {
    charStates,
    currentIndex,
    testStatus,
    metrics,
    formattedTime,
    intervals,
    resetTest,
    newTest,
    elapsedTime,
  } = useTypingEngine()

  const containerRef = useRef<HTMLDivElement>(null)

  const formattedDisplayTime = useCallback(() => {
    if (!elapsedTime) return '00:00'
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = Math.floor(elapsedTime % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [elapsedTime])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus()
    }
  }, [testStatus])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0
      const modifierKey = isMac ? event.metaKey : event.ctrlKey

      if (testStatus === 'finished') {
        if (modifierKey && event.key.toLowerCase() === 'r') {
          event.preventDefault()
          resetTest()
        } else if (modifierKey && event.key === 'Enter') {
          event.preventDefault()
          newTest()
        }
      } else if (testStatus === 'pending') {
        if (modifierKey && event.key === 'Enter') {
          event.preventDefault()
          newTest()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [testStatus, resetTest, newTest])

  return (
    <div
      ref={containerRef}
      className="focus:outline-none w-full flex flex-col flex-grow items-center py-2 md:py-4"
      tabIndex={-1}
      role="application"
      aria-label="Typing test application"
    >
      {/* Main content area */}
      <div className="flex flex-col flex-grow w-full justify-center items-center max-w-6xl">
        {testStatus === 'finished' && (
          <div className="flex flex-col gap-4 md:gap-6 w-full h-full ">
            <MetricsDisplay
              metrics={metrics}
              formattedTime={formattedTime}
              testStatus={testStatus}
            />
            <ResultsSummary metrics={metrics} formattedTime={formattedTime} intervals={intervals} />
          </div>
        )}

        {testStatus !== 'finished' && (
          <div className="flex flex-col items-center justify-center gap-4 md:gap-6 flex-grow w-full max-w-6xl">
            <div className="w-full flex-grow flex flex-col items-center justify-center space-y-4">
              <Timer
                className="w-full items-start text-amber-500"
                formattedTime={formattedDisplayTime()}
                testStatus={testStatus}
              />
              <TextDisplay
                charStates={charStates}
                currentIndex={currentIndex}
                testStatus={testStatus}
              />
            </div>
          </div>
        )}
      </div>

      {/* Shortcut hints - consistently at the bottom of the page content area */}
      <div className="w-full text-center text-muted-foreground text-xs sm:text-sm flex items-center justify-center gap-2 py-3 shrink-0 mt-auto">
        {testStatus === 'finished' && (
          <>
            <span>
              Press <Kbd>Ctrl/Cmd + R</Kbd> to Try Again
            </span>
            <span>
              or <Kbd>Ctrl/Cmd + Enter</Kbd> for New Text.
            </span>
          </>
        )}
        {testStatus === 'pending' && (
          <span>
            Start typing to begin or press <Kbd>Ctrl/Cmd + Enter</Kbd> for New Text.
          </span>
        )}
      </div>
    </div>
  )
}
