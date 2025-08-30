import { IntervalData } from '../engine/hooks/useTypingEngine'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'

// Dynamic imports to prevent SSR issues and reduce bundle size
const ResultsChart = dynamic(() => import('./ResultsChart').then(mod => mod.default), {
  ssr: false,
})

interface ResultsSummaryProps {
  metrics: { wpm: number; cpm: number; accuracy: number; errorCount: number }
  formattedTime: string
  intervals: IntervalData[]
}

// Displays typing test results with performance chart
export function ResultsSummary({ intervals, metrics }: ResultsSummaryProps) {
  // Early return for insufficient data - prevents unnecessary rendering
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

  // Render the chart component - all complex logic moved to ResultsChart
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
        <ResultsChart intervals={intervals} metrics={metrics} />
      </CardContent>
    </Card>
  )
}

export default ResultsSummary
