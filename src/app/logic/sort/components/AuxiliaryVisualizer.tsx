'use client'

import React, { useEffect } from 'react'
import type { AuxiliaryStructure } from '../engine/types'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SortStatisticsDisplay } from './SortStatisticsDisplay'
import { motion } from 'framer-motion'
import { SortStats } from '../engine/types'

interface AuxiliaryVisualizerProps {
  sortStats?: Readonly<SortStats>
  auxiliaryStructures: ReadonlyArray<AuxiliaryStructure> | undefined
  maxValue: number // For YAxis domain consistency if needed, or dynamic based on data
}

// Generic chart config for auxiliary structures
const auxChartConfig = {
  value: {
    label: 'Count/Value', // Generic label
  },
} satisfies ChartConfig

const renderAuxiliaryData = (
  structure: AuxiliaryStructure,
  maxValue: number,
  parentCardId: string
) => {
  // Check if data is in { value: number; originalIndex: number } format or just number[]
  const isDetailedData =
    structure.data.length > 0 &&
    typeof structure.data[0] === 'object' &&
    'value' in structure.data[0]

  const chartData = isDetailedData
    ? (structure.data as ReadonlyArray<{ value: number; [key: string]: unknown }>).map(
        (item, index) => {
          let name: string
          if (item.originalIndex !== undefined && item.originalIndex !== null) {
            name = item.originalIndex.toString()
          } else if (item.id !== undefined && item.id !== null) {
            // Handle 'id' from TreeSort or other structures
            name = item.id.toString()
          } else {
            name = index.toString() // Fallback to array index
          }
          return { name, value: item.value }
        }
      )
    : (structure.data as ReadonlyArray<number>).map((val, idx) => ({
        name: idx.toString(),
        value: val,
      }))

  return (
    <div key={`${parentCardId}-${structure.id}`} className="w-full flex flex-col space-y-2">
      <h4 className="text-sm font-semibold text-foreground">{structure.title}</h4>
      <motion.div
        key={`aux-chart-${structure.id}`}
        className="w-full p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <ChartContainer config={auxChartConfig} className="h-full w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              interval={chartData.length > 20 ? 'preserveEnd' : 0}
            />
            <Tooltip
              content={<ChartTooltipContent indicator="dot" hideLabel />}
              cursor={{ fill: 'var(--muted-foreground)', fillOpacity: 0.1 }}
            />
            <Bar dataKey="value" fill="var(--chart-4)" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-aux-${structure.id}-${index}`} fill="var(--chart-4)" />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </motion.div>
    </div>
  )
}

export function AuxiliaryVisualizer({
  sortStats,
  auxiliaryStructures,
  maxValue,
}: AuxiliaryVisualizerProps): React.JSX.Element {
  const parentCardId = React.useId() // Unique ID for the parent container

  const hasStats = !!sortStats && Object.keys(sortStats).length > 0
  const hasAuxStructures = !!auxiliaryStructures && auxiliaryStructures.length > 0

  useEffect(() => {
    console.log(
      'AuxiliaryVisualizer: Props updated.',
      `Stats ${hasStats ? 'present' : 'absent'}.`,
      `AuxiliaryStructures count: ${auxiliaryStructures?.length || 0}`,
      auxiliaryStructures && auxiliaryStructures.length > 0
        ? `First aux structure: "${auxiliaryStructures[0].title}" (ID: ${auxiliaryStructures[0].id})`
        : 'No auxiliary structures.'
    )
  }, [auxiliaryStructures, sortStats, hasStats])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithm Performance & Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasStats && <SortStatisticsDisplay stats={sortStats} />}

        {hasAuxStructures && (
          <div className="space-y-4 pt-4 border-t mt-4">
            <h3 className="text-lg font-semibold text-foreground">Auxiliary Data Structures</h3>
            {auxiliaryStructures.map(structure =>
              renderAuxiliaryData(structure, maxValue, parentCardId)
            )}
          </div>
        )}

        {!hasAuxStructures && hasStats && (
          <div className="w-full text-center p-4 border border-dashed rounded-md mt-4 min-h-[5rem] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              This algorithm does not utilize specific auxiliary data structures for visualization.
            </p>
          </div>
        )}

        {!hasStats && !hasAuxStructures && (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md min-h-[10rem]">
            <p className="text-sm text-muted-foreground">
              No performance data or auxiliary structures to display for this algorithm.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
