import { PerformanceMetrics } from '../engine/hooks/useTypingEngine'

interface MetricsDisplayProps {
  metrics: PerformanceMetrics
  formattedTime: string
  testStatus: 'pending' | 'typing' | 'finished'
}

// Displays typing performance metrics in finished state
export function MetricsDisplay({ metrics, formattedTime, testStatus }: MetricsDisplayProps) {
  // Only show full metrics in finished state
  if (testStatus !== 'finished') return null

  return (
    <div className="w-full max-w-xl mx-auto my-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="WPM"
          value={metrics.wpm.toString()}
          description="Words Per Minute"
          isHighlighted // WPM is often a primary focus
        />
        <MetricCard
          label="Accuracy"
          value={`${metrics.accuracy}%`}
          description="Correct keystrokes"
        />
        <MetricCard label="Time" value={formattedTime} description="Total time" />
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  description: string
  isHighlighted?: boolean
}

// Individual metric display card component
function MetricCard({ label, value, description, isHighlighted }: MetricCardProps) {
  return (
    <div
      className={`
      rounded-lg p-4 flex flex-col items-center justify-center text-center 
      transition-colors duration-200 ease-in-out 
      ${isHighlighted ? 'bg-primary/10' : 'bg-muted/40'}
    `}
    >
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </h3>
      <p className="text-4xl font-bold font-mono my-1 text-primary">{value}</p>
      <p className="text-xs text-muted-foreground/80">{description}</p>
    </div>
  )
}
