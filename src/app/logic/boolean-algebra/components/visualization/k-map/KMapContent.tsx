'use client'

import React from 'react'
import { KMapResult } from './types'
import { KMapWaiting } from './KMapWaiting'
import { KMapError } from './KMapError'
import { KMapSuccess } from './KMapSuccess'

interface KMapContentProps {
  kmapResult: KMapResult
  isFullscreen: boolean
}

export function KMapContent({ kmapResult, isFullscreen }: KMapContentProps) {
  if (kmapResult.status === 'waiting') {
    return <KMapWaiting />
  }

  if (kmapResult.status === 'error') {
    return <KMapError result={kmapResult} />
  }

  if (kmapResult.status === 'success') {
    return <KMapSuccess result={kmapResult} isFullscreen={isFullscreen} />
  }

  // Fallback
  return <KMapWaiting />
}
