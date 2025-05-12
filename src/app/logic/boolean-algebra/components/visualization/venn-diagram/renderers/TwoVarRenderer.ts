import * as d3 from 'd3'
import { VennData2Vars } from '../VennDiagramEngine'
import { VENN_SET_COLORS, VENN_STROKE_COLORS, LABEL_COLOR } from '../../utils'

// Exported 2-Variable Renderer Function
export function renderD3TwoVarDiagram(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  data: VennData2Vars,
  currentVariables: string[],
  svgWidth: number,
  svgHeight: number,
  padding: number,
  circleStroke: string,
  fontSize: number
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
      .attr('fill', VENN_SET_COLORS.A) // Use semantic variable
      .attr('fill-opacity', 0.5)
      .attr('mask', 'url(#maskAOnlyD3)')
      .attr('stroke', VENN_STROKE_COLORS.INSIDE)
      .attr('stroke-width', 2.2)
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
      .attr('fill', VENN_SET_COLORS.B) // Use semantic variable
      .attr('fill-opacity', 0.5)
      .attr('mask', 'url(#maskBOnlyD3)')
      .attr('stroke', VENN_STROKE_COLORS.INSIDE)
      .attr('stroke-width', 2.2)
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
      .attr('fill', VENN_SET_COLORS.INTERSECTION) // Use semantic variable
      .attr('fill-opacity', 0.7)
      .attr('clip-path', 'url(#clipIntersectionABD3)')
      .attr('stroke', VENN_STROKE_COLORS.INSIDE)
      .attr('stroke-width', 2.2)
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
