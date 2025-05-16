import React from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/Kbd'
import { Play, Pause, RotateCcw, SkipForward, PlusSquare } from 'lucide-react'

interface SortActionButtonsProps {
  onNewArray: () => void
  onStart: () => void
  onPause: () => void
  onStepForward: () => void
  onReset: () => void
  isSorting: boolean
  isPaused: boolean
  toggleAlgorithmInfoShortcut?: string
  togglePseudoCodeShortcut?: string
}

export function SortActionButtons({
  onNewArray,
  onStart,
  onPause,
  onStepForward,
  onReset,
  isSorting,
  isPaused,
  toggleAlgorithmInfoShortcut,
  togglePseudoCodeShortcut,
}: SortActionButtonsProps): React.JSX.Element {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between text-sm leading-none flex-wrap gap-2">
        <span>Sort Control</span>
        <div className="flex items-center space-x-3">
          {toggleAlgorithmInfoShortcut && (
            <span className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
              Toggle Info:
              <Kbd>{toggleAlgorithmInfoShortcut}</Kbd>
            </span>
          )}
          {togglePseudoCodeShortcut && (
            <span className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
              Toggle Code:
              <Kbd>{togglePseudoCodeShortcut}</Kbd>
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        <Button onClick={onNewArray} variant="outline" title="New Array (N)">
          <PlusSquare className="h-4 w-4 mr-2" />
          New Array
        </Button>
        <Button
          onClick={onStart}
          disabled={isSorting && !isPaused}
          title={`${isPaused ? 'Resume' : 'Start'} Sort (Space)`}
        >
          {isPaused ? (
            <>
              <Play className="h-4 w-4 mr-2" /> Resume
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" /> Start
            </>
          )}
        </Button>
        <Button
          onClick={onPause}
          disabled={!isSorting || isPaused}
          variant="outline"
          title="Pause (Space)"
        >
          <Pause className="h-4 w-4 mr-2" />
          Pause
        </Button>
        <Button
          onClick={onStepForward}
          disabled={!isSorting || !isPaused}
          variant="outline"
          title="Step Forward (→)"
        >
          <SkipForward className="h-4 w-4 mr-2" /> Step
        </Button>
        <Button onClick={onReset} variant="outline" title="Reset (R)">
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  )
}
