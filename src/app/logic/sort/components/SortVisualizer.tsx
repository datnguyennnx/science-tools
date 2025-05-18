'use client'

import { memo } from 'react'
import type { SortStep } from '../engine/types'
import type { SortAlgorithm } from '../engine/algorithmRegistry'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SortConfigControls } from './SortConfigControls'
import { SortActionButtons } from './SortActionButtons'
import { SortChartDisplay } from './SortChartDisplay'
import { AuxiliaryStructuresDisplay } from './AuxiliaryStructuresDisplay'

interface SortVisualizerProps {
  currentSortStep: SortStep | null
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onStepForward?: () => void
  onNewArray: () => void
  isSorting: boolean
  isPaused: boolean
  arraySize: number
  setArraySize: (value: number) => void
  MIN_ARRAY_SIZE: number
  MAX_ARRAY_SIZE: number
  speed: number
  setSpeed: (value: number) => void
  MIN_SPEED: number
  MAX_SPEED: number
  selectedAlgorithmId: string
  setSelectedAlgorithmId: (id: string) => void
  algorithms: ReadonlyArray<SortAlgorithm>
  sortDirection: 'asc' | 'desc'
  setSortDirection: (direction: 'asc' | 'desc') => void
  toggleAlgorithmInfoShortcut?: string
  togglePseudoCodeShortcut?: string
}

const MemoizedSortVisualizer = memo(function SortVisualizer({
  currentSortStep,
  onStart,
  onPause,
  onResume,
  onReset,
  onStepForward,
  onNewArray,
  isSorting,
  isPaused,
  arraySize,
  MAX_ARRAY_SIZE,
  MIN_ARRAY_SIZE,
  setArraySize,
  speed,
  MIN_SPEED,
  MAX_SPEED,
  setSpeed,
  selectedAlgorithmId,
  setSelectedAlgorithmId,
  algorithms,
  sortDirection,
  setSortDirection,
  toggleAlgorithmInfoShortcut,
  togglePseudoCodeShortcut,
}: SortVisualizerProps): React.JSX.Element {
  const internalOnStart = () => {
    onStart()
  }
  const internalOnPause = () => {
    onPause()
  }
  const internalOnResume = () => {
    onResume()
  }
  const internalOnReset = () => {
    onReset()
  }
  const internalOnStepForward = () => {
    if (onStepForward) {
      onStepForward()
    }
  }
  const internalOnNewArray = () => {
    onNewArray()
  }
  const internalSetSelectedAlgorithmId = (id: string) => {
    setSelectedAlgorithmId(id)
  }
  const internalSetSortDirection = (direction: 'asc' | 'desc') => {
    setSortDirection(direction)
  }

  const hasAuxStructures = !!(
    currentSortStep?.currentPassAuxiliaryStructure ||
    (currentSortStep?.historicalAuxiliaryStructures &&
      currentSortStep.historicalAuxiliaryStructures.length > 0)
  )

  return (
    <Card>
      <CardHeader className="space-y-8">
        <CardTitle>Sort Visualization & Auxiliary Data</CardTitle>

        <div className="flex flex-col xl:flex-row xl:items-start gap-6">
          <SortConfigControls
            arraySize={arraySize}
            setArraySize={setArraySize}
            MIN_ARRAY_SIZE={MIN_ARRAY_SIZE}
            MAX_ARRAY_SIZE={MAX_ARRAY_SIZE}
            speed={speed}
            setSpeed={setSpeed}
            MIN_SPEED={MIN_SPEED}
            MAX_SPEED={MAX_SPEED}
            selectedAlgorithmId={selectedAlgorithmId}
            setSelectedAlgorithmId={internalSetSelectedAlgorithmId}
            algorithms={algorithms}
            sortDirection={sortDirection}
            setSortDirection={internalSetSortDirection}
          />

          <div className="flex flex-col gap-4 xl:w-auto">
            <SortActionButtons
              onNewArray={internalOnNewArray}
              onStart={internalOnStart}
              onPause={internalOnPause}
              onResume={internalOnResume}
              onStepForward={internalOnStepForward}
              onReset={internalOnReset}
              isSorting={isSorting}
              isPaused={isPaused}
              toggleAlgorithmInfoShortcut={toggleAlgorithmInfoShortcut}
              togglePseudoCodeShortcut={togglePseudoCodeShortcut}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <SortChartDisplay currentSortStep={currentSortStep} />
        {hasAuxStructures && (
          <AuxiliaryStructuresDisplay
            currentPassAuxiliaryStructure={currentSortStep?.currentPassAuxiliaryStructure}
            historicalAuxiliaryStructures={currentSortStep?.historicalAuxiliaryStructures}
            separateSection={false}
          />
        )}
      </CardContent>
    </Card>
  )
})

export { MemoizedSortVisualizer as SortVisualizer }
