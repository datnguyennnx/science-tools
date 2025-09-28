'use client'

import React, { useState } from 'react'
import './styles.css'
import { Button } from '@/components/ui/button'
import { TextInput } from './components/inputs'
import { TextPreview } from './components/displays/textPreview'
import { useTextDiff } from './engine/hooks/useTextDiff'
import {
  DEFAULT_TEXT_1,
  DEFAULT_TEXT_2,
  BUTTON_LABELS,
  ARIA_LABELS,
  STATUS_MESSAGES,
  PLACEHOLDER_TEXT_1,
  PLACEHOLDER_TEXT_2,
  SECTION_LABELS,
} from './engine/constants'

export default function TextDiffPage() {
  const [text1, setText1] = useState(DEFAULT_TEXT_1)
  const [text2, setText2] = useState(DEFAULT_TEXT_2)
  const [showInputs, setShowInputs] = useState(true)
  const { compareTexts, getDiffStats, hasDifferences } = useTextDiff()

  const diffResults = compareTexts(text1, text2)
  const stats = getDiffStats(diffResults)
  const hasDiff = hasDifferences(text1, text2)

  const handleClear = () => {
    setText1('')
    setText2('')
  }

  const handleLoadSample = () => {
    setText1(DEFAULT_TEXT_1)
    setText2(DEFAULT_TEXT_2)
  }

  return (
    <main
      className="flex flex-col focus:outline-none"
      role="main"
      aria-label={ARIA_LABELS.textDiffTool}
    >
      {/* Header with toolbar */}
      <header
        className="flex items-center justify-between p-4 pb-3 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/30"
        role="banner"
        aria-label={ARIA_LABELS.textDiffToolbar}
      >
        <nav
          className="flex items-center gap-2"
          role="navigation"
          aria-label={ARIA_LABELS.textDiffActions}
        >
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            onClick={handleLoadSample}
            aria-label={ARIA_LABELS.loadSampleAria}
          >
            {BUTTON_LABELS.loadSample}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            onClick={handleClear}
            disabled={!text1 && !text2}
            aria-label={ARIA_LABELS.clearAllAria}
          >
            {BUTTON_LABELS.clearAll}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            onClick={() => setShowInputs(!showInputs)}
            aria-label={showInputs ? 'Hide input panels' : 'Show input panels'}
          >
            {showInputs ? 'Hide Inputs' : 'Show Inputs'}
          </Button>
        </nav>

        {/* Status indicator */}
        <div className="text-xs text-muted-foreground">
          {hasDiff ? (
            <span className="diff-status-changes font-medium">
              {STATUS_MESSAGES.differencesFound}
            </span>
          ) : (
            <span className="diff-status-match font-medium">{STATUS_MESSAGES.textsMatch}</span>
          )}
        </div>
      </header>

      {/* Main content - Two column layout */}
      {showInputs && (
        <div
          className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 pt-3 min-h-0"
          role="region"
          aria-label="Text Comparison Workspace"
        >
          {/* Left input panel */}
          <section className="flex flex-col h-full min-h-0" aria-labelledby="left-input-heading">
            <h2 id="left-input-heading" className="sr-only">
              {ARIA_LABELS.originalTextInput}
            </h2>
            <div className="flex-1 min-h-0">
              <TextInput
                value={text1}
                onChange={setText1}
                label={SECTION_LABELS.originalText}
                placeholder={PLACEHOLDER_TEXT_1}
                className="h-full w-full"
              />
            </div>
          </section>

          {/* Right input panel */}
          <section className="flex flex-col h-full min-h-0" aria-labelledby="right-input-heading">
            <h2 id="right-input-heading" className="sr-only">
              {ARIA_LABELS.modifiedTextInput}
            </h2>
            <div className="flex-1 min-h-0">
              <TextInput
                value={text2}
                onChange={setText2}
                label={SECTION_LABELS.modifiedText}
                placeholder={PLACEHOLDER_TEXT_2}
                className="h-full w-full"
              />
            </div>
          </section>
        </div>
      )}

      {/* Diff results panel - Full width below */}
      <div className="flex-1 p-4 pt-0 min-h-0" role="region" aria-labelledby="diff-results-heading">
        <h2 id="diff-results-heading" className="sr-only">
          {ARIA_LABELS.textDifferenceResults}
        </h2>
        <div className="h-full ">
          <TextPreview diffResults={diffResults} stats={stats} className="h-full w-full" />
        </div>
      </div>
    </main>
  )
}
