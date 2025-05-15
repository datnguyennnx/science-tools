import React from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, SkipForward, PlusSquare } from 'lucide-react'

interface SortActionButtonsProps {
  onNewArray: () => void
  onStart: () => void
  onPause: () => void
  onStepForward: () => void
  onReset: () => void
  isSorting: boolean
  isPaused: boolean
}

export function SortActionButtons({
  onNewArray,
  onStart,
  onPause,
  onStepForward,
  onReset,
  isSorting,
  isPaused,
}: SortActionButtonsProps): React.JSX.Element {
  console.log(
    '[SortActionButtons] Rendering. isSorting:',
    isSorting,
    'isPaused:',
    isPaused,
    'Start button disabled:',
    isSorting && !isPaused
  )
  return (
    <div className="flex flex-col space-y-2">
      <p className="flex items-center text-sm leading-none">Sort Control</p>
      <div className="flex flex-row flex-wrap gap-2">
        <Button onClick={onNewArray} variant="outline" title="New Array">
          <PlusSquare className="h-4 w-4" />
          New Array
        </Button>
        <Button onClick={onStart} disabled={isSorting && !isPaused} title="Start/Resume">
          {isPaused ? (
            <>
              <Play className="h-4 w-4" /> Resume
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Start
            </>
          )}
        </Button>
        <Button onClick={onPause} disabled={!isSorting || isPaused} variant="outline" title="Pause">
          <Pause className="h-4 w-4" />
          Pause
        </Button>
        <Button
          onClick={onStepForward}
          disabled={!isSorting || !isPaused}
          variant="outline"
          title="Step Forward"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button onClick={onReset} variant="outline" size="icon" title="Reset">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
