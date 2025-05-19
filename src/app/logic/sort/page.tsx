'use client'

import { useEffect, useState } from 'react'
import {
  useSortControls,
  useAlgorithmSelection,
  useSortTabView,
  useSortKeyboardCommands,
} from './engine/hooks'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import dynamic from 'next/dynamic'

const SortVisualizer = dynamic(() => import('./components').then(mod => mod.SortVisualizer), {
  loading: () => null,
  ssr: false,
})

const AlgorithmInfoDisplay = dynamic(
  () => import('./components').then(mod => mod.AlgorithmInfoDisplay),
  {
    loading: () => null,
    ssr: false,
  }
)

const PseudoCodeDisplay = dynamic(() => import('./components').then(mod => mod.PseudoCodeDisplay), {
  loading: () => null,
  ssr: false,
})

export default function SortPage(): React.JSX.Element {
  const { selectedAlgorithmId, setSelectedAlgorithmId, selectedAlgorithm, filteredAlgorithms } =
    useAlgorithmSelection()

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
    isBusy,
    isPaused,
    isStopping,
    liveSortStats,
    finalSortStats,
    performanceScenario,
    setPerformanceScenario,
    startSort,
    pauseSort,
    resumeSort,
    resetSort,
    stepForward,
  } = useSortControls({
    selectedAlgorithm: selectedAlgorithm || undefined,
  })

  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState<boolean>(true)
  const [showPseudoCode, setShowPseudoCode] = useState<boolean>(true)

  const { activeTab, setActiveTab } = useSortTabView({
    showAlgorithmInfo,
    showPseudoCode,
  })
  const { toggleAlgorithmInfoShortcut, togglePseudoCodeShortcut } = useSortKeyboardCommands({
    setShowAlgorithmInfo,
    setShowPseudoCode,
  })

  useEffect(() => {
    resetSort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlgorithmId, sortDirection])

  const displayedSortStats =
    liveSortStats && Object.keys(liveSortStats).length > 0
      ? liveSortStats
      : (finalSortStats ?? undefined)

  const mainPanelColSpan = showAlgorithmInfo || showPseudoCode ? '2xl:col-span-5' : '2xl:col-span-8'
  const rightPanelVisible = showAlgorithmInfo || showPseudoCode

  const visibleMobileTabs = [
    showAlgorithmInfo && { value: 'info', label: 'Algorithm Info' },
    showPseudoCode && { value: 'code', label: 'Code & Stats' },
  ].filter(Boolean) as Array<{ value: 'info' | 'code'; label: string }>

  return (
    <main className="2xl:grid 2xl:grid-cols-8 xl:gap-4">
      {/* Left Panel: Sort Visualizer */}
      <div className={`w-full ${mainPanelColSpan}`}>
        <SortVisualizer
          currentSortStep={currentSortStep}
          onStart={startSort}
          onPause={pauseSort}
          onResume={resumeSort}
          onReset={resetSort}
          onNewArray={resetSort}
          onStepForward={stepForward}
          isSorting={isBusy}
          isPaused={isPaused}
          isStopping={isStopping}
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
          toggleAlgorithmInfoShortcut={toggleAlgorithmInfoShortcut}
          togglePseudoCodeShortcut={togglePseudoCodeShortcut}
        />
      </div>

      {/* Mobile Tabs (Info and Code/Stats) */}
      {visibleMobileTabs.length > 0 && (
        <div className="mt-4 flex flex-col 2xl:hidden">
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
            {showAlgorithmInfo && activeTab === 'info' && (
              <div key="algoInfoMobile" className="overflow-hidden mt-2">
                <TabsContent value="info" forceMount>
                  <AlgorithmInfoDisplay selectedAlgorithm={selectedAlgorithm} />
                </TabsContent>
              </div>
            )}
            {showPseudoCode && activeTab === 'code' && (
              <div key="pseudoCodeMobile" className="overflow-hidden mt-2">
                <TabsContent value="code" forceMount>
                  <PseudoCodeDisplay
                    algorithmData={selectedAlgorithm}
                    activeLines={currentSortStep?.currentPseudoCodeLine}
                    initialLanguage={'plaintext'}
                    sortStats={displayedSortStats}
                    performanceScenario={performanceScenario}
                    setPerformanceScenario={setPerformanceScenario}
                  />
                </TabsContent>
              </div>
            )}
          </Tabs>
        </div>
      )}

      {/* Desktop Right Panel (AlgorithmInfo top, PseudoCode/Stats bottom) */}
      {rightPanelVisible && (
        <div className="hidden 2xl:grid 2xl:col-span-3 h-fit gap-4">
          {showAlgorithmInfo && (
            <div key="algoInfoDesktop" className="overflow-hidden">
              <AlgorithmInfoDisplay selectedAlgorithm={selectedAlgorithm} />
            </div>
          )}
          {showPseudoCode && (
            <div key="pseudoCodeDesktop" className="overflow-hidden">
              <PseudoCodeDisplay
                algorithmData={selectedAlgorithm}
                activeLines={currentSortStep?.currentPseudoCodeLine}
                initialLanguage={'plaintext'}
                sortStats={displayedSortStats}
                performanceScenario={performanceScenario}
                setPerformanceScenario={setPerformanceScenario}
              />
            </div>
          )}
        </div>
      )}
    </main>
  )
}
