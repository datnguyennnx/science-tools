import { memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, CartesianGrid, Cell, Tooltip } from 'recharts'
import type { SortStep } from '../engine/types'
import type { ChartConfig } from '@/components/ui/chart'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

interface SortChartDisplayProps {
  currentSortStep: SortStep | null
}

const chartConfig = {
  value: {
    label: 'Value',
  },
} satisfies ChartConfig

const MemoizedSortChartDisplay = memo(function SortChartDisplay({
  currentSortStep,
}: SortChartDisplayProps): React.JSX.Element {
  const chartData = useMemo(() => {
    if (!currentSortStep || !currentSortStep.array || currentSortStep.array.length === 0) {
      return []
    }
    return currentSortStep.array.map((value, index) => ({
      name: index.toString(),
      value: value,
      originalIndex: index,
    }))
  }, [currentSortStep])

  return (
    <AnimatePresence mode="wait">
      {chartData.length === 0 ? (
        <motion.div
          key="no-data-placeholder"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          Array visualization will appear here.
        </motion.div>
      ) : (
        <motion.div
          key="chart-content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full p-2 border-2 rounded-md h-full"
        >
          <ChartContainer config={chartConfig} className="w-full min-h-[20rem] max-h-[35rem]">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                stroke="var(--muted-foreground)"
              />
              <Bar dataKey="value" radius={[2, 2, 0, 0]} isAnimationActive={true}>
                {currentSortStep &&
                  currentSortStep.array.map((value, index) => {
                    const isSorted = currentSortStep.sortedIndices?.includes(index)
                    const isHighlighted = currentSortStep.highlightedIndices?.includes(index)
                    const isCompared = currentSortStep.comparisonIndices?.includes(index)
                    const isSwapping = currentSortStep.swappingIndices?.includes(index)

                    let fill = 'var(--sort-value)' // Default color
                    let cellStroke = 'transparent'
                    let cellStrokeWidth = 0
                    let cellStrokeDasharray: string | undefined = undefined

                    if (isSorted) {
                      fill = 'var(--sort-sorted)'
                    } else {
                      // Apply special fill colors only if not sorted
                      if (isSwapping) {
                        fill = 'var(--sort-swap)' // Highest priority for swapping visual
                      } else if (isHighlighted) {
                        fill = 'var(--sort-highlight)'
                      } else if (isCompared) {
                        fill = 'var(--sort-compare)'
                      }

                      // Apply borders only if not sorted
                      if (isSwapping) {
                        cellStroke = 'var(--sort-swap-border)'
                        cellStrokeDasharray = '4 4'
                        cellStrokeWidth = 2
                      } else if (isCompared) {
                        cellStroke = 'var(--sort-compare-border)'
                        cellStrokeDasharray = '3 2'
                        cellStrokeWidth = 1.5
                      }
                    }

                    return (
                      <Cell
                        key={`bar-${value}-${index}`}
                        fill={fill}
                        stroke={cellStroke}
                        strokeWidth={cellStrokeWidth}
                        strokeDasharray={cellStrokeDasharray}
                      />
                    )
                  })}
              </Bar>
              <Tooltip
                content={<ChartTooltipContent indicator="dot" hideLabel />}
                cursor={{ fill: 'var(--muted-foreground)', fillOpacity: 0.1 }}
              />
            </BarChart>
          </ChartContainer>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

export { MemoizedSortChartDisplay as SortChartDisplay }
