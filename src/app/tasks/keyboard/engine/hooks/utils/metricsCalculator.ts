/**
 * Pure utility functions for calculating typing metrics
 */

/**
 * Calculate Characters Per Minute (CPM)
 * @param correctChars Number of correctly typed characters
 * @param timeInSeconds Time elapsed in seconds
 * @returns The CPM value or 0 if time is 0
 */
export const calculateCPM = (correctChars: number, timeInSeconds: number): number => {
  if (timeInSeconds <= 0) return 0
  return Math.round(correctChars / (timeInSeconds / 60))
}

/**
 * Calculate Words Per Minute (WPM) using the standard 5 characters per word
 * @param correctChars Number of correctly typed characters
 * @param timeInSeconds Time elapsed in seconds
 * @returns The WPM value or 0 if time is 0
 */
export const calculateWPM = (correctChars: number, timeInSeconds: number): number => {
  if (timeInSeconds <= 0) return 0
  return Math.round(correctChars / 5 / (timeInSeconds / 60))
}

/**
 * Calculate typing accuracy as a percentage
 * @param correctChars Number of correctly typed characters
 * @param errorCount Number of errors made
 * @returns Accuracy as a percentage (0-100)
 */
export const calculateAccuracy = (correctChars: number, errorCount: number): number => {
  const total = correctChars + errorCount
  if (total <= 0) return 100
  return Math.round((correctChars / total) * 100)
}

/**
 * Format time in seconds to MM:SS format
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format time in seconds to S.s format (for short times)
 * @param seconds Time in seconds
 * @returns Formatted time string with one decimal place
 */
export const formatShortTime = (seconds: number): string => {
  return seconds.toFixed(1)
}

/**
 * Calculate interval metrics for charting (WPM in each interval)
 * @param intervals Array of typing intervals with timing data
 * @returns Array of calculated metrics for each interval
 */
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
