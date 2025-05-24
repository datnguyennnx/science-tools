import { useMemo } from 'react'
import { IntervalData } from '../engine/hooks/useTypingEngine'
import { calculateIntervalMetrics } from '../engine/hooks/utils/metricsCalculator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, XAxis, YAxis, CartesianGrid, Scatter, Legend, ComposedChart, Dot } from 'recharts'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'

interface ResultsSummaryProps {
  metrics: { wpm: number; cpm: number; accuracy: number; errorCount: number }
  formattedTime: string
  intervals: IntervalData[]
}

// Define a type for individual data points in chartData
interface ChartDataPoint {
  time: number
  wpm: number
  cpm: number
  errors: number | null // Updated to allow null for Scatter plot
  accuracy: number
}

// New Custom Tooltip Content Component
const CustomChartTooltipContent = ({
  active,
  payload,
  label,
  chartConfig,
}: {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: ChartDataPoint
    dataKey: string
    color: string
  }>
  label?: string | number
  chartConfig?: ChartConfig
}) => {
  if (active && payload && payload.length && chartConfig && typeof label === 'number') {
    const timeLabel = `Time: ${label.toFixed(1)}s`

    const order: Record<string, number> = {
      wpm: 1,
      cpm: 2,
      accuracy: 3,
      errors: 4,
    }

    const sortedPayload = [...payload].sort(
      (a, b) => (order[a.name as string] ?? 5) - (order[b.name as string] ?? 5)
    )

    return (
      <div className="min-w-[150px] rounded-lg border bg-background p-2 text-sm shadow-lg">
        <div className="mb-1 font-medium">{timeLabel}</div>
        <div className="space-y-1">
          {sortedPayload.map(item => {
            const config = chartConfig[item.dataKey as keyof typeof chartConfig]
            if (!config) return null

            const itemPayload = item.payload
            if (!itemPayload) return null

            const metricName = config.label || item.name
            let valueToDisplay = ''

            if (item.dataKey === 'wpm') {
              valueToDisplay = `${item.value.toFixed(0)}`
            } else if (item.dataKey === 'cpm') {
              valueToDisplay = `${item.value.toFixed(0)}`
            } else if (item.dataKey === 'accuracy') {
              valueToDisplay = `${itemPayload.accuracy.toFixed(1)}%`
            } else if (item.dataKey === 'errors') {
              if (itemPayload.errors && itemPayload.errors > 0) {
                valueToDisplay = `${itemPayload.errors}`
              } else {
                return null
              }
            } else {
              valueToDisplay = String(item.value)
            }

            return (
              <div key={item.dataKey} className="flex items-start py-0.5">
                {config.icon && (
                  <span className="mr-1.5 mt-1 h-2.5 w-2.5 shrink-0 flex items-center justify-center">
                    <config.icon />
                  </span>
                )}
                <div className="flex flex-row w-full justify-between leading-tight">
                  <span className="text-xs text-muted-foreground">{metricName}</span>
                  <span className="font-semibold">{valueToDisplay}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}

/**
 * Component to display detailed test results and visualizations after completion
 */
export function ResultsSummary({ intervals, metrics }: ResultsSummaryProps) {
  const chartData = useMemo(() => {
    try {
      if (!intervals || intervals.length === 0) {
        return [
          { time: 0, wpm: 0, cpm: 0, errors: 0, accuracy: 100 },
          {
            time: 2,
            wpm: metrics.wpm || 0,
            cpm: metrics.cpm || 0,
            errors: metrics.errorCount || 0,
            accuracy: metrics.accuracy || 0,
          },
        ]
      }
      const processed = calculateIntervalMetrics(intervals)
      // Ensure there are at least 2 data points for the line chart if only one interval processed
      if (processed.length === 1) {
        return [
          ...processed,
          {
            time: processed[0].time + 2, // Extend time for the second point
            wpm: processed[0].wpm,
            cpm: processed[0].cpm,
            errors: processed[0].errors, // Carry over errors if any
            accuracy: processed[0].accuracy,
          },
        ]
      }
      return processed
    } catch (e) {
      console.error('[ResultsSummary] Error processing chartData:', e)
      // Fallback data in case of an error during processing
      const fallback = [
        { time: 0, wpm: 0, cpm: 0, errors: 0, accuracy: 100 },
        {
          time: 2,
          wpm: metrics.wpm || 0,
          cpm: metrics.cpm || 0,
          errors: metrics.errorCount || 0,
          accuracy: metrics.accuracy || 0,
        },
      ]
      return fallback
    }
  }, [intervals, metrics])

  const performanceChartConfig = useMemo((): ChartConfig => {
    // Renamed for clarity
    return {
      wpm: {
        label: 'WPM',
        color: 'var(--chart-1)',
        icon: () => (
          <p
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: 'var(--color-wpm)' }}
          />
        ),
      },
      cpm: {
        label: 'CPM',
        color: 'var(--chart-2)',
        icon: () => (
          <p
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: 'var(--color-cpm)' }}
          />
        ),
      },
      accuracy: {
        label: 'Accuracy',
        color: 'var(--chart-3)',
        icon: () => (
          <p
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: 'var(--color-accuracy)' }}
          />
        ),
      },
      errors: {
        label: 'Errors',
        color: 'var(--destructive)',
        icon: () => (
          <p
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: 'var(--color-errors)' }}
          />
        ),
      },
    }
  }, [])

  const processedChartData = useMemo(() => {
    const data = chartData.map(d => ({
      ...d,
      // Set errors to null if 0, so Scatter doesn't render a dot
      errors: d.errors > 0 ? d.errors : null,
    }))
    return data
  }, [chartData])

  if (
    !chartData ||
    chartData.length < 2 ||
    (chartData.length === 2 &&
      chartData[0].wpm === 0 &&
      chartData[1].wpm === 0 &&
      chartData[0].cpm === 0 &&
      chartData[1].cpm === 0)
  ) {
    if (!intervals || intervals.length === 0) {
      return (
        <div className="mt-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Performance Analysis</CardTitle>
              <CardDescription className="text-sm">
                Complete a longer typing test to see your detailed performance analytics.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )
    }
  }

  const xAxisLabel = {
    value: 'Time (s)',
    position: 'insideBottom',
    offset: -5,
    fontSize: 12,
    fill: 'var(--muted-foreground)',
  }

  const commonXAxisProps = {
    dataKey: 'time',
    stroke: 'var(--muted-foreground)',
    tickSize: 5,
    tickMargin: 5,
    tick: { fontSize: 11 },
    minTickGap: 15,
    label: xAxisLabel,
    height: 40,
  }

  const commonYAxisProps = (labelValue: string, domain?: [number | string, number | string]) => ({
    stroke: 'var(--muted-foreground)',
    tickSize: 5,
    tickMargin: 5,
    tick: { fontSize: 11 },
    label: {
      value: labelValue,
      angle: -90,
      position: 'insideLeft',
      fontSize: 12,
      fill: 'var(--muted-foreground)',
      dy: -10,
    },
    domain: domain || ['auto', 'auto'],
    width: 40,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Over Time</CardTitle>
        <CardDescription>
          Your Words Per Minute (WPM), Characters Per Minute (CPM), and Accuracy over the duration
          of the test. Higher values for speed and accuracy indicate better performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={performanceChartConfig}>
          <ComposedChart
            data={processedChartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis {...commonXAxisProps} />
            <YAxis {...commonYAxisProps('WPM / CPM', ['auto', 'dataMax + 10'])} yAxisId="left" />
            <YAxis
              {...commonYAxisProps('Accuracy (%)', [0, 100])}
              yAxisId="right"
              orientation="right"
              label={{
                value: 'Accuracy (%)',
                angle: -90,
                position: 'insideRight',
                fontSize: 12,
                fill: 'var(--muted-foreground)',
                dy: -10,
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<CustomChartTooltipContent chartConfig={performanceChartConfig} />}
            />
            <Legend
              verticalAlign="top"
              height={30}
              wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="wpm"
              name="Words Per Minute"
              stroke="var(--color-wpm)"
              activeDot={{ r: 5, strokeWidth: 1 }}
              strokeWidth={1.5}
              dot={{ r: 2, strokeWidth: 1 }}
              animationDuration={300}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cpm"
              name="Chars Per Minute"
              stroke="var(--color-cpm)"
              activeDot={{ r: 5, strokeWidth: 1 }}
              strokeWidth={1.5}
              dot={{ r: 2, strokeWidth: 1 }}
              animationDuration={300}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accuracy"
              name="Accuracy"
              stroke="var(--color-accuracy)"
              activeDot={{ r: 5, strokeWidth: 1 }}
              strokeWidth={1.5}
              dot={{ r: 2, strokeWidth: 1 }}
              animationDuration={300}
            />
            <Scatter
              yAxisId="left"
              dataKey="errors"
              name="Errors"
              fill="var(--color-errors)"
              shape={<Dot r={3} />}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ResultsSummary
