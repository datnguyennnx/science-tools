// Calculates typing performance metrics

// Calculates characters per minute
export const calculateCPM = (correctChars: number, timeInSeconds: number): number => {
  if (timeInSeconds <= 0) return 0
  return Math.round(correctChars / (timeInSeconds / 60))
}

// Calculates words per minute (5 chars per word standard)
export const calculateWPM = (correctChars: number, timeInSeconds: number): number => {
  if (timeInSeconds <= 0) return 0
  return Math.round(correctChars / 5 / (timeInSeconds / 60))
}

// Calculates typing accuracy as percentage
export const calculateAccuracy = (correctChars: number, errorCount: number): number => {
  const total = correctChars + errorCount
  if (total <= 0) return 100
  return Math.round((correctChars / total) * 100)
}

// Calculates metrics for each typing interval (for charting)
export const calculateIntervalMetrics = (
  intervals: Array<{
    intervalEndTime: number
    correctCharsInInterval: number
    errorsInInterval: number
  }>
): Array<{ time: number; wpm: number; cpm: number; errors: number; accuracy: number }> => {
  if (!intervals || intervals.length === 0) {
    return [
      { time: 0, wpm: 0, cpm: 0, errors: 0, accuracy: 100 },
      { time: 2, wpm: 0, cpm: 0, errors: 0, accuracy: 100 },
    ]
  }

  let accumulatedCorrectChars = 0
  let accumulatedErrors = 0

  const results = intervals.map(interval => {
    accumulatedCorrectChars += interval.correctCharsInInterval
    accumulatedErrors += interval.errorsInInterval

    const overallWpm = calculateWPM(accumulatedCorrectChars, interval.intervalEndTime)
    const overallCpm = calculateCPM(accumulatedCorrectChars, interval.intervalEndTime)
    const overallAccuracy = calculateAccuracy(accumulatedCorrectChars, accumulatedErrors)

    const segmentErrors = interval.errorsInInterval

    return {
      time: Number(interval.intervalEndTime.toFixed(1)),
      wpm: overallWpm,
      cpm: overallCpm,
      errors: segmentErrors,
      accuracy: overallAccuracy,
    }
  })

  if (results.length === 1) {
    const firstResult = results[0]
    const timeOffset = firstResult.time === 0 ? 0.1 : 0.1

    results.push({
      ...firstResult,
      time: Number((firstResult.time + timeOffset).toFixed(1)),
    })
  }

  return results
}
