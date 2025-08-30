'use client'

import { cn } from '@/lib/utils'
import { TimerMode } from '../../engine/core/types'

interface TimerDisplayProps {
  minutes: number
  seconds: number
  progress: number
  mode: TimerMode
  className?: string
}

export function TimerDisplay({ minutes, seconds, mode, className }: TimerDisplayProps) {
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  // Get mode label for screen readers only
  const getModeLabel = () => {
    switch (mode) {
      case 'focus':
        return 'Focus session'
      case 'shortBreak':
        return 'Short break'
      case 'longBreak':
        return 'Long break'
      default:
        return 'Current session'
    }
  }

  return (
    <div
      className={cn('flex flex-col items-center justify-center select-none', className)}
      role="timer"
      aria-live="polite"
      aria-label={`${timeString} remaining in ${getModeLabel()}`}
    >
      {/* Timer display with custom font */}
      <p className={'text-9xl font-mono font-extrabold tracking-tighter text-foreground'}>
        {timeString}
      </p>
    </div>
  )
}
