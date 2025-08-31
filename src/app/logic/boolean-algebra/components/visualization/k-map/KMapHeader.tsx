'use client'

import React from 'react'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { KMapResult } from './types'

interface KMapHeaderProps {
  kmapResult: KMapResult
  isFullscreen: boolean
}

export function KMapHeader({ kmapResult, isFullscreen }: KMapHeaderProps) {
  const cardTitle = 'Karnaugh Map'
  const defaultCardDescription = 'Visualization limited to 2-5 variables'

  return (
    <>
      <CardTitle>{cardTitle}</CardTitle>
      {isFullscreen ? (
        kmapResult.status === 'waiting' ? (
          <CardDescription>{defaultCardDescription}</CardDescription>
        ) : kmapResult.status === 'error' ? (
          <CardDescription className="text-destructive">{kmapResult.message}</CardDescription>
        ) : (
          <CardDescription>{defaultCardDescription}</CardDescription>
        )
      ) : kmapResult.status === 'success' ? (
        <CardDescription>
          Visual tool for Boolean simplification with {kmapResult.allVariables.length}
          variables ({kmapResult.allVariables.join(', ')})
          {kmapResult.maps.length > 0 && ` and ${kmapResult.maps[0].mintermSet.size} minterms`}
          {kmapResult.isMultiMap && ` (Split into ${kmapResult.maps.length} maps)`}
        </CardDescription>
      ) : kmapResult.status === 'waiting' ? (
        <CardDescription>{defaultCardDescription}</CardDescription>
      ) : (
        <CardDescription>{defaultCardDescription}</CardDescription>
      )}
    </>
  )
}
