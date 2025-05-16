'use client'

import { useState, useEffect } from 'react'

interface UseSortTabViewProps {
  showAlgorithmInfo: boolean
  showPseudoCode: boolean
}

interface UseSortTabViewReturn {
  activeTab: 'info' | 'code'
  setActiveTab: React.Dispatch<React.SetStateAction<'info' | 'code'>>
}

export function useSortTabView({
  showAlgorithmInfo,
  showPseudoCode,
}: UseSortTabViewProps): UseSortTabViewReturn {
  const [activeTab, setActiveTab] = useState<'info' | 'code'>('info')

  useEffect(() => {
    if (!showAlgorithmInfo && activeTab === 'info') {
      if (showPseudoCode) {
        setActiveTab('code')
      }
      // If both are hidden, activeTab remains as is, or could be set to a null/default state.
      // The UI rendering logic in page.tsx already handles cases where tabs might not appear.
    } else if (!showPseudoCode && activeTab === 'code') {
      if (showAlgorithmInfo) {
        setActiveTab('info')
      }
    } else if (showAlgorithmInfo && activeTab === 'code' && !showPseudoCode) {
      // If pseudo code was active and gets hidden, switch to info if available
      setActiveTab('info')
    } else if (showPseudoCode && activeTab === 'info' && !showAlgorithmInfo) {
      // If info was active and gets hidden, switch to pseudo code if available
      setActiveTab('code')
    } else if (showAlgorithmInfo && !activeTab) {
      // Default to 'info' if it's visible and no tab is active (e.g. after both were hidden)
      setActiveTab('info')
    } else if (showPseudoCode && !activeTab && !showAlgorithmInfo) {
      // Default to 'code' if it's the only one visible and no tab is active
      setActiveTab('code')
    }
  }, [showAlgorithmInfo, showPseudoCode, activeTab])

  return { activeTab, setActiveTab }
}
