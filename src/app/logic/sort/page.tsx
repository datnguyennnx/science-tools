'use client'

import { useEffect, useState } from 'react'
import {
  AlgorithmInfoDisplay,
  AuxiliaryVisualizer,
  SortVisualizer,
  PseudoCodeDisplay,
} from './components'
import type { SupportedLanguages } from './components/PseudoCodeDisplay'
import { useSortControls, useAlgorithmSelection } from './engine/hooks'
import {
  SORT_ALGORITHMS,
  TimeComplexityCategory,
  SpaceComplexityCategory,
} from './engine/algorithmRegistry'

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
  } = useAlgorithmSelection()

  const {
    arraySize,
    setArraySize,
    MIN_ARRAY_SIZE,
    MAX_ARRAY_SIZE,
    speed,
    setSpeed,
    MIN_SPEED,
    MAX_SPEED,
    sortDirection,
    setSortDirection,
    currentSortStep,
    isSorting,
    isPaused,
    liveSortStats,
    finalSortStats,
    auxiliaryStructures,
    startSort,
    pauseSort,
    resetSort,
    stepForward,
    generateRandomArray,
    MAX_VALUE,
  } = useSortControls({
    selectedAlgorithm: selectedAlgorithm || SORT_ALGORITHMS[0],
  })

  const [currentPseudoCodeLanguage, setCurrentPseudoCodeLanguage] =
    useState<SupportedLanguages>('plaintext')

  useEffect(() => {
    generateRandomArray()
  }, [selectedAlgorithmId, arraySize, sortDirection])

  return (
    <main className="flex-grow sm:px-4 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
      {/* Main Visualization Area (SortVisualizer + AlgorithmInfoDisplay) */}
      <div className="xl:col-span-9 h-full">
        <SortVisualizer
          currentSortStep={currentSortStep}
          onStart={startSort}
          onPause={pauseSort}
          onReset={resetSort}
          onStepForward={stepForward}
          onNewArray={generateRandomArray}
          isSorting={isSorting}
          isPaused={isPaused}
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
        />
      </div>

      {/* Right Sidebar Area */}
      <div className="xl:col-span-3 space-y-4 lg:space-y-6 h-full flex flex-col">
        <AlgorithmInfoDisplay selectedAlgorithm={selectedAlgorithm} />
        <PseudoCodeDisplay
          algorithmName={selectedAlgorithm?.name}
          pseudoCode={selectedAlgorithm?.pseudoCodes?.[currentPseudoCodeLanguage]}
          activeLine={currentSortStep?.currentPseudoCodeLine}
          language={currentPseudoCodeLanguage}
          onLanguageChange={setCurrentPseudoCodeLanguage}
        />
        <AuxiliaryVisualizer
          sortStats={
            liveSortStats && Object.keys(liveSortStats).length > 0
              ? liveSortStats
              : (finalSortStats ?? undefined)
          }
          auxiliaryStructures={auxiliaryStructures}
          maxValue={MAX_VALUE}
        />
      </div>
    </main>
  )
}
