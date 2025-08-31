'use client'

import React from 'react'
import { CardFooter } from '@/components/ui/card'
import { VennDiagramSVG } from './VennDiagramSVG'
import { VennLegend } from './VennLegend'
import { VennData5Vars } from './VennDiagramEngine'
import type { VennDiagramResultType } from './types'

interface VennDiagramContentProps {
  vennDiagramResult: VennDiagramResultType
  isFullscreen: boolean
}

export function VennDiagramContent({ vennDiagramResult, isFullscreen }: VennDiagramContentProps) {
  // Define classes based on fullscreen state
  const rootContentDivClass = isFullscreen
    ? 'w-full max-w-6xl mx-auto max-h-[calc(100vh-10rem)] flex flex-col items-center justify-center ' // Fullscreen: constrained, centered, padding inside
    : 'w-full h-full flex flex-col items-center justify-start ' // Normal: fill container, start alignment, top padding

  if (vennDiagramResult.status === 'waiting') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-md min-h-[15rem]">
        <p className="text-sm">Enter an expression to generate a Venn Diagram.</p>
        <p className="text-sm mt-2">Venn Diagrams support 2 to 5 variables.</p>
      </div>
    )
  }

  if (vennDiagramResult.status === 'error') {
    return (
      <div className="border-2 border-dashed rounded-md flex flex-col items-center justify-center h-full p-6 min-h-[15rem] text-center">
        <p className="mb-2 text-base font-medium">{vennDiagramResult.message}</p>
        {vennDiagramResult.details && (
          <p className="text-sm mt-1 ba-text-muted">{vennDiagramResult.details}</p>
        )}
        {vennDiagramResult.variables && vennDiagramResult.variables.length > 0 && (
          <p className="text-sm mt-2">
            Detected variables: {vennDiagramResult.variables.join(', ')}
          </p>
        )}
      </div>
    )
  }

  // Success state
  const { variables, vennData, numVars } = vennDiagramResult

  // Common structure for success state
  const renderSuccessContent = (diagramContent: React.ReactNode) => (
    <div className={rootContentDivClass}>
      {/* Diagram(s) */}
      {diagramContent}

      {/* Legend */}
      <VennLegend variables={variables} numVars={numVars} />

      {/* Footer */}
      <CardFooter className="mt-auto pt-4 border-t w-full flex flex-col items-center">
        <p className="text-xs ba-text-muted text-center">
          {numVars === 5
            ? `Diagram for ${numVars} variables: ${variables.join(', ')}. Displaying two 4-variable diagrams, one for each value of ${(vennData as VennData5Vars).E_name}.`
            : `Diagram for ${numVars} variables: ${variables.join(', ')}. Highlighted regions represent areas where the expression is true.`}
        </p>
      </CardFooter>
    </div>
  )

  if (numVars === 5) {
    const fiveVarData = vennData as VennData5Vars
    const diagramContent = (
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full pb-2 text-center">
          <p className="font-bold">5-Variable Venn Diagram</p>
        </div>
        <div
          className={`flex ${isFullscreen ? 'flex-row space-x-4' : 'flex-col space-y-4'} w-full`}
        >
          {/* Diagram E=1 */}
          <div className="flex-1 rounded-md flex flex-col items-center">
            <h4 className="text-sm font-bold text-center">When {fiveVarData.E_name} = 1</h4>
            <VennDiagramSVG variables={variables.slice(0, 4)} vennData={fiveVarData.whenEIsTrue} />
          </div>
          {/* Diagram E=0 */}
          <div className="flex-1 rounded-md flex flex-col items-center">
            <h4 className="text-sm font-bold text-center">When {fiveVarData.E_name} = 0</h4>
            <VennDiagramSVG variables={variables.slice(0, 4)} vennData={fiveVarData.whenEIsFalse} />
          </div>
        </div>
      </div>
    )
    return renderSuccessContent(diagramContent)
  } else {
    // Layout for 2-4 variables
    const diagramContent = (
      <div className="w-full flex-grow flex items-center justify-center">
        <VennDiagramSVG variables={variables} vennData={vennData} />
      </div>
    )
    return renderSuccessContent(diagramContent)
  }
}
