'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3' // Import D3
import { VennData2Vars, VennData3Vars, VennData } from './VennDiagramEngine'

interface VennDiagramSVGProps {
  variables: string[]
  vennData: VennData | null
  width?: number
  height?: number
  // Keeping a general highlightColor for regions not yet distinctly colored (e.g. 3-var intersections)
  // and for the universal set when 'Neither' is true if not overridden.
  universalSetTrueColor?: string
  universalSetFalseColor?: string
  strokeColor?: string
}

// Define a richer color palette using chart-x variables for distinct regions
const REGION_COLORS = {
  A_ONLY_2VAR: 'var(--venn-region-a)',
  B_ONLY_2VAR: 'var(--venn-region-b)',
  A_AND_B_2VAR: 'var(--venn-region-intersection)',

  A_ONLY_3VAR: 'var(--venn-region-a)',
  B_ONLY_3VAR: 'var(--venn-region-b)',
  C_ONLY_3VAR: 'var(--venn-region-c)',
  A_B_C_3VAR: 'var(--venn-region-intersection)',
  A_B_ONLY_3VAR: 'var(--venn-region-a)', // Placeholder, can be customized
  A_C_ONLY_3VAR: 'var(--venn-region-b)', // Placeholder, can be customized
  B_C_ONLY_3VAR: 'var(--venn-region-c)', // Placeholder, can be customized

  NEITHER_TRUE: 'var(--venn-bg)',
  NEITHER_FALSE: 'var(--muted)',
}

const DEFAULT_STROKE_COLOR = 'var(--venn-border)'
const INSIDE_STROKE_COLOR = 'var(--venn-border-inside)'
const LABEL_COLOR = 'hsl(var(--foreground))'
const UNIVERSAL_SET_STROKE_COLOR = 'var(--venn-border)'

