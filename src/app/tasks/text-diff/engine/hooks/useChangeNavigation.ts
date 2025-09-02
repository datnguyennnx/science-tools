import { useState } from 'react'
import { DiffResult } from '../types'
import { ChangeNavigationData } from '../utils/viewUtils'

export function useChangeNavigation(diffResults: DiffResult[]) {
  const changedLines: ChangeNavigationData[] = diffResults
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => result.type !== 'unchanged')

  const [currentChangeIndex, setCurrentChangeIndex] = useState(0)

  const navigateToChange = (direction: 'prev' | 'next') => {
    if (changedLines.length === 0) return

    if (direction === 'prev') {
      setCurrentChangeIndex(prev => (prev > 0 ? prev - 1 : changedLines.length - 1))
    } else {
      setCurrentChangeIndex(prev => (prev < changedLines.length - 1 ? prev + 1 : 0))
    }
  }

  const resetNavigation = () => {
    setCurrentChangeIndex(0)
  }

  return {
    changedLines,
    currentChangeIndex,
    navigateToChange,
    resetNavigation,
    hasChanges: changedLines.length > 0,
    canNavigate: changedLines.length > 1,
  }
}
