import React, { useEffect, useRef } from 'react'
import { DiffResult } from '../types'
import { STATUS_MESSAGES } from '../constants'

export interface ChangeNavigationData {
  result: DiffResult
  index: number
}

export function useScrollToChange(currentChangeIndex: number) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const currentChangeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentChangeRef.current && scrollContainerRef.current) {
      currentChangeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentChangeIndex])

  return { scrollContainerRef, currentChangeRef }
}

export function useSynchronizedScroll() {
  const leftScrollRef = useRef<HTMLDivElement>(null)
  const rightScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isScrollingLeft = false
    let isScrollingRight = false

    const handleLeftScroll = () => {
      if (isScrollingLeft) return
      isScrollingRight = true

      if (leftScrollRef.current && rightScrollRef.current) {
        rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop
      }

      setTimeout(() => {
        isScrollingRight = false
      }, 10)
    }

    const handleRightScroll = () => {
      if (isScrollingRight) return
      isScrollingLeft = true

      if (rightScrollRef.current && leftScrollRef.current) {
        leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop
      }

      setTimeout(() => {
        isScrollingLeft = false
      }, 10)
    }

    const leftContainer = leftScrollRef.current
    const rightContainer = rightScrollRef.current

    if (leftContainer && rightContainer) {
      leftContainer.addEventListener('scroll', handleLeftScroll, { passive: true })
      rightContainer.addEventListener('scroll', handleRightScroll, { passive: true })

      return () => {
        leftContainer.removeEventListener('scroll', handleLeftScroll)
        rightContainer.removeEventListener('scroll', handleRightScroll)
      }
    }
  }, [])

  return { leftScrollRef, rightScrollRef }
}

export function renderEmptyState(): React.ReactElement {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground p-4">
      <div className="text-center">
        <p className="text-sm">{STATUS_MESSAGES.noDifferences}</p>
        <p className="text-xs mt-1">{STATUS_MESSAGES.enterTextToCompare}</p>
      </div>
    </div>
  )
}

export function getCurrentChangeHighlight(isCurrent: boolean): string {
  return isCurrent
    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
}
