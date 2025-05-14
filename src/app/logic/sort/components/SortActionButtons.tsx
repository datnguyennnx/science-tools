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
  return (
    <div className="flex-grow md:flex-grow-0 space-y-2">
      <div className="text-sm font-bold text-foreground">Sort Control</div>
      <div className="flex flex-col items-start sm:flex-row sm:items-center flex-wrap gap-2 pt-0.5">
        <Button onClick={onNewArray} variant="outline" size="sm" className="text-xs">
          <PlusSquare className="h-4 w-4 mr-1" />
          New Array
        </Button>
        <Button onClick={onStart} disabled={isSorting && !isPaused} size="sm" className="text-xs">
          {isPaused ? (
            <>
              <Play className="h-4 w-4 mr-1" /> Resume
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" /> Start
            </>
          )}
        </Button>
        <Button
          onClick={onPause}
          disabled={!isSorting || isPaused}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <Pause className="h-4 w-4 mr-1" />
          Pause
        </Button>
        <Button
          onClick={onStepForward}
          disabled={!isSorting || !isPaused}
          variant="outline"
          size="icon"
          title="Step Forward"
          className="text-xs"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button onClick={onReset} variant="outline" size="icon" title="Reset" className="text-xs">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
