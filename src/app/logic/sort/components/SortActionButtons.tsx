import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/Kbd'
import { Play, Pause, RotateCcw, SkipForward, PlusSquare } from 'lucide-react'

interface SortActionButtonsProps {
  onNewArray: () => void
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStepForward?: () => void
  onReset: () => void
  isSorting: boolean
  isPaused: boolean
  isStopping?: boolean
  toggleAlgorithmInfoShortcut?: string
  togglePseudoCodeShortcut?: string
}

const MemoizedSortActionButtons = memo(function SortActionButtons({
  onNewArray,
  onStart,
  onPause,
  onResume,
  onStepForward,
  onReset,
  isSorting,
  isPaused,
  isStopping,
  toggleAlgorithmInfoShortcut,
  togglePseudoCodeShortcut,
}: SortActionButtonsProps): React.JSX.Element {
  const isStoppingValue = isStopping || false

  const startResumeDisabled = isPaused ? isStoppingValue : isSorting

  const isActuallyRunning = isSorting && !isStoppingValue
  const pauseDisabled = !isActuallyRunning || isPaused || isStoppingValue

  // Step button enabled if: onStepForward exists, AND system is not stopping, AND
  // ( (sort is actually running AND paused) OR (sort is not busy (isSorting is false) AND not paused -> initial state) )
  const stepEnabled =
    onStepForward &&
    !isStoppingValue &&
    ((isActuallyRunning && isPaused) || (!isSorting && !isPaused))
  const stepDisabled = !stepEnabled

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between text-sm leading-none flex-wrap gap-2">
        <p>Sort Control</p>
        <div className="flex space-x-2">
          {toggleAlgorithmInfoShortcut && (
            <span className="flex items-center text-sm leading-none flex-wrap text-muted-foreground whitespace-nowrap">
              Toggle Info:
              <Kbd>{toggleAlgorithmInfoShortcut}</Kbd>
            </span>
          )}
          {togglePseudoCodeShortcut && (
            <span className="flex items-center text-sm leading-none flex-wrap text-muted-foreground whitespace-nowrap">
              Toggle Code:
              <Kbd>{togglePseudoCodeShortcut}</Kbd>
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          onClick={onNewArray}
          variant="outline"
          title="New Array (N)"
          disabled={isStoppingValue}
        >
          <PlusSquare className="h-4 w-4 mr-2" />
          New Array
        </Button>
        <Button
          onClick={isPaused ? onResume : onStart}
          disabled={startResumeDisabled}
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
        <Button onClick={onPause} disabled={pauseDisabled} variant="outline" title="Pause (Space)">
          <Pause className="h-4 w-4 mr-2" />
          Pause
        </Button>
        <Button
          onClick={onStepForward}
          disabled={stepDisabled}
          variant="outline"
          title={onStepForward ? 'Step Forward (→)' : 'Step Forward (N/A)'}
        >
          <SkipForward className="h-4 w-4 mr-2" /> Step
        </Button>
        <Button onClick={onReset} variant="outline" title="Reset (R)" disabled={isStoppingValue}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  )
})

export { MemoizedSortActionButtons as SortActionButtons }
