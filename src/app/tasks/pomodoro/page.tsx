'use client'

import { useEffect, useState } from 'react'
import { TimerDisplay } from './components/TimerDisplay'
import { PomodoroDialogs } from './components/KeyboardShortcuts'
import { CurrentSectionDisplay } from './components/CurrentSectionDisplay'
import { usePomodoroEngine } from './engine/hooks/usePomodoroEngine'
import { usePomodoroCommands } from './engine/hooks/usePomodoroCommands'
import { Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PomodoroPage() {
  const { uiState, actions: engineActions } = usePomodoroEngine()
  const {
    commands,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isSettingsDialogOpen,
    setIsSettingsDialogOpen,
    isTimelineVisible,
    isTimerDisplayModeFull,
  } = usePomodoroCommands({ engineActions, isTimerRunning: uiState.isRunning })

  const [isFullScreen, setIsFullScreen] = useState(false)

  // Auto-enter full screen mode when timer starts
  useEffect(() => {
    if (uiState.isRunning && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
      setIsFullScreen(true)
    }
  }, [uiState.isRunning])

  // Update document title with timer
  useEffect(() => {
    const timeString = `${uiState.displayMinutes.toString().padStart(2, '0')}:${uiState.displaySeconds.toString().padStart(2, '0')}`
    document.title = `${timeString} - ${uiState.currentMode}`
    return () => {
      document.title = 'Pomodoro Timer'
    }
  }, [uiState.displayMinutes, uiState.displaySeconds, uiState.currentMode])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
    }
  }, [])

  return (
    <div
      className={cn(
        'w-full min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center relative',
        isFullScreen && 'fixed inset-0 bg-background z-50 min-h-screen'
      )}
    >
      {/* Section Display - Top Right */}
      <CurrentSectionDisplay
        isVisible={isTimelineVisible}
        uiState={uiState}
        showTimeDisplay={isTimerDisplayModeFull}
      />

      {/* Corrected component name usage */}
      <PomodoroDialogs
        commands={commands}
        isCommandPaletteOpen={isCommandPaletteOpen}
        setIsCommandPaletteOpen={setIsCommandPaletteOpen}
        isSettingsDialogOpen={isSettingsDialogOpen}
        setIsSettingsDialogOpen={setIsSettingsDialogOpen}
        currentSettings={uiState.settings}
        onUpdateSettings={engineActions.updateSettings}
      />

      {/* Main Container */}
      <div className="w-full max-w-screen-md flex flex-col items-center px-4">
        {/* Main Timer Display */}
        <div
          className={cn(
            'flex flex-col items-center w-full transition-all duration-300',
            isFullScreen
          )}
        >
          <TimerDisplay
            minutes={uiState.displayMinutes}
            seconds={uiState.displaySeconds}
            progress={uiState.progressPercent}
            mode={uiState.currentMode}
            className={cn(
              'transition-all duration-500 transform',
              isFullScreen ? 'scale-350' : 'scale-300'
            )}
          />
        </div>
      </div>

      {/* Keyboard shortcuts hint - updated to mention ShortcutsDialog */}
      <div className="absolute bottom-4 text-muted-foreground flex items-center gap-4">
        <Keyboard className="h-4 w-4" />
        <h2>
          Press <kbd className="bg-muted px-1 border border-border">Shift + /</kbd> for commands
        </h2>
      </div>
    </div>
  )
}
