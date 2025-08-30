// Time formatting utilities

// Formats seconds to MM:SS format
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Formats seconds to S.s format for short times
export const formatShortTime = (seconds: number): string => {
  return seconds.toFixed(1)
}
