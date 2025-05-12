'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3' // Import D3
import { VennData2Vars, VennData3Vars, VennData4Vars, VennData } from './VennDiagramEngine'

// Import the new renderer functions
import { renderD3TwoVarDiagram, renderD3ThreeVarDiagram, renderD3FourVarDiagram } from './renderers'
import { VENN_SET_COLORS, LABEL_COLOR, VENN_STROKE_COLORS } from '../utils/colors'

interface VennDiagramSVGProps {
  variables: string[]
  vennData: VennData | null
  width?: number
  height?: number
  universalSetTrueColor?: string
  universalSetFalseColor?: string
  strokeColor?: string
  className?: string // Allow className to be passed
}

export const VennDiagramSVG = ({
  variables,
  vennData,
  width,
  height,
  universalSetTrueColor = VENN_SET_COLORS.NEITHER_TRUE,
  universalSetFalseColor = VENN_SET_COLORS.NEITHER_FALSE,
  strokeColor = VENN_STROKE_COLORS.DEFAULT, // Use imported constant
  className,
}: VennDiagramSVGProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null) // Ref for the container div
  const numVars = variables.length
  const universalSetPadding = Math.min(width || 350, height || 250) * 0.15
  const labelFontSize = Math.max(10, Math.min(width || 350, height || 250) / 18)

  useEffect(() => {
    if (!containerRef.current || !vennData) {
      // Clear previous drawing if data is invalid or ref is not available
      if (containerRef.current) {
        d3.select(containerRef.current).selectAll('*').remove()
      }
      return
    }

    // Only proceed with D3 if numVars is 2, 3, or 4.
    // The 5-variable case is handled by the parent `VennDiagram` component,
    // which passes 4-variable data structures to this SVG component.
    if (numVars !== 2 && numVars !== 3 && numVars !== 4) {
      if (containerRef.current) {
        d3.select(containerRef.current).selectAll('*').remove() // Clear if previously drawn
      }
      return // D3 rendering functions won't be called
    }

    const container = d3.select(containerRef.current)
    container.selectAll('*').remove() // Clear previous contents before redrawing

    // Create the SVG element inside the container
    const svg = container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width || 350} ${height || 250}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('aria-label', `Venn diagram visualization`)
      .attr('role', 'img')

    const universalSetStrokeWidth = 2
    // Safely determine the fill color for the universal set
    let currentUniversalSetFill = universalSetFalseColor // Default to false color
    if ('Neither' in vennData) {
      currentUniversalSetFill = (vennData as VennData2Vars | VennData3Vars | VennData4Vars).Neither
        ? universalSetTrueColor
        : universalSetFalseColor
    }

    // Draw Universal Set Background
    svg
      .append('rect')
      .attr('x', universalSetPadding / 2)
      .attr('y', universalSetPadding / 2)
      .attr('width', (width || 350) - universalSetPadding)
      .attr('height', (height || 250) - universalSetPadding)
      .attr('fill', currentUniversalSetFill)
      .attr('stroke', VENN_STROKE_COLORS.UNIVERSAL_SET) // Use imported constant
      .attr('stroke-width', universalSetStrokeWidth)
      .attr('rx', Math.min(width || 350, height || 250) * 0.02)

    svg
      .append('text')
      .attr('x', universalSetPadding)
      .attr('y', universalSetPadding + labelFontSize * 1.2)
      .attr('font-size', labelFontSize * 1.15)
      .attr('fill', LABEL_COLOR)
      .attr('opacity', 0.7)
      .attr('font-weight', 700)
      .attr('font-family', 'var(--font-sans), sans-serif')
      .text('U')

    // Call the imported renderer functions based on the actual number of variables
    // passed to this component (expected to be 2, 3, or 4)
    if (numVars === 2) {
      renderD3TwoVarDiagram(
        svg,
        vennData as VennData2Vars,
        variables, // Pass the original variables array
        width || 350,
        height || 250,
        universalSetPadding,
        strokeColor,
        labelFontSize
      )
    } else if (numVars === 3) {
      renderD3ThreeVarDiagram(
        svg,
        vennData as VennData3Vars,
        variables, // Pass the original variables array
        width || 350,
        height || 250,
        universalSetPadding,
        strokeColor,
        labelFontSize
      )
    } else if (numVars === 4) {
      // Note: This handles both true 4-variable cases and the sub-diagrams for 5-variables
      renderD3FourVarDiagram(
        svg,
        vennData as VennData4Vars,
        variables, // Pass the relevant variables (first 4 for 5-var case)
        width || 350,
        height || 250,
        universalSetPadding,
        strokeColor,
        labelFontSize
      )
    }
  }, [
    vennData,
    variables, // Add variables here
    width,
    height,
    universalSetTrueColor,
    universalSetFalseColor,
    strokeColor,
    numVars, // Recalculated anyway, but good practice
    universalSetPadding,
    labelFontSize,
  ])

  // Fallback UI: Render a styled div if conditions are not met for D3 rendering
  const fallbackBaseClass =
    'w-full h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md min-h-[12rem] text-muted-foreground'

  if (!vennData && variables.length === 0) {
    return (
      <div className={fallbackBaseClass}>
        <p>Venn Diagram: Please enter an expression.</p>
      </div>
    )
  }

  // Check if the number of variables passed is outside the 2-5 range handled by the parent
  if (numVars < 2 || numVars > 5) {
    return (
      <div className={fallbackBaseClass}>
        <p>Venn Diagram cannot be generated.</p>
        <p className="text-sm mt-1">
          This tool supports 2 to 5 variables. Detected {numVars} ({variables.join(', ') || 'none'}
          ).
        </p>
      </div>
    )
  }

  // Check if data is missing for a supported number of variables (2-5)
  if (!vennData && numVars >= 2 && numVars <= 5) {
    return (
      <div className={fallbackBaseClass}>
        <p>Venn Diagram: Error generating data.</p>
        <p className="text-sm mt-1">Please check the expression for {numVars} variables.</p>
      </div>
    )
  }

  // Return the container div. D3 will append the SVG inside it via useEffect.
  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center ${className || ''}`} // Apply flex and pass className
    >
      {/* SVG will be appended here by D3 */}
    </div>
  )
}