export const VennDiagramSVG: React.FC<VennDiagramSVGProps> = ({
  variables,
  vennData,
  width = 350,
  height = 250,
  // Props below are less critical now as specific colors are defined in REGION_COLORS
  // but can be kept for fallback or if direct override is desired for some elements.
  universalSetTrueColor = REGION_COLORS.NEITHER_TRUE,
  universalSetFalseColor = REGION_COLORS.NEITHER_FALSE,
  strokeColor = DEFAULT_STROKE_COLOR,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const numVars = variables.length
  const universalSetPadding = Math.min(width, height) * 0.15
  const labelFontSize = Math.max(10, Math.min(width, height) / 18)

  useEffect(() => {
    if (!svgRef.current || !vennData) {
      // Clear previous drawing if data is invalid or ref is not available
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove()
      }
      return
    }

    // Only proceed with D3 if numVars is 2 or 3
    if (numVars !== 2 && numVars !== 3) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove() // Clear if previously drawn
      }
      return // D3 rendering functions won't be called
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous contents before redrawing

    const universalSetStrokeWidth = 2
    const insideBorderWidth = 1.4
    const currentUniversalSetFill = (vennData as VennData2Vars | VennData3Vars).Neither
      ? universalSetTrueColor
      : universalSetFalseColor

    // Draw Universal Set Background
    svg
      .append('rect')
      .attr('x', universalSetPadding / 2)
      .attr('y', universalSetPadding / 2)
      .attr('width', width - universalSetPadding)
      .attr('height', height - universalSetPadding)
      .attr('fill', currentUniversalSetFill)
      .attr('stroke', UNIVERSAL_SET_STROKE_COLOR)
      .attr('stroke-width', universalSetStrokeWidth)
      .attr('rx', Math.min(width, height) * 0.02)

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

    // D3 rendering logic will go here based on numVars (2 or 3)
    if (numVars === 2) {
      renderD3TwoVarDiagram(
        svg,
        vennData as VennData2Vars,
        variables,
        width,
        height,
        universalSetPadding,
        strokeColor,
        labelFontSize,
        insideBorderWidth
      )
    } else if (numVars === 3) {
      renderD3ThreeVarDiagram(
        svg,
        vennData as VennData3Vars,
        variables,
        width,
        height,
        universalSetPadding,
        strokeColor,
        labelFontSize
      )
    }
  }, [
    vennData,
    variables,
    width,
    height,
    universalSetTrueColor,
    universalSetFalseColor,
    strokeColor,
    numVars,
    universalSetPadding,
    labelFontSize,
  ])

  // Placeholder D3 rendering functions - to be implemented
  function renderD3TwoVarDiagram(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    data: VennData2Vars,
    currentVariables: string[],
    svgWidth: number,
    svgHeight: number,
    padding: number,
    circleStroke: string,
    fontSize: number,
    insideBorderWidth: number
  ) {
    const diagramWidth = svgWidth - 2 * padding
    const diagramHeight = svgHeight - 2 * padding
    const r = Math.min(diagramWidth, diagramHeight) * 0.33
    const cx1 = padding + diagramWidth * 0.35
    const cy = padding + diagramHeight * 0.5
    const cx2 = padding + diagramWidth * 0.65
    const defs = svg.append('defs')

    // Define circle paths for masks/clips if needed, or draw directly
    defs.append('circle').attr('id', 'venn2A').attr('cx', cx1).attr('cy', cy).attr('r', r)
    defs.append('circle').attr('id', 'venn2B').attr('cx', cx2).attr('cy', cy).attr('r', r)

    // Mask for A only (A \ B)
    const maskAOnly = defs.append('mask').attr('id', 'maskAOnlyD3')
    maskAOnly
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .attr('fill', 'white')
    maskAOnly.append('use').attr('xlink:href', '#venn2B').attr('fill', 'black')

    // Mask for B only (B \ A)
    const maskBOnly = defs.append('mask').attr('id', 'maskBOnlyD3')
    maskBOnly
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .attr('fill', 'white')
    maskBOnly.append('use').attr('xlink:href', '#venn2A').attr('fill', 'black')

    // ClipPath for A ∩ B (Intersection)
    const clipIntersectionAB = defs.append('clipPath').attr('id', 'clipIntersectionABD3')
    clipIntersectionAB.append('use').attr('xlink:href', '#venn2A')

    // Draw the regions based on data
    if (data.A_only) {
      svg
        .append('use')
        .attr('xlink:href', '#venn2A')
        .attr('fill', REGION_COLORS.A_ONLY_2VAR)
        .attr('fill-opacity', 0.5)
        .attr('mask', 'url(#maskAOnlyD3)')
        .attr('stroke', INSIDE_STROKE_COLOR)
        .attr('stroke-width', insideBorderWidth)
        .on('mouseover', function () {
          d3.select(this).attr('fill-opacity', 0.8).attr('filter', 'drop-shadow(0 0 6px #0002)')
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill-opacity', 0.5).attr('filter', null)
        })
        .append('title')
        .text(`${currentVariables[0]} only`)
    }
    if (data.B_only) {
      svg
        .append('use')
        .attr('xlink:href', '#venn2B')
        .attr('fill', REGION_COLORS.B_ONLY_2VAR)
        .attr('fill-opacity', 0.5)
        .attr('mask', 'url(#maskBOnlyD3)')
        .attr('stroke', INSIDE_STROKE_COLOR)
        .attr('stroke-width', insideBorderWidth)
        .on('mouseover', function () {
          d3.select(this).attr('fill-opacity', 0.8).attr('filter', 'drop-shadow(0 0 6px #0002)')
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill-opacity', 0.5).attr('filter', null)
        })
        .append('title')
        .text(`${currentVariables[1]} only`)
    }
    if (data.A_and_B) {
      svg
        .append('use')
        .attr('xlink:href', '#venn2B')
        .attr('fill', REGION_COLORS.A_AND_B_2VAR)
        .attr('fill-opacity', 0.7)
        .attr('clip-path', 'url(#clipIntersectionABD3)')
        .attr('stroke', INSIDE_STROKE_COLOR)
        .attr('stroke-width', insideBorderWidth)
        .on('mouseover', function () {
          d3.select(this).attr('fill-opacity', 0.95).attr('filter', 'drop-shadow(0 0 8px #0003)')
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill-opacity', 0.7).attr('filter', null)
        })
        .append('title')
        .text(`${currentVariables[0]} ∩ ${currentVariables[1]}`)
    }

    // Base circle outlines (drawn on top of fills or separately if fills are opaque)
    svg
      .append('use')
      .attr('xlink:href', '#venn2A')
      .attr('fill', 'none')
      .attr('stroke', circleStroke)
      .attr('stroke-width', 2.2)
    svg
      .append('use')
      .attr('xlink:href', '#venn2B')
      .attr('fill', 'none')
      .attr('stroke', circleStroke)
      .attr('stroke-width', 2.2)

    // Labels
    svg
      .append('text')
      .attr('x', cx1)
      .attr('y', cy - r - fontSize * 0.7)
      .attr('font-size', fontSize * 1.1)
      .attr('fill', LABEL_COLOR)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 700)
      .attr('font-family', 'var(--font-sans), sans-serif')
      .text(currentVariables[0])
    svg
      .append('text')
      .attr('x', cx2)
      .attr('y', cy - r - fontSize * 0.7)
      .attr('font-size', fontSize * 1.1)
      .attr('fill', LABEL_COLOR)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 700)
      .attr('font-family', 'var(--font-sans), sans-serif')
      .text(currentVariables[1])
  }

  function renderD3ThreeVarDiagram(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    data: VennData3Vars,
    currentVariables: string[],
    svgWidth: number,
    svgHeight: number,
    padding: number,
    circleStroke: string,
    fontSize: number
  ) {
    const diagramWidth = svgWidth - 2 * padding
    const diagramHeight = svgHeight - 2 * padding
    const r = Math.min(diagramWidth, diagramHeight) * 0.28
    const midX = padding + diagramWidth / 2
    const midY = padding + diagramHeight / 2
    const c1x = midX
    const c1y = midY - r * 0.6
    const c2x = midX - r * 0.866 * 0.7
    const c2y = midY + r * 0.5
    const c3x = midX + r * 0.866 * 0.7
    const c3y = midY + r * 0.5

    // Draw base circles (outlines)
    svg
      .append('circle')
      .attr('cx', c1x)
      .attr('cy', c1y)
      .attr('r', r)
      .attr('fill', 'none')
      .attr('stroke', circleStroke)
      .attr('stroke-width', 2.2)
    svg
      .append('circle')
      .attr('cx', c2x)
      .attr('cy', c2y)
      .attr('r', r)
      .attr('fill', 'none')
      .attr('stroke', circleStroke)
      .attr('stroke-width', 2.2)
    svg
      .append('circle')
      .attr('cx', c3x)
      .attr('cy', c3y)
      .attr('r', r)
      .attr('fill', 'none')
      .attr('stroke', circleStroke)
      .attr('stroke-width', 2.2)

    // Simplified fill based on 'only' and 'A_B_C' for now
    if (data.A_only)
      svg
        .append('circle')
        .attr('cx', c1x)
        .attr('cy', c1y)
        .attr('r', r)
        .attr('fill', REGION_COLORS.A_ONLY_3VAR)
        .attr('fill-opacity', 0.5) // Needs masking
    if (data.B_only)
      svg
        .append('circle')
        .attr('cx', c2x)
        .attr('cy', c2y)
        .attr('r', r)
        .attr('fill', REGION_COLORS.B_ONLY_3VAR)
        .attr('fill-opacity', 0.5) // Needs masking
    if (data.C_only)
      svg
        .append('circle')
        .attr('cx', c3x)
        .attr('cy', c3y)
        .attr('r', r)
        .attr('fill', REGION_COLORS.C_ONLY_3VAR)
        .attr('fill-opacity', 0.5) // Needs masking

    // A_B_C intersection - approximate center for the blob
    if (data.A_B_C) {
      // A more accurate center would be the geometric center of the three circle centers' intersection area.
      // This is a rough approximation.
      const approxCenterX = midX
      const approxCenterY = midY + r * 0.1 // Shifted slightly down from c1y, towards c2y/c3y intersection
      svg
        .append('circle')
        .attr('cx', approxCenterX)
        .attr('cy', approxCenterY)
        .attr('r', r * 0.4) // Smaller circle for the central intersection
        .attr('fill', REGION_COLORS.A_B_C_3VAR)
        .attr('fill-opacity', 0.7)
        .attr('stroke', circleStroke)
        .attr('stroke-width', 1.2)
        .on('mouseover', function () {
          d3.select(this).attr('fill-opacity', 0.95).attr('filter', 'drop-shadow(0 0 8px #0003)')
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill-opacity', 0.7).attr('filter', null)
        })
        .append('title')
        .text(`${currentVariables[0]} ∩ ${currentVariables[1]} ∩ ${currentVariables[2]}`)
    }

    // Placeholder for more complex D3 path logic for other intersections (AB, AC, BC only)
    // if (data.A_B_only) { /* D3 code to draw path for A_B_only, e.g. using REGION_COLORS.A_B_ONLY_3VAR */ }
    // if (data.A_C_only) { /* D3 code to draw path for A_C_only */ }
    // if (data.B_C_only) { /* D3 code to draw path for B_C_only */ }

    // Labels
    svg
      .append('text')
      .attr('x', c1x)
      .attr('y', c1y - r - fontSize * 0.7)
      .attr('font-size', fontSize * 1.1)
      .attr('fill', LABEL_COLOR)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 700)
      .attr('font-family', 'var(--font-sans), sans-serif')
      .text(currentVariables[0])
    svg
      .append('text')
      .attr('x', c2x - r * 0.7)
      .attr('y', c2y + r + fontSize * 0.4)
      .attr('font-size', fontSize * 1.1)
      .attr('fill', LABEL_COLOR)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 700)
      .attr('font-family', 'var(--font-sans), sans-serif')
      .text(currentVariables[1])
    svg
      .append('text')
      .attr('x', c3x + r * 0.7)
      .attr('y', c3y + r + fontSize * 0.4)
      .attr('font-size', fontSize * 1.1)
      .attr('fill', LABEL_COLOR)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 700)
      .attr('font-family', 'var(--font-sans), sans-serif')
      .text(currentVariables[2])
  }

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

  if (numVars !== 2 && numVars !== 3) {
    // Covers cases where vennData might be null or valid for wrong numVars
    return (
      <div className={fallbackBaseClass}>
        <p>Venn Diagram cannot be generated.</p>
        <p className="text-xs mt-1">
          This visualization supports 2 or 3 variables. Detected {numVars} (
          {variables.join(', ') || 'none'}).
        </p>
      </div>
    )
  }

  // If vennData is null but numVars is 2 or 3 (e.g. error during vennData generation for supported vars)
  // This case should ideally be caught by the parent component's error state.
  // However, if VennDiagramSVG is called directly with such props:
  if (!vennData) {
    // And we know numVars IS 2 or 3 from above check not being met
    return (
      <div className={fallbackBaseClass}>
        <p>Venn Diagram: Error generating data.</p>
        <p className="text-xs mt-1">Please check the expression for {numVars} variables.</p>
      </div>
    )
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      aria-label={`Venn diagram for ${variables.join(', ')}`}
      role="img"
    >
      {/* D3 will render content here */}
      {/* Fallback message if D3 fails or for unsupported var counts not caught by initial checks */}
      {numVars !== 2 && numVars !== 3 && vennData && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fill={strokeColor}
          fontSize={labelFontSize * 0.9}
        >
          D3 Venn: {numVars} vars not drawn (supports 2-3).
        </text>
      )}
    </svg>
  )
}
