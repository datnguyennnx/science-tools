'use client'

import React from 'react'
import { KMapGrid } from './KMapGrid'
import { KMapLegend } from './KMapLegend'
import { KMapResultSuccess } from './types'

interface KMapSuccessProps {
  result: KMapResultSuccess
  isFullscreen: boolean
}

export function KMapSuccess({ result, isFullscreen }: KMapSuccessProps) {
  const { maps, isMultiMap } = result

  if (isMultiMap) {
    // Use flex layout for multi-map display
    return (
      <div className="w-full h-full flex flex-col items-center">
        <div
          className={`flex flex-col ${isFullscreen ? 'flex-row space-x-6' : 'space-y-2'} w-full flex-grow`}
        >
          {maps.map(mapData => (
            <div key={mapData.title} className="flex-1 border rounded-lg p-4 min-w-0 flex flex-col">
              <h3 className="text-lg font-semibold mb-3 text-center">{mapData.title}</h3>
              <div className="flex-grow flex items-center justify-center">
                <KMapGrid
                  config={mapData.kMapConfig}
                  mintermSet={mapData.mintermSet}
                  groups={mapData.groups}
                  showMintermNumbers={true}
                />
              </div>
            </div>
          ))}
        </div>
        {/* Add shared legend below the maps */}
        <div className="space-y-4">
          <div className="w-full flex flex-col justify-center items-center space-y-2">
            <h2 className="font-bold w-full items-start">Group Legend</h2>
            <KMapLegend />
            <p className="ba-text-muted">
              Each group represents a term in the simplified boolean expression. Larger groups (more
              cells) result in simpler terms.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Single map rendering
  const mainMap = maps[0]

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow flex flex-col justify-center">
        <KMapGrid
          config={mainMap.kMapConfig}
          mintermSet={mainMap.mintermSet}
          groups={mainMap.groups}
          showMintermNumbers={true}
        />
      </div>
      <div className="w-full text-center text-sm ba-text-muted mt-4">
        {mainMap.variables.length > 0 && (
          <p className="font-medium">
            2<sup>{mainMap.variables.length}</sup> = {Math.pow(2, mainMap.variables.length)}
            cells
          </p>
        )}
        {mainMap.mintermSet.size > 0 && (
          <p>
            with {mainMap.mintermSet.size} minterms (
            {((mainMap.mintermSet.size / Math.pow(2, mainMap.variables.length)) * 100).toFixed(1)}
            %)
          </p>
        )}
      </div>
      <div className="space-y-4 mt-4">
        <div className="w-full flex flex-col justify-center items-center space-y-2">
          <h2 className="font-bold w-full items-start">Group Legend</h2>
          <KMapLegend />
          <p className="ba-text-muted">
            Each group represents a term in the simplified boolean expression. Larger groups (more
            cells) result in simpler terms.
          </p>
        </div>
      </div>
    </div>
  )
}
