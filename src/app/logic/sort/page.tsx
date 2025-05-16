'use client'

import { useEffect, useState } from 'react'
import { AlgorithmInfoDisplay, SortVisualizer, PseudoCodeDisplay } from './components'
import type { SupportedLanguages } from './components/PseudoCodeDisplay'
import {
  useSortControls,
  useAlgorithmSelection,
  useSortTabView,
  useSortKeyboardCommands,
} from './engine/hooks'
import { TimeComplexityCategory, SpaceComplexityCategory } from './engine/algorithmRegistry'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'

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

  const mainPanelColSpan = showAlgorithmInfo || showPseudoCode ? 'xl:col-span-5' : 'xl:col-span-8'
  const rightPanelVisible = showAlgorithmInfo || showPseudoCode

  const motionVariants = {
    initial: { opacity: 0, height: 0, y: -10 },
    animate: { opacity: 1, height: 'auto', y: 0 },
    exit: { opacity: 0, height: 0, y: -10 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  }

  const visibleMobileTabs = [
    showAlgorithmInfo && { value: 'info', label: 'Algorithm Info' },
    showPseudoCode && { value: 'code', label: 'Code & Stats' },
  ].filter(Boolean) as Array<{ value: 'info' | 'code'; label: string }>

  return (
    <main className="xl:grid xl:grid-cols-8 xl:gap-4">
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
          toggleAlgorithmInfoShortcut={toggleAlgorithmInfoShortcut}
          togglePseudoCodeShortcut={togglePseudoCodeShortcut}
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
            <AnimatePresence mode="wait">
              {showAlgorithmInfo && activeTab === 'info' && (
                <motion.div
                  key="algoInfoMobile"
                  initial={motionVariants.initial}
                  animate={motionVariants.animate}
                  exit={motionVariants.exit}
                  transition={motionVariants.transition}
                  className="overflow-hidden"
                >
                  <TabsContent value="info" forceMount>
                    <AlgorithmInfoDisplay selectedAlgorithm={selectedAlgorithm} />
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {showPseudoCode && activeTab === 'code' && (
                <motion.div
                  key="pseudoCodeMobile"
                  initial={motionVariants.initial}
                  animate={motionVariants.animate}
                  exit={motionVariants.exit}
                  transition={motionVariants.transition}
                  className="overflow-hidden"
                >
                  <TabsContent value="code" forceMount>
                    <PseudoCodeDisplay
                      algorithmName={selectedAlgorithm?.name}
                      pseudoCode={selectedAlgorithm?.pseudoCodes?.[currentPseudoCodeLanguage]}
                      activeLine={currentSortStep?.currentPseudoCodeLine}
                      language={currentPseudoCodeLanguage}
                      onLanguageChange={setCurrentPseudoCodeLanguage}
                      sortStats={displayedSortStats}
                    />
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      )}

      {/* Desktop Right Panel (AlgorithmInfo top, PseudoCode/Stats bottom) */}
      {rightPanelVisible && (
        <div className="hidden xl:grid xl:col-span-3 h-fit gap-4">
          <AnimatePresence>
            {showAlgorithmInfo && (
              <motion.div
                key="algoInfoDesktop"
                initial={motionVariants.initial}
                animate={motionVariants.animate}
                exit={motionVariants.exit}
                transition={motionVariants.transition}
                className="overflow-hidden"
              >
                <AlgorithmInfoDisplay selectedAlgorithm={selectedAlgorithm} />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showPseudoCode && (
              <motion.div
                key="pseudoCodeDesktop"
                initial={motionVariants.initial}
                animate={motionVariants.animate}
                exit={motionVariants.exit}
                transition={motionVariants.transition}
                className="overflow-hidden"
              >
                <PseudoCodeDisplay
                  algorithmName={selectedAlgorithm?.name}
                  pseudoCode={selectedAlgorithm?.pseudoCodes?.[currentPseudoCodeLanguage]}
                  activeLine={currentSortStep?.currentPseudoCodeLine}
                  language={currentPseudoCodeLanguage}
                  onLanguageChange={setCurrentPseudoCodeLanguage}
                  sortStats={displayedSortStats}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </main>
  )
}
