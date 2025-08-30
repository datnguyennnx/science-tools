'use client'

import { useEffect, useRef } from 'react'
import { usePomodoro } from './engine/hooks/usePomodoro'
import { useCommands } from './engine/hooks/useCommands'
import { Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const PomodoroDialogs = dynamic(
  () => import('./components/shortcuts').then(mod => mod.PomodoroDialogs),
  {
    loading: () => null,
    ssr: false,
  }
)

const CurrentSectionDisplay = dynamic(
  () => import('./components/timeline').then(mod => mod.CurrentSectionDisplay),
  {
    loading: () => null,
    ssr: false,
  }
)

const TimerDisplay = dynamic(() => import('./components/timer').then(mod => mod.TimerDisplay), {
  loading: () => null,
  ssr: false,
})

export default function PomodoroPage() {
  const { uiState, actions: engineActions } = usePomodoro()
  const {
    commands,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isSettingsDialogOpen,
    setIsSettingsDialogOpen,
    isTimelineVisible,
    isTimerDisplayModeFull,
  } = useCommands({ engineActions, isTimerRunning: uiState.isRunning })

  const isFullScreenRef = useRef(false)

  // Handle fullscreen and document title updates
  useEffect(() => {
    if (uiState.isRunning && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      isFullScreenRef.current = true
    }

    const timeString = `${uiState.displayMinutes.toString().padStart(2, '0')}:${uiState.displaySeconds.toString().padStart(2, '0')}`
    document.title = `${timeString} - ${uiState.currentMode}`

    const handleFullScreenChange = () => {
      isFullScreenRef.current = !!document.fullscreenElement
    }
    document.addEventListener('fullscreenchange', handleFullScreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
      document.title = 'Pomodoro Timer'
    }
  }, [uiState.isRunning, uiState.displayMinutes, uiState.displaySeconds, uiState.currentMode])

  return (
    <div
      className={cn(
        'w-full min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center relative',
        isFullScreenRef.current && 'fixed inset-0 bg-background z-50 min-h-screen'
      )}
    >
      <CurrentSectionDisplay
        isVisible={isTimelineVisible}
        uiState={uiState}
        showTimeDisplay={isTimerDisplayModeFull}
      />

      <PomodoroDialogs
        commands={commands}
        isCommandPaletteOpen={isCommandPaletteOpen}
        setIsCommandPaletteOpen={setIsCommandPaletteOpen}
        isSettingsDialogOpen={isSettingsDialogOpen}
        setIsSettingsDialogOpen={setIsSettingsDialogOpen}
        currentSettings={uiState.settings}
        onUpdateSettings={engineActions.updateSettings}
      />

      <div className="w-full max-w-screen-md flex flex-col items-center px-4">
        <div
          className={cn(
            'flex flex-col items-center w-full transition-all duration-300',
            isFullScreenRef.current
          )}
        >
          <TimerDisplay
            minutes={uiState.displayMinutes}
            seconds={uiState.displaySeconds}
            progress={uiState.progressPercent}
            mode={uiState.currentMode}
            className={cn(
              'transition-all duration-500 transform',
              isFullScreenRef.current ? 'scale-350' : 'scale-300'
            )}
          />
        </div>
      </div>

      <div className="absolute bottom-4 text-muted-foreground flex items-center gap-4">
        <Keyboard className="h-4 w-4" />
        <h2>
          Press <kbd className="bg-muted px-1 border border-border">Shift + /</kbd> for commands
        </h2>
      </div>
    </div>
  )
}
