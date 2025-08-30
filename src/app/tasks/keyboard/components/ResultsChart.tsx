import { IntervalData } from '../engine/hooks/useTypingEngine'
import { calculateIntervalMetrics } from '../engine/utils/metricsCalculator'
import { Line, XAxis, YAxis, CartesianGrid, Scatter, Legend, ComposedChart, Dot } from 'recharts'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'

// Chart data point interface for proper typing
interface ChartDataPoint {
  time: number
  wpm: number
  cpm: number
  errors: number | null
  accuracy: number
}

// Pure functions for data processing - prevents recreation on every render
function processChartData(
  intervals: IntervalData[],
  metrics: { wpm: number; cpm: number; accuracy: number; errorCount: number }
): ChartDataPoint[] {
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
          time: processed[0].time + 2,
          wpm: processed[0].wpm,
          cpm: processed[0].cpm,
          errors: processed[0].errors,
          accuracy: processed[0].accuracy,
        },
      ]
    }
    return processed
  } catch (e) {
    console.error('[ResultsChart] Error processing chartData:', e)
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
}

function createProcessedChartData(chartData: ChartDataPoint[]): ChartDataPoint[] {
  return chartData.map(d => ({
    ...d,
    errors: d.errors !== null && d.errors > 0 ? d.errors : null,
  }))
}

// Stable configuration objects - defined once to prevent recreation
const PERFORMANCE_CHART_CONFIG: ChartConfig = {
  wpm: {
    label: 'WPM',
    color: 'var(--chart-1)',
    icon: () => (
      <p className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: 'var(--color-wpm)' }} />
    ),
  },
  cpm: {
    label: 'CPM',
    color: 'var(--chart-2)',
    icon: () => (
      <p className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: 'var(--color-cpm)' }} />
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
      <p className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: 'var(--color-errors)' }} />
    ),
  },
}

const X_AXIS_LABEL = {
  value: 'Time (s)',
  position: 'insideBottom' as const,
  offset: -5,
  fontSize: 12,
  fill: 'var(--muted-foreground)',
}

const COMMON_X_AXIS_PROPS = {
  dataKey: 'time' as const,
  stroke: 'var(--muted-foreground)',
  tickSize: 5,
  tickMargin: 5,
  tick: { fontSize: 11 },
  minTickGap: 15,
  label: X_AXIS_LABEL,
  height: 40,
}

function createYAxisProps(labelValue: string, domain?: [number | string, number | string]) {
  return {
    stroke: 'var(--muted-foreground)',
    tickSize: 5,
    tickMargin: 5,
    tick: { fontSize: 11 },
    label: {
      value: labelValue,
      angle: -90,
      position: 'insideLeft' as const,
      fontSize: 12,
      fill: 'var(--muted-foreground)',
      dy: -10,
    },
    domain: domain || ['auto', 'auto'],
    width: 40,
  }
}

// Tooltip component - isolated to prevent recreation
function ChartTooltipContent({
  active,
  payload,
  label,
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
}) {
  if (!active || !payload?.length || typeof label !== 'number') return null

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
          const config =
            PERFORMANCE_CHART_CONFIG[item.dataKey as keyof typeof PERFORMANCE_CHART_CONFIG]
          if (!config || !item.payload) return null

          let valueToDisplay = ''
          const itemPayload = item.payload

          switch (item.dataKey) {
            case 'wpm':
            case 'cpm':
              valueToDisplay = item.value.toFixed(0)
              break
            case 'accuracy':
              valueToDisplay = `${itemPayload.accuracy.toFixed(1)}%`
              break
            case 'errors':
              if (!itemPayload.errors || itemPayload.errors <= 0) return null
              valueToDisplay = String(itemPayload.errors)
              break
            default:
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
                <span className="text-xs text-muted-foreground">{config.label || item.name}</span>
                <span className="font-semibold">{valueToDisplay}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface ResultsChartProps {
  intervals: IntervalData[]
  metrics: { wpm: number; cpm: number; accuracy: number; errorCount: number }
}

// Renders performance chart with WPM, CPM, and accuracy data
export default function ResultsChart({ intervals, metrics }: ResultsChartProps) {
  // Process data using pure functions - no state dependencies
  const chartData = processChartData(intervals, metrics)
  const processedChartData = createProcessedChartData(chartData)

  // Validate data before rendering
  if (!processedChartData?.length) return null

  return (
    <ChartContainer config={PERFORMANCE_CHART_CONFIG}>
      <ComposedChart
        data={processedChartData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis {...COMMON_X_AXIS_PROPS} />
        <YAxis {...createYAxisProps('WPM / CPM', ['auto', 'dataMax + 10'])} yAxisId="left" />
        <YAxis
          {...createYAxisProps('Accuracy (%)', [0, 100])}
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
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
  )
}
