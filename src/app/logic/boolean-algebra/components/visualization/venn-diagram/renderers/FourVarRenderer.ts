import * as d3 from 'd3'
import { VennData4Vars } from '../VennDiagramEngine'
import { VENN_SET_COLORS, LABEL_COLOR, FOUR_VAR_VENN_REGION_STYLES } from '../../utils'

// Exported 4-Variable Renderer Function
export function renderD3FourVarDiagram(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  data: VennData4Vars,
  currentVariables: string[],
  svgWidth: number,
  svgHeight: number,
  padding: number,
  outlineStrokeColor: string, // Renamed for clarity
  fontSize: number
) {
  const diagramWidth = svgWidth - 2 * padding
  const diagramHeight = svgHeight - 2 * padding
  const centerX = padding + diagramWidth / 2
  const centerY = padding + diagramHeight / 2
  const r = Math.min(diagramWidth, diagramHeight) * 0.3 // Increased radius
  const offset = r * 0.5 // Offset for circle centers from main center

  const circleDefs = [
    {
      id: 'A',
      cx: centerX - offset,
      cy: centerY - offset,
      label: currentVariables[0],
      color: VENN_SET_COLORS.A,
    },
    {
      id: 'B',
      cx: centerX + offset,
      cy: centerY - offset,
      label: currentVariables[1],
      color: VENN_SET_COLORS.B,
    },
    {
      id: 'C',
      cx: centerX - offset,
      cy: centerY + offset,
      label: currentVariables[2],
      color: VENN_SET_COLORS.C,
    },
    {
      id: 'D',
      cx: centerX + offset,
      cy: centerY + offset,
      label: currentVariables[3],
      color: VENN_SET_COLORS.D,
    },
  ]

  // 1. Draw the main circle outlines
  circleDefs.forEach(circle => {
    svg
      .append('circle')
      .attr('cx', circle.cx)
      .attr('cy', circle.cy)
      .attr('r', r)
      .attr('fill', 'none')
      .attr('stroke', outlineStrokeColor)
      .attr('stroke-width', 2.2)
      .attr('stroke-opacity', 0.8)

    const angle = Math.atan2(circle.cy - centerY, circle.cx - centerX)
    const labelRadius = r * 1.15
    svg
      .append('text')
      .attr('x', circle.cx + Math.cos(angle) * labelRadius)
      .attr('y', circle.cy + Math.sin(angle) * labelRadius + fontSize * 0.35)
      .attr('font-size', fontSize * 1.1)
      .attr('fill', LABEL_COLOR)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 700)
      .attr('font-family', 'var(--font-sans), sans-serif')
      .text(circle.label)
  })

  // 2. Define the 16 regions (minterms) and their approximate centers
  const regionCenters: { [key in keyof VennData4Vars]?: { x: number; y: number } } = {
    A_B_C_D: { x: centerX, y: centerY },
    A_B_C_only: { x: centerX - offset * 0.4, y: centerY - offset * 0.4 },
    A_B_D_only: { x: centerX + offset * 0.4, y: centerY - offset * 0.4 },
    A_C_D_only: { x: centerX, y: centerY + offset * 0.5 },
    B_C_D_only: { x: centerX + offset * 0.5, y: centerY + offset * 0.5 },
    A_B_only: { x: centerX, y: centerY - offset * 0.8 },
    A_C_only: { x: centerX - offset * 0.8, y: centerY },
    A_D_only: { x: centerX - offset * 0.4, y: centerY + offset * 0.8 }, // Adjusted
    B_C_only: { x: centerX + offset * 0.4, y: centerY - offset * 0.8 }, // Adjusted
    B_D_only: { x: centerX + offset * 0.8, y: centerY },
    C_D_only: { x: centerX, y: centerY + offset * 0.8 },
    A_only: { x: centerX - offset * 0.9, y: centerY - offset * 0.9 }, // Pulled in slightly
    B_only: { x: centerX + offset * 0.9, y: centerY - offset * 0.9 }, // Pulled in slightly
    C_only: { x: centerX - offset * 0.9, y: centerY + offset * 0.9 }, // Pulled in slightly
    D_only: { x: centerX + offset * 0.9, y: centerY + offset * 0.9 }, // Pulled in slightly
  }

  const regionDescriptions: { [key in keyof VennData4Vars]: string } = {
    A_only: `${currentVariables[0]} only`,
    B_only: `${currentVariables[1]} only`,
    C_only: `${currentVariables[2]} only`,
    D_only: `${currentVariables[3]} only`,
    A_B_only: `${currentVariables[0]}∩${currentVariables[1]} only`,
    A_C_only: `${currentVariables[0]}∩${currentVariables[2]} only`,
    A_D_only: `${currentVariables[0]}∩${currentVariables[3]} only`,
    B_C_only: `${currentVariables[1]}∩${currentVariables[2]} only`,
    B_D_only: `${currentVariables[1]}∩${currentVariables[3]} only`,
    C_D_only: `${currentVariables[2]}∩${currentVariables[3]} only`,
    A_B_C_only: `${currentVariables[0]}∩${currentVariables[1]}∩${currentVariables[2]} only`,
    A_B_D_only: `${currentVariables[0]}∩${currentVariables[1]}∩${currentVariables[3]} only`,
    A_C_D_only: `${currentVariables[0]}∩${currentVariables[2]}∩${currentVariables[3]} only`,
    B_C_D_only: `${currentVariables[1]}∩${currentVariables[2]}∩${currentVariables[3]} only`,
    A_B_C_D: `${currentVariables[0]}∩${currentVariables[1]}∩${currentVariables[2]}∩${currentVariables[3]}`,
    Neither: `Outside all sets (¬${currentVariables[0]} ∧ ¬${currentVariables[1]} ∧ ¬${currentVariables[2]} ∧ ¬${currentVariables[3]})`,
  }

  // 3. Draw representative shapes for each region based on data
  const regionShapeRadius = r * 0.15

  Object.entries(data).forEach(([key, isActive]) => {
    const regionKey = key as keyof VennData4Vars
    const center = regionCenters[regionKey]
    const description = regionDescriptions[regionKey]

    if (regionKey === 'Neither' || !center) return

    let fillColor = VENN_SET_COLORS.INTERSECTION // Default
    if (regionKey.endsWith('_only')) {
      if (regionKey === 'A_only') fillColor = VENN_SET_COLORS.A
      else if (regionKey === 'B_only') fillColor = VENN_SET_COLORS.B
      else if (regionKey === 'C_only') fillColor = VENN_SET_COLORS.C
      else if (regionKey === 'D_only') fillColor = VENN_SET_COLORS.D
      // Keep intersection color for combined '_only' regions for now
    }

    svg
      .append('circle')
      .attr('cx', center.x)
      .attr('cy', center.y)
      .attr('r', regionShapeRadius)
      .attr('fill', fillColor)
      .attr(
        'fill-opacity',
        isActive
          ? FOUR_VAR_VENN_REGION_STYLES.ACTIVE_FILL_OPACITY
          : FOUR_VAR_VENN_REGION_STYLES.INACTIVE_FILL_OPACITY
      )
      .attr('stroke', outlineStrokeColor)
      .attr('stroke-width', isActive ? 1.5 : 0.5)
      .attr(
        'stroke-opacity',
        isActive
          ? FOUR_VAR_VENN_REGION_STYLES.ACTIVE_STROKE_OPACITY
          : FOUR_VAR_VENN_REGION_STYLES.INACTIVE_STROKE_OPACITY
      )
      .style('pointer-events', 'all')
      .on('mouseover', function () {
        if (isActive) {
          d3.select(this)
            .transition()
            .duration(150)
            .attr('r', regionShapeRadius * 1.2)
            .attr('fill-opacity', FOUR_VAR_VENN_REGION_STYLES.ACTIVE_FILL_OPACITY * 1.4)
        }
      })
      .on('mouseout', function () {
        if (isActive) {
          d3.select(this)
            .transition()
            .duration(150)
            .attr('r', regionShapeRadius)
            .attr('fill-opacity', FOUR_VAR_VENN_REGION_STYLES.ACTIVE_FILL_OPACITY)
        }
      })
      .append('title')
      .text(description)
  })
}
