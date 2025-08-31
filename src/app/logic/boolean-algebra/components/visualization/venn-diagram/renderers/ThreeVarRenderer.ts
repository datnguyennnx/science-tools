import * as d3 from 'd3'
import { VennData3Vars } from '../VennDiagramEngine'
import { VENN_SET_COLORS, LABEL_COLOR } from '../../utils/colors'

// Exported 3-Variable Renderer Function
export function renderD3ThreeVarDiagram(
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
  // NOTE: Accurate rendering requires complex path calculations and masking
  if (data.A_only)
    svg
      .append('circle') // Placeholder: Needs masking
      .attr('cx', c1x)
      .attr('cy', c1y)
      .attr('r', r)
      .attr('fill', VENN_SET_COLORS.A) // Use semantic variable
      .attr('fill-opacity', 0.5)
  if (data.B_only)
    svg
      .append('circle') // Placeholder: Needs masking
      .attr('cx', c2x)
      .attr('cy', c2y)
      .attr('r', r)
      .attr('fill', VENN_SET_COLORS.B) // Use semantic variable
      .attr('fill-opacity', 0.5)
  if (data.C_only)
    svg
      .append('circle') // Placeholder: Needs masking
      .attr('cx', c3x)
      .attr('cy', c3y)
      .attr('r', r)
      .attr('fill', VENN_SET_COLORS.C) // Use semantic variable
      .attr('fill-opacity', 0.5)

  // A_B_C intersection - approximate center for the blob
  if (data.A_B_C) {
    const approxCenterX = midX
    const approxCenterY = midY + r * 0.1
    svg
      .append('circle')
      .attr('cx', approxCenterX)
      .attr('cy', approxCenterY)
      .attr('r', r * 0.4) // Smaller circle for the central intersection
      .attr('fill', VENN_SET_COLORS.INTERSECTION) // Use semantic variable
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
