import { memo, useMemo } from 'react'
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
    if (currentSortStep?.mainChartData) {
      return currentSortStep.mainChartData
    }
    if (currentSortStep?.array && currentSortStep.array.length > 0) {
      return currentSortStep.array.map((value, index) => ({
        name: index.toString(),
        value: value,
        originalIndex: index,
      }))
    }
    return []
  }, [currentSortStep?.mainChartData, currentSortStep?.array])

  const cellKeys = useMemo<string[]>(() => {
    if (!chartData || chartData.length === 0) {
      return []
    }
    const keyMap = new Map<number, number>()
    return chartData.map(dataItem => {
      // Iterate over chartData items
      const valueInArray = dataItem.value // Get the value from the chartDataItem
      const occurrence = keyMap.get(valueInArray) || 0
      const newKey = `bar-value-${valueInArray}-occurrence-${occurrence}`
      keyMap.set(valueInArray, occurrence + 1)
      return newKey
    })
  }, [chartData]) // Depend on chartData, which is derived from currentSortStep.mainChartData

  return (
    <div
      key={chartData.length > 0 ? 'chart-content' : 'empty-chart-content'}
      className="w-full p-2 border-2 rounded-md h-full"
    >
      <ChartContainer config={chartConfig} className="w-full min-h-[20rem] max-h-[35rem]">
        <BarChart accessibilityLayer data={chartData.length > 0 ? [...chartData] : []}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            stroke="var(--muted-foreground)"
          />
          <Bar dataKey="value" radius={[2, 2, 0, 0]} isAnimationActive={false}>
            {currentSortStep && // currentSortStep still needed for highlightedIndices etc.
              chartData.map((_dataItem, index) => {
                // Iterate chartData, but use currentSortStep for highlighting logic
                const isSorted = currentSortStep.sortedIndices?.includes(index)
                const isHighlighted = currentSortStep.highlightedIndices?.includes(index)
                const isCompared = currentSortStep.comparisonIndices?.includes(index)
                const isSwapping = currentSortStep.swappingIndices?.includes(index)

                let fill = 'var(--sort-value)'
                let cellStroke = 'transparent'
                let cellStrokeWidth = 0
                let cellStrokeDasharray: string | undefined = undefined

                if (isSorted) {
                  fill = 'var(--sort-sorted)'
                } else {
                  if (isSwapping) {
                    fill = 'var(--sort-swap)'
                  } else if (isHighlighted) {
                    fill = 'var(--sort-highlight)'
                  } else if (isCompared) {
                    fill = 'var(--sort-compare)'
                  }

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
                    key={cellKeys[index]} // cellKeys is now based on chartData
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
    </div>
  )
})

export { MemoizedSortChartDisplay as SortChartDisplay }
