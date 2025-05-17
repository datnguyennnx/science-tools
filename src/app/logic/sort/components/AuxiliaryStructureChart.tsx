'use client'

import React, { memo, useMemo } from 'react'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { motion } from 'framer-motion'
import type { AuxiliaryStructure } from '../engine/types'
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart'

// Generic chart config for auxiliary structures
const auxChartConfig = {
  value: {
    label: 'Count/Value', // Generic label
  },
} satisfies ChartConfig

interface AuxiliaryStructureChartProps {
  structure: Readonly<AuxiliaryStructure>
}

const MemoizedAuxiliaryStructureChart = memo(function AuxiliaryStructureChart({
  structure,
}: AuxiliaryStructureChartProps): React.JSX.Element {
  const chartData = useMemo(() => {
    const isDetailedData =
      structure.data.length > 0 &&
      typeof structure.data[0] === 'object' &&
      'value' in structure.data[0]

    return isDetailedData
      ? (structure.data as ReadonlyArray<{ value: number; [key: string]: unknown }>).map(
          (item, index) => {
            let name: string
            if (item.originalIndex !== undefined && item.originalIndex !== null) {
              name = item.originalIndex.toString()
            } else if (item.id !== undefined && item.id !== null) {
              name = item.id.toString()
            } else {
              name = index.toString()
            }
            return { name, value: item.value }
          }
        )
      : (structure.data as ReadonlyArray<number>).map((val, idx) => ({
          name: idx.toString(),
          value: val,
        }))
  }, [structure.data])

  return (
    <div className="w-full flex flex-col space-y-2">
      <h4 className="text-sm font-semibold text-foreground">{structure.title}</h4>
      <motion.div
        key={`aux-chart-${structure.id}`}
        className="w-full p-2 border-2 rounded-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <ChartContainer config={auxChartConfig} className="w-full min-h-[20rem] max-h-[35rem]">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              interval={chartData.length > 20 ? 'preserveEnd' : 0}
            />
            {/* YAxis could be added here if maxValue is used: <YAxis domain={[0, maxValue]} /> */}
            <Tooltip
              content={<ChartTooltipContent indicator="dot" hideLabel />}
              cursor={{ fill: 'var(--muted-foreground)', fillOpacity: 0.1 }}
            />
            <Bar dataKey="value" fill="var(--chart-4)" radius={[2, 2, 0, 0]}>
              {chartData.map((_entry, index) => (
                <Cell key={`aux-bar-${_entry.name}-${index}`} fill="var(--chart-4)" />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </motion.div>
    </div>
  )
})

export { MemoizedAuxiliaryStructureChart as AuxiliaryStructureChart }
