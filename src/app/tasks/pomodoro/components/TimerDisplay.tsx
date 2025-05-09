'use client'

import { cn } from '@/lib/utils'
import { TimerMode } from '../engine/core/types'

interface TimerDisplayProps {
  minutes: number
  seconds: number
  progress: number
  mode: TimerMode
  className?: string
}

export function TimerDisplay({ minutes, seconds, mode, className }: TimerDisplayProps) {
  // Restore color map for text color based on mode
  const colorMap: Record<TimerMode, string> = {
    focus: 'text-red-500',
    shortBreak: 'text-green-500',
    longBreak: 'text-blue-500',
  }

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

  const activeColor = colorMap[mode] || 'text-foreground'

  return (
    <div
      className={cn('flex flex-col items-center justify-center select-none', className)}
      role="timer"
      aria-live="polite"
      aria-label={`${timeString} remaining in ${getModeLabel()}`}
    >
      {/* Reverted to simple text display */}
      <span
        className={cn(
          `text-9xl font-mono font-bold tracking-tighter ${activeColor}`,
          'transition-all duration-300' // Optional: keep transition for color changes
        )}
      >
        {timeString}
      </span>
    </div>
  )
}
