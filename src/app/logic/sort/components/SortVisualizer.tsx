'use client'

import React from 'react'
import type { SortStep, AuxiliaryStructure } from '../engine/types'
import type {
  SortAlgorithm,
  TimeComplexityCategory,
  SpaceComplexityCategory,
} from '../engine/algorithmRegistry'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SortConfigControls } from './SortConfigControls'
import { SortActionButtons } from './SortActionButtons'
import { SortChartDisplay } from './SortChartDisplay'
import { AuxiliaryStructuresDisplay } from './AuxiliaryStructuresDisplay'

interface SortVisualizerProps {
  currentSortStep: SortStep | null
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onStepForward: () => void
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
  timeCategories: typeof TimeComplexityCategory
  selectedTimeCategory: string
  handleTimeCategoryChange: (category: string) => void
  spaceCategories: typeof SpaceComplexityCategory
  selectedSpaceCategory: string
  handleSpaceCategoryChange: (category: string) => void
  auxiliaryStructures?: ReadonlyArray<AuxiliaryStructure>
  maxValue: number
  toggleAlgorithmInfoShortcut?: string
  togglePseudoCodeShortcut?: string
}

export function SortVisualizer({
  currentSortStep,
  onStart,
  onPause,
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
  timeCategories,
  selectedTimeCategory,
  handleTimeCategoryChange,
  spaceCategories,
  selectedSpaceCategory,
  handleSpaceCategoryChange,
  auxiliaryStructures,
  maxValue,
  toggleAlgorithmInfoShortcut,
  togglePseudoCodeShortcut,
}: SortVisualizerProps): React.JSX.Element {
  // Internal handlers remain for now, can be moved or simplified if props are passed directly
  const internalOnStart = () => {
    onStart()
  }
  const internalOnPause = () => {
    onPause()
  }
  const internalOnReset = () => {
    onReset()
  }
  const internalOnStepForward = () => {
    onStepForward()
  }
  const internalOnNewArray = () => {
    onNewArray()
  }
  const internalSetSelectedAlgorithmId = (id: string) => {
    // console.log('SortVisualizer: Algorithm selection changed to:', id) // Kept for debugging if needed
    setSelectedAlgorithmId(id)
  }
  const internalSetSortDirection = (direction: 'asc' | 'desc') => {
    // console.log('SortVisualizer: Sort direction changed to:', direction)
    setSortDirection(direction)
  }
  const internalHandleTimeCategoryChange = (category: string) => {
    // console.log('SortVisualizer: Time category filter changed to:', category)
    handleTimeCategoryChange(category)
  }
  const internalHandleSpaceCategoryChange = (category: string) => {
    // console.log('SortVisualizer: Space category filter changed to:', category)
    handleSpaceCategoryChange(category)
  }

  const hasAuxStructures = !!auxiliaryStructures && auxiliaryStructures.length > 0

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
            timeCategories={timeCategories}
            selectedTimeCategory={selectedTimeCategory}
            handleTimeCategoryChange={internalHandleTimeCategoryChange}
            spaceCategories={spaceCategories}
            selectedSpaceCategory={selectedSpaceCategory}
            handleSpaceCategoryChange={internalHandleSpaceCategoryChange}
          />

          <div className="flex flex-col gap-4 xl:w-auto">
            <SortActionButtons
              onNewArray={internalOnNewArray}
              onStart={internalOnStart}
              onPause={internalOnPause}
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
            auxiliaryStructures={auxiliaryStructures}
            maxValue={maxValue}
            separateSection={false}
          />
        )}
      </CardContent>
    </Card>
  )
}
