'use client'

import { useState } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev)
  }

  return {
    isFullscreen,
    toggleFullscreen,
  }
}
