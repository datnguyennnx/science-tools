'use client'

import { useEffect, useState } from 'react'
import { AlgorithmInfoDisplay, SortVisualizer, PseudoCodeDisplay } from './components'
import type { SupportedLanguages } from './components/PseudoCodeDisplay'
import { useSortControls } from './engine/hooks'
import { TimeComplexityCategory, SpaceComplexityCategory } from './engine/algorithmRegistry'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAlgorithmSelection } from './engine/hooks/useAlgorithmSelection'

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
    MAX_VALUE,
  } = useSortControls({
    selectedAlgorithm: selectedAlgorithm || undefined,
  })

  const [currentPseudoCodeLanguage, setCurrentPseudoCodeLanguage] =
    useState<SupportedLanguages>('cpp')

  const [activeTab, setActiveTab] = useState<'info' | 'code'>('info')
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState<boolean>(true)
  const [showPseudoCode, setShowPseudoCode] = useState<boolean>(true)

  useEffect(() => {
    resetSort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlgorithmId, sortDirection])

  // Effect to manage activeTab when visibility changes
  useEffect(() => {
    if (!showAlgorithmInfo && activeTab === 'info') {
      if (showPseudoCode) {
        setActiveTab('code')
      } else {
        // Both are hidden, no active tab or a default placeholder if needed
        // For now, let's assume if both hidden, tabs might not render or show empty
      }
    } else if (!showPseudoCode && activeTab === 'code') {
      if (showAlgorithmInfo) {
        setActiveTab('info')
      } else {
        // Both are hidden
      }
    } else if (showAlgorithmInfo && activeTab === 'code' && !showPseudoCode) {
      // If pseudo code was active and gets hidden, switch to info if available
      setActiveTab('info')
    } else if (showPseudoCode && activeTab === 'info' && !showAlgorithmInfo) {
      // If info was active and gets hidden, switch to pseudo code if available
      setActiveTab('code')
    }
  }, [showAlgorithmInfo, showPseudoCode, activeTab])

  const displayedSortStats =
    liveSortStats && Object.keys(liveSortStats).length > 0
      ? liveSortStats
      : (finalSortStats ?? undefined)

  const mainPanelColSpan = showAlgorithmInfo || showPseudoCode ? 'xl:col-span-4' : 'xl:col-span-6'
  const rightPanelVisible = showAlgorithmInfo || showPseudoCode

  const visibleMobileTabs = [
    showAlgorithmInfo && { value: 'info', label: 'Algorithm Info' },
    showPseudoCode && { value: 'code', label: 'Code & Stats' },
  ].filter(Boolean) as Array<{ value: 'info' | 'code'; label: string }>

  return (
    <main className="xl:grid xl:grid-cols-6 xl:gap-4">
      {/* Left Panel: Sort Visualizer */}
      <div className={`w-full ${mainPanelColSpan}`}>
        <SortVisualizer
          currentSortStep={currentSortStep}
          onStart={startSort}
          onPause={pauseSort}
          onReset={resetSort}
          onStepForward={stepForward}
          onNewArray={resetSort}
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
          auxiliaryStructures={auxiliaryStructures}
          maxValue={MAX_VALUE}
          showAlgorithmInfo={showAlgorithmInfo}
          onShowAlgorithmInfoChange={setShowAlgorithmInfo}
          showPseudoCode={showPseudoCode}
          onShowPseudoCodeChange={setShowPseudoCode}
        />
      </div>

      {/* Mobile Tabs (Info and Code/Stats) */}
      {visibleMobileTabs.length > 0 && (
        <div className="mt-4 flex flex-col xl:hidden">
          <Tabs
            value={activeTab}
            onValueChange={v => setActiveTab(v as 'info' | 'code')}
            className="flex flex-col"
          >
            <TabsList
              className={`grid ${visibleMobileTabs.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
            >
              {showAlgorithmInfo && (
                <TabsTrigger value="info" className="whitespace-nowrap">
                  Algorithm Info
                </TabsTrigger>
              )}
              {showPseudoCode && (
                <TabsTrigger value="code" className="whitespace-nowrap">
                  Code & Stats
                </TabsTrigger>
              )}
            </TabsList>
            {showAlgorithmInfo && (
              <TabsContent value="info">
                <AlgorithmInfoDisplay selectedAlgorithm={selectedAlgorithm} />
              </TabsContent>
            )}
            {showPseudoCode && (
              <TabsContent value="code">
                <PseudoCodeDisplay
                  algorithmName={selectedAlgorithm?.name}
                  pseudoCode={selectedAlgorithm?.pseudoCodes?.[currentPseudoCodeLanguage]}
                  activeLine={currentSortStep?.currentPseudoCodeLine}
                  language={currentPseudoCodeLanguage}
                  onLanguageChange={setCurrentPseudoCodeLanguage}
                  sortStats={displayedSortStats}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}

      {/* Desktop Right Panel (AlgorithmInfo top, PseudoCode/Stats bottom) */}
      {rightPanelVisible && (
        <div className="hidden xl:grid xl:col-span-2 h-fit gap-4">
          {showAlgorithmInfo && <AlgorithmInfoDisplay selectedAlgorithm={selectedAlgorithm} />}
          {showPseudoCode && (
            <PseudoCodeDisplay
              algorithmName={selectedAlgorithm?.name}
              pseudoCode={selectedAlgorithm?.pseudoCodes?.[currentPseudoCodeLanguage]}
              activeLine={currentSortStep?.currentPseudoCodeLine}
              language={currentPseudoCodeLanguage}
              onLanguageChange={setCurrentPseudoCodeLanguage}
              sortStats={displayedSortStats}
            />
          )}
        </div>
      )}
    </main>
  )
}
