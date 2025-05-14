'use client'

import React from 'react'
import { AlgorithmInfoDisplay, SortVisualizer, AuxiliaryVisualizer } from './components'
import { useSortControls, useAlgorithmSelection } from './engine/hooks'
import { TimeComplexityCategory, SpaceComplexityCategory } from './engine/algorithmRegistry'

export default function SortPage(): React.JSX.Element {
  const {
    selectedAlgorithmId,
    setSelectedAlgorithmId,
    selectedAlgorithm,
    filteredAlgorithms,
    selectedTimeCategory,
    handleTimeCategoryChange,
    selectedSpaceCategory,
    handleSpaceCategoryChange,
  } = useAlgorithmSelection({
    onAlgorithmChange: newAlgorithmId => {
      // The generateRandomArray in the useEffect below will handle array regeneration.
      console.log('Algorithm changed to:', newAlgorithmId)
    },
  })

  const {
    arraySize,
    setArraySize,
    sortDirection,
    setSortDirection,
    isSorting,
    isPaused,
    speed,
    setSpeed,
    startSort,
    pauseSort,
    resumeSort,
    resetSort,
    stepForward,
    generateRandomArray,
    currentSortStep,
    auxiliaryStructures,
    finalSortStats,
    liveSortStats,
    MIN_ARRAY_SIZE,
    MAX_ARRAY_SIZE,
    MIN_SPEED,
    MAX_SPEED,
    MAX_VALUE,
  } = useSortControls({
    selectedAlgorithm: selectedAlgorithm,
  })

  React.useEffect(() => {
    generateRandomArray()
  }, [selectedAlgorithmId, generateRandomArray])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-8 gap-2 w-full min-h-[calc(100vh-6rem)]">
      <div className="lg:col-span-5 xl:col-span-6">
        <SortVisualizer
          currentSortStep={currentSortStep}
          arraySize={arraySize}
          setArraySize={setArraySize}
          MIN_ARRAY_SIZE={MIN_ARRAY_SIZE}
          MAX_ARRAY_SIZE={MAX_ARRAY_SIZE}
          speed={speed}
          setSpeed={setSpeed}
          MIN_SPEED={MIN_SPEED}
          MAX_SPEED={MAX_SPEED}
          selectedAlgorithmId={selectedAlgorithmId}
          setSelectedAlgorithmId={setSelectedAlgorithmId}
          algorithms={filteredAlgorithms}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          timeCategories={TimeComplexityCategory}
          selectedTimeCategory={selectedTimeCategory}
          handleTimeCategoryChange={handleTimeCategoryChange}
          spaceCategories={SpaceComplexityCategory}
          selectedSpaceCategory={selectedSpaceCategory}
          handleSpaceCategoryChange={handleSpaceCategoryChange}
          onStart={isPaused ? resumeSort : startSort}
          onPause={pauseSort}
          onReset={resetSort}
          onStepForward={stepForward}
          onNewArray={generateRandomArray}
          isSorting={isSorting}
          isPaused={isPaused}
        />
      </div>

      <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-4 h-fit w-full">
        <AlgorithmInfoDisplay selectedAlgorithm={selectedAlgorithm} />
        <AuxiliaryVisualizer
          sortStats={
            liveSortStats && Object.keys(liveSortStats).length > 0
              ? liveSortStats
              : finalSortStats === null
                ? undefined
                : finalSortStats
          }
          auxiliaryStructures={auxiliaryStructures}
          maxValue={MAX_VALUE}
        />
      </div>
    </div>
  )
}
