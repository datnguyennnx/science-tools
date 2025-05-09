'use client'

import React, { useMemo, memo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { PomodoroUIState, TimerMode } from '../engine/core/types'
import { Check } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

// Internal Stage representation for the timeline
interface TimelineStage {
  type: TimerMode
  label: string
  durationInSeconds: number
}

interface CurrentSectionDisplayProps {
  isVisible: boolean
  uiState: PomodoroUIState
  showTimeDisplay?: boolean
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.07,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      when: 'afterChildren',
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
}

// Stage status type
type StageStatus = 'current' | 'completed' | 'upcoming'

// Helper to format duration from seconds to "MM min" string
const formatDurationDisplay = (seconds: number): string => {
  return `${Math.floor(seconds / 60)} min`
}

// Current time display component
const DateTimeDisplay = memo(({ currentTime }: { currentTime: Date }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 text-center"
  >
    <div className="flex flex-col items-center">
      <p className="text-base font-medium text-muted-foreground mb-1">
        {format(currentTime, 'EEEE, MMMM d, yyyy')}
      </p>
      <p className="text-6xl font-mono font-bold tracking-tight">
        {format(currentTime, 'HH:mm:ss')}
      </p>
    </div>
  </motion.div>
))

DateTimeDisplay.displayName = 'DateTimeDisplay'

// Create a memoized stage component to prevent unnecessary re-renders
const StageItem = memo(
  ({
    stage,
    status,
    isLastStageInTimeline,
    lineColorClass,
    dotColorClass,
    textColorClass,
    timeDisplay,
  }: {
    stage: TimelineStage
    status: StageStatus
    isLastStageInTimeline: boolean
    lineColorClass: string
    dotColorClass: string
    textColorClass: string
    timeDisplay: string
  }) => (
    <motion.div variants={itemVariants} className="flex items-start relative p-2 space-x-4">
      <div className="w-16 text-right pr-3 pt-1">
        <p className="text-sm text-muted-foreground">{timeDisplay}</p>
      </div>
      <div className="relative flex flex-col items-center">
        {/* Simplified line logic for now, always draw from top if not first overall */}
        {status !== 'upcoming' || stage.type !== 'focus'}
        <div
          className={cn('w-0.5 h-6 -mt-3', lineColorClass, status === 'upcoming' && 'opacity-50')}
        />

        <div
          className={cn(
            'w-4 h-4 rounded-full flex items-center justify-center z-10',
            dotColorClass
          )}
        >
          {status === 'completed' && <Check className="h-2.5 w-2.5" />}
        </div>
        {!isLastStageInTimeline && (
          <div
            className={cn(
              'w-0.5 flex-grow min-h-[40px]',
              lineColorClass,
              status === 'upcoming' && 'opacity-50'
            )}
          />
        )}
      </div>
      <div className="flex-1 ml-3 py-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={cn('font-medium text-sm', textColorClass)}>{stage.label}</h3>
            <p className="text-muted-foreground text-sm mt-0.5">
              {stage.type === 'focus'
                ? 'Focus on your work'
                : `Take a ${stage.type === 'longBreak' ? 'long' : 'short'} break`}
            </p>
          </div>
          <div className="text-right">
            {status === 'current' && (
              <Badge
                variant="default"
                className={cn(
                  'text-sm px-1.5 py-0 h-4 mb-0.5',
                  stage.type === 'focus'
                    ? 'bg-[var(--pomodoro-focus)]'
                    : stage.type === 'shortBreak'
                      ? 'bg-[var(--pomodoro-short-break)]'
                      : 'bg-[var(--pomodoro-long-break)]'
                )}
              >
                In Progress
              </Badge>
            )}
            {status === 'completed' && (
              <Badge
                variant="secondary"
                className="text-sm px-1.5 py-0 h-4 mb-0.5 bg-[var(--pomodoro-completed)]/20"
              >
                Completed
              </Badge>
            )}
            <div className="text-sm text-muted-foreground">
              {formatDurationDisplay(stage.durationInSeconds)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
)

StageItem.displayName = 'StageItem'

// Main component function
export function CurrentSectionDisplay({
  isVisible,
  uiState,
  showTimeDisplay = false,
}: CurrentSectionDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date())
    updateTime()
    const intervalId = setInterval(updateTime, showTimeDisplay ? 1000 : 60000)
    return () => clearInterval(intervalId)
  }, [showTimeDisplay])

  const { settings, currentMode, completedFocusSessionsInSet, displayMinutes, displaySeconds } =
    uiState

  // 1. Derive the sequence of all stages in a full Pomodoro set (Focus, SB, F, SB, F, LB)
  const timelineStages = useMemo(() => {
    const stages: TimelineStage[] = []
    for (let i = 0; i < settings.sessionsUntilLongBreak; i++) {
      stages.push({
        type: 'focus',
        label: `Focus ${i + 1}`,
        durationInSeconds: settings.focusDuration,
      })
      if (i < settings.sessionsUntilLongBreak - 1) {
        stages.push({
          type: 'shortBreak',
          label: `Short Break ${i + 1}`,
          durationInSeconds: settings.shortBreakDuration,
        })
      }
    }
    stages.push({
      type: 'longBreak',
      label: 'Long Break',
      durationInSeconds: settings.longBreakDuration,
    })
    return stages
  }, [
    settings.sessionsUntilLongBreak,
    settings.focusDuration,
    settings.shortBreakDuration,
    settings.longBreakDuration,
  ])

  // 2. Determine the current stage's global index in this timeline sequence
  const currentGlobalStageIndex = useMemo(() => {
    if (currentMode === 'focus') {
      return completedFocusSessionsInSet * 2 // Focus 1 (idx 0), Focus 2 (idx 2), ...
    }
    if (currentMode === 'shortBreak') {
      // Short break N follows Focus N. Focus N is at (N-1)*2. Short Break N is (N-1)*2 + 1.
      // completedFocusSessionsInSet is the count of *completed* focus sessions.
      // If 1 focus session is done, currentMode is SB, completedFocusSessionsInSet = 1.
      // This SB is SB1, index is (1-1)*2 + 1 = 1.
      return (completedFocusSessionsInSet - 1) * 2 + 1
    }
    // Long Break is always the last stage in the derived timelineStages array
    return timelineStages.length - 1
  }, [currentMode, completedFocusSessionsInSet, timelineStages.length])

  // 3. Group stages by session for display (optional, can render flat list too)
  // This logic is complex and can be simplified or adjusted based on desired UI.
  // For now, let's map directly over timelineStages for rendering.

  if (!timelineStages || timelineStages.length === 0) {
    return null
  }

  return (
    <>
      {/* Time Display with proper AnimatePresence */}
      <AnimatePresence>
        {showTimeDisplay && <DateTimeDisplay currentTime={currentTime} />}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="timeline-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn('fixed top-16 right-6 w-80', 'z-50')}
          >
            <Card className="p-0 py-2 overflow-hidden">
              <div className="max-h-[80vh] overflow-y-auto pr-2 no-scrollbar">
                <div className="p-2">
                  {timelineStages.map((stage, index) => {
                    const status: StageStatus =
                      index === currentGlobalStageIndex
                        ? 'current'
                        : index < currentGlobalStageIndex
                          ? 'completed'
                          : 'upcoming'

                    let dotColorClass = ''
                    let lineColorClass = ''
                    let textColorClass = ''

                    if (status === 'completed') {
                      dotColorClass =
                        'bg-[var(--pomodoro-completed)] text-[var(--pomodoro-icon-completed)]'
                      lineColorClass = 'bg-[var(--pomodoro-completed)]'
                      textColorClass = 'text-muted-foreground line-through opacity-70'
                    } else if (status === 'current') {
                      if (stage.type === 'focus') {
                        dotColorClass = 'bg-[var(--pomodoro-focus)]'
                        lineColorClass = 'bg-[var(--pomodoro-focus)]'
                        textColorClass = 'text-[var(--pomodoro-focus)]'
                      } else if (stage.type === 'shortBreak') {
                        dotColorClass = 'bg-[var(--pomodoro-short-break)]'
                        lineColorClass = 'bg-[var(--pomodoro-short-break)]'
                        textColorClass = 'text-[var(--pomodoro-short-break)]'
                      } else {
                        // longBreak
                        dotColorClass = 'bg-[var(--pomodoro-long-break)]'
                        lineColorClass = 'bg-[var(--pomodoro-long-break)]'
                        textColorClass = 'text-[var(--pomodoro-long-break)]'
                      }
                    } else {
                      // upcoming
                      dotColorClass = 'border-2 border-[var(--pomodoro-upcoming)] bg-background'
                      lineColorClass = 'bg-[var(--pomodoro-upcoming)]' // Will be partially transparent via style
                      textColorClass = 'text-muted-foreground opacity-50'
                    }

                    const timeDisplayStr =
                      status === 'current'
                        ? `${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`
                        : status === 'completed'
                          ? 'Done'
                          : 'Pending'

                    return (
                      <StageItem
                        key={stage.label}
                        stage={stage}
                        status={status}
                        isLastStageInTimeline={index === timelineStages.length - 1}
                        lineColorClass={lineColorClass}
                        dotColorClass={dotColorClass}
                        textColorClass={textColorClass}
                        timeDisplay={timeDisplayStr}
                      />
                    )
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
