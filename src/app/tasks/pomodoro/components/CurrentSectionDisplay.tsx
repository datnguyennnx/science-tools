'use client'

import { useMemo, memo, useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { PomodoroUIState, TimerMode } from '../engine/core/types'
import { Check } from 'lucide-react'
import { format } from 'date-fns'

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

const getStageDisplay = (stage: TimelineStage, status: StageStatus) => {
  if (status === 'completed') {
    if (stage.type === 'focus') return `🏆 ${stage.label} Complete!`
    if (stage.type === 'shortBreak') return `🎉 ${stage.label} Cleared!`
    if (stage.type === 'longBreak') return `🥇 ${stage.label} Unlocked!`
  }
  if (status === 'current') {
    if (stage.type === 'focus') return `🔥 ${stage.label} In Progress!`
    if (stage.type === 'shortBreak') return `⏳ ${stage.label} In Progress!`
    if (stage.type === 'longBreak') return `🎯 ${stage.label} In Progress!`
  }
  // upcoming
  return `${stage.label}`
}

// Create a memoized stage component to prevent unnecessary re-renders
const StageItem = memo(
  ({
    stage,
    status,
    isLastStageInTimeline,
  }: {
    stage: TimelineStage
    status: StageStatus
    isLastStageInTimeline: boolean
  }) => {
    return (
      <motion.div variants={itemVariants} className="flex items-start relative p-2 space-x-4">
        <div className="relative flex flex-col items-center">
          <div
            className={cn('w-0.5 h-6 -mt-3', 'bg-border', status === 'upcoming' && 'opacity-50')}
          />
          <div
            className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center z-10',
              status === 'completed'
                ? 'bg-border text-muted-foreground'
                : status === 'current'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border-2 border-border text-muted-foreground'
            )}
          >
            {status === 'completed' && <Check className="h-2.5 w-2.5" />}
          </div>
          {!isLastStageInTimeline && (
            <div
              className={cn(
                'w-0.5 flex-grow min-h-[40px]',
                'bg-border',
                status === 'upcoming' && 'opacity-50'
              )}
            />
          )}
        </div>
        <div className="border-2 bg-muted/20 rounded-md p-2">
          <div className="flex justify-between items-center">
            <h3
              className={cn(
                'font-semibold text-sm',
                status === 'completed'
                  ? 'text-muted-foreground'
                  : status === 'current'
                    ? 'text-primary'
                    : 'text-muted-foreground opacity-80'
              )}
            >
              {getStageDisplay(stage, status)}
            </h3>
          </div>
        </div>
      </motion.div>
    )
  }
)

StageItem.displayName = 'StageItem'

// Main component function
export function CurrentSectionDisplay({
  isVisible,
  uiState,
  showTimeDisplay = false,
}: CurrentSectionDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  const { settings, currentMode, completedFocusSessionsInSet } = uiState

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

  const currentGlobalStageIndex = useMemo(() => {
    if (currentMode === 'focus') {
      return completedFocusSessionsInSet * 2
    }
    if (currentMode === 'shortBreak') {
      return (completedFocusSessionsInSet - 1) * 2 + 1
    }
    return timelineStages.length - 1
  }, [currentMode, completedFocusSessionsInSet, timelineStages.length])

  // Auto-scroll logic
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const currentStageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date())
    updateTime()
    const intervalId = setInterval(updateTime, showTimeDisplay ? 1000 : 60000)
    return () => clearInterval(intervalId)
  }, [showTimeDisplay])

  useEffect(() => {
    if (currentStageRef.current && timelineContainerRef.current) {
      setTimeout(() => {
        currentStageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    }
  }, [currentGlobalStageIndex, isVisible])

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
            className={cn('fixed top-16 right-2 w-64', 'z-50')}
          >
            <div className="max-h-[80vh] overflow-y-auto no-scrollbar" ref={timelineContainerRef}>
              <div className="p-2">
                {timelineStages.map((stage, index) => {
                  const status: StageStatus =
                    index === currentGlobalStageIndex
                      ? 'current'
                      : index < currentGlobalStageIndex
                        ? 'completed'
                        : 'upcoming'

                  // Attach ref to current stage
                  const ref = status === 'current' ? currentStageRef : undefined

                  return (
                    <div ref={ref} key={stage.label}>
                      <StageItem
                        stage={stage}
                        status={status}
                        isLastStageInTimeline={index === timelineStages.length - 1}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
